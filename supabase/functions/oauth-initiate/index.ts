import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OAuth configuration for each platform
const oauthConfig: Record<string, { authUrl: string, scopes: string[] }> = {
  microsoft_365: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: ['openid', 'profile', 'email', 'User.Read', 'Contacts.Read', 'Calendars.Read', 'Files.Read', 'Mail.Read'],
  },
  google_workspace: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/contacts.readonly', 'https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/drive.readonly'],
  },
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    scopes: ['crm.objects.contacts.read', 'crm.objects.companies.read', 'crm.objects.deals.read', 'crm.schemas.contacts.read'],
  },
  salesforce: {
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    scopes: ['api', 'refresh_token', 'openid'],
  },
  zoho: {
    authUrl: 'https://accounts.zoho.com/oauth/v2/auth',
    scopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.settings.ALL'],
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { platform, redirectUri, ecosystemAppId } = await req.json();

    if (!platform || !oauthConfig[platform]) {
      return new Response(JSON.stringify({ 
        error: 'Invalid platform',
        supportedPlatforms: Object.keys(oauthConfig),
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Initiating OAuth for platform: ${platform}`);

    // Generate a state parameter for security
    const state = crypto.randomUUID();

    // Create a pending authorization record
    const { data: auth, error: authError } = await supabase
      .from('external_system_authorizations')
      .insert({
        user_id: user.id,
        ecosystem_app_id: ecosystemAppId || null,
        platform,
        authorization_status: 'pending',
        metadata: {
          state,
          redirect_uri: redirectUri,
          initiated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (authError) {
      console.error('Failed to create authorization:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const config = oauthConfig[platform];

    // Build the authorization URL
    // Note: In production, you would use actual OAuth client IDs from environment variables
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: `PLACEHOLDER_${platform.toUpperCase()}_CLIENT_ID`,
      redirect_uri: redirectUri || `${supabaseUrl}/functions/v1/oauth-callback`,
      scope: config.scopes.join(' '),
      state: `${auth.id}:${state}`,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authorizationUrl = `${config.authUrl}?${authParams.toString()}`;

    return new Response(JSON.stringify({
      success: true,
      authorizationId: auth.id,
      authorizationUrl,
      platform,
      scopes: config.scopes,
      message: `OAuth flow initiated for ${platform}. Redirect the user to the authorization URL.`,
      note: 'To complete OAuth integration, configure actual OAuth client credentials for each platform.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OAuth initiate error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
