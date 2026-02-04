import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inventionTitle, description, patentType } = await req.json();

    if (!inventionTitle || !description) {
      throw new Error("Invention title and description are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a USPTO patent attorney assistant. Generate patent application components based on the provided invention details. 

Your response must be valid JSON with this exact structure:
{
  "abstract": "A concise 150-word abstract summarizing the invention",
  "claims": [
    "1. A method/system/apparatus comprising...",
    "2. The method of claim 1, wherein...",
    "3. The method of claim 1, further comprising..."
  ],
  "noveltyScore": 75,
  "priorArtRisks": [
    "Similar patent US1234567 describes...",
    "Potential overlap with patent application US20220123456..."
  ],
  "recommendations": [
    "Emphasize the unique aspect of...",
    "Consider filing in class XYZ..."
  ]
}`;

    const userPrompt = `Patent Type: ${patentType}
Invention Title: ${inventionTitle}
Description: ${description}

Generate a comprehensive patent application analysis including:
1. Professional abstract (USPTO format)
2. At least 5 independent and dependent claims
3. Novelty score (0-100)
4. Potential prior art risks
5. Filing recommendations`;

    console.log("Calling Lovable AI for patent analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
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
          JSON.stringify({ error: "AI quota exceeded. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to generate patent analysis");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log("AI response received, parsing...");

    // Try to parse JSON from the response
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      // Fallback structure
      parsedContent = {
        abstract: "AI-generated abstract parsing failed. Please try again.",
        claims: ["Claim generation failed. Please try again."],
        noveltyScore: 0,
        priorArtRisks: ["Unable to assess prior art at this time."],
        recommendations: ["Please regenerate the analysis."]
      };
    }

    return new Response(
      JSON.stringify(parsedContent),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Patent assist error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
