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
    const { imageUrl, venueType } = await req.json();
    
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing crowd for venue type:", venueType);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI crowd analysis expert. Analyze venue images and provide:
1. Crowd level (low/medium/high/packed)
2. Energy level (1-10 scale)
3. Estimated count
4. Atmosphere description
5. Peak activity areas

Be concise and accurate.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${venueType} venue image. Provide: crowd level, energy (1-10), estimated count, atmosphere, and peak areas.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log("Crowd analysis complete:", analysis);

    // Parse the analysis to extract structured data
    const crowdLevelMatch = analysis.match(/crowd level:?\s*(low|medium|high|packed)/i);
    const energyMatch = analysis.match(/energy:?\s*(\d+)/i);
    const countMatch = analysis.match(/count:?\s*(\d+)/i);

    return new Response(
      JSON.stringify({
        analysis,
        crowdLevel: crowdLevelMatch ? crowdLevelMatch[1].toLowerCase() : "medium",
        energyLevel: energyMatch ? parseInt(energyMatch[1]) : 5,
        estimatedCount: countMatch ? parseInt(countMatch[1]) : null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-crowd function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
