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

    const { name, slug, description, appType, supabaseUrl: appUrl, webhookUrl, companyId } = await req.json();

    // Generate a secure API key for the child app
    const apiKey = crypto.randomUUID() + '-' + crypto.randomUUID();
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`Registering ecosystem app: ${name} (${slug}) for user ${user.id}`);

    // Create the ecosystem app record
    const { data: app, error: insertError } = await supabase
      .from('ecosystem_apps')
      .insert({
        name,
        slug,
        description,
        app_type: appType || 'external',
        supabase_url: appUrl,
        webhook_url: webhookUrl,
        api_key_hash: apiKeyHash,
        owner_user_id: user.id,
        company_id: companyId,
        status: 'pending',
        metadata: {
          registered_at: new Date().toISOString(),
          registered_by: user.email,
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to register app:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`App registered successfully: ${app.id}`);

    // Return the API key only once - it should be stored by the child app
    return new Response(JSON.stringify({
      success: true,
      app: {
        id: app.id,
        name: app.name,
        slug: app.slug,
        status: app.status,
      },
      apiKey, // Return the unhashed key for the child app to store
      message: 'App registered successfully. Store the API key securely - it will not be shown again.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Ecosystem register error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
