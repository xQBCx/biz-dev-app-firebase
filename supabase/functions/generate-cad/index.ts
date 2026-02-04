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
    const {
      projectId,
      systemType,
      dimensions,
      specifications,
      format = "dxf" // dxf, dwg, pdf
    } = await req.json();

    if (!projectId || !systemType || !dimensions) {
      return new Response(
        JSON.stringify({ error: "Project ID, system type, and dimensions are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for CAD generation
    const systemPrompt = `You are an expert CAD designer specializing in construction drawings.
Generate precise, professional construction drawings based on specifications.
Include:
- Accurate dimensions and annotations
- Layer organization (walls, dimensions, text, hatching)
- Standard construction symbols
- Title block with project info
- Scale and north arrow where applicable

Output format: ${format.toUpperCase()} compatible markup or instructions for CAD generation.`;

    const userPrompt = `Generate a ${systemType} construction drawing with the following:

Dimensions: ${JSON.stringify(dimensions)}
Specifications: ${JSON.stringify(specifications)}
Output format: ${format}

Include:
1. Main system layout with dimensions
2. Detail callouts for complex areas
3. Material specifications and notes
4. Section cuts where needed
5. Title block with project: ${projectId}

Provide detailed CAD instructions or markup that can be converted to ${format}.`;

    // Call Lovable AI for CAD generation logic
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Use pro for complex CAD logic
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3, // More deterministic for technical drawings
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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const cadInstructions = result.choices?.[0]?.message?.content || "";

    // TODO: In production, convert AI-generated instructions to actual CAD files
    // For now, return the structured instructions
    const cadData = {
      format,
      systemType,
      instructions: cadInstructions,
      layers: extractLayers(cadInstructions),
      entities: extractEntities(cadInstructions),
      metadata: {
        projectId,
        generatedAt: new Date().toISOString(),
        model: "google/gemini-2.5-pro"
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        cadData,
        downloadUrl: null, // TODO: Generate actual file and upload to storage
        message: "CAD instructions generated. Integration with CAD export pending."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-cad:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper functions to parse CAD instructions
function extractLayers(instructions: string): string[] {
  const layerRegex = /Layer[:\s]+([A-Z_]+)/gi;
  const matches = instructions.matchAll(layerRegex);
  return Array.from(matches, m => m[1]);
}

function extractEntities(instructions: string): any[] {
  // Parse for common CAD entities (line, circle, arc, text, dimension)
  const entities: any[] = [];
  const lines = instructions.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('line')) {
      entities.push({ type: 'line', data: line });
    } else if (line.toLowerCase().includes('dimension')) {
      entities.push({ type: 'dimension', data: line });
    } else if (line.toLowerCase().includes('text')) {
      entities.push({ type: 'text', data: line });
    }
  }
  
  return entities;
}
