import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessageRequest {
  messageId: string;
  dealRoomId: string;
  dealRoomName: string;
  recipientEmail: string;
  subject: string;
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { messageId, dealRoomId, dealRoomName, recipientEmail, subject, content }: MessageRequest = await req.json();

    console.log(`Sending deal room message to ${recipientEmail}`);

    // Generate a unique reply-to address for tracking
    // In production, you'd use a subdomain like replies@dealroom.thebdapp.com
    const replyToAddress = `dealroom-${dealRoomId.substring(0, 8)}@thebdapp.com`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            Message from <strong>${dealRoomName}</strong> Deal Room
          </p>
        </div>
        
        <div style="padding: 20px 0;">
          ${content.split('\n').map(line => `<p style="margin: 0 0 16px 0;">${line}</p>`).join('')}
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999;">
          You can reply directly to this email to respond in the deal room.<br>
          <a href="https://thebdapp.com/deal-rooms/${dealRoomId}" style="color: #667eea;">View in Biz Dev App</a>
        </p>
      </body>
      </html>
    `;

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return new Response(
        JSON.stringify({ success: true, message: 'Email skipped - no API key configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${dealRoomName} via Biz Dev <onboarding@resend.dev>`,
        reply_to: replyToAddress,
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
        headers: {
          'X-Deal-Room-ID': dealRoomId,
          'X-Message-ID': messageId,
        }
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await emailResponse.json();
    console.log('Email sent successfully:', emailData);

    // Update the outbound message with the email ID
    await supabase
      .from('deal_room_outbound_messages')
      .update({
        email_message_id: emailData.id,
        reply_to_address: replyToAddress,
        sent_via_email: true
      })
      .eq('id', messageId);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-deal-room-message:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
