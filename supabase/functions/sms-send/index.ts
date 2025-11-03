import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSSendRequest {
  to: string;
  from: string;
  body: string;
  media?: Array<{ url: string; content_type: string; bytes: number }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: SMSSendRequest = await req.json();

    // Check if number is opted out
    const { data: optout } = await supabase
      .from('sms_optouts')
      .select('*')
      .eq('phone_number', body.to)
      .is('opted_in_at', null)
      .maybeSingle();

    if (optout) {
      console.log(`Blocked SMS to opted-out number: ${body.to}`);
      return new Response(
        JSON.stringify({ error: 'Recipient has opted out of SMS', status: 'blocked' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert conversation
    const { data: conversation, error: convError } = await supabase
      .from('sms_conversations')
      .upsert(
        {
          owner_user_id: user.id,
          peer_number: body.to,
          our_number: body.from,
          last_message_at: new Date().toISOString(),
        },
        { onConflict: 'owner_user_id,peer_number,our_number' }
      )
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return new Response(
        JSON.stringify({ error: 'Failed to create conversation', details: convError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert message with queued status
    const { data: message, error: msgError } = await supabase
      .from('sms_messages')
      .insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        status: 'queued',
        from_number: body.from,
        to_number: body.to,
        body: body.body,
        media: body.media || [],
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error creating message:', msgError);
      return new Response(
        JSON.stringify({ error: 'Failed to create message', details: msgError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send via carrier (SMPP or HTTP)
    const smsMode = Deno.env.get('SMS_MODE') || 'HTTP';
    let carrierMsgId: string | null = null;
    let sendStatus = 'queued';

    try {
      if (smsMode === 'HTTP') {
        const carrierUrl = Deno.env.get('CARRIER_HTTP_BASEURL') || '';
        const carrierKey = Deno.env.get('CARRIER_HTTP_KEY') || '';
        
        if (carrierUrl && carrierKey) {
          const response = await fetch(`${carrierUrl}/send`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${carrierKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: body.from,
              to: body.to,
              text: body.body,
              media: body.media,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            carrierMsgId = result.message_id || result.id;
            sendStatus = 'sent';
          } else {
            sendStatus = 'failed';
            console.error('Carrier send failed:', await response.text());
          }
        }
      }
      // SMPP mode would go here via Jasmin or direct SMPP client
    } catch (error) {
      console.error('Error sending to carrier:', error);
      sendStatus = 'failed';
    }

    // Update message with carrier info
    await supabase
      .from('sms_messages')
      .update({
        carrier_msg_id: carrierMsgId,
        status: sendStatus,
      })
      .eq('id', message.id);

    console.log(`SMS sent: ${message.id}, to: ${body.to}, status: ${sendStatus}`);

    return new Response(
      JSON.stringify({
        message: { ...message, carrier_msg_id: carrierMsgId, status: sendStatus },
        conversation,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in sms-send function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
