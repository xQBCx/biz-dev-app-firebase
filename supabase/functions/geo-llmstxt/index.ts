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
    const { company, description } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("[geo-llmstxt] Generating llms.txt for:", company);

    const systemPrompt = `You are an expert in creating llms.txt files - the emerging standard for telling AI systems about websites (similar to robots.txt but for LLMs).

The llms.txt file format:
- Plain text file placed at website root (/llms.txt)
- Provides structured information for AI crawlers
- Helps AI systems accurately represent the company/product

Generate a comprehensive llms.txt file with these sections:

# [Company Name]

## About
[2-3 sentence company overview]

## Products/Services
[Bullet list of main offerings]

## Key Facts
[Important facts, statistics, founding date, etc.]

## Expertise Areas
[What topics this company is authoritative on]

## Contact
[How to reach the company]

## Preferred Citation Format
[How the company prefers to be cited]

## Do Not
[Common misconceptions to avoid]

## Last Updated
[Date]

Make it informative, accurate based on the input, and helpful for AI systems to understand and accurately represent this company.`;

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
          { role: "user", content: `Generate an llms.txt file for:\n\nCompany: ${company}\n\nDescription & Information:\n${description}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[geo-llmstxt] AI error:", errorText);
      throw new Error("AI request failed");
    }

    const data = await response.json();
    const llmsTxt = data.choices?.[0]?.message?.content || "";
    
    console.log("[geo-llmstxt] llms.txt generated");

    return new Response(JSON.stringify({ llmsTxt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[geo-llmstxt] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
