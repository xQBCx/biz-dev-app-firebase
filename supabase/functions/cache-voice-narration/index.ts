import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for content
async function hashContent(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

    if (!elevenlabsApiKey) {
      return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { text, cacheKey, persona = 'biz', signatureOverride } = await req.json();

    if (!text || !cacheKey) {
      return new Response(JSON.stringify({ error: 'Missing text or cacheKey' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use signature override for hashing if provided (key properties only)
    const hashInput = signatureOverride ? signatureOverride + persona : text + persona;
    const contentHash = await hashContent(hashInput);

    // Check if cached version exists with matching hash
    const { data: existingCache } = await supabase
      .from('voice_narration_cache')
      .select('audio_url, content_hash')
      .eq('cache_key', cacheKey)
      .single();

    if (existingCache && existingCache.content_hash === contentHash) {
      console.log('Cache hit for:', cacheKey);
      return new Response(JSON.stringify({ audioUrl: existingCache.audio_url, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Cache miss for:', cacheKey, '- generating audio');

    // Voice IDs from memory
    const voiceId = persona === 'dev' ? 'cjVigY5qzO86Huf0OWal' : 'onwK4e9ZLuTAKqWW03F9';

    // Generate audio via ElevenLabs
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenlabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('ElevenLabs error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to generate audio' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const filePath = `${cacheKey.replace(/[^a-zA-Z0-9-]/g, '-')}-${contentHash}.mp3`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('voice-narrations')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload audio' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('voice-narrations')
      .getPublicUrl(filePath);

    const audioUrl = publicUrlData.publicUrl;

    // Upsert cache record
    const { error: upsertError } = await supabase
      .from('voice_narration_cache')
      .upsert({
        cache_key: cacheKey,
        audio_url: audioUrl,
        content_hash: contentHash,
        persona,
        file_path: filePath,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'cache_key',
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
    }

    return new Response(JSON.stringify({ audioUrl, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
