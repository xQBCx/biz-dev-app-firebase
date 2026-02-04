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
    const { prompt, category = "operations" } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-workflow] Generating workflow for: ${prompt}`);

    // Fetch available node types
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: nodeTypes } = await supabase
      .from("workflow_node_types")
      .select("slug, name, category, description")
      .eq("is_active", true);

    const nodeTypeList = nodeTypes?.map(n => `- ${n.slug}: ${n.name} (${n.category}) - ${n.description || ''}`).join('\n') || '';

    const systemPrompt = `You are a workflow automation expert. Generate a workflow definition based on the user's request.

Available node types:
${nodeTypeList}

Respond with a JSON object containing:
{
  "name": "Workflow name",
  "description": "Brief description",
  "category": "sales|marketing|ai_content|operations|erp_audit",
  "nodes": [
    {
      "id": "unique-id",
      "type": "node_slug_from_list",
      "name": "Display name",
      "category": "trigger|action|logic|ai|integration|erp_audit",
      "config": {},
      "position": { "x": 100, "y": 100 }
    }
  ],
  "trigger_type": "manual|schedule|event|webhook"
}

Rules:
1. First node should be a trigger (trigger_manual, trigger_schedule, trigger_event, or trigger_webhook)
2. Use only nodes from the available list
3. Keep workflows focused and practical (3-8 nodes typically)
4. Include appropriate logic nodes for conditions when needed
5. Match the category to the workflow purpose`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_workflow",
              description: "Create a workflow definition",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Workflow name" },
                  description: { type: "string", description: "Brief description" },
                  category: { 
                    type: "string", 
                    enum: ["sales", "marketing", "ai_content", "operations", "erp_audit"] 
                  },
                  trigger_type: {
                    type: "string",
                    enum: ["manual", "schedule", "event", "webhook"]
                  },
                  nodes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        name: { type: "string" },
                        category: { type: "string" },
                        config: { type: "object" },
                        position: {
                          type: "object",
                          properties: {
                            x: { type: "number" },
                            y: { type: "number" }
                          }
                        }
                      },
                      required: ["id", "type", "name", "category"]
                    }
                  }
                },
                required: ["name", "description", "category", "trigger_type", "nodes"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_workflow" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-workflow] AI error:", errorText);
      throw new Error("Failed to generate workflow");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No workflow generated");
    }

    const workflow = JSON.parse(toolCall.function.arguments);
    console.log(`[generate-workflow] Generated: ${workflow.name} with ${workflow.nodes?.length || 0} nodes`);

    return new Response(
      JSON.stringify({ workflow }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[generate-workflow] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
