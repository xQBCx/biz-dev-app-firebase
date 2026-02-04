import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
