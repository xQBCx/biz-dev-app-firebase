import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log(`Generating article for interview with ${interview.subject_name}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build Q&A transcript
    const qaPairs = (interview.questions || []).map((q: any, idx: number) => {
      const answer = (interview.answers || [])[idx]?.answer || '[No response]';
      return `Q: ${q.question}\nA: ${answer}`;
    }).join('\n\n');

    const systemPrompt = `You are a senior editor at BizDev Magazine, transforming raw interview transcripts into polished, engaging magazine articles. Your style is:
- Professional yet accessible
- Story-driven with a clear narrative arc
- Rich with direct quotes from the subject
- Structured with compelling headers and subheaders
- Includes a powerful opening hook and memorable closing

Write in the third person, weaving the subject's words into a narrative that tells their story.`;

    const userPrompt = `Transform this interview into a polished BizDev Magazine article:

SUBJECT: ${interview.subject_name}
TITLE: ${interview.subject_title || 'Business Leader'}
COMPANY: ${interview.subject_company || 'Independent'}

INTERVIEW TRANSCRIPT:
${qaPairs}

Create a magazine-quality article with:
1. A compelling headline (not the subject's name)
2. A subtitle that captures the essence
3. An engaging opening paragraph that hooks the reader
4. Well-structured sections with subheaders
5. Rich use of direct quotes
6. A powerful closing that leaves readers inspired
7. Author attribution: "By BizDev Magazine Staff"

Format in Markdown.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const articleContent = aiData.choices?.[0]?.message?.content || '';

    // Extract title from the generated content
    const titleMatch = articleContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `Interview: ${interview.subject_name}`;

    // Extract subtitle
    const subtitleMatch = articleContent.match(/^##\s+(.+)$/m) || articleContent.match(/\*\*(.+?)\*\*/);
    const subtitle = subtitleMatch ? subtitleMatch[1] : null;

    // Update interview with generated article
    await supabaseClient
      .from('news_interviews')
      .update({ 
        generated_article: articleContent,
        interview_status: 'completed'
      })
      .eq('id', interviewId);

    // Create or update the article
    let articleId = interview.article_id;
    
    if (!articleId) {
      const { data: newArticle, error: createError } = await supabaseClient
        .from('news_articles')
        .insert({
          user_id: user.id,
          title,
          subtitle,
          content: articleContent,
          article_type: 'interview',
          status: 'draft',
          entity_tags: [{
            type: 'person',
            name: interview.subject_name,
            title: interview.subject_title,
            company: interview.subject_company
          }]
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating article:', createError);
        throw createError;
      }
      
      articleId = newArticle.id;

      // Link article to interview
      await supabaseClient
        .from('news_interviews')
        .update({ article_id: articleId })
        .eq('id', interviewId);
    } else {
      await supabaseClient
        .from('news_articles')
        .update({ 
          title,
          subtitle,
          content: articleContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId);
    }

    console.log('Article generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      articleId,
      title,
      content: articleContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating article:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
