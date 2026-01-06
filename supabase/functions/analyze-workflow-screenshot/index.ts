import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, mimeType = "image/png" } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
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

    console.log("[analyze-workflow-screenshot] Processing image...");

    const systemPrompt = `You are an expert workflow automation analyst. Analyze the provided screenshot and identify any workflows, automations, or process names visible in the image.

For EACH workflow/automation you detect, provide:
1. name: The workflow name as shown or a clear descriptive name
2. description: What this workflow likely does (1-2 sentences)
3. category: One of: sales, marketing, ai_content, operations, erp_audit
4. confidence: How confident you are this is a real workflow (0.0-1.0)
5. suggestedNodes: Array of nodes this workflow likely contains

Node categories: trigger, action, logic, ai, integration
Node types: schedule, webhook, event, manual (triggers), email, slack, task, update_record, http_request (actions), condition, delay, loop (logic), analyze, generate, summarize (ai)

Return a JSON object with a "workflows" array. Even if you see just a list of names, infer what each workflow does based on the name.

Example output:
{
  "workflows": [
    {
      "name": "Lead Scoring Automation",
      "description": "Automatically scores incoming leads based on behavior and demographics",
      "category": "sales",
      "confidence": 0.92,
      "suggestedNodes": [
        { "type": "event", "name": "New Lead Created", "category": "trigger", "description": "Triggers when a new lead is added" },
        { "type": "analyze", "name": "AI Lead Analysis", "category": "ai", "description": "Analyzes lead data for scoring" },
        { "type": "condition", "name": "Check Score", "category": "logic", "description": "Routes based on lead score" },
        { "type": "task", "name": "Create Follow-up", "category": "action", "description": "Creates task for sales rep" }
      ]
    }
  ]
}`;

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
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${image}`,
                },
              },
              {
                type: "text",
                text: "Analyze this screenshot and identify all visible workflows, automations, or process names. Return the structured JSON response with detected workflows.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "detect_workflows",
              description: "Return detected workflows from the screenshot",
              parameters: {
                type: "object",
                properties: {
                  workflows: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        category: { 
                          type: "string",
                          enum: ["sales", "marketing", "ai_content", "operations", "erp_audit"]
                        },
                        confidence: { type: "number" },
                        suggestedNodes: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: { type: "string" },
                              name: { type: "string" },
                              category: { type: "string" },
                              description: { type: "string" }
                            },
                            required: ["type", "name", "category"]
                          }
                        }
                      },
                      required: ["name", "description", "category", "confidence", "suggestedNodes"]
                    }
                  }
                },
                required: ["workflows"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "detect_workflows" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[analyze-workflow-screenshot] AI error:", errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to analyze screenshot");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.log("[analyze-workflow-screenshot] No tool call in response");
      return new Response(
        JSON.stringify({ workflows: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log(`[analyze-workflow-screenshot] Detected ${result.workflows?.length || 0} workflows`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[analyze-workflow-screenshot] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
