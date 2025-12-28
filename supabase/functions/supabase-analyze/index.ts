import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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

    const { projectUrl, anonKey, serviceRoleKey, projectImportId } = await req.json();

    if (!projectUrl || !anonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: projectUrl, anonKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing Supabase project: ${projectUrl}`);

    // Create client for the target Supabase project
    const targetSupabase = createClient(projectUrl, serviceRoleKey || anonKey);

    // Fetch schema information using information_schema
    let tables: any[] = [];
    let policies: any[] = [];
    let functions: any[] = [];

    try {
      // Get tables
      const { data: tableData, error: tableError } = await targetSupabase
        .rpc('get_schema_info')
        .select('*');

      if (tableError) {
        // Fallback: try to query information_schema directly
        // This requires service role key
        console.log('RPC not available, trying direct query...');
      }

      tables = tableData || [];
    } catch (e: any) {
      console.log('Could not fetch tables:', e?.message);
    }

    // Try to get a list of tables by querying each common table name
    const commonTables = [
      'profiles', 'users', 'posts', 'comments', 'orders', 'products',
      'customers', 'invoices', 'payments', 'subscriptions', 'settings',
      'notifications', 'messages', 'files', 'categories', 'tags'
    ];

    const discoveredTables: string[] = [];

    for (const tableName of commonTables) {
      try {
        const { count, error } = await targetSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          discoveredTables.push(tableName);
          tables.push({
            name: tableName,
            row_count: count,
          });
        }
      } catch (e) {
        // Table doesn't exist or no access
      }
    }

    // Build analysis
    const analysis = {
      projectUrl,
      accessLevel: serviceRoleKey ? 'full' : 'limited',
      tablesDiscovered: tables.length,
      tables: tables.map(t => ({
        name: t.name,
        rowCount: t.row_count || 'unknown',
      })),
      features: {
        hasAuth: discoveredTables.includes('profiles') || discoveredTables.includes('users'),
        hasContent: discoveredTables.some(t => ['posts', 'comments', 'messages'].includes(t)),
        hasCommerce: discoveredTables.some(t => ['orders', 'products', 'invoices', 'payments'].includes(t)),
        hasSubscriptions: discoveredTables.includes('subscriptions'),
      },
      integrationOpportunities: [] as any[],
      recommendations: [] as any[],
    };

    // Generate integration opportunities
    if (analysis.features.hasAuth) {
      analysis.integrationOpportunities.push({
        module: 'CRM',
        opportunity: 'Sync user profiles to CRM contacts',
        benefit: 'Unified customer view across all projects',
      });
    }

    if (analysis.features.hasCommerce) {
      analysis.integrationOpportunities.push({
        module: 'Billing',
        opportunity: 'Consolidate order and payment data',
        benefit: 'Single revenue dashboard',
      });
    }

    if (analysis.features.hasContent) {
      analysis.integrationOpportunities.push({
        module: 'Content Hub',
        opportunity: 'Centralize content management',
        benefit: 'Cross-project content sharing',
      });
    }

    // Generate recommendations
    analysis.recommendations = [
      {
        priority: 'high',
        title: 'Enable Cross-Project Authentication',
        description: 'Allow users to sign in once and access all ecosystem projects',
        effort: 'medium',
      },
      {
        priority: 'high',
        title: 'Sync Customer Data to CRM',
        description: 'Automatically sync user data to the unified CRM',
        effort: 'low',
      },
      {
        priority: 'medium',
        title: 'Enable Analytics Consolidation',
        description: 'Share analytics data with the ecosystem dashboard',
        effort: 'low',
      },
    ];

    // AI-enhanced analysis if available
    if (lovableApiKey && tables.length > 0) {
      try {
        const prompt = `Analyze this Supabase database schema and provide integration recommendations:

Tables discovered: ${JSON.stringify(tables, null, 2)}

Features detected:
- Authentication: ${analysis.features.hasAuth}
- Content management: ${analysis.features.hasContent}
- E-commerce: ${analysis.features.hasCommerce}
- Subscriptions: ${analysis.features.hasSubscriptions}

Provide additional recommendations for integrating this database with a business ecosystem platform.
Focus on data sync opportunities, automation possibilities, and unified reporting.

Respond with JSON:
{
  "additionalOpportunities": [{ "module": "string", "opportunity": "string", "benefit": "string" }],
  "additionalRecommendations": [{ "priority": "high|medium|low", "title": "string", "description": "string" }],
  "dataSyncSuggestions": ["string"],
  "overallScore": number
}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a database integration expert. Analyze schemas and provide actionable recommendations. Always respond with valid JSON.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiAnalysis = JSON.parse(jsonMatch[0]);
            analysis.integrationOpportunities.push(...(aiAnalysis.additionalOpportunities || []));
            analysis.recommendations.push(...(aiAnalysis.additionalRecommendations || []));
          }
        }
      } catch (e) {
        console.error('AI analysis failed:', e);
      }
    }

    // Store results if we have a project import
    if (projectImportId) {
      await supabase
        .from('platform_project_imports')
        .update({
          status: 'analyzed',
          analysis_data: {
            type: 'supabase',
            ...analysis,
            analyzedAt: new Date().toISOString(),
          },
          analysis_score: Math.min(100, 50 + tables.length * 5),
        })
        .eq('id', projectImportId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Supabase analyze error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
