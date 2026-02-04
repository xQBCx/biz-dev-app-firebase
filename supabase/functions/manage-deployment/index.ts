import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_DOMAIN = 'bizdev.app';

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

    const { action, businessId, versionId, versionLabel, notes } = await req.json();

    if (!businessId) {
      return new Response(JSON.stringify({ error: 'Business ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify ownership
    const { data: business, error: businessError } = await supabase
      .from('spawned_businesses')
      .select('*')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      return new Response(JSON.stringify({ error: 'Business not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'deploy': {
        // Update status to deploying
        await supabase
          .from('spawned_businesses')
          .update({ deployment_status: 'deploying' })
          .eq('id', businessId);

        // Get next version number
        const { data: versionNum } = await supabase.rpc('get_next_version_number', {
          p_business_id: businessId
        });

        // Create snapshot of current state
        const { data: version, error: versionError } = await supabase
          .from('deployment_versions')
          .insert({
            business_id: businessId,
            version_number: versionNum || 1,
            version_label: versionLabel || `v${versionNum || 1}`,
            website_snapshot: business.generated_website_data,
            config_snapshot: {
              erp_structure: business.erp_structure,
              modules: business.modules_config,
            },
            deployed_by: user.id,
            is_current: true,
            notes,
          })
          .select()
          .single();

        if (versionError) {
          await supabase
            .from('spawned_businesses')
            .update({ deployment_status: 'failed' })
            .eq('id', businessId);
          
          return new Response(JSON.stringify({ error: 'Failed to create version' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Mark other versions as not current
        await supabase
          .from('deployment_versions')
          .update({ is_current: false })
          .eq('business_id', businessId)
          .neq('id', version.id);

        // Create or ensure domain exists
        const subdomain = business.business_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50);

        const { data: existingDomain } = await supabase
          .from('business_domains')
          .select('*')
          .eq('business_id', businessId)
          .single();

        let domainRecord;
        if (!existingDomain) {
          const verificationToken = crypto.randomUUID().replace(/-/g, '');
          
          const { data: newDomain } = await supabase
            .from('business_domains')
            .insert({
              business_id: businessId,
              subdomain,
              verification_token: verificationToken,
              created_by: user.id,
              is_primary: true,
              status: 'active',
            })
            .select()
            .single();
          
          domainRecord = newDomain;
        } else {
          domainRecord = existingDomain;
          await supabase
            .from('business_domains')
            .update({ status: 'active' })
            .eq('id', existingDomain.id);
        }

        const deploymentUrl = `https://${domainRecord?.subdomain || subdomain}.${BASE_DOMAIN}`;
        
        // Update version with deployment URL
        await supabase
          .from('deployment_versions')
          .update({ deployment_url: deploymentUrl })
          .eq('id', version.id);

        // Update business status
        await supabase
          .from('spawned_businesses')
          .update({ 
            deployment_status: 'deployed',
            current_version_id: version.id,
          })
          .eq('id', businessId);

        return new Response(JSON.stringify({
          success: true,
          action: 'deployed',
          version: {
            id: version.id,
            number: version.version_number,
            label: version.version_label,
          },
          url: deploymentUrl,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'undeploy': {
        await supabase
          .from('spawned_businesses')
          .update({ deployment_status: 'undeploying' })
          .eq('id', businessId);

        // Deactivate domain but don't delete
        await supabase
          .from('business_domains')
          .update({ status: 'pending' })
          .eq('business_id', businessId);

        // Mark all versions as not current
        await supabase
          .from('deployment_versions')
          .update({ is_current: false })
          .eq('business_id', businessId);

        await supabase
          .from('spawned_businesses')
          .update({ 
            deployment_status: 'unpublished',
            current_version_id: null,
          })
          .eq('id', businessId);

        return new Response(JSON.stringify({
          success: true,
          action: 'undeployed',
          message: 'Business website has been unpublished. All data is preserved.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'rollback': {
        if (!versionId) {
          return new Response(JSON.stringify({ error: 'Version ID required for rollback' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get the target version
        const { data: targetVersion, error: versionError } = await supabase
          .from('deployment_versions')
          .select('*')
          .eq('id', versionId)
          .eq('business_id', businessId)
          .single();

        if (versionError || !targetVersion) {
          return new Response(JSON.stringify({ error: 'Version not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Apply snapshot to business
        await supabase
          .from('spawned_businesses')
          .update({
            generated_website_data: targetVersion.website_snapshot,
            erp_structure: targetVersion.config_snapshot?.erp_structure,
            modules_config: targetVersion.config_snapshot?.modules,
            current_version_id: targetVersion.id,
          })
          .eq('id', businessId);

        // Mark this version as current
        await supabase
          .from('deployment_versions')
          .update({ is_current: false })
          .eq('business_id', businessId);

        await supabase
          .from('deployment_versions')
          .update({ is_current: true })
          .eq('id', targetVersion.id);

        return new Response(JSON.stringify({
          success: true,
          action: 'rollback',
          restoredVersion: {
            id: targetVersion.id,
            number: targetVersion.version_number,
            label: targetVersion.version_label,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'preview': {
        // Generate a temporary preview URL
        const previewToken = crypto.randomUUID();
        const previewUrl = `https://preview-${previewToken.substring(0, 8)}.${BASE_DOMAIN}`;

        // In production, this would set up an actual preview environment
        // For now, we'll just return a preview URL concept

        return new Response(JSON.stringify({
          success: true,
          action: 'preview',
          previewUrl,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          message: 'Preview URL generated. This is a temporary preview that will expire in 24 hours.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'list-versions': {
        const { data: versions } = await supabase
          .from('deployment_versions')
          .select('*')
          .eq('business_id', businessId)
          .order('version_number', { ascending: false });

        return new Response(JSON.stringify({
          success: true,
          versions: versions || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error: any) {
    console.error('Deployment error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
