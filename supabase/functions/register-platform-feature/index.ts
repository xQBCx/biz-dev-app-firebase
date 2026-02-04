import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterPlatformFeatureRequest {
  featureName: string;
  featureRoute: string;
  industry: string;
  description: string;
  offersJson?: Record<string, unknown>;
  needsJson?: Record<string, unknown>;
  offersTags?: string[];
  needsTags?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth token to get user ID
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RegisterPlatformFeatureRequest = await req.json();
    const { featureName, featureRoute, industry, description, offersJson, needsJson, offersTags, needsTags } = body;

    if (!featureName || !featureRoute || !industry) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: featureName, featureRoute, industry' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this feature is already registered
    const { data: existingBusiness } = await supabase
      .from('spawned_businesses')
      .select('id')
      .eq('feature_route', featureRoute)
      .eq('is_platform_feature', true)
      .single();

    if (existingBusiness) {
      return new Response(
        JSON.stringify({ 
          error: 'This platform feature is already registered as a business',
          businessId: existingBusiness.id 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Registering platform feature:', featureName, 'for user:', user.id);

    // Create the spawned business record
    const { data: business, error: businessError } = await supabase
      .from('spawned_businesses')
      .insert({
        user_id: user.id,
        business_name: featureName,
        industry: industry,
        description: description || `${featureName} - Platform Feature`,
        status: 'active',
        spawn_progress: 100,
        is_platform_feature: true,
        feature_route: featureRoute,
        offers_json: offersJson || {},
        needs_json: needsJson || {},
        offers_tags: offersTags || [],
        needs_tags: needsTags || []
      })
      .select()
      .single();

    if (businessError) {
      console.error('Error creating business:', businessError);
      return new Response(
        JSON.stringify({ error: 'Failed to register platform feature', details: businessError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Platform feature registered successfully:', business.id);

    // The trigger should automatically create a client workspace
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the linked client workspace
    const { data: client } = await supabase
      .from('clients')
      .select('id, name')
      .eq('spawned_business_id', business.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        business: {
          id: business.id,
          name: business.business_name,
          industry: business.industry,
          featureRoute: business.feature_route,
          status: business.status
        },
        clientWorkspace: client ? {
          id: client.id,
          name: client.name
        } : null
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
