import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { captureId, photoUrl, companyIds } = await req.json();

    if (!captureId) {
      throw new Error('Capture ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to processing
    await supabase
      .from('field_capture')
      .update({ status: 'processing' })
      .eq('id', captureId);

    let ocrText = '';
    let aiTags: string[] = [];
    let confidence = 0;

    // If we have a photo, run OCR and classification using Lovable AI
    if (photoUrl) {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      
      if (lovableApiKey) {
        try {
          // Use Lovable AI Gateway for OCR and classification
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert at analyzing business signage and storefronts. 
                  Extract all visible text (OCR) and classify the business.
                  
                  Respond ONLY in valid JSON format:
                  {
                    "ocr_text": "all visible text from the image",
                    "business_name": "extracted or inferred business name",
                    "categories": ["category1", "category2"],
                    "soc_code": "most relevant SOC code (e.g., 47-0000 for construction)",
                    "confidence": 0.0-1.0,
                    "observations": "any notable details about the business"
                  }
                  
                  Categories should be specific like: Cooling Towers, Mechanical Service, HVAC, Plumbing, Apartments, Farm, Office Building, Data Center, Restaurant, Retail, Manufacturing, etc.
                  
                  SOC codes:
                  11-0000: Management
                  17-0000: Architecture/Engineering  
                  37-0000: Building Maintenance
                  47-0000: Construction
                  49-0000: Installation/Repair
                  53-0000: Transportation`
                },
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Analyze this business image. Extract all visible text and classify the business type.' },
                    { type: 'image_url', image_url: { url: photoUrl } }
                  ]
                }
              ],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            try {
              // Parse JSON from response
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                ocrText = parsed.ocr_text || '';
                aiTags = parsed.categories || [];
                confidence = parsed.confidence || 0;
                
                // Update capture with OCR results
                await supabase
                  .from('field_capture')
                  .update({
                    raw_ocr: parsed,
                    ai_tags: aiTags,
                    confidence: confidence,
                    status: 'processed',
                  })
                  .eq('id', captureId);
              }
            } catch (parseError) {
              console.error('Failed to parse AI response:', parseError);
              await supabase.from('field_capture').update({ status: 'error' }).eq('id', captureId);
            }
          } else {
            const errorText = await response.text();
            console.error('Lovable AI error:', response.status, errorText);
            
            if (response.status === 429) {
              return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), 
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            if (response.status === 402) {
              return new Response(JSON.stringify({ error: 'AI credits exhausted, please add funds' }), 
                { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
          }
        } catch (aiError) {
          console.error('AI processing error:', aiError);
          await supabase.from('field_capture').update({ status: 'error' }).eq('id', captureId);
        }
      } else {
        console.log('LOVABLE_API_KEY not configured, skipping AI processing');
        await supabase.from('field_capture').update({ status: 'pending_ai' }).eq('id', captureId);
      }
    }

    console.log(`Processed capture ${captureId}: ${aiTags.length} tags, ${confidence} confidence`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        captureId,
        ocrText,
        aiTags,
        confidence 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Drive-by process error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
