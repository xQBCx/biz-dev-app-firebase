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

    const { companyName, industry, strategy, customDetails, templateId } = await req.json();

    console.log("Generating ERP for:", { companyName, industry, strategy });

    // Get template if specified
    let template = null;
    if (templateId) {
      const { data } = await supabaseClient
        .from("erp_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      template = data;
    }

    // Generate AI assessment and custom structure
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an ERP structure expert. Generate a comprehensive folder structure and recommendations for a company.
Return a JSON object with the following structure:
{
  "folder_structure": {
    "root": {
      "Department1": { "Subdept1": {}, "Subdept2": {} },
      "Department2": { ... }
    }
  },
  "integrations": {
    "recommended": ["integration1", "integration2"]
  },
  "workflows": {
    "recommended": ["workflow1", "workflow2"]
  },
  "ai_assessment": {
    "summary": "Brief assessment of the ERP structure",
    "key_features": ["feature1", "feature2"],
    "growth_recommendations": ["recommendation1", "recommendation2"]
  }
}`;

    const userPrompt = template
      ? `Based on the "${template.name}" template for ${industry} industry, customize the ERP structure for:
Company: ${companyName}
Strategy: ${strategy || "general"}
Additional requirements: ${customDetails || "none"}

Start with this template structure and enhance it:
${JSON.stringify(template.folder_structure)}`
      : `Generate a comprehensive ERP folder structure for:
Company: ${companyName}
Industry: ${industry}
Strategy: ${strategy || "general"}
Additional requirements: ${customDetails || "none"}

Create a detailed structure appropriate for this industry and strategy.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to generate ERP structure");
    }

    const aiData = await aiResponse.json();
    let generatedStructure;
    
    try {
      generatedStructure = JSON.parse(aiData.choices[0].message.content);
    } catch {
      console.error("Failed to parse AI response:", aiData.choices[0].message.content);
      // Fallback to template or basic structure
      generatedStructure = template ? {
        folder_structure: template.folder_structure,
        integrations: { recommended: template.recommended_integrations || [] },
        workflows: { recommended: template.recommended_workflows || [] },
        ai_assessment: { summary: "Generated from template" }
      } : {
        folder_structure: { root: { Documents: {}, Projects: {}, Operations: {} } },
        integrations: { recommended: [] },
        workflows: { recommended: [] },
        ai_assessment: { summary: "Basic structure generated" }
      };
    }

    // Save to database
    const { data: config, error: insertError } = await supabaseClient
      .from("company_erp_configs")
      .insert({
        user_id: user.id,
        template_id: templateId || null,
        industry,
        strategy: strategy || null,
        folder_structure: generatedStructure.folder_structure,
        integrations: generatedStructure.integrations,
        workflows: generatedStructure.workflows,
        ai_assessment: generatedStructure.ai_assessment,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save ERP configuration");
    }

    // Log the evolution
    await supabaseClient.from("erp_evolution_log").insert({
      erp_config_id: config.id,
      change_type: "structure_created",
      change_description: `Initial ERP structure created for ${companyName}`,
      trigger_source: "erp-generator",
      ai_reasoning: generatedStructure.ai_assessment?.summary || "AI-generated structure",
      new_state: generatedStructure,
    });

    console.log("ERP config created:", config.id);

    return new Response(
      JSON.stringify({ configId: config.id, structure: generatedStructure }),
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
