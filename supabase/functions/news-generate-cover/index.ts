import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interviewId, articleId, subjectName, subjectTitle, subjectCompany, coverType = 'magazine' } = await req.json();
    
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

    console.log(`Generating ${coverType} cover for ${subjectName}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build image generation prompt based on cover type
    let imagePrompt: string;
    
    if (coverType === 'magazine') {
      imagePrompt = `Create a professional business magazine cover for "BizDev Magazine" featuring:
- A sophisticated, modern design with deep blue and gold accent colors
- Professional headshot placeholder area (abstract professional silhouette)
- Magazine masthead "BizDev" in elegant serif font at top
- Cover story: "${subjectName}: ${subjectTitle || 'Business Leader'}"
- Subtitle: "An Exclusive Interview"
- Clean corporate aesthetic with subtle geometric patterns
- Issue date and barcode in corner
- High-end business publication feel like Forbes or Fast Company
- 9:12 portrait aspect ratio magazine cover`;
    } else {
      imagePrompt = `Create a professional article header image for a business interview:
- Modern, clean design with corporate blue tones
- Abstract professional business imagery (cityscapes, office interiors, geometric shapes)
- Suitable as a wide banner/hero image
- Text overlay space for title: "${subjectName}"
- Sophisticated business journalism aesthetic
- 16:9 landscape aspect ratio`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: imagePrompt }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI image generation error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      throw new Error('No image generated');
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid image data format');
    }

    const imageFormat = base64Match[1];
    const base64String = base64Match[2];
    const imageBuffer = base64Decode(base64String);

    // Upload to Supabase Storage
    const fileName = `${user.id}/covers/${coverType}_${interviewId || articleId}_${Date.now()}.${imageFormat}`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('news-media')
      .upload(fileName, imageBuffer, {
        contentType: `image/${imageFormat}`,
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

    // Update interview with cover image
    if (interviewId) {
      const currentImages = [];
      const { data: interview } = await supabaseClient
        .from('news_interviews')
        .select('generated_images')
        .eq('id', interviewId)
        .single();
      
      const images = interview?.generated_images || [];
      images.push({ type: coverType, url: publicUrl });
      
      await supabaseClient
        .from('news_interviews')
        .update({ generated_images: images })
        .eq('id', interviewId);
    }

    // Update article with cover
    if (articleId) {
      const updateField = coverType === 'magazine' ? 'magazine_cover_url' : 'featured_image_url';
      await supabaseClient
        .from('news_articles')
        .update({ [updateField]: publicUrl })
        .eq('id', articleId);
    }

    // Store media asset record
    await supabaseClient
      .from('news_media_assets')
      .insert({
        interview_id: interviewId,
        article_id: articleId,
        user_id: user.id,
        asset_type: 'cover',
        url: publicUrl,
        alt_text: `${coverType} cover for ${subjectName}`,
        ai_prompt_used: imagePrompt,
        metadata: { coverType, subjectName, subjectTitle }
      });

    console.log(`${coverType} cover generated successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      coverUrl: publicUrl,
      coverType 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating cover:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
