import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { contentId, targets } = await req.json();

    // Fetch content item with brand config
    const { data: content, error: contentError } = await supabase
      .from('marketing_content_queue')
      .select(`
        *,
        brand_marketing_config (
          upn_broadcast_enabled,
          social_platforms,
          physical_stations,
          franchises (
            brand_name
          )
        )
      `)
      .eq('id', contentId)
      .eq('user_id', user.id)
      .single();

    if (contentError || !content) {
      throw new Error('Content not found');
    }

    if (content.status !== 'approved') {
      throw new Error('Content must be approved before deployment');
    }

    const deploymentResults: any[] = [];
    const brandConfig = content.brand_marketing_config;

    // Deploy to UPN if enabled
    if (brandConfig?.upn_broadcast_enabled) {
      console.log('Deploying to UPN Broadcast...');
      
      // Create broadcast segment
      const { data: segment, error: segmentError } = await supabase
        .from('bd_broadcast_segments')
        .insert({
          user_id: user.id,
          sector: 'general',
          title: content.title,
          summary: content.content?.substring(0, 500) || '',
          content_body: content.content,
          source_url: null,
          is_featured: content.priority === 'high',
        })
        .select()
        .single();

      if (segmentError) {
        console.error('UPN deployment failed:', segmentError);
      } else {
        // Record deployment
        const { data: deployment } = await supabase
          .from('marketing_deployments')
          .insert({
            content_id: contentId,
            brand_config_id: content.brand_config_id,
            user_id: user.id,
            deployment_target: 'upn',
            status: 'completed',
            external_post_id: segment.id,
            deployed_at: new Date().toISOString(),
          })
          .select()
          .single();

        deploymentResults.push({ target: 'upn', success: true, id: segment.id });
      }
    }

    // Deploy to social platforms (placeholder for actual API integrations)
    if (brandConfig?.social_platforms && brandConfig.social_platforms.length > 0) {
      for (const platform of brandConfig.social_platforms) {
        console.log(`Would deploy to social platform: ${platform}`);
        
        // Create scheduled post in social_posts table
        const { data: post, error: postError } = await supabase
          .from('social_posts')
          .insert({
            user_id: user.id,
            account_id: null, // Would need to fetch linked account
            content: content.content,
            media_urls: content.media_url ? [content.media_url] : [],
            scheduled_for: new Date().toISOString(),
            status: 'scheduled',
          })
          .select()
          .single();

        if (!postError && post) {
          await supabase
            .from('marketing_deployments')
            .insert({
              content_id: contentId,
              brand_config_id: content.brand_config_id,
              user_id: user.id,
              deployment_target: 'social',
              platform_slug: platform,
              status: 'pending',
              external_post_id: post.id,
            });

          deploymentResults.push({ target: 'social', platform, success: true, id: post.id });
        }
      }
    }

    // Deploy to physical stations (placeholder)
    if (brandConfig?.physical_stations && brandConfig.physical_stations.length > 0) {
      for (const stationId of brandConfig.physical_stations) {
        console.log(`Would deploy to physical station: ${stationId}`);
        
        await supabase
          .from('marketing_deployments')
          .insert({
            content_id: contentId,
            brand_config_id: content.brand_config_id,
            user_id: user.id,
            deployment_target: 'physical_station',
            station_id: stationId,
            status: 'pending',
          });

        deploymentResults.push({ target: 'physical_station', stationId, success: true });
      }
    }

    // Update content status to deployed
    await supabase
      .from('marketing_content_queue')
      .update({ status: 'deployed' })
      .eq('id', contentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deployments: deploymentResults 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Deployment error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Deployment failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});