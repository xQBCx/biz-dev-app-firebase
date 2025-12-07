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

    // If we have a photo, run OCR and classification
    if (photoUrl) {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (openaiKey) {
        // Use GPT-4 Vision for OCR and classification
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert at analyzing business signage and storefronts. 
                Extract all visible text (OCR) and classify the business.
                
                Respond in JSON format:
                {
                  "ocr_text": "all visible text from the image",
                  "business_name": "extracted or inferred business name",
                  "categories": ["category1", "category2"],
                  "soc_code": "most relevant SOC code (e.g., 47-0000 for construction)",
                  "confidence": 0.0-1.0,
                  "observations": "any notable details about the business"
                }
                
                Categories should be specific like: Mechanical Service, HVAC, Plumbing, Apartments, Farm, Office Building, Data Center, Restaurant, Retail, etc.
                
                SOC codes:
                11-0000: Management
                17-0000: Architecture/Engineering
                37-0000: Building Maintenance
                47-0000: Construction
                49-0000: Installation/Repair
                etc.`
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Analyze this business image. Extract text and classify.' },
                  { type: 'image_url', image_url: { url: photoUrl } }
                ]
              }
            ],
            max_tokens: 500,
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
                })
                .eq('id', captureId);
            }
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
          }
        }
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
