import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HarvestRequest {
  library_slug: string;
  npm_package?: string;
  version?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { library_slug, npm_package, version = 'latest' }: HarvestRequest = await req.json();

    // Create a job record
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .insert({
        type: 'import_library',
        status: 'running',
        payload_json: { library_slug, npm_package, version }
      })
      .select()
      .single();

    if (jobError) throw jobError;

    try {
      // Fetch from NPM registry
      if (npm_package) {
        const npmUrl = `https://registry.npmjs.org/${npm_package}/${version}`;
        const npmResponse = await fetch(npmUrl);
        
        if (!npmResponse.ok) {
          throw new Error(`NPM fetch failed: ${npmResponse.statusText}`);
        }

        const packageData = await npmResponse.json();
        
        // Extract license
        const license = packageData.license || 'UNKNOWN';
        
        // Check if license is allowed
        const { data: licenseConfig } = await supabaseClient
          .from('license_configs')
          .select('is_allowed')
          .eq('license_id', license)
          .single();

        if (!licenseConfig?.is_allowed) {
          throw new Error(`License ${license} is not allowed`);
        }

        // Get or create library record
        const { data: library, error: libError } = await supabaseClient
          .from('libraries')
          .upsert({
            slug: library_slug,
            name: packageData.name,
            license_spdx: license,
            website: packageData.homepage,
            repo_url: packageData.repository?.url,
            npm_url: `https://www.npmjs.com/package/${npm_package}`,
            framework: 'tailwind', // Default, can be improved
            is_approved: false
          }, {
            onConflict: 'slug'
          })
          .select()
          .single();

        if (libError) throw libError;

        // Create version record
        const checksum = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(JSON.stringify(packageData))
        );
        const checksumHex = Array.from(new Uint8Array(checksum))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const { data: libraryVersion, error: versionError } = await supabaseClient
          .from('library_versions')
          .insert({
            library_id: library.id,
            version: packageData.version,
            tarball_url: packageData.dist?.tarball,
            checksum: checksumHex,
            size_kb: Math.round((packageData.dist?.unpackedSize || 0) / 1024)
          })
          .select()
          .single();

        if (versionError && !versionError.message.includes('duplicate')) {
          throw versionError;
        }

        // Update job status
        await supabaseClient
          .from('jobs')
          .update({
            status: 'completed',
            finished_at: new Date().toISOString()
          })
          .eq('id', job.id);

        return new Response(
          JSON.stringify({
            success: true,
            library: library,
            version: libraryVersion
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      throw new Error('No npm_package provided');

    } catch (error) {
      // Update job with error
      await supabaseClient
        .from('jobs')
        .update({
          status: 'failed',
          error_text: error.message,
          finished_at: new Date().toISOString()
        })
        .eq('id', job.id);

      throw error;
    }

  } catch (error) {
    console.error('Error in harvest-library:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
