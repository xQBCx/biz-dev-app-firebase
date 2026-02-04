import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform-specific discovery configurations
const platformDiscoveryConfig: Record<string, { scopes: string[], endpoints: string[] }> = {
  microsoft_365: {
    scopes: ['User.Read', 'Contacts.Read', 'Calendars.Read', 'Files.Read', 'Mail.Read'],
    endpoints: ['/me', '/me/contacts', '/me/calendar/events', '/me/drive/root/children', '/me/mailFolders'],
  },
  google_workspace: {
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/contacts.readonly', 'https://www.googleapis.com/auth/calendar.readonly'],
    endpoints: ['/userinfo', '/contacts', '/calendars', '/drive/files'],
  },
  hubspot: {
    scopes: ['crm.objects.contacts.read', 'crm.objects.companies.read', 'crm.objects.deals.read'],
    endpoints: ['/crm/v3/objects/contacts', '/crm/v3/objects/companies', '/crm/v3/objects/deals', '/automation/v4/flows'],
  },
  salesforce: {
    scopes: ['api', 'refresh_token'],
    endpoints: ['/services/data/v58.0/sobjects/Account', '/services/data/v58.0/sobjects/Contact', '/services/data/v58.0/sobjects/Opportunity'],
  },
  zoho: {
    scopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.settings.ALL'],
    endpoints: ['/crm/v3/Contacts', '/crm/v3/Accounts', '/crm/v3/Deals'],
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

    const { authorizationId } = await req.json();

    // Get the authorization record
    const { data: auth, error: authError } = await supabase
      .from('external_system_authorizations')
      .select('*')
      .eq('id', authorizationId)
      .eq('user_id', user.id)
      .single();

    if (authError || !auth) {
      return new Response(JSON.stringify({ error: 'Authorization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting discovery for platform: ${auth.platform}`);

    // Create a discovery session
    const { data: session, error: sessionError } = await supabase
      .from('system_discovery_sessions')
      .insert({
        authorization_id: authorizationId,
        user_id: user.id,
        discovery_status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to create discovery session:', sessionError);
      return new Response(JSON.stringify({ error: sessionError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simulate discovery based on platform
    // In production, this would use the OAuth tokens to call actual APIs
    const discoveredData = await performDiscovery(auth.platform, auth);

    // Update the discovery session with results
    const { error: updateError } = await supabase
      .from('system_discovery_sessions')
      .update({
        discovery_status: 'completed',
        completed_at: new Date().toISOString(),
        discovered_data: discoveredData,
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Failed to update discovery session:', updateError);
    }

    // Update last_crawl_at on the authorization
    await supabase
      .from('external_system_authorizations')
      .update({ last_crawl_at: new Date().toISOString() })
      .eq('id', authorizationId);

    return new Response(JSON.stringify({
      success: true,
      sessionId: session.id,
      discoveredData,
      message: 'Discovery completed successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('System discover error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performDiscovery(platform: string, auth: any): Promise<object> {
  // This is a simulated discovery - in production, use actual OAuth tokens
  const baseDiscovery = {
    platform,
    discovered_at: new Date().toISOString(),
    users: { count: 0, details: [] },
    apps_in_use: [] as string[],
    data_volumes: {
      contacts: 0,
      emails: 0,
      files: 0,
      events: 0,
    },
    integrations_found: [] as string[],
    workflows: [] as string[],
    capabilities: [] as string[],
  };

  // Platform-specific discovery simulation
  switch (platform) {
    case 'microsoft_365':
      return {
        ...baseDiscovery,
        apps_in_use: ['Outlook', 'Teams', 'SharePoint', 'OneDrive', 'Word', 'Excel'],
        data_volumes: {
          contacts: Math.floor(Math.random() * 5000),
          emails: Math.floor(Math.random() * 50000),
          files: Math.floor(Math.random() * 10000),
          events: Math.floor(Math.random() * 1000),
        },
        integrations_found: ['Power Automate', 'Power BI'],
        capabilities: ['email', 'calendar', 'storage', 'collaboration', 'crm'],
      };

    case 'google_workspace':
      return {
        ...baseDiscovery,
        apps_in_use: ['Gmail', 'Drive', 'Calendar', 'Docs', 'Sheets', 'Meet'],
        data_volumes: {
          contacts: Math.floor(Math.random() * 3000),
          emails: Math.floor(Math.random() * 40000),
          files: Math.floor(Math.random() * 8000),
          events: Math.floor(Math.random() * 800),
        },
        integrations_found: ['Zapier', 'Slack'],
        capabilities: ['email', 'calendar', 'storage', 'collaboration'],
      };

    case 'hubspot':
      return {
        ...baseDiscovery,
        apps_in_use: ['CRM', 'Marketing Hub', 'Sales Hub'],
        data_volumes: {
          contacts: Math.floor(Math.random() * 10000),
          companies: Math.floor(Math.random() * 2000),
          deals: Math.floor(Math.random() * 500),
          emails: Math.floor(Math.random() * 20000),
        },
        integrations_found: ['Gmail', 'Slack', 'Zoom'],
        workflows: ['Lead Nurturing', 'Deal Pipeline'],
        capabilities: ['crm', 'marketing', 'email', 'analytics'],
      };

    case 'salesforce':
      return {
        ...baseDiscovery,
        apps_in_use: ['Sales Cloud', 'Service Cloud'],
        data_volumes: {
          contacts: Math.floor(Math.random() * 15000),
          accounts: Math.floor(Math.random() * 3000),
          opportunities: Math.floor(Math.random() * 1000),
        },
        integrations_found: ['Slack', 'DocuSign', 'Mailchimp'],
        workflows: ['Lead Assignment', 'Opportunity Stages'],
        capabilities: ['crm', 'analytics', 'workflows', 'reports'],
      };

    default:
      return baseDiscovery;
  }
}
