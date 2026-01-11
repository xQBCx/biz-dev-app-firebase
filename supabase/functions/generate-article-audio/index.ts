import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice IDs for the interview
const VOICES = {
  biz: 'onwK4e9ZLuTAKqWW03F9',     // Brian - male professional "Biz"
  dev: 'cjVigY5qzO86Huf0OWal',     // Eric - female technical "Dev"  
  subject: 'TX3LPaxmHKxFdv7VOQHJ', // Roger - 30s American male tech entrepreneur
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, interviewerVoice = 'biz' } = await req.json();
    
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

    // Fetch article data
    const { data: article, error: fetchError } = await supabaseClient
      .from('news_articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      throw new Error('Article not found');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    console.log(`Generating audio for article: ${article.title}`);

    // Parse content to extract Q&A pairs from the article HTML
    const content = article.content || '';
    
    // Extract interview Q&A from the HTML content
    const qaSegments = parseInterviewContent(content, article.title);
    
    if (qaSegments.length === 0) {
      throw new Error('No interview content found in article');
    }

    // Select interviewer voice
    const interviewerVoiceId = interviewerVoice === 'dev' ? VOICES.dev : VOICES.biz;
    const subjectVoiceId = VOICES.subject;

    const audioSegments: ArrayBuffer[] = [];

    // Generate intro
    const introText = `Welcome to BizDev.news. Today's exclusive interview: ${article.title}. Let's begin.`;
    
    const introResponse = await generateSpeech(
      ELEVENLABS_API_KEY,
      interviewerVoiceId,
      introText
    );
    
    if (introResponse) {
      audioSegments.push(introResponse);
    }

    // Generate Q&A segments (limit to 8 for API efficiency)
    const segmentsToGenerate = Math.min(qaSegments.length, 8);
    
    for (let i = 0; i < segmentsToGenerate; i++) {
      const segment = qaSegments[i];
      
      // Generate question with interviewer voice
      if (segment.question) {
        const qResponse = await generateSpeech(
          ELEVENLABS_API_KEY,
          interviewerVoiceId,
          segment.question
        );
        if (qResponse) {
          audioSegments.push(qResponse);
        }
      }

      // Generate answer with subject voice
      if (segment.answer) {
        // Limit answer length to prevent API issues
        const answerText = segment.answer.substring(0, 2500);
        const aResponse = await generateSpeech(
          ELEVENLABS_API_KEY,
          subjectVoiceId,
          answerText
        );
        if (aResponse) {
          audioSegments.push(aResponse);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Generate outro
    const outroText = `Thank you for listening to this BizDev.news interview. For more insights and exclusive content, visit bizdev.news.`;
    
    const outroResponse = await generateSpeech(
      ELEVENLABS_API_KEY,
      interviewerVoiceId,
      outroText
    );
    
    if (outroResponse) {
      audioSegments.push(outroResponse);
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
    const fileName = `articles/${articleId}/interview_audio_${Date.now()}.mp3`;
    
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

    // Update article with audio URL
    await supabaseClient
      .from('news_articles')
      .update({ audio_url: publicUrl })
      .eq('id', articleId);

    // Store media asset record
    await supabaseClient
      .from('news_media_assets')
      .insert({
        article_id: articleId,
        user_id: user.id,
        asset_type: 'audio_interview',
        url: publicUrl,
        alt_text: `Audio interview: ${article.title}`,
        metadata: {
          duration_segments: audioSegments.length,
          interviewer_voice: interviewerVoice,
          voices: { 
            interviewer: interviewerVoiceId, 
            subject: subjectVoiceId 
          }
        }
      });

    console.log('Article audio generated successfully');

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

async function generateSpeech(apiKey: string, voiceId: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('ElevenLabs error:', await response.text());
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Speech generation error:', error);
    return null;
  }
}

function parseInterviewContent(htmlContent: string, title: string): Array<{ question: string; answer: string }> {
  const segments: Array<{ question: string; answer: string }> = [];
  
  // Remove HTML tags but preserve structure
  const textContent = htmlContent
    .replace(/<h2[^>]*>/gi, '\n[H2]')
    .replace(/<\/h2>/gi, '[/H2]\n')
    .replace(/<h3[^>]*>/gi, '\n[H3]')
    .replace(/<\/h3>/gi, '[/H3]\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong[^>]*>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<em[^>]*>/gi, '')
    .replace(/<\/em>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  // Split by headers to find Q&A sections
  const sections = textContent.split(/\[H[23]\]/);
  
  let currentQuestion = '';
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].replace(/\[\/H[23]\]/g, '').trim();
    
    if (!section) continue;
    
    // Check if this looks like a question (shorter, ends with ?)
    if (section.length < 300 && (section.includes('?') || section.match(/^(What|How|Why|When|Where|Who|Can|Could|Would|Tell|Describe|Explain)/i))) {
      currentQuestion = section;
    } else if (currentQuestion && section.length > 50) {
      // This is likely an answer
      segments.push({
        question: currentQuestion,
        answer: section
      });
      currentQuestion = '';
    }
  }

  // If structured parsing didn't work, try simpler approach
  if (segments.length === 0) {
    // Look for bold text followed by regular text pattern
    const lines = textContent.split('\n').filter(l => l.trim());
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim() || '';
      
      if (line.includes('?') && nextLine.length > 100) {
        segments.push({
          question: line,
          answer: nextLine
        });
        i++; // Skip the answer line
      }
    }
  }

  return segments;
}
