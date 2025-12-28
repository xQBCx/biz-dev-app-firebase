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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code, state, platform, error: oauthError } = await req.json();

    if (oauthError) {
      console.error('OAuth error from provider:', oauthError);
      return new Response(
        JSON.stringify({ error: 'OAuth authorization was denied or failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code or state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the pending authorization record
    const { data: authRecord, error: fetchError } = await supabase
      .from('external_system_authorizations')
      .select('*')
      .eq('state_param', state)
      .eq('status', 'pending')
      .single();

    if (fetchError || !authRecord) {
      console.error('Failed to find authorization record:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired authorization state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For GitHub: Exchange code for access token
    // User must provide their GitHub OAuth App credentials in user_platform_connections
    const { data: connectionData } = await supabase
      .from('user_platform_connections')
      .select('credentials')
      .eq('user_id', authRecord.user_id)
      .eq('platform', platform || authRecord.platform)
      .single();

    let accessToken = null;
    let tokenData = null;

    if (platform === 'github' || authRecord.platform === 'github') {
      // For GitHub, we need client_id and client_secret from user's stored credentials
      const clientId = connectionData?.credentials?.client_id;
      const clientSecret = connectionData?.credentials?.client_secret;

      if (clientId && clientSecret) {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
          }),
        });

        tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;

        if (!accessToken) {
          console.error('Failed to get access token:', tokenData);
          return new Response(
            JSON.stringify({ error: 'Failed to exchange code for access token', details: tokenData }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Update the authorization record with the token
    const { error: updateError } = await supabase
      .from('external_system_authorizations')
      .update({
        status: accessToken ? 'active' : 'pending_token',
        access_token_encrypted: accessToken, // In production, encrypt this
        token_expires_at: tokenData?.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        scopes_granted: tokenData?.scope?.split(',') || [],
        authorized_at: new Date().toISOString(),
      })
      .eq('id', authRecord.id);

    if (updateError) {
      console.error('Failed to update authorization:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save authorization' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also update user_platform_connections
    await supabase
      .from('user_platform_connections')
      .update({
        status: 'connected',
        credentials: {
          ...connectionData?.credentials,
          access_token: accessToken,
          token_type: tokenData?.token_type,
          scope: tokenData?.scope,
        },
        last_sync_at: new Date().toISOString(),
      })
      .eq('user_id', authRecord.user_id)
      .eq('platform', platform || authRecord.platform);

    console.log('OAuth callback successful for user:', authRecord.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Authorization successful',
        authorizationId: authRecord.id,
        hasToken: !!accessToken,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
