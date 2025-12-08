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
    const { notebookId, outputType, sources } = await req.json();
    const authHeader = req.headers.get("Authorization");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from auth header
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const context = sources
      .map((s: any) => `[${s.title}]\n${s.content || s.summary || ""}`)
      .join("\n\n---\n\n");

    const prompts: Record<string, string> = {
      flashcards: `Create 10-15 flashcards from this content. Return JSON: { "cards": [{ "question": "...", "answer": "..." }] }`,
      study_guide: `Create a comprehensive study guide with sections, key concepts, and definitions. Return as formatted text.`,
      briefing: `Create a concise executive briefing document summarizing the key points. Return as formatted text.`,
      slides: `Create a slide deck outline. Return JSON: { "slides": [{ "title": "...", "bullets": ["..."] }] }`,
      mind_map: `Create a mind map structure. Return JSON: { "central": "...", "branches": [{ "topic": "...", "subtopics": ["..."] }] }`,
      audio_overview: `Create a conversational podcast script discussing the key points. Two hosts discussing the material naturally.`,
    };

    const systemPrompt = `You are creating educational content from source materials.\n\nSOURCES:\n${context.substring(0, 50000)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompts[outputType] || "Summarize this content." },
        ],
      }),
    });

    if (!aiRes.ok) {
      throw new Error("AI generation failed");
    }

    const data = await aiRes.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let content: any = { text: rawContent };
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      }
    } catch {}

    const titleMap: Record<string, string> = {
      flashcards: "Flashcards",
      study_guide: "Study Guide",
      briefing: "Briefing Document",
      slides: "Slide Deck",
      mind_map: "Mind Map",
      audio_overview: "Audio Overview",
    };

    await supabase.from("notebook_outputs").insert({
      notebook_id: notebookId,
      user_id: user.id,
      output_type: outputType,
      title: titleMap[outputType] || "Output",
      content,
      status: "completed",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});