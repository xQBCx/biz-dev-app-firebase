import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  partner_id: string;
  custom_message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Admin access required");

    const { partner_id, custom_message }: OnboardingEmailRequest = await req.json();

    // Fetch partner details
    const { data: partner, error: partnerError } = await supabase
      .from("partner_integrations")
      .select("*")
      .eq("id", partner_id)
      .single();

    if (partnerError || !partner) {
      throw new Error("Partner not found");
    }

    if (!partner.contact_email) {
      throw new Error("Partner has no contact email configured");
    }

    // Generate onboarding token
    const onboardingToken = crypto.randomUUID() + "-" + crypto.randomUUID().split("-")[0];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Update partner with onboarding token
    await supabase
      .from("partner_integrations")
      .update({
        onboarding_token: onboardingToken,
        onboarding_token_expires_at: expiresAt.toISOString(),
      })
      .eq("id", partner_id);

    // Fetch deal room info if applicable
    const hubspotAccounts = partner.allowed_hubspot_accounts || [];
    let dealRoomName = "";
    if (hubspotAccounts.length > 0 && hubspotAccounts[0].deal_room_id) {
      const { data: dealRoom } = await supabase
        .from("deal_rooms")
        .select("name")
        .eq("id", hubspotAccounts[0].deal_room_id)
        .single();
      if (dealRoom) dealRoomName = dealRoom.name;
    }

    // Get partner brief info
    const partnerBrief = partner.partner_brief || {};
    const agentsList = partnerBrief.agents?.join(", ") || "";

    // Build onboarding URL
    const baseUrl = "https://biz-dev-app.lovable.app";
    const onboardingUrl = `${baseUrl}/partner-onboarding/${onboardingToken}`;

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Biz Dev App</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Welcome to Biz Dev App
              </h1>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">
                Your Partner Integration is Ready
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">
                Hello ${partner.contact_name || partner.partner_name}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                You've been invited to join the <strong>Biz Dev App</strong> platform as a partner. 
                Your integration is configured and ready to use.
              </p>

              ${dealRoomName ? `
              <!-- Deal Room Info -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  <strong>Your Deal Room:</strong> ${dealRoomName}
                </p>
                ${partnerBrief.role ? `<p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;"><strong>Your Role:</strong> ${partnerBrief.role}</p>` : ""}
                ${agentsList ? `<p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;"><strong>Your Agents:</strong> ${agentsList}</p>` : ""}
              </div>
              ` : ""}

              ${custom_message ? `
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  ${custom_message}
                </p>
              </div>
              ` : ""}

              <!-- What You Can Do -->
              <h3 style="margin: 30px 0 15px 0; color: #1e293b; font-size: 18px;">
                What You Can Do:
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                <li>Access your secure API credentials</li>
                <li>Create and update contacts in HubSpot</li>
                <li>Create deals and log activities</li>
                <li>Trigger settlements when milestones are met</li>
                <li>View interactive API documentation</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="${onboardingUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                      Access Your Partner Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
                This link expires in 7 days.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px; text-align: center;">
                <strong>Need help?</strong> Reply to this email or contact us at 
                <a href="mailto:bill@bdsrvs.com" style="color: #3b82f6; text-decoration: none;">bill@bdsrvs.com</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                Biz Dev App • Business Development LLC
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Biz Dev App <bill@thebdapp.com>",
        reply_to: "bill@bdsrvs.com",
        to: [partner.contact_email],
        subject: `Welcome to Biz Dev App - Your ${partner.partner_name} Integration is Ready`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Onboarding email sent to ${partner.contact_email}`,
        email_id: emailResult.id,
        onboarding_url: onboardingUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-partner-onboarding-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
