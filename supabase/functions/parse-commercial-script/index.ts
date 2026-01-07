import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Scene {
  order: number;
  duration: number;
  description: string;
  visual_prompt: string;
  voiceover_text: string;
}

interface ParsedScript {
  title: string;
  scenes: Scene[];
  total_duration: number;
  full_voiceover: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { script_text, title } = await req.json();

    if (!script_text) {
      throw new Error("Script text is required");
    }

    // Use AI to parse the script into scenes
    const aiPrompt = `You are a professional video commercial director. Parse this commercial script into individual scenes for video generation.

For each scene, provide:
1. A scene order number
2. Duration in seconds (scenes should add up to approximately 60 seconds total)
3. A brief description of what happens
4. A detailed visual prompt for AI video generation (be specific about camera angles, lighting, mood, action)
5. The voiceover text for that scene

Script:
${script_text}

Respond in this exact JSON format:
{
  "scenes": [
    {
      "order": 1,
      "duration": 3,
      "description": "Opening with black screen and heartbeat",
      "visual_prompt": "Pure black screen with subtle red pulse emanating from center, dramatic lighting, cinematic 4K",
      "voiceover_text": "You have ideas."
    }
  ],
  "full_voiceover": "The complete voiceover text combined"
}`;

    // Call Lovable AI for parsing
    const aiResponse = await fetch("https://lovable.dev/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: aiPrompt }],
      }),
    });

    let parsedScript: ParsedScript;

    if (!aiResponse.ok) {
      // Fallback: Simple scene parsing if AI fails
      console.log("AI parsing failed, using fallback parser");
      parsedScript = fallbackParse(script_text, title);
    } else {
      const aiResult = await aiResponse.json();
      const content = aiResult.choices?.[0]?.message?.content || "";
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedScript = {
          title: title || "Untitled Commercial",
          scenes: parsed.scenes,
          total_duration: parsed.scenes.reduce((sum: number, s: Scene) => sum + s.duration, 0),
          full_voiceover: parsed.full_voiceover,
        };
      } else {
        parsedScript = fallbackParse(script_text, title);
      }
    }

    // Create the commercial project
    const { data: project, error: projectError } = await supabaseClient
      .from("commercial_projects")
      .insert({
        user_id: user.id,
        title: parsedScript.title,
        script_text,
        status: "generating",
        price_cents: 2999, // $29.99 base price
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    // Create scenes
    const scenesToInsert = parsedScript.scenes.map((scene) => ({
      project_id: project.id,
      scene_order: scene.order,
      description: scene.description,
      visual_prompt: scene.visual_prompt,
      voiceover_text: scene.voiceover_text,
      duration_seconds: scene.duration,
      status: "pending",
    }));

    const { error: scenesError } = await supabaseClient
      .from("commercial_scenes")
      .insert(scenesToInsert);

    if (scenesError) {
      throw new Error(`Failed to create scenes: ${scenesError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        project_id: project.id,
        scenes_count: parsedScript.scenes.length,
        total_duration: parsedScript.total_duration,
        full_voiceover: parsedScript.full_voiceover,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error parsing script:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

function fallbackParse(scriptText: string, title: string): ParsedScript {
  // Simple fallback that splits script into chunks
  const lines = scriptText.split("\n").filter((l) => l.trim());
  const scenes: Scene[] = [];
  let order = 1;
  let currentDescription = "";
  let currentVoiceover = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      // Scene direction
      if (currentVoiceover) {
        scenes.push({
          order: order++,
          duration: Math.max(3, Math.ceil(currentVoiceover.split(" ").length / 3)),
          description: currentDescription || "Scene transition",
          visual_prompt: currentDescription || "Cinematic transition, professional lighting, 4K quality",
          voiceover_text: currentVoiceover,
        });
        currentVoiceover = "";
      }
      currentDescription = trimmed.slice(1, -1);
    } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      // Voiceover text
      currentVoiceover += (currentVoiceover ? " " : "") + trimmed.slice(1, -1);
    }
  }

  // Add final scene
  if (currentVoiceover || currentDescription) {
    scenes.push({
      order: order,
      duration: Math.max(3, Math.ceil((currentVoiceover || "").split(" ").length / 3)),
      description: currentDescription || "Final scene",
      visual_prompt: currentDescription || "Logo reveal, professional branding, cinematic lighting",
      voiceover_text: currentVoiceover,
    });
  }

  // Ensure we have at least one scene
  if (scenes.length === 0) {
    scenes.push({
      order: 1,
      duration: 60,
      description: "Full commercial",
      visual_prompt: "Professional business montage, modern office, technology, success imagery, 4K cinematic",
      voiceover_text: scriptText.replace(/\[.*?\]/g, "").replace(/"/g, "").trim(),
    });
  }

  return {
    title: title || "Untitled Commercial",
    scenes,
    total_duration: scenes.reduce((sum, s) => sum + s.duration, 0),
    full_voiceover: scenes.map((s) => s.voiceover_text).join(" "),
  };
}
