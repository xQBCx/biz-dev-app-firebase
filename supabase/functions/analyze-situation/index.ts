import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, situation_type } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.log("LOVABLE_API_KEY not found, returning defaults");
      return new Response(
        JSON.stringify({
          severity: "medium",
          urgency_score: 50,
          context_summary: null,
          recommended_action: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Sytuation, a situational intelligence system that helps people understand and resolve situations quickly.

Your job is to analyze a situation described by a user and provide:
1. An assessment of severity (low, medium, high, critical)
2. An urgency score (0-100, where 100 is most urgent)
3. A brief context summary that captures what's really happening
4. A single, clear recommended next action

Be practical and direct. Focus on what matters most and what can be done immediately.`;

    const userPrompt = `Analyze this situation:

Title: ${title}
Type: ${situation_type}
${description ? `Details: ${description}` : ""}

Provide your analysis as JSON with these fields:
- severity: "low" | "medium" | "high" | "critical"
- urgency_score: number 0-100
- context_summary: string (1-2 sentences capturing the essence)
- recommended_action: string (a single, specific next step)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_situation",
              description: "Analyze a situation and provide assessment",
              parameters: {
                type: "object",
                properties: {
                  severity: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "How severe is this situation",
                  },
                  urgency_score: {
                    type: "number",
                    description: "Urgency score from 0-100",
                  },
                  context_summary: {
                    type: "string",
                    description: "1-2 sentence summary of what's happening",
                  },
                  recommended_action: {
                    type: "string",
                    description: "Single specific next step to take",
                  },
                },
                required: ["severity", "urgency_score", "context_summary", "recommended_action"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_situation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    // Extract function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({
        severity: "medium",
        urgency_score: 50,
        context_summary: null,
        recommended_action: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing situation:", error);
    return new Response(
      JSON.stringify({
        severity: "medium",
        urgency_score: 50,
        context_summary: null,
        recommended_action: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
