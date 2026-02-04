import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MockupRequest {
  glyphSvgData: string;
  productType: 'jewelry' | 'apparel' | 'art_print' | 'accessory' | 'custom';
  productVariant: string;
  glyphText: string;
}

const productPrompts: Record<string, Record<string, string>> = {
  jewelry: {
    pendant: "A elegant sterling silver pendant necklace featuring an engraved geometric glyph pattern. The pendant hangs on a delicate chain against a soft gray velvet display. Professional jewelry photography, macro shot, beautiful lighting highlighting the metalwork details.",
    ring: "A modern titanium ring with geometric glyph pattern laser-engraved on its surface. The ring sits on a marble surface with soft studio lighting. High-end jewelry photography, clean minimal aesthetic.",
    bracelet: "A sleek brushed metal cuff bracelet with geometric glyph patterns etched into the surface. Photographed on a wrist, lifestyle jewelry shot with natural lighting.",
    earrings: "A pair of minimalist drop earrings featuring geometric glyph shapes cut from brushed gold metal. Elegant jewelry photography against white background."
  },
  apparel: {
    tshirt: "A premium cotton black t-shirt with a geometric glyph pattern screen-printed in white on the chest. Lifestyle fashion photography, model wearing the shirt casually, natural lighting.",
    embroidery: "A close-up of intricate embroidery on denim fabric, featuring a geometric glyph pattern stitched in gold thread. High detail macro photography showing the texture of the stitching.",
    hoodie: "A premium quality hoodie with geometric glyph pattern embroidered on the back. Streetwear fashion photography, lifestyle shot.",
    cap: "A fitted baseball cap with a small geometric glyph embroidered on the front. Clean product photography."
  },
  art_print: {
    poster: "A large format art print featuring a geometric glyph design as the centerpiece. The print is displayed in a modern gallery setting with white walls. Fine art photography, museum quality presentation.",
    canvas: "A stretched canvas print featuring geometric glyph artwork. The canvas hangs on a modern living room wall. Interior design photography.",
    framed: "A beautifully framed art print with geometric glyph design, displayed with gallery lighting. The frame is sleek black metal with white matting."
  },
  accessory: {
    mug: "A ceramic coffee mug with geometric glyph pattern wrapped around the exterior. Product photography on a marble countertop with soft morning light.",
    phone_case: "A premium phone case featuring geometric glyph pattern. Clean product photography against white background.",
    tote_bag: "A canvas tote bag with geometric glyph pattern screen-printed in black. Lifestyle photography, the bag sits on a wooden table."
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { glyphSvgData, productType, productVariant, glyphText }: MockupRequest = await req.json();

    console.log(`Generating mockup for: ${productType} - ${productVariant}, glyph text: "${glyphText}"`);

    // Get the base prompt for this product type and variant
    const typePrompts = productPrompts[productType];
    const basePrompt = typePrompts?.[productVariant] || typePrompts?.[Object.keys(typePrompts)[0]] || 
      "A product mockup featuring a geometric glyph pattern. Professional product photography.";

    // Enhance prompt with glyph context
    const enhancedPrompt = `${basePrompt} The geometric pattern represents the encoded phrase "${glyphText}" - a unique quantum-inspired symbolic design with continuous flowing lines and precise anchor points. Ultra high resolution, photorealistic.`;

    console.log('Using prompt:', enhancedPrompt);

    // Use the image generation model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits required. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the image from the response
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated');
    }

    return new Response(JSON.stringify({
      success: true,
      imageUrl: imageData,
      prompt: enhancedPrompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating mockup:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
