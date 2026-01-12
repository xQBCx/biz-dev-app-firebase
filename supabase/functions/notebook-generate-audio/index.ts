import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { outputId, transcript } = await req.json();
    const authHeader = req.headers.get("Authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Parse the transcript into dialogue segments
    const dialogueSegments = parseDialogue(transcript);
    
    // Voice IDs for Biz and Dev personas (matching existing system)
    const voiceIds = {
      biz: "onwK4e9ZLuTAKqWW03F9", // Daniel - professional business voice
      dev: "cjVigY5qzO86Huf0OWal", // Eric - technical developer voice
    };

    console.log(`Generating audio for ${dialogueSegments.length} segments...`);

    // Generate audio for each segment
    const audioChunks: ArrayBuffer[] = [];
    
    for (const segment of dialogueSegments) {
      const voiceId = segment.speaker === "biz" ? voiceIds.biz : voiceIds.dev;
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: segment.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error(`ElevenLabs error for segment: ${response.status}`);
        continue;
      }

      const audioBuffer = await response.arrayBuffer();
      audioChunks.push(audioBuffer);
    }

    // Combine all audio chunks
    const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const combinedAudio = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunks) {
      combinedAudio.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }

    // Upload to storage
    const fileName = `audio/${user.id}/${outputId}-${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("notebook-outputs")
      .upload(fileName, combinedAudio, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      // If bucket doesn't exist, just return a base64 data URL
      const base64Audio = base64Encode(combinedAudio.buffer);
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      
      // Update the notebook output with the audio URL
      await supabase
        .from("notebook_outputs")
        .update({ audio_url: audioUrl })
        .eq("id", outputId);

      return new Response(
        JSON.stringify({ success: true, audioUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("notebook-outputs")
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    // Update the notebook output with the audio URL
    await supabase
      .from("notebook_outputs")
      .update({ audio_url: audioUrl })
      .eq("id", outputId);

    return new Response(
      JSON.stringify({ success: true, audioUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface DialogueSegment {
  speaker: "biz" | "dev";
  text: string;
}

function parseDialogue(transcript: string): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  
  // Try to parse structured dialogue
  const lines = transcript.split(/\n+/);
  let currentSpeaker: "biz" | "dev" = "biz";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for speaker indicators
    const bizMatch = trimmed.match(/^(Biz|Host 1|Speaker 1|Business Host|A):\s*(.+)/i);
    const devMatch = trimmed.match(/^(Dev|Host 2|Speaker 2|Technical Host|B):\s*(.+)/i);
    
    if (bizMatch) {
      segments.push({ speaker: "biz", text: bizMatch[2] });
      currentSpeaker = "biz";
    } else if (devMatch) {
      segments.push({ speaker: "dev", text: devMatch[2] });
      currentSpeaker = "dev";
    } else if (trimmed.length > 10) {
      // Alternate speakers for unstructured text
      segments.push({ speaker: currentSpeaker, text: trimmed });
      currentSpeaker = currentSpeaker === "biz" ? "dev" : "biz";
    }
  }
  
  // If no structured dialogue found, split by sentences and alternate
  if (segments.length === 0) {
    const sentences = transcript.split(/(?<=[.!?])\s+/);
    let speaker: "biz" | "dev" = "biz";
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (sentence.length > 5) {
        segments.push({ speaker, text: sentence });
        speaker = speaker === "biz" ? "dev" : "biz";
      }
    }
  }
  
  return segments.length > 0 ? segments : [{ speaker: "biz", text: transcript }];
}
