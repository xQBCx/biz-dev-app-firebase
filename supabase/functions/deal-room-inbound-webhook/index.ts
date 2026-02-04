import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-signature, svix-timestamp',
};

// This webhook receives inbound emails from Resend or a mail forwarding service
// Configure your email provider to forward emails to: https://[project-id].supabase.co/functions/v1/deal-room-inbound-webhook

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const payload = await req.json();
    console.log('Received inbound email webhook:', JSON.stringify(payload, null, 2));

    // Handle different email provider formats
    // This example handles a generic format - adjust for your provider (Resend, SendGrid, Mailgun, etc.)
    const {
      from,
      from_email,
      from_name,
      to,
      to_email,
      subject,
      text,
      html,
      body_text,
      body_html,
      message_id,
      in_reply_to,
      headers,
    } = payload;

    const fromEmail = from_email || from?.email || from;
    const fromName = from_name || from?.name || null;
    const toAddress = to_email || to?.email || to;
    const bodyText = body_text || text || '';
    const bodyHtml = body_html || html || null;
    const messageId = message_id || headers?.['message-id'] || null;
    const inReplyTo = in_reply_to || headers?.['in-reply-to'] || null;

    if (!fromEmail || !toAddress) {
      console.error('Missing required email fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to match to a deal room based on the to address
    // Expected format: dealroom-{dealRoomIdPrefix}@thebdapp.com
    let dealRoomId: string | null = null;
    let matchedOutboundId: string | null = null;
    let matchedParticipantId: string | null = null;

    // Extract deal room ID from to address
    const dealRoomMatch = toAddress.match(/dealroom-([a-f0-9]+)@/i);
    if (dealRoomMatch) {
      const prefix = dealRoomMatch[1];
      // Find deal room with matching ID prefix
      const { data: dealRooms } = await supabase
        .from('deal_rooms')
        .select('id')
        .ilike('id', `${prefix}%`)
        .limit(1);
      
      if (dealRooms && dealRooms.length > 0) {
        dealRoomId = dealRooms[0].id;
      }
    }

    // Try to match by in-reply-to header
    if (inReplyTo) {
      const { data: outboundMsg } = await supabase
        .from('deal_room_outbound_messages')
        .select('id, deal_room_id, recipient_participant_id')
        .eq('email_message_id', inReplyTo)
        .single();

      if (outboundMsg) {
        matchedOutboundId = outboundMsg.id;
        dealRoomId = dealRoomId || outboundMsg.deal_room_id;
        matchedParticipantId = outboundMsg.recipient_participant_id;
      }
    }

    // Try to match participant by email
    if (dealRoomId && !matchedParticipantId) {
      const { data: participant } = await supabase
        .from('deal_room_participants')
        .select('id')
        .eq('deal_room_id', dealRoomId)
        .eq('contact_email', fromEmail)
        .single();

      if (participant) {
        matchedParticipantId = participant.id;
      }
    }

    // Store the inbound email
    const { data: inboundRecord, error: insertError } = await supabase
      .from('deal_room_inbound_emails')
      .insert({
        deal_room_id: dealRoomId,
        from_email: fromEmail,
        from_name: fromName,
        to_address: toAddress,
        subject: subject || null,
        body_text: bodyText,
        body_html: bodyHtml,
        message_id: messageId,
        in_reply_to: inReplyTo,
        matched_outbound_id: matchedOutboundId,
        matched_participant_id: matchedParticipantId,
        processed: false,
      })
      .select()
      .single();

    if (insertError) {
      // Handle duplicate message IDs gracefully
      if (insertError.message.includes('duplicate')) {
        console.log('Duplicate email message, ignoring');
        return new Response(
          JSON.stringify({ success: true, message: 'Duplicate ignored' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    console.log('Inbound email stored:', inboundRecord.id);

    // Optionally, also create a deal room message for the chat
    if (dealRoomId && matchedParticipantId) {
      // Find the participant's user_id
      const { data: participant } = await supabase
        .from('deal_room_participants')
        .select('user_id')
        .eq('id', matchedParticipantId)
        .single();

      if (participant?.user_id) {
        await supabase
          .from('deal_room_messages')
          .insert({
            deal_room_id: dealRoomId,
            sender_id: participant.user_id,
            message_type: 'email_reply',
            content: bodyText || 'Email reply received',
            metadata: {
              subject,
              from_email: fromEmail,
              inbound_email_id: inboundRecord.id
            }
          });
      }
    }

    // Mark as processed
    await supabase
      .from('deal_room_inbound_emails')
      .update({ processed: true })
      .eq('id', inboundRecord.id);

    return new Response(
      JSON.stringify({ success: true, id: inboundRecord.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deal-room-inbound-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
