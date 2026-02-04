import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  topics: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { connectionId, accessToken: providedToken } = await req.json();

    // Get access token from connection or use provided token
    let accessToken = providedToken;
    let connectionRecord = null;

    if (connectionId && !accessToken) {
      const { data: connection, error: connError } = await supabase
        .from('user_platform_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('user_id', user.id)
        .single();

      if (connError || !connection) {
        return new Response(
          JSON.stringify({ error: 'Connection not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      connectionRecord = connection;
      accessToken = connection.credentials?.access_token || connection.credentials?.personal_access_token;
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No access token available. Please connect your GitHub account first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch repositories from GitHub
    console.log('Fetching GitHub repositories...');
    
    const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BizDev-System-Intelligence',
      },
    });

    if (!reposResponse.ok) {
      const errorText = await reposResponse.text();
      console.error('GitHub API error:', reposResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch GitHub repositories', 
          status: reposResponse.status,
          details: errorText 
        }),
        { status: reposResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const repos: GitHubRepo[] = await reposResponse.json();
    console.log(`Found ${repos.length} repositories`);

    // Also get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BizDev-System-Intelligence',
      },
    });

    const githubUser = userResponse.ok ? await userResponse.json() : null;

    // Transform repos into project imports
    const projects = repos.map(repo => ({
      platform: 'github',
      external_id: repo.id.toString(),
      project_name: repo.name,
      project_url: repo.html_url,
      live_url: repo.homepage,
      description: repo.description,
      metadata: {
        full_name: repo.full_name,
        language: repo.language,
        default_branch: repo.default_branch,
        size: repo.size,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        is_private: repo.private,
        topics: repo.topics,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
      },
      status: 'discovered',
    }));

    // If we have a connection, store the discovered projects
    if (connectionRecord) {
      for (const project of projects) {
        // Check if project already exists
        const { data: existing } = await supabase
          .from('platform_project_imports')
          .select('id')
          .eq('connection_id', connectionId)
          .eq('external_id', project.external_id)
          .single();

        if (!existing) {
          await supabase
            .from('platform_project_imports')
            .insert({
              connection_id: connectionId,
              ...project,
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: githubUser ? {
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
          public_repos: githubUser.public_repos,
          total_private_repos: githubUser.total_private_repos,
        } : null,
        repositories: projects,
        count: projects.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('GitHub discover error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
