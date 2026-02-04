import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuildRequest {
  project_id: string;
  platform: 'ios' | 'android';
  build_type: 'development' | 'release' | 'internal_testing' | 'store_draft';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { project_id, platform, build_type }: BuildRequest = await req.json();

    // Validate project exists and user owns it
    const { data: project, error: projectError } = await supabaseClient
      .from('store_launch_projects')
      .select('*')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found or access denied");
    }

    // Check if platform is enabled for this project
    if (!project.platforms?.includes(platform)) {
      throw new Error(`Platform ${platform} is not enabled for this project`);
    }

    // Generate version number
    const { data: lastBuild } = await supabaseClient
      .from('store_launch_builds')
      .select('version_code')
      .eq('project_id', project_id)
      .eq('platform', platform)
      .order('version_code', { ascending: false })
      .limit(1)
      .maybeSingle();

    const versionCode = (lastBuild?.version_code || 0) + 1;
    const versionName = `1.0.${versionCode}`;

    // Create build record
    const { data: build, error: buildError } = await supabaseClient
      .from('store_launch_builds')
      .insert({
        project_id,
        platform,
        build_type,
        status: 'queued',
        version_name: versionName,
        version_code: versionCode,
        build_config: {
          source_url: project.source_url,
          source_type: project.source_type,
          native_features: await getNativeFeatures(supabaseClient, project_id),
        }
      })
      .select()
      .single();

    if (buildError) {
      throw buildError;
    }

    // Simulate build process (in production, this would trigger actual cloud build)
    simulateBuild(supabaseClient, build.id);

    console.log(`Build queued: ${build.id} for project ${project.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        build_id: build.id,
        message: `${platform.toUpperCase()} ${build_type} build queued`,
        estimated_time: build_type === 'development' ? '5-10 minutes' : '15-25 minutes'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Build error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function getNativeFeatures(supabase: any, projectId: string) {
  const { data } = await supabase
    .from('store_launch_native_features')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  
  return data || {};
}

// Simulate build process with status updates
async function simulateBuild(supabase: any, buildId: string) {
  const stages = [
    { status: 'building', logs: 'Starting build process...\nFetching source code...' },
    { status: 'building', logs: 'Installing dependencies...\nnpm install completed' },
    { status: 'building', logs: 'Compiling web assets...\nBundling JavaScript...' },
    { status: 'building', logs: 'Generating native project...\nConfiguring native modules...' },
    { status: 'building', logs: 'Building native binary...\nCompiling Swift/Kotlin...' },
    { status: 'completed', logs: 'Build completed successfully!\nArtifact ready for download.' },
  ];

  // Use service role for background updates
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let accumulatedLogs = '';
  
  for (let i = 0; i < stages.length; i++) {
    // Wait between stages (simulating build time)
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    accumulatedLogs += stages[i].logs + '\n';
    
    const updates: any = {
      status: stages[i].status,
      build_logs: accumulatedLogs,
    };

    if (i === 0) {
      updates.started_at = new Date().toISOString();
    }

    if (stages[i].status === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.artifact_url = `https://builds.example.com/${buildId}/app.ipa`;
      updates.artifact_size_mb = Math.floor(20 + Math.random() * 30);
    }

    await serviceClient
      .from('store_launch_builds')
      .update(updates)
      .eq('id', buildId);
  }
}
