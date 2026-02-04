import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      businessName, 
      businessDescription, 
      industry, 
      targetAudience,
      generationMethod = 'ai_generated',
      templateId 
    } = await req.json();

    if (!businessName || !businessDescription) {
      return new Response(
        JSON.stringify({ error: 'Business name and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get industry best practices if available
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let bestPractices = null;
    if (industry) {
      const { data } = await supabase
        .from('industry_best_practices')
        .select('*')
        .eq('industry', industry)
        .single();
      bestPractices = data;
    }

    // Build AI prompt based on generation method
    let systemPrompt = `You are an expert web designer and copywriter specializing in business landing pages. 
Your task is to analyze business information (which may be very detailed or very brief) and extract the core value proposition, key offerings, and create compelling landing page content.

IMPORTANT: If the user provides extensive detail including full website copy, wireframes, or design guides, extract and synthesize the KEY information rather than returning it verbatim. Focus on creating a clean, professional landing page structure.`;
    
    let userPrompt = `Analyze the following business information and create a professional landing page structure:

Business Name: ${businessName}

Business Information:
${businessDescription}

${industry ? `Industry: ${industry}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${bestPractices ? `\n\nIndustry Best Practices:\n- Recommended sections: ${bestPractices.recommended_sections?.join(', ')}\n- Content guidelines: ${bestPractices.content_guidelines}\n- CTA examples: ${bestPractices.cta_examples?.join(', ')}` : ''}

INSTRUCTIONS:
1. Extract the core value proposition and key offerings
2. Create 4-6 distinct, focused sections
3. Write clear, compelling copy (not placeholder text)
4. If color schemes are mentioned, use them; otherwise choose appropriate professional colors
5. Each section should have substantial, real content

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Compelling page title under 60 chars",
  "metaDescription": "Clear SEO description under 160 chars",
  "sections": [
    {
      "type": "hero",
      "title": "Powerful headline",
      "subtitle": "Clear 1-2 sentence value proposition",
      "content": "2-3 sentences of compelling copy",
      "cta": "Action button text",
      "imagePrompt": "Description for background image"
    },
    {
      "type": "about",
      "title": "Section heading",
      "subtitle": "Optional subheading",
      "content": "3-4 paragraphs of detailed information about the company, mission, approach, etc."
    },
    {
      "type": "services",
      "title": "What We Offer",
      "content": "Introduction paragraph",
      "items": [
        {"title": "Service 1", "description": "2-3 sentence description", "icon": "icon-name"},
        {"title": "Service 2", "description": "2-3 sentence description", "icon": "icon-name"}
      ]
    },
    {
      "type": "industries",
      "title": "Who We Serve",
      "content": "Brief intro",
      "items": ["Industry 1", "Industry 2", "Industry 3"]
    },
    {
      "type": "cta",
      "title": "Ready to Get Started?",
      "content": "Compelling closing paragraph",
      "buttonText": "Take Action",
      "secondaryText": "Or contact us at..."
    }
  ],
  "theme": {
    "colors": {
      "primary": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX",
      "background": "#HEX",
      "text": "#HEX"
    },
    "fonts": {
      "heading": "Font name",
      "body": "Font name"
    }
  }
}

Generate substantial, real content based on the business information provided. Make it professional and compelling.`;

    console.log('Calling Lovable AI for webpage generation...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from AI');
    }

    // Parse the JSON response
    let generatedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      generatedData = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('Failed to parse generated content');
    }

    // Estimate token usage (rough estimate: 1 token ≈ 4 chars)
    const estimatedTokens = Math.ceil((systemPrompt.length + userPrompt.length + content.length) / 4);

    return new Response(
      JSON.stringify({
        ...generatedData,
        tokensUsed: estimatedTokens,
        generationMethod,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-webpage function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});