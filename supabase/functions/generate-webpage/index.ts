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
    let systemPrompt = `You are an expert web designer and copywriter. Generate a complete landing page structure as JSON.`;
    
    let userPrompt = `Create a professional landing page for:
Business: ${businessName}
Description: ${businessDescription}
${industry ? `Industry: ${industry}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${bestPractices ? `\n\nIndustry Best Practices:\n- Recommended sections: ${bestPractices.recommended_sections?.join(', ')}\n- Content guidelines: ${bestPractices.content_guidelines}\n- CTA examples: ${bestPractices.cta_examples?.join(', ')}` : ''}

Return a JSON object with this structure:
{
  "title": "Page title with main keyword",
  "metaDescription": "SEO-optimized description under 160 chars",
  "sections": [
    {
      "type": "hero",
      "heading": "Compelling headline",
      "subheading": "Supporting text",
      "cta": "Call to action button text",
      "backgroundImage": "description for AI image generation"
    },
    {
      "type": "features",
      "heading": "Section heading",
      "items": [
        {"title": "Feature 1", "description": "Description", "icon": "icon-name"}
      ]
    },
    {
      "type": "testimonials",
      "heading": "Section heading",
      "items": [
        {"name": "Person", "role": "Title", "quote": "Testimonial", "rating": 5}
      ]
    },
    {
      "type": "cta",
      "heading": "Final call to action",
      "description": "Supporting text",
      "buttonText": "Action text"
    }
  ],
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "fontFamily": "font name"
  }
}

Generate 4-6 sections appropriate for this business. Use best practices for ${industry || 'general'} industry.`;

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
        temperature: 0.8,
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