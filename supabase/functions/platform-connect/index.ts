import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform connection configurations
const platformConfigs: Record<string, {
  authType: string;
  oauthUrl?: string;
  apiUrl?: string;
  scopes?: string[];
}> = {
  replit: {
    authType: 'oauth',
    oauthUrl: 'https://replit.com/auth',
    apiUrl: 'https://replit.com/graphql',
    scopes: ['read:user', 'read:repls'],
  },
  lindy_ai: {
    authType: 'webhook',
    apiUrl: 'https://api.lindy.ai',
  },
  n8n: {
    authType: 'api_key',
    apiUrl: 'https://n8n.io/api/v1',
  },
  bubble: {
    authType: 'api_key',
    apiUrl: 'https://api.bubble.io/v1',
  },
  make: {
    authType: 'api_key',
    apiUrl: 'https://hook.make.com',
  },
  zapier: {
    authType: 'webhook',
    apiUrl: 'https://hooks.zapier.com',
  },
  webflow: {
    authType: 'oauth',
    oauthUrl: 'https://webflow.com/oauth/authorize',
    apiUrl: 'https://api.webflow.com',
    scopes: ['sites:read', 'collections:read'],
  },
  notion: {
    authType: 'oauth',
    oauthUrl: 'https://api.notion.com/v1/oauth/authorize',
    apiUrl: 'https://api.notion.com/v1',
    scopes: ['read'],
  },
  airtable: {
    authType: 'oauth',
    oauthUrl: 'https://airtable.com/oauth2/v1/authorize',
    apiUrl: 'https://api.airtable.com/v0',
    scopes: ['data.records:read', 'schema.bases:read'],
  },
  github: {
    authType: 'oauth',
    oauthUrl: 'https://github.com/login/oauth/authorize',
    apiUrl: 'https://api.github.com',
    scopes: ['read:user', 'repo'],
  },
  vercel: {
    authType: 'api_key',
    apiUrl: 'https://api.vercel.com',
  },
  supabase: {
    authType: 'api_key',
    apiUrl: 'https://api.supabase.com',
  },
  firebase: {
    authType: 'oauth',
    oauthUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    apiUrl: 'https://firebase.googleapis.com',
    scopes: ['https://www.googleapis.com/auth/firebase.readonly'],
  },
  shopify: {
    authType: 'oauth',
    oauthUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    apiUrl: 'https://{shop}.myshopify.com/admin/api/2024-01',
    scopes: ['read_products', 'read_orders', 'read_analytics'],
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

    const { action, platformSlug, connectionData, connectionId } = await req.json();

    switch (action) {
      case 'initiate': {
        // Get platform from registry
        const { data: platform, error: platformError } = await supabase
          .from('external_platform_registry')
          .select('*')
          .eq('platform_slug', platformSlug)
          .single();

        if (platformError || !platform) {
          return new Response(JSON.stringify({ error: 'Platform not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const config = platformConfigs[platformSlug];
        if (!config) {
          return new Response(JSON.stringify({ 
            error: 'Platform integration not yet implemented',
            platform: platform.platform_name,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create pending connection record
        const { data: connection, error: connError } = await supabase
          .from('user_platform_connections')
          .insert({
            user_id: user.id,
            platform_id: platform.id,
            connection_name: connectionData?.name || `${platform.platform_name} Connection`,
            connection_status: 'pending',
            auth_method: config.authType,
            platform_metadata: {
              initiated_at: new Date().toISOString(),
              ...connectionData,
            },
          })
          .select()
          .single();

        if (connError) {
          console.error('Error creating connection:', connError);
          return new Response(JSON.stringify({ error: connError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Return connection details based on auth type
        if (config.authType === 'oauth') {
          const state = crypto.randomUUID();
          // Store state for OAuth callback verification
          await supabase
            .from('user_platform_connections')
            .update({
              platform_metadata: {
                ...connection.platform_metadata,
                oauth_state: state,
              },
            })
            .eq('id', connection.id);

          return new Response(JSON.stringify({
            success: true,
            connectionId: connection.id,
            authType: 'oauth',
            oauthUrl: config.oauthUrl,
            scopes: config.scopes,
            state,
            message: 'OAuth authorization required. Redirect user to authorization URL.',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (config.authType === 'api_key') {
          return new Response(JSON.stringify({
            success: true,
            connectionId: connection.id,
            authType: 'api_key',
            message: 'API key required. Please provide your API key to complete connection.',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (config.authType === 'webhook') {
          const webhookUrl = `${supabaseUrl}/functions/v1/platform-webhook/${connection.id}`;
          await supabase
            .from('user_platform_connections')
            .update({
              webhook_url: webhookUrl,
              connection_status: 'connected',
            })
            .eq('id', connection.id);

          return new Response(JSON.stringify({
            success: true,
            connectionId: connection.id,
            authType: 'webhook',
            webhookUrl,
            message: 'Webhook URL generated. Configure this URL in your platform settings.',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'complete': {
        // Complete connection with API key or OAuth tokens
        const { data: connection, error: connError } = await supabase
          .from('user_platform_connections')
          .select('*, external_platform_registry(*)')
          .eq('id', connectionId)
          .eq('user_id', user.id)
          .single();

        if (connError || !connection) {
          return new Response(JSON.stringify({ error: 'Connection not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updateData: any = {
          connection_status: 'connected',
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'success',
        };

        if (connectionData.apiKey) {
          updateData.api_key_encrypted = connectionData.apiKey; // In production, encrypt this
        }
        if (connectionData.accessToken) {
          updateData.access_token_encrypted = connectionData.accessToken;
          updateData.refresh_token_encrypted = connectionData.refreshToken;
          updateData.token_expires_at = connectionData.expiresAt;
        }
        if (connectionData.externalAccountId) {
          updateData.external_account_id = connectionData.externalAccountId;
          updateData.external_account_name = connectionData.externalAccountName;
        }

        const { error: updateError } = await supabase
          .from('user_platform_connections')
          .update(updateData)
          .eq('id', connectionId);

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Connection completed successfully',
          connectionId,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'discover': {
        // Discover projects from connected platform
        const { data: connection, error: connError } = await supabase
          .from('user_platform_connections')
          .select('*, external_platform_registry(*)')
          .eq('id', connectionId)
          .eq('user_id', user.id)
          .single();

        if (connError || !connection) {
          return new Response(JSON.stringify({ error: 'Connection not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Simulate discovery based on platform (in production, call actual APIs)
        const discoveredProjects = await simulateProjectDiscovery(connection);

        // Update connection with discovered projects
        await supabase
          .from('user_platform_connections')
          .update({
            discovery_completed_at: new Date().toISOString(),
            discovered_projects: discoveredProjects,
            discovered_capabilities: {
              projects_count: discoveredProjects.length,
              discovered_at: new Date().toISOString(),
            },
          })
          .eq('id', connectionId);

        // Create import records for each discovered project
        for (const project of discoveredProjects) {
          await supabase
            .from('platform_project_imports')
            .upsert({
              connection_id: connectionId,
              user_id: user.id,
              external_project_id: project.id,
              external_project_name: project.name,
              external_project_url: project.url,
              external_created_at: project.createdAt,
              external_updated_at: project.updatedAt,
              import_status: 'discovered',
            }, {
              onConflict: 'connection_id,external_project_id',
            });
        }

        return new Response(JSON.stringify({
          success: true,
          discoveredProjects,
          message: `Discovered ${discoveredProjects.length} projects`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list': {
        // List user's platform connections
        const { data: connections, error: listError } = await supabase
          .from('user_platform_connections')
          .select('*, external_platform_registry(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (listError) {
          return new Response(JSON.stringify({ error: listError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          connections,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Platform connect error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simulate project discovery for demo purposes
async function simulateProjectDiscovery(connection: any): Promise<any[]> {
  const platformSlug = connection.external_platform_registry?.platform_slug;
  const projectCount = Math.floor(Math.random() * 5) + 1;
  const projects = [];

  for (let i = 0; i < projectCount; i++) {
    projects.push({
      id: crypto.randomUUID(),
      name: `${platformSlug}-project-${i + 1}`,
      description: `Sample project from ${connection.external_platform_registry?.platform_name}`,
      url: `https://${platformSlug}.example.com/project/${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        files: Math.floor(Math.random() * 100),
        collaborators: Math.floor(Math.random() * 10),
        deployments: Math.floor(Math.random() * 50),
      },
    });
  }

  return projects;
}