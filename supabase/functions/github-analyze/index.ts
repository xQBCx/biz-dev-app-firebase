import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileContent {
  path: string;
  content: string;
  size: number;
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

    const { projectImportId, repoFullName, accessToken, branch = 'main' } = await req.json();

    if (!repoFullName || !accessToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: repoFullName, accessToken' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing repository: ${repoFullName}`);

    // Update status to analyzing if we have a project import
    if (projectImportId) {
      await supabase
        .from('platform_project_imports')
        .update({ status: 'analyzing' })
        .eq('id', projectImportId);
    }

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'BizDev-System-Intelligence',
    };

    // Fetch key files for analysis
    const filesToFetch = [
      'package.json',
      'supabase/config.toml',
      'src/App.tsx',
      'README.md',
      'tailwind.config.ts',
      'tailwind.config.js',
      'vite.config.ts',
    ];

    const fetchedFiles: FileContent[] = [];

    for (const filePath of filesToFetch) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            const content = atob(data.content);
            fetchedFiles.push({
              path: filePath,
              content: content,
              size: data.size,
            });
          }
        }
      } catch (e: any) {
        console.log(`Could not fetch ${filePath}:`, e?.message);
      }
    }

    // Fetch directory structure for src/
    let srcStructure: string[] = [];
    try {
      const srcResponse = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/src?ref=${branch}`,
        { headers }
      );

      if (srcResponse.ok) {
        const srcContents = await srcResponse.json();
        srcStructure = srcContents.map((item: any) => 
          `${item.type === 'dir' ? '📁' : '📄'} ${item.path}`
        );
      }
    } catch (e: any) {
      console.log('Could not fetch src structure:', e?.message);
    }

    // Fetch Supabase migrations if available
    let migrations: string[] = [];
    try {
      const migrationsResponse = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/supabase/migrations?ref=${branch}`,
        { headers }
      );

      if (migrationsResponse.ok) {
        const migrationsContents = await migrationsResponse.json();
        migrations = migrationsContents.map((item: any) => item.name);
      }
    } catch (e: any) {
      console.log('Could not fetch migrations:', e?.message);
    }

    // Fetch edge functions if available
    let edgeFunctions: string[] = [];
    try {
      const functionsResponse = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/supabase/functions?ref=${branch}`,
        { headers }
      );

      if (functionsResponse.ok) {
        const functionsContents = await functionsResponse.json();
        edgeFunctions = functionsContents
          .filter((item: any) => item.type === 'dir')
          .map((item: any) => item.name);
      }
    } catch (e: any) {
      console.log('Could not fetch edge functions:', e?.message);
    }

    // Parse package.json for dependencies
    let dependencies: Record<string, string> = {};
    let devDependencies: Record<string, string> = {};
    const packageJsonFile = fetchedFiles.find(f => f.path === 'package.json');
    
    if (packageJsonFile) {
      try {
        const pkg = JSON.parse(packageJsonFile.content);
        dependencies = pkg.dependencies || {};
        devDependencies = pkg.devDependencies || {};
      } catch (e) {
        console.log('Could not parse package.json');
      }
    }

    // Build analysis context
    const analysisContext = {
      repository: repoFullName,
      branch,
      files: fetchedFiles.map(f => ({ path: f.path, size: f.size })),
      srcStructure,
      migrations,
      edgeFunctions,
      dependencies: Object.keys(dependencies),
      devDependencies: Object.keys(devDependencies),
      hasSupabase: fetchedFiles.some(f => f.path.includes('supabase')),
      hasTailwind: dependencies['tailwindcss'] || devDependencies['tailwindcss'],
      hasReact: dependencies['react'],
      hasTypeScript: devDependencies['typescript'],
    };

    // AI Analysis
    let aiAnalysis = null;
    
    if (lovableApiKey) {
      const prompt = `Analyze this codebase and provide recommendations for integrating it into a business ecosystem platform.

Repository: ${repoFullName}
Branch: ${branch}

Files found:
${fetchedFiles.map(f => `- ${f.path} (${f.size} bytes)`).join('\n')}

Source structure:
${srcStructure.join('\n')}

Database migrations: ${migrations.length > 0 ? migrations.join(', ') : 'None found'}
Edge functions: ${edgeFunctions.length > 0 ? edgeFunctions.join(', ') : 'None found'}

Dependencies:
${Object.entries(dependencies).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Package.json content:
${packageJsonFile?.content || 'Not found'}

README.md:
${fetchedFiles.find(f => f.path === 'README.md')?.content?.substring(0, 2000) || 'Not found'}

Analyze this project and provide:
1. Project purpose and main features
2. Tech stack summary
3. Database entities/tables (from migrations or inferred from code)
4. Integration opportunities with business modules (CRM, Billing, Workflows, etc.)
5. Potential optimizations for:
   - Money (revenue, cost savings)
   - Time (automation, efficiency)
   - Peace of mind (reliability, monitoring)
6. Specific recommendations for ecosystem integration

Provide your analysis as JSON with this structure:
{
  "purpose": "string",
  "features": ["string"],
  "techStack": { "frontend": [], "backend": [], "database": [], "other": [] },
  "entities": ["string"],
  "integrationOpportunities": [{ "module": "string", "opportunity": "string", "benefit": "string" }],
  "optimizations": {
    "money": [{ "suggestion": "string", "estimatedValue": "string" }],
    "time": [{ "suggestion": "string", "estimatedSavings": "string" }],
    "peace": [{ "suggestion": "string", "benefit": "string" }]
  },
  "recommendations": [{ "priority": "high|medium|low", "title": "string", "description": "string", "effort": "string" }],
  "overallScore": number // 0-100
}`;

      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are an expert software architect and business analyst. Analyze codebases and provide actionable integration recommendations. Always respond with valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              aiAnalysis = JSON.parse(jsonMatch[0]);
            } catch (e) {
              console.error('Failed to parse AI JSON response:', e);
            }
          }
        }
      } catch (e) {
        console.error('AI analysis failed:', e);
      }
    }

    // Fallback to rule-based analysis if AI fails
    if (!aiAnalysis) {
      aiAnalysis = generateRuleBasedAnalysis(analysisContext, fetchedFiles);
    }

    // Store analysis results if we have a project import
    if (projectImportId) {
      await supabase
        .from('platform_project_imports')
        .update({
          status: 'analyzed',
          analysis_data: {
            context: analysisContext,
            analysis: aiAnalysis,
            analyzedAt: new Date().toISOString(),
          },
          analysis_score: aiAnalysis.overallScore || 50,
        })
        .eq('id', projectImportId);

      // Create recommendations
      if (aiAnalysis.recommendations) {
        for (const rec of aiAnalysis.recommendations) {
          await supabase
            .from('platform_recommendations')
            .insert({
              project_import_id: projectImportId,
              recommendation_type: 'integration',
              title: rec.title,
              description: rec.description,
              priority: rec.priority,
              estimated_value: rec.estimatedValue || null,
              implementation_effort: rec.effort || 'medium',
              status: 'pending',
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        context: analysisContext,
        analysis: aiAnalysis,
        filesAnalyzed: fetchedFiles.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('GitHub analyze error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateRuleBasedAnalysis(context: any, files: FileContent[]) {
  const features: string[] = [];
  const integrations: any[] = [];
  const recommendations: any[] = [];
  
  // Detect features based on dependencies
  if (context.dependencies.includes('@supabase/supabase-js')) {
    features.push('Supabase Database Integration');
    features.push('Authentication');
    integrations.push({
      module: 'Database',
      opportunity: 'Unified data layer with Biz Dev Ecosystem',
      benefit: 'Single source of truth for all business data',
    });
  }

  if (context.dependencies.includes('react-router-dom')) {
    features.push('Multi-page Application');
  }

  if (context.dependencies.includes('@tanstack/react-query')) {
    features.push('Data Fetching & Caching');
  }

  if (context.dependencies.includes('stripe') || context.dependencies.includes('@stripe/stripe-js')) {
    features.push('Payment Processing');
    integrations.push({
      module: 'Billing',
      opportunity: 'Unified billing dashboard',
      benefit: 'Consolidated revenue tracking across projects',
    });
  }

  if (context.edgeFunctions.length > 0) {
    features.push(`${context.edgeFunctions.length} Edge Functions`);
    integrations.push({
      module: 'Workflows',
      opportunity: 'Integrate edge functions into workflow automation',
      benefit: 'Automated cross-project workflows',
    });
  }

  if (context.migrations.length > 0) {
    features.push(`${context.migrations.length} Database Migrations`);
  }

  // Generate recommendations
  recommendations.push({
    priority: 'high',
    title: 'Connect to Unified CRM',
    description: 'Import contacts and customer data into the Biz Dev CRM for unified relationship management',
    effort: 'low',
  });

  if (!context.dependencies.includes('@supabase/supabase-js')) {
    recommendations.push({
      priority: 'medium',
      title: 'Add Supabase Integration',
      description: 'Connect to Supabase for real-time data sync with the ecosystem',
      effort: 'medium',
    });
  }

  recommendations.push({
    priority: 'medium',
    title: 'Enable Cross-Project Analytics',
    description: 'Share analytics data with the ecosystem dashboard for holistic business insights',
    effort: 'low',
  });

  return {
    purpose: 'Lovable-built web application',
    features,
    techStack: {
      frontend: ['React', context.hasTypeScript ? 'TypeScript' : 'JavaScript', context.hasTailwind ? 'Tailwind CSS' : null].filter(Boolean),
      backend: context.hasSupabase ? ['Supabase', 'Edge Functions'] : [],
      database: context.hasSupabase ? ['PostgreSQL'] : [],
      other: context.dependencies.filter((d: string) => !['react', 'react-dom', 'typescript', 'tailwindcss'].includes(d)),
    },
    entities: context.migrations.map((m: string) => m.replace(/^\d+_/, '').replace('.sql', '')),
    integrationOpportunities: integrations,
    optimizations: {
      money: [
        { suggestion: 'Unified billing dashboard', estimatedValue: '$500/month visibility' },
        { suggestion: 'Cross-project upselling', estimatedValue: '+15% revenue' },
      ],
      time: [
        { suggestion: 'Automated data sync', estimatedSavings: '5 hours/week' },
        { suggestion: 'Unified authentication', estimatedSavings: '2 hours/week' },
      ],
      peace: [
        { suggestion: 'Centralized monitoring', benefit: 'Single dashboard for all projects' },
        { suggestion: 'Unified backup strategy', benefit: 'Disaster recovery across ecosystem' },
      ],
    },
    recommendations,
    overallScore: 65,
  };
}
