import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MOWebhookPayload {
  from: string;
  to: string;
  body: string;
  media?: Array<{ url: string; content_type: string; bytes: number }>;
  carrier_msg_id?: string;
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

    const payload: MOWebhookPayload = await req.json();
    console.log('Received MO message:', payload);

    // Find owner by their number
    const { data: existingConv } = await supabase
      .from('sms_conversations')
      .select('owner_user_id')
      .eq('our_number', payload.to)
      .eq('peer_number', payload.from)
      .maybeSingle();

    const owner_user_id = existingConv?.owner_user_id;

    // If no existing conversation, we need to route to a default user or create new
    // For now, we'll skip if no owner found
    if (!owner_user_id) {
      console.log(`No owner found for number ${payload.to}, skipping`);
      return new Response(
        JSON.stringify({ status: 'no_owner' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert conversation
    const { data: conversation } = await supabase
      .from('sms_conversations')
      .upsert(
        {
          owner_user_id,
          peer_number: payload.from,
          our_number: payload.to,
          last_message_at: new Date().toISOString(),
        },
        { onConflict: 'owner_user_id,peer_number,our_number' }
      )
      .select()
      .single();

    if (!conversation) {
      throw new Error('Failed to create conversation');
    }

    // Check for opt-out keywords
    const bodyLower = payload.body.toLowerCase().trim();
    const isOptOut = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'].includes(bodyLower);
    const isOptIn = ['start', 'unstop', 'yes'].includes(bodyLower);
    const isHelp = bodyLower === 'help';

    if (isOptOut) {
      await supabase
        .from('sms_optouts')
        .upsert(
          {
            phone_number: payload.from,
            reason: 'STOP',
            created_at: new Date().toISOString(),
            opted_in_at: null,
          },
          { onConflict: 'phone_number' }
        );

      // Send auto-reply
      await supabase.from('sms_messages').insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        status: 'sent',
        from_number: payload.to,
        to_number: payload.from,
        body: 'You have opted out and will no longer receive messages. Reply START to re-subscribe.',
      });

      console.log(`User ${payload.from} opted out`);
    } else if (isOptIn) {
      await supabase
        .from('sms_optouts')
        .update({ opted_in_at: new Date().toISOString() })
        .eq('phone_number', payload.from);

      await supabase.from('sms_messages').insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        status: 'sent',
        from_number: payload.to,
        to_number: payload.from,
        body: 'You have been re-subscribed and will receive messages again.',
      });

      console.log(`User ${payload.from} opted in`);
    } else if (isHelp) {
      await supabase.from('sms_messages').insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        status: 'sent',
        from_number: payload.to,
        to_number: payload.from,
        body: 'For support, contact us at support@bizdev.app. Reply STOP to opt out.',
      });
    }

    // Insert incoming message
    const { data: message, error: msgError } = await supabase
      .from('sms_messages')
      .insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        status: 'received',
        from_number: payload.from,
        to_number: payload.to,
        body: payload.body,
        media: payload.media || [],
        carrier_msg_id: payload.carrier_msg_id,
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error creating inbound message:', msgError);
      throw msgError;
    }

    console.log(`Inbound SMS processed: ${message.id}`);

    return new Response(
      JSON.stringify({ status: 'success', message_id: message.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in sms-webhook-mo function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
