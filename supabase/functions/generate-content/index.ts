import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, type, additionalContext } = await req.json();

    if (!title || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create type-specific prompts
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'email':
        systemPrompt = 'You are a professional business email writer. Create clear, concise, and professional email content.';
        userPrompt = `Write a professional business email about: ${title}\n${additionalContext ? `Additional context: ${additionalContext}` : ''}`;
        break;
      case 'post':
        systemPrompt = 'You are a social media content creator. Create engaging, concise social media posts.';
        userPrompt = `Create an engaging social media post about: ${title}\n${additionalContext ? `Additional context: ${additionalContext}` : ''}`;
        break;
      case 'article':
        systemPrompt = 'You are a professional content writer. Create well-structured, informative articles.';
        userPrompt = `Write a professional article about: ${title}\n${additionalContext ? `Additional context: ${additionalContext}` : ''}`;
        break;
      case 'script':
        systemPrompt = 'You are a professional scriptwriter. Create compelling scripts for video or audio content.';
        userPrompt = `Write a script about: ${title}\n${additionalContext ? `Additional context: ${additionalContext}` : ''}`;
        break;
      default:
        throw new Error('Invalid content type');
    }

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Content generation quota exceeded. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Content generation service error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content, type, title }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Content generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
