import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Registrar-specific token exchange handlers
const tokenExchangeHandlers: Record<string, (code: string, redirectUri: string) => Promise<any>> = {
  cloudflare: async (code: string, redirectUri: string) => {
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: Deno.env.get('CLOUDFLARE_CLIENT_ID'),
        client_secret: Deno.env.get('CLOUDFLARE_CLIENT_SECRET'),
      }),
    });
    return response.json();
  },
  godaddy: async (code: string, redirectUri: string) => {
    const response = await fetch('https://sso.godaddy.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: Deno.env.get('GODADDY_CLIENT_ID') || '',
        client_secret: Deno.env.get('GODADDY_CLIENT_SECRET') || '',
      }),
    });
    return response.json();
  },
  namecheap: async (code: string, redirectUri: string) => {
    const response = await fetch('https://api.namecheap.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: Deno.env.get('NAMECHEAP_CLIENT_ID') || '',
        client_secret: Deno.env.get('NAMECHEAP_CLIENT_SECRET') || '',
      }),
    });
    return response.json();
  },
  google_domains: async (code: string, redirectUri: string) => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      }),
    });
    return response.json();
  },
};

serve(async (req) => {
  const url = new URL(req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Handle OAuth callback
  if (url.pathname.endsWith('/callback')) {
    try {
      const code = url.searchParams.get('code');
      const stateParam = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response(`
          <html>
            <body>
              <script>
                window.opener?.postMessage({ type: 'oauth-error', error: '${error}' }, '*');
                window.close();
              </script>
              <p>Authorization failed. You can close this window.</p>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      if (!code || !stateParam) {
        return new Response('Missing code or state', { status: 400 });
      }

      const { state, domainId, userId } = JSON.parse(stateParam);
      
      // Verify state matches
      const { data: domainData } = await supabase
        .from('business_domains')
        .select('*, registrar_detected')
        .eq('id', domainId)
        .single();

      if (!domainData || domainData.oauth_state !== state) {
        return new Response('Invalid state', { status: 400 });
      }

      const registrarSlug = domainData.registrar_detected;
      if (!registrarSlug || !tokenExchangeHandlers[registrarSlug]) {
        return new Response('Unsupported registrar', { status: 400 });
      }

      // Get registrar info
      const { data: registrarInfo } = await supabase
        .from('registrar_registry')
        .select('*')
        .eq('registrar_name', registrarSlug)
        .single();

      if (!registrarInfo) {
        return new Response('Registrar not found', { status: 400 });
      }

      // Exchange code for tokens
      const redirectUri = `${supabaseUrl}/functions/v1/registrar-oauth/callback`;
      const tokenData = await tokenExchangeHandlers[registrarSlug](code, redirectUri);

      if (tokenData.error) {
        return new Response(`
          <html>
            <body>
              <script>
                window.opener?.postMessage({ type: 'oauth-error', error: '${tokenData.error}' }, '*');
                window.close();
              </script>
              <p>Token exchange failed. You can close this window.</p>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      // Store or update the connection
      const connectionData = {
        user_id: userId,
        registrar_id: registrarInfo.id,
        access_token_encrypted: tokenData.access_token,
        refresh_token_encrypted: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        account_email: tokenData.email || null,
        account_id: tokenData.account_id || null,
        is_active: true,
        last_used_at: new Date().toISOString(),
      };

      const { data: connection, error: connError } = await supabase
        .from('domain_registrar_connections')
        .upsert(connectionData, { 
          onConflict: 'user_id,registrar_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (connError) {
        console.error('Failed to save connection:', connError);
        return new Response(`
          <html>
            <body>
              <script>
                window.opener?.postMessage({ type: 'oauth-error', error: 'Failed to save connection' }, '*');
                window.close();
              </script>
              <p>Failed to save connection. You can close this window.</p>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      // Link connection to domain
      await supabase
        .from('business_domains')
        .update({ 
          registrar_connection_id: connection.id,
          oauth_state: null 
        })
        .eq('id', domainId);

      return new Response(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ 
                type: 'oauth-success', 
                connectionId: '${connection.id}',
                registrar: '${registrarSlug}'
              }, '*');
              window.close();
            </script>
            <p>Authorization successful! You can close this window.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
      console.error('OAuth callback error:', error);
      return new Response(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ type: 'oauth-error', error: 'Internal error' }, '*');
              window.close();
            </script>
            <p>An error occurred. You can close this window.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }
  }

  // Handle manual token input (for registrars without OAuth)
  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { registrarSlug, apiKey, apiSecret, domainId } = await req.json();

      // Get registrar info
      const { data: registrarInfo } = await supabase
        .from('registrar_registry')
        .select('*')
        .eq('registrar_name', registrarSlug)
        .single();

      if (!registrarInfo) {
        return new Response(JSON.stringify({ error: 'Registrar not found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Store the API credentials
      const connectionData = {
        user_id: user.id,
        registrar_id: registrarInfo.id,
        access_token_encrypted: apiKey,
        refresh_token_encrypted: apiSecret || null,
        is_active: true,
        last_used_at: new Date().toISOString(),
      };

      const { data: connection, error: connError } = await supabase
        .from('domain_registrar_connections')
        .upsert(connectionData, { 
          onConflict: 'user_id,registrar_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (connError) {
        return new Response(JSON.stringify({ error: 'Failed to save credentials' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Link connection to domain if provided
      if (domainId) {
        await supabase
          .from('business_domains')
          .update({ registrar_connection_id: connection.id })
          .eq('id', domainId);
      }

      return new Response(JSON.stringify({
        success: true,
        connectionId: connection.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error: any) {
      console.error('Error saving credentials:', error);
      return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
