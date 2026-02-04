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
    const { url } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[geo-audit] Auditing URL:", url);

    // Fetch the page content
    let pageContent = "";
    let fetchError = null;
    
    try {
      const pageResponse = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GEOAuditBot/1.0)",
        },
      });
      pageContent = await pageResponse.text();
    } catch (e) {
      fetchError = e;
      console.error("[geo-audit] Failed to fetch page:", e);
    }

    const systemPrompt = `You are a GEO (Generative Engine Optimization) expert. Analyze web pages for AI discoverability - how well they will be cited by ChatGPT, Perplexity, Claude, and other AI systems.

Score each category from 0-100 and provide specific findings and recommendations.

Categories to evaluate:
1. Structured Data: JSON-LD, Schema.org markup, Open Graph tags
2. Content Quality: Clear answers, FAQ sections, statistics, citations, E-E-A-T signals
3. Technical SEO: Semantic HTML, heading structure, meta tags, accessibility
4. E-E-A-T Signals: Author info, expertise indicators, trust signals, source citations

Return ONLY valid JSON in this exact format:
{
  "overallScore": number,
  "structuredData": { "score": number, "findings": ["..."], "recommendations": ["..."] },
  "contentQuality": { "score": number, "findings": ["..."], "recommendations": ["..."] },
  "technicalSEO": { "score": number, "findings": ["..."], "recommendations": ["..."] },
  "eatSignals": { "score": number, "findings": ["..."], "recommendations": ["..."] }
}`;

    const userPrompt = fetchError 
      ? `I couldn't fetch the page at ${url}. Please provide a general GEO audit checklist with mock scores showing what to look for.`
      : `Analyze this page for GEO (AI discoverability). URL: ${url}\n\nPage HTML (first 15000 chars):\n${pageContent.slice(0, 15000)}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[geo-audit] AI error:", errorText);
      throw new Error("AI request failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse audit results");
    }
    
    const auditResult = JSON.parse(jsonMatch[0]);
    console.log("[geo-audit] Audit complete, score:", auditResult.overallScore);

    return new Response(JSON.stringify(auditResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[geo-audit] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Audit failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
