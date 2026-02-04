import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ElevenLabs voice IDs for interviewer and subject
const INTERVIEWER_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // Daniel - professional
const SUBJECT_VOICE = 'JBFqnCBsd6RMkjVDRZzb'; // George - conversational

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interviewId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch interview data
    const { data: interview, error: fetchError } = await supabaseClient
      .from('news_interviews')
      .select('*')
      .eq('id', interviewId)
      .single();

    if (fetchError || !interview) {
      throw new Error('Interview not found');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    console.log(`Generating audio interview for ${interview.subject_name}`);

    // Build conversation script
    const questions = interview.questions || [];
    const answers = interview.answers || [];
    
    // Generate intro
    const introText = `Welcome to BizDev Magazine's interview series. Today, we're speaking with ${interview.subject_name}${interview.subject_title ? `, ${interview.subject_title}` : ''}${interview.subject_company ? ` at ${interview.subject_company}` : ''}. Let's dive in.`;

    // Build audio segments
    const audioSegments: ArrayBuffer[] = [];

    // Generate intro with interviewer voice
    const introResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${INTERVIEWER_VOICE}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: introText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!introResponse.ok) {
      console.error('ElevenLabs intro error:', await introResponse.text());
      throw new Error('Failed to generate intro audio');
    }

    audioSegments.push(await introResponse.arrayBuffer());

    // Generate Q&A segments (limit to first 5 for API efficiency)
    const qaPairsToGenerate = Math.min(questions.length, 5);
    
    for (let i = 0; i < qaPairsToGenerate; i++) {
      const q = questions[i];
      const a = answers[i];
      
      if (!q?.question || !a?.answer) continue;

      // Generate question with interviewer voice
      const qResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${INTERVIEWER_VOICE}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: q.question,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (qResponse.ok) {
        audioSegments.push(await qResponse.arrayBuffer());
      }

      // Generate answer with subject voice
      const aResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${SUBJECT_VOICE}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: a.answer.substring(0, 2000), // Limit length
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          }),
        }
      );

      if (aResponse.ok) {
        audioSegments.push(await aResponse.arrayBuffer());
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Generate outro
    const outroText = `Thank you for listening to this BizDev Magazine interview with ${interview.subject_name}. For more insights and interviews, visit bizdev.news.`;
    
    const outroResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${INTERVIEWER_VOICE}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: outroText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (outroResponse.ok) {
      audioSegments.push(await outroResponse.arrayBuffer());
    }

    // Combine audio segments
    const totalLength = audioSegments.reduce((sum, seg) => sum + seg.byteLength, 0);
    const combinedAudio = new Uint8Array(totalLength);
    let offset = 0;
    for (const segment of audioSegments) {
      combinedAudio.set(new Uint8Array(segment), offset);
      offset += segment.byteLength;
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/interviews/${interviewId}_audio_${Date.now()}.mp3`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('news-media')
      .upload(fileName, combinedAudio.buffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('news-media')
      .getPublicUrl(fileName);

    // Update interview with audio URL
    await supabaseClient
      .from('news_interviews')
      .update({ generated_audio_url: publicUrl })
      .eq('id', interviewId);

    // Also update article if exists
    if (interview.article_id) {
      await supabaseClient
        .from('news_articles')
        .update({ audio_url: publicUrl })
        .eq('id', interview.article_id);
    }

    // Store media asset record
    await supabaseClient
      .from('news_media_assets')
      .insert({
        interview_id: interviewId,
        article_id: interview.article_id,
        user_id: user.id,
        asset_type: 'audio',
        url: publicUrl,
        alt_text: `Audio interview with ${interview.subject_name}`,
        metadata: {
          duration_segments: audioSegments.length,
          voices: { interviewer: INTERVIEWER_VOICE, subject: SUBJECT_VOICE }
        }
      });

    console.log('Audio interview generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      audioUrl: publicUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
