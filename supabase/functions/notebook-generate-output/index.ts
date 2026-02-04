import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_MODEL = "google/gemini-3-pro-preview";
const SLIDES_MODEL = "google/gemini-2.5-pro";

const JSON_OUTPUT_TYPES = new Set([
  "flashcards",
  "slides",
  "mind_map",
  "video_script",
  "quiz",
  "infographic",
  "data_table",
]);

function buildContext(sources: any[]) {
  return sources
    .map((s: any) => {
      const meta = [s.source_type, s.file_type].filter(Boolean).join(" • ");
      const body = s.content || s.summary || "";
      return `# ${s.title}${meta ? `\n(${meta})` : ""}\n\n${body}`;
    })
    .join("\n\n---\n\n");
}

function extractJsonLoose(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }
  return null;
}

function getSlidesPrompt() {
  return `Create an executive-grade slide deck grounded ONLY in the provided sources.

Return STRICT JSON (no markdown, no commentary) with this schema:
{
  "slides": [
    {
      "title": "string",
      "subtitle": "string (optional; only for slide 1)",
      "layout": "title" | "content" | "quote" | "stats",
      "keyMessage": "string (optional)",
      "bullets": ["string"],
      "stats": [{"label":"string","value":"string"}],
      "speakerNotes": "string"
    }
  ]
}

Quality rules (non-negotiable):
- 10–14 slides.
- Slide 1: layout="title", include subtitle, no bullets.
- Slide 2: "Agenda" (3–5 bullets).
- Use boardroom tone: precise, calm, no hype language.
- Bullets: 3–6 per slide, each ≤ 14 words, strong verbs, no filler.
- Include exactly ONE quote slide (layout="quote") capturing the core thesis.
- Include exactly ONE stats slide (layout="stats"). If sources lack numbers, use count-based stats (e.g., "3 Levers", "5 Moves") derived from the deck’s structure (not fabricated facts).
- Speaker notes: 2–4 sentences per slide, explain what to say; reference source titles when making specific claims.
- Do not invent facts, names, or metrics not supported by sources.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notebookId, outputType, sources } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!notebookId || !outputType) {
      return new Response(JSON.stringify({ error: "Missing notebookId or outputType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from auth header
    const token = authHeader?.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const context = buildContext(Array.isArray(sources) ? sources : []);

    const prompts: Record<string, string> = {
      flashcards:
        'Create 10-15 flashcards from this content. Return JSON: { "cards": [{ "question": "...", "answer": "..." }] }',
      study_guide:
        "Create a comprehensive study guide with sections, key concepts, and definitions. Return as formatted text with HTML markup for structure.",
      briefing:
        "Create a concise executive briefing document summarizing the key points for C-level executives. Return as formatted text with HTML markup.",
      slides: getSlidesPrompt(),
      mind_map:
        'Create a mind map structure showing relationships between concepts. Return JSON: { "central": "...", "branches": [{ "topic": "...", "subtopics": ["..."], "connections": ["..."] }] }',
      audio_overview:
        "Create a conversational podcast script discussing the key points. Two hosts (Biz and Dev) discussing the material naturally with back-and-forth dialogue.",
      video_script:
        'Create a professional video script with scenes. Return JSON: { "title": "...", "duration": "5-7 minutes", "scenes": [{ "sceneNumber": 1, "setting": "...", "narration": "...", "visualNotes": "...", "duration": "30s" }], "callToAction": "..." }',
      quiz:
        'Create an interactive quiz with 10 questions to test comprehension. Return JSON: { "title": "...", "questions": [{ "id": 1, "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }] }',
      infographic:
        'Create structured data for an infographic. Return JSON: { "title": "...", "subtitle": "...", "sections": [{ "heading": "...", "stats": [{ "value": "...", "label": "..." }], "keyPoints": ["..."] }], "conclusion": "..." }',
      data_table:
        'Create comprehensive data tables summarizing the content. Return JSON: { "tables": [{ "title": "...", "description": "...", "columns": ["Column1", "Column2"], "rows": [["value1", "value2"]] }], "insights": ["..."] }',
    };

    const model = outputType === "slides" ? SLIDES_MODEL : DEFAULT_MODEL;

    const systemPrompt =
      outputType === "slides"
        ? `You are a boardroom-grade strategy deck writer.

You will:
- Synthesize the sources into a clear narrative (situation → problem → recommendation → plan → risks → next steps).
- Mirror any executive presentation tone implied by the sources.
- Avoid marketing fluff; write like a senior partner.

SOURCES (ground truth):\n${context.substring(0, 120000)}`
        : `You are creating educational content from source materials.\n\nSOURCES:\n${context.substring(0, 50000)}`;

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompts[outputType] || "Summarize this content." },
      ],
      temperature: outputType === "slides" ? 0.35 : 0.7,
      max_tokens: outputType === "slides" ? 7000 : 4000,
    };

    if (JSON_OUTPUT_TYPES.has(outputType)) {
      body.response_format = { type: "json_object" };
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI generation failed:", aiRes.status, errText);
      throw new Error("AI generation failed");
    }

    const data = await aiRes.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let content: any = { text: rawContent };

    if (JSON_OUTPUT_TYPES.has(outputType)) {
      try {
        content = JSON.parse(rawContent);
      } catch {
        const extracted = extractJsonLoose(rawContent);
        if (extracted) content = JSON.parse(extracted);
      }

      if (outputType === "slides") {
        const slides = content?.slides;
        if (!Array.isArray(slides) || slides.length < 6) {
          console.error("Invalid slides payload:", rawContent);
          throw new Error("Slide generation returned invalid JSON");
        }
      }
    } else {
      content = { html: rawContent, text: rawContent };
    }

    const titleMap: Record<string, string> = {
      flashcards: "Flashcards",
      study_guide: "Study Guide",
      briefing: "Briefing Document",
      slides: "Slide Deck",
      mind_map: "Mind Map",
      audio_overview: "Audio Overview",
      video_script: "Video Script",
      quiz: "Quiz",
      infographic: "Infographic Data",
      data_table: "Data Tables",
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
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
