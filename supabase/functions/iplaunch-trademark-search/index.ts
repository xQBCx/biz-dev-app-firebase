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
    const { markText, description, classes } = await req.json();

    if (!markText || !description) {
      throw new Error("Trademark text and description are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a USPTO trademark attorney assistant. Analyze trademark applications for registrability and provide risk assessments.

Your response must be valid JSON with this exact structure:
{
  "strengthScore": 85,
  "riskLevel": "low",
  "similarMarks": [
    {
      "mark": "SIMILAR MARK",
      "owner": "Company Name",
      "classes": "25, 35",
      "status": "Registered",
      "similarity": "High"
    }
  ],
  "recommendedClasses": [
    { "class": "25", "description": "Clothing" },
    { "class": "35", "description": "Advertising services" }
  ],
  "suggestions": [
    "The mark has strong distinctiveness...",
    "Consider adding design elements...",
    "File in International Class 42 for software services..."
  ],
  "distinctiveness": "Suggestive"
}

Risk levels: "low", "medium", "high"
Distinctiveness levels: "Generic", "Descriptive", "Suggestive", "Arbitrary", "Fanciful"`;

    const userPrompt = `Trademark: ${markText}
Goods/Services: ${description}
Proposed Classes: ${classes || "Not specified"}

Analyze this trademark application for:
1. Trademark strength score (0-100)
2. Overall risk level
3. Similar existing marks (USPTO database simulation)
4. Recommended trademark classes
5. Suggestions for improving registrability
6. Distinctiveness assessment`;

    console.log("Calling Lovable AI for trademark analysis...");

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
      throw new Error("Failed to generate trademark analysis");
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
        strengthScore: 0,
        riskLevel: "medium",
        similarMarks: [],
        recommendedClasses: [],
        suggestions: ["Unable to analyze trademark at this time. Please try again."],
        distinctiveness: "Unknown"
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
    console.error("Trademark search error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
