import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { appId, featureName, enabled, config } = await req.json();

    console.log(`Provisioning feature ${featureName} for app ${appId}: enabled=${enabled}`);

    // Verify the user owns this app
    const { data: app, error: appError } = await supabase
      .from('ecosystem_apps')
      .select('*')
      .eq('id', appId)
      .eq('owner_user_id', user.id)
      .single();

    if (appError || !app) {
      return new Response(JSON.stringify({ error: 'App not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upsert the feature configuration
    const { data: feature, error: featureError } = await supabase
      .from('ecosystem_app_features')
      .upsert({
        ecosystem_app_id: appId,
        feature_name: featureName,
        is_enabled: enabled,
        enabled_at: enabled ? new Date().toISOString() : null,
        enabled_by: enabled ? user.id : null,
        config: config || {},
        sync_status: 'pending',
      }, {
        onConflict: 'ecosystem_app_id,feature_name'
      })
      .select()
      .single();

    if (featureError) {
      console.error('Failed to provision feature:', featureError);
      return new Response(JSON.stringify({ error: featureError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If the app has a webhook URL, notify it of the feature change
    if (app.webhook_url) {
      try {
        console.log(`Sending webhook to ${app.webhook_url}`);
        const webhookPayload = {
          action: enabled ? 'enable_feature' : 'disable_feature',
          feature: featureName,
          config: config || {},
          app_id: appId,
          timestamp: new Date().toISOString(),
        };

        const webhookResponse = await fetch(app.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Biz-Dev-Signature': app.api_key_hash?.slice(0, 32) || '',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (webhookResponse.ok) {
          // Update sync status to synced
          await supabase
            .from('ecosystem_app_features')
            .update({ sync_status: 'synced', last_sync_at: new Date().toISOString() })
            .eq('id', feature.id);
        } else {
          console.warn(`Webhook failed with status: ${webhookResponse.status}`);
          await supabase
            .from('ecosystem_app_features')
            .update({ sync_status: 'failed' })
            .eq('id', feature.id);
        }
      } catch (webhookError) {
        console.error('Webhook delivery failed:', webhookError);
        await supabase
          .from('ecosystem_app_features')
          .update({ sync_status: 'failed' })
          .eq('id', feature.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      feature: {
        id: feature.id,
        feature_name: feature.feature_name,
        is_enabled: feature.is_enabled,
        sync_status: feature.sync_status,
      },
      message: `Feature ${featureName} ${enabled ? 'enabled' : 'disabled'} successfully`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Ecosystem provision error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
