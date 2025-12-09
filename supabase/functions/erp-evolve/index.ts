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

    const { configId } = await req.json();

    console.log("Evolving ERP config:", configId);

    // Get current config
    const { data: config, error: configError } = await supabaseClient
      .from("company_erp_configs")
      .select("*")
      .eq("id", configId)
      .eq("user_id", user.id)
      .single();

    if (configError || !config) {
      throw new Error("ERP configuration not found");
    }

    // Get recent documents to understand usage patterns
    const { data: recentDocs } = await supabaseClient
      .from("erp_documents")
      .select("file_name, file_type, routing_recommendation")
      .eq("erp_config_id", configId)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get related CRM data for context
    const { data: deals } = await supabaseClient
      .from("crm_deals")
      .select("name, stage, value")
      .eq("user_id", user.id)
      .limit(20);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an ERP evolution AI. Analyze the current structure and usage patterns to recommend improvements.
Return a JSON object with:
{
  "changes": [
    {
      "change_type": "folder_added|folder_removed|workflow_added|structure_optimized",
      "description": "What changed",
      "reasoning": "Why this change improves the ERP"
    }
  ],
  "updated_structure": { the new folder_structure },
  "updated_workflows": { recommended workflows array },
  "summary": "Overall assessment of changes"
}

Only suggest changes if there's clear evidence they would improve the structure. If no changes needed, return empty changes array.`;

    const userPrompt = `Analyze this ERP for potential evolution:

Current Structure:
${JSON.stringify(config.folder_structure, null, 2)}

Industry: ${config.industry}
Strategy: ${config.strategy}

Recent Documents (${recentDocs?.length || 0}):
${recentDocs?.map(d => `- ${d.file_name} (${d.file_type})`).join("\n") || "None"}

Active Deals (${deals?.length || 0}):
${deals?.map(d => `- ${d.name}: ${d.stage}`).join("\n") || "None"}

Based on usage patterns and company context, suggest any structural improvements.`;

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
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to analyze ERP evolution");
    }

    const aiData = await aiResponse.json();
    let evolution;
    
    try {
      evolution = JSON.parse(aiData.choices[0].message.content);
    } catch {
      evolution = { changes: [], summary: "No changes recommended" };
    }

    // Apply changes if any
    if (evolution.changes && evolution.changes.length > 0) {
      const previousState = {
        folder_structure: config.folder_structure,
        workflows: config.workflows,
      };

      // Update config
      const { error: updateError } = await supabaseClient
        .from("company_erp_configs")
        .update({
          folder_structure: evolution.updated_structure || config.folder_structure,
          workflows: evolution.updated_workflows ? { recommended: evolution.updated_workflows } : config.workflows,
          last_evolved_at: new Date().toISOString(),
        })
        .eq("id", configId);

      if (updateError) {
        console.error("Update error:", updateError);
      }

      // Log each change
      for (const change of evolution.changes) {
        await supabaseClient.from("erp_evolution_log").insert({
          erp_config_id: configId,
          change_type: change.change_type,
          change_description: change.description,
          trigger_source: "auto-evolution",
          ai_reasoning: change.reasoning,
          previous_state: previousState,
          new_state: {
            folder_structure: evolution.updated_structure,
            workflows: evolution.updated_workflows,
          },
        });
      }
    }

    console.log("Evolution complete:", evolution.summary);

    return new Response(
      JSON.stringify({
        changes: evolution.changes?.length || 0,
        summary: evolution.summary,
      }),
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
