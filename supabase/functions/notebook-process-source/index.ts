import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the source
    const { data: source, error } = await supabase
      .from("notebook_sources")
      .select("*")
      .eq("id", sourceId)
      .single();

    if (error || !source) {
      throw new Error("Source not found");
    }

    // Update to processing
    await supabase
      .from("notebook_sources")
      .update({ processing_status: "processing" })
      .eq("id", sourceId);

    let content = source.content || "";
    let summary = "";

    // For URLs, fetch content
    if (source.source_type === "url" && source.source_url) {
      try {
        const res = await fetch(source.source_url);
        const html = await res.text();
        content = html.replace(/<[^>]*>/g, " ").substring(0, 50000);
      } catch (e) {
        console.error("Failed to fetch URL:", e);
      }
    }

    // Generate summary using AI
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey && content) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Summarize the following content in 2-3 paragraphs." },
              { role: "user", content: content.substring(0, 30000) },
            ],
          }),
        });

        if (aiRes.ok) {
          const data = await aiRes.json();
          summary = data.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("AI summary failed:", e);
      }
    }

    // Update with processed content
    await supabase
      .from("notebook_sources")
      .update({
        content: content.substring(0, 100000),
        summary,
        processing_status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", sourceId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});