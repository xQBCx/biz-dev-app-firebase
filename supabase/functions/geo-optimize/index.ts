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
    const { content } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("[geo-optimize] Optimizing content length:", content?.length);

    const systemPrompt = `You are a GEO (Generative Engine Optimization) content specialist. Your job is to enhance content so it gets cited by AI systems like ChatGPT, Perplexity, and Claude.

Transform the user's content by:

1. **Add Clear, Direct Answers**: Start sections with concise, quotable statements that directly answer potential questions
2. **Include Statistics & Data**: Add relevant statistics, percentages, and data points (mark as [statistic needed] if you need to make them up)
3. **Create FAQ Section**: Add a "Frequently Asked Questions" section with 3-5 Q&As based on the content
4. **Add Expert Quotes**: Include quotable expert opinions or insights
5. **Structure with Headings**: Use clear H2/H3 headings that match common search queries
6. **Add Summary Box**: Include a TL;DR or Key Takeaways section at the top
7. **Citation-Ready Snippets**: Create standalone sentences that can be directly quoted by AI
8. **E-E-A-T Signals**: Add author credentials, last updated date, and source references where appropriate

Return the optimized content in clean markdown format. Preserve the original meaning while making it more AI-citable.`;

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
          { role: "user", content: `Optimize this content for AI discoverability:\n\n${content}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[geo-optimize] AI error:", errorText);
      throw new Error("AI request failed");
    }

    const data = await response.json();
    const optimizedContent = data.choices?.[0]?.message?.content || "";
    
    console.log("[geo-optimize] Content optimized");

    return new Response(JSON.stringify({ optimizedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[geo-optimize] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Optimization failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
