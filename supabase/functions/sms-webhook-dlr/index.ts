import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DLRWebhookPayload {
  carrier_msg_id: string;
  status: 'delivered' | 'failed' | 'undeliverable';
  dlr_code?: string;
  error_detail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook token
    const authHeader = req.headers.get('Authorization') || '';
    const expectedToken = Deno.env.get('INBOUND_WEBHOOK_TOKEN') || '';
    
    if (!authHeader.includes(expectedToken) && expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: DLRWebhookPayload = await req.json();
    console.log('Received DLR:', payload);

    // Update message status
    const { data: message, error: updateError } = await supabase
      .from('sms_messages')
      .update({
        status: payload.status,
        dlr_code: payload.dlr_code,
        error_detail: payload.error_detail,
      })
      .eq('carrier_msg_id', payload.carrier_msg_id)
      .select()
      .single();

    if (updateError || !message) {
      console.error('Error updating message status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Message not found', details: updateError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`DLR processed for message ${message.id}: ${payload.status}`);

    return new Response(
      JSON.stringify({ status: 'success', message_id: message.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in sms-webhook-dlr function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
