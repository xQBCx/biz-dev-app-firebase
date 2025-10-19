import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const payload: AccessRequestPayload = await req.json();
    
    if (payload.type === 'INSERT' && payload.table === 'access_requests') {
      const { record } = payload;
      
      await resend.emails.send({
        from: "Biz Dev Access Requests <onboarding@resend.dev>",
        to: ["bill@bdsrvs.com"],
        subject: `New Access Request from ${record.full_name}`,
        html: `
          <h2>New Access Request Received</h2>
          <p><strong>Name:</strong> ${record.full_name}</p>
          <p><strong>Email:</strong> ${record.email}</p>
          ${record.company ? `<p><strong>Company:</strong> ${record.company}</p>` : ''}
          ${record.reason ? `<p><strong>Reason:</strong> ${record.reason}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date(record.created_at).toLocaleString()}</p>
          <p>Please review this request in the admin panel.</p>
        `,
      });

      console.log("Access request notification sent to bill@bdsrvs.com");
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
