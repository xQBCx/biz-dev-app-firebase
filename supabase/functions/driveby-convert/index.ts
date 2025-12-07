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
    const { captureId } = await req.json();

    if (!captureId) {
      throw new Error('Capture ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the capture
    const { data: capture, error: captureError } = await supabase
      .from('field_capture')
      .select('*')
      .eq('id', captureId)
      .single();

    if (captureError || !capture) {
      throw new Error('Capture not found');
    }

    // Extract data from OCR results
    const rawOcr = capture.raw_ocr || {};
    const businessName = rawOcr.business_name || 'Unknown Business';
    const category = (capture.ai_tags && capture.ai_tags[0]) || null;
    const socCode = rawOcr.soc_code || null;
    const observations = rawOcr.observations || null;

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from('driveby_lead')
      .insert({
        source_capture_id: captureId,
        user_id: capture.captured_by,
        place_name: businessName,
        category: category,
        soc_code: socCode,
        quality_score: capture.confidence || 0,
        notes: observations ? `AI Observation: ${observations}\n${capture.notes || ''}` : capture.notes,
        status: 'new',
      })
      .select()
      .single();

    if (leadError) {
      throw leadError;
    }

    // Update capture status
    await supabase
      .from('field_capture')
      .update({ status: 'converted' })
      .eq('id', captureId);

    // Auto-assign to matching companies based on category
    const { data: companies } = await supabase
      .from('biz_company')
      .select(`
        id,
        product_bundle (
          id,
          category
        )
      `)
      .eq('user_id', capture.captured_by)
      .eq('active', true);

    if (companies && category) {
      const categoryLower = category.toLowerCase();
      
      for (const company of companies) {
        // Check if any product bundle matches the category
        const matchingBundle = company.product_bundle?.find((bundle: any) =>
          bundle.category?.toLowerCase().includes(categoryLower) ||
          categoryLower.includes(bundle.category?.toLowerCase() || '')
        );

        if (matchingBundle) {
          await supabase
            .from('lead_assignment')
            .insert({
              lead_id: lead.id,
              company_id: company.id,
              bundle_id: matchingBundle.id,
              rationale: `Auto-matched based on category: ${category}`,
              assigned_by: capture.captured_by,
            });
        }
      }
    }

    console.log(`Converted capture ${captureId} to lead ${lead.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        placeName: businessName,
        category,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Drive-by convert error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
