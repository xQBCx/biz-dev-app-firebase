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
    const { notebookId, question, sources } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build context from sources
    const context = sources
      .map((s: any) => `[Source: ${s.title}]\n${s.content || s.summary || ""}`)
      .join("\n\n---\n\n");

    // Determine if question needs real-time web search
    const needsWebSearch = /latest|current|today|recent|now|2024|2025|real-time|update|news|price|stock|weather|score|happening/i.test(question);

    let systemPrompt: string;
    
    if (needsWebSearch) {
      systemPrompt = `You are an intelligent research assistant with access to real-time web information. 

Your task is to answer the user's question using:
1. The provided source documents below
2. Your general knowledge and real-time web search capabilities

UPLOADED SOURCES:
${context || "No sources uploaded yet."}

Guidelines:
- For factual/real-time questions (prices, news, current events, company info), use your web search capabilities to provide accurate, up-to-date information
- When referencing uploaded sources, cite them as [Source: title]
- When using web knowledge, indicate the source or note that it's based on current information
- Be thorough, accurate, and cite your sources
- If information conflicts, prefer verified/official sources
- Provide detailed, well-researched answers`;
    } else {
      systemPrompt = `You are a research assistant analyzing uploaded documents. Answer questions based primarily on the provided sources, supplemented with your general knowledge when helpful.

SOURCES:
${context}

Guidelines:
- Answer based on the provided sources when available
- Include [Source: title] citations for information from uploaded documents
- If the sources don't cover the question, use your knowledge but note this
- Be concise but thorough`;
    }

    console.log(`Processing question: "${question}" | Web search mode: ${needsWebSearch}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Using Pro for better research quality
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI error:", err);
      
      // Handle rate limits
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
