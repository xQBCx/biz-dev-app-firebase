import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, documentUrl, extractionType = "full" } = await req.json();

    if (!documentId || !documentUrl) {
      return new Response(
        JSON.stringify({ error: "Document ID and URL are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const startTime = Date.now();

    // System prompt for plan extraction
    const systemPrompt = `You are an expert construction plan analyzer specializing in takeoff and estimation.
Analyze the provided construction plan and extract:
1. Project Details: name, location, sheet info, scale
2. Building Systems: roofs, walls, foundations with dimensions
3. Quantities: areas (sqft), lengths (lf), counts (ea), volumes (cf)
4. Materials: specified products, manufacturers, notes
5. CSI Divisions: organized by construction spec sections

Return structured JSON with confidence scores for each extraction.`;

    const userPrompt = `Extract all quantifiable information from this construction plan document.
Document URL: ${documentUrl}
Extraction type: ${extractionType}

Focus on:
- Roof systems (type, area, slope, materials)
- Wall assemblies and linear footage
- Door and window schedules
- Material callouts and specifications
- Any visible measurements or dimensions
- Sheet metal details (coping, edge, gutters)`;

    // Call Lovable AI with vision capabilities
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Fast vision model
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: documentUrl } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_plan_data",
            description: "Extract structured data from construction plans",
            parameters: {
              type: "object",
              properties: {
                projectInfo: {
                  type: "object",
                  properties: {
                    sheetNumber: { type: "string" },
                    sheetTitle: { type: "string" },
                    scale: { type: "string" },
                    discipline: { type: "string" }
                  }
                },
                systems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      systemType: { type: "string" },
                      area: { type: "number" },
                      linearFeet: { type: "number" },
                      count: { type: "number" },
                      materials: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                quantities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item: { type: "string" },
                      quantity: { type: "number" },
                      unit: { type: "string" },
                      location: { type: "string" },
                      csiDivision: { type: "string" }
                    }
                  }
                },
                confidence: { type: "number", minimum: 0, maximum: 1 }
              },
              required: ["projectInfo", "systems", "quantities"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_plan_data" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    // Parse the tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let extractedData = {};
    let confidence = 0.8;

    if (toolCall) {
      try {
        extractedData = JSON.parse(toolCall.function.arguments);
        confidence = extractedData.confidence || 0.8;
      } catch (e) {
        console.error("Failed to parse tool call:", e);
        extractedData = { error: "Failed to parse extraction results" };
      }
    }

    // Log to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("ai_extraction_log").insert({
      document_id: documentId,
      extraction_type: extractionType,
      model_used: "google/gemini-2.5-flash",
      extracted_data: extractedData,
      confidence_score: confidence,
      processing_time_ms: processingTime
    });

    return new Response(
      JSON.stringify({
        success: true,
        extractedData,
        confidence,
        processingTimeMs: processingTime,
        model: "google/gemini-2.5-flash"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in extract-plan-data:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
