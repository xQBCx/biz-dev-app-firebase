import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, cc, bcc, subject, body, identityId } = await req.json();

    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get the email identity
    const { data: identity, error: identityError } = await supabaseClient
      .from('email_identities')
      .select('*')
      .eq('id', identityId)
      .eq('user_id', user.id)
      .single();

    if (identityError || !identity) {
      throw new Error('Email identity not found');
    }

    // Store the outbound message
    const { error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        user_id: user.id,
        identity_id: identityId,
        direction: 'outbound',
        from_email: identity.email,
        from_name: identity.display_name,
        to_emails: Array.isArray(to) ? to : [to],
        cc_emails: cc || [],
        bcc_emails: bcc || [],
        subject: subject,
        body_text: body,
        body_html: body,
        message_date: new Date().toISOString(),
        is_read: true,
      });

    if (messageError) {
      console.error('Error storing message:', messageError);
      throw messageError;
    }

    // TODO: Implement actual email sending via SMTP
    // This would use the identity's SMTP settings or OAuth token
    console.log('Email queued for sending:', { to, subject, from: identity.email });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email queued for sending',
        note: 'Email sending will be implemented once SMTP/OAuth credentials are configured'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});