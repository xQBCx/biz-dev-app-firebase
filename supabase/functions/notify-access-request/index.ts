import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface AccessRequestPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    full_name: string;
    email: string;
    company: string | null;
    reason: string | null;
    created_at: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: AccessRequestPayload = await req.json();
    
    if (payload.type === 'INSERT' && payload.table === 'access_requests') {
      const { record } = payload;
      
      // Get the admin user's ID
      const { data: adminProfile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', 'bill@bdsrvs.com')
        .single();

      if (adminProfile) {
        // Create a communication in the admin's inbox
        await supabaseClient
          .from('communications')
          .insert({
            user_id: adminProfile.id,
            communication_type: 'email',
            direction: 'inbound',
            subject: `New Access Request from ${record.full_name}`,
            body: `
Name: ${record.full_name}
Email: ${record.email}
${record.company ? `Company: ${record.company}\n` : ''}${record.reason ? `Reason: ${record.reason}\n` : ''}
Submitted: ${new Date(record.created_at).toLocaleString()}

Please review this request in the admin panel.
            `.trim(),
            status: 'completed',
            metadata: {
              access_request_id: record.id,
              type: 'access_request'
            }
          });

        console.log("Access request notification created in Communications Hub");
      }

      // Send confirmation email to the requestor
      try {
        await resend.emails.send({
          from: "Biz Dev Platform <onboarding@resend.dev>",
          to: [record.email],
          subject: "Access Request Received - We're Working Toward Our Official Launch!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2e8eff;">Thank you, ${record.full_name}!</h1>
              
              <p>We've received your request for access to the Biz Dev Platform.</p>
              
              <p><strong>Your request is currently being reviewed.</strong></p>
              
              <p>We're excited to let you know that we're working diligently toward our official launch event! Your interest means a lot to us, and we'll be in touch soon with updates on your access.</p>
              
              <div style="background: linear-gradient(to bottom right, #2e8eff 0%, rgba(46, 142, 255, 0.2) 30%); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0; color: white;"><strong>What's Next?</strong></p>
                <p style="margin: 10px 0 0 0; color: white;">Our team will review your request and send you an email with your access details once approved.</p>
              </div>
              
              <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Biz Dev Team</strong>
              </p>
            </div>
          `,
        });

        console.log(`Confirmation email sent to ${record.email}`);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the entire function if email fails
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-access-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
