import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  invitationId: string;
  dealRoomName: string;
  recipientEmail: string;
  recipientName?: string;
  personalMessage?: string;
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
    
    const { invitationId, dealRoomName, recipientEmail, recipientName, personalMessage }: InviteRequest = await req.json();

    console.log(`Sending deal room invite to ${recipientEmail} for ${dealRoomName}`);

    // Fetch the invitation to get the token
    const { data: invitation, error: inviteError } = await supabase
      .from('deal_room_invitations')
      .select('token, role_in_deal, allow_full_profile_setup')
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      throw new Error('Invitation not found');
    }

    const inviteUrl = `https://thebdapp.com/deal-room-invite/${invitation.token}`;
    const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
    const accessInfo = invitation.allow_full_profile_setup 
      ? 'You can also set up a complete Biz Dev profile to access all platform features.'
      : 'This invitation grants you access specifically to this deal room.';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deal Room Invitation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited to a Deal Room</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">${greeting}</p>
          
          <p>You've been invited to join <strong>"${dealRoomName}"</strong> on Biz Dev App.</p>
          
          ${invitation.role_in_deal ? `<p>Your role: <strong>${invitation.role_in_deal}</strong></p>` : ''}
          
          ${personalMessage ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-style: italic;">"${personalMessage}"</p>
          </div>
          ` : ''}
          
          <p>${accessInfo}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This invitation expires in 30 days. If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
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

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: 'Biz Dev App <bill@thebdapp.com>',
      to: [recipientEmail],
      subject: `You're invited to join "${dealRoomName}" on Biz Dev App`,
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-deal-room-invite:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
