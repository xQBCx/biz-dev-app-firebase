import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { fileName, fileType, erpConfigId } = await req.json();

    console.log("Analyzing document:", { fileName, fileType, erpConfigId });

    // Get ERP config to understand structure
    const { data: erpConfig, error: configError } = await supabaseClient
      .from("company_erp_configs")
      .select("*")
      .eq("id", erpConfigId)
      .single();

    if (configError || !erpConfig) {
      throw new Error("ERP configuration not found");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a document routing AI for an ERP system. Analyze the document and recommend where it should be stored.
The ERP has this folder structure:
${JSON.stringify(erpConfig.folder_structure, null, 2)}

Return a JSON object with:
{
  "suggestedFolder": "The immediate folder name",
  "suggestedPath": "The full path like /root/Department/Subfolder",
  "extractedData": { "key information extracted from filename/type" },
  "workflowSuggestions": ["relevant workflow names"],
  "knowledgeBaseRelevance": true/false (should this be added to AI knowledge base),
  "reasoning": "Brief explanation of why this location was chosen"
}`;

    const userPrompt = `Analyze this document and recommend routing:
File Name: ${fileName}
File Type: ${fileType}
Industry: ${erpConfig.industry}

Based on the filename and type, determine the best folder location and any relevant workflows or actions.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to analyze document");
    }

    const aiData = await aiResponse.json();
    let recommendation;
    
    try {
      recommendation = JSON.parse(aiData.choices[0].message.content);
    } catch {
      // Fallback recommendation
      recommendation = {
        suggestedFolder: "Documents",
        suggestedPath: "/root/Documents",
        extractedData: { fileName, fileType },
        workflowSuggestions: [],
        knowledgeBaseRelevance: false,
        reasoning: "Default routing - unable to determine specific location",
      };
    }

    console.log("Document analysis complete:", recommendation);

    return new Response(
      JSON.stringify(recommendation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
