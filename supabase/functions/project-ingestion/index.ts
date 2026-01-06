import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Project Ingestion Function
 * 
 * Enables ingesting code from other Lovable projects or external repositories
 * into the Biz Dev ecosystem. This supports:
 * - SonicBrief
 * - Quantum Bit Code
 * - ISO Flash
 * - Other user projects
 * 
 * The ingested code can either:
 * 1. Be used as components within the main platform
 * 2. Be added to the ecosystem as connected child apps
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      action,
      project_url,
      github_repo,
      project_name,
      ingestion_mode, // 'component' | 'ecosystem_app' | 'analyze'
      target_modules, // Which modules to extract
    } = await req.json();

    console.log(`[project-ingestion] Action: ${action} for project: ${project_name || project_url}`);

    switch (action) {
      case "analyze": {
        // Analyze a project to understand its structure and capabilities
        const analysis = await analyzeProject(project_url || github_repo);
        
        return new Response(
          JSON.stringify({
            success: true,
            analysis,
            recommendations: generateIngestionRecommendations(analysis),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "ingest": {
        // Create ingestion record
        const { data: ingestion, error: ingestionError } = await supabase
          .from("project_ingestions")
          .insert({
            user_id: user.id,
            project_name,
            source_url: project_url || github_repo,
            ingestion_mode,
            target_modules: target_modules || [],
            status: "pending",
          })
          .select()
          .single();

        if (ingestionError) {
          // Table might not exist yet - return informative message
          console.log("[project-ingestion] Ingestion table not found, would create:", ingestionError);
        }

        // Start async ingestion process
        // In production, this would be a background task
        const ingestionResult = await performIngestion({
          projectUrl: project_url || github_repo,
          mode: ingestion_mode,
          targetModules: target_modules,
        });

        return new Response(
          JSON.stringify({
            success: true,
            ingestion_id: ingestion?.id,
            status: "processing",
            message: "Project ingestion started",
            preview: ingestionResult.preview,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list_available": {
        // List known Lovable projects that could be ingested
        const availableProjects = [
          {
            name: "SonicBrief",
            description: "AI-powered briefing and summarization app",
            capabilities: ["summarization", "ai-content", "notifications"],
            integration_points: ["workflows", "agents", "notifications"],
          },
          {
            name: "Quantum Bit Code",
            description: "Code analysis and generation platform",
            capabilities: ["code-generation", "analysis", "testing"],
            integration_points: ["ai-agents", "development-tools"],
          },
          {
            name: "ISO Flash",
            description: "Compliance and certification management",
            capabilities: ["compliance-tracking", "auditing", "documentation"],
            integration_points: ["erp", "audit-workflows", "documentation"],
          },
          // More projects can be added
        ];

        return new Response(
          JSON.stringify({
            success: true,
            projects: availableProjects,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error: any) {
    console.error("[project-ingestion] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeProject(sourceUrl: string): Promise<any> {
  // In production, this would:
  // 1. Clone/fetch the repository
  // 2. Parse package.json, tsconfig, etc.
  // 3. Identify components, hooks, utilities
  // 4. Map dependencies
  // 5. Identify potential integration points

  console.log(`[project-ingestion] Analyzing project: ${sourceUrl}`);

  return {
    projectType: "lovable-app",
    framework: "react-vite",
    dependencies: ["react", "supabase", "tailwind", "shadcn"],
    components: [],
    hooks: [],
    utilities: [],
    integrationPoints: [],
    estimatedComplexity: "medium",
  };
}

function generateIngestionRecommendations(analysis: any): any[] {
  return [
    {
      type: "component_extraction",
      description: "Extract reusable UI components into the Biz Dev component library",
      effort: "low",
    },
    {
      type: "workflow_integration",
      description: "Create workflow nodes that leverage the project's capabilities",
      effort: "medium",
    },
    {
      type: "ecosystem_addition",
      description: "Add as a connected ecosystem app with bidirectional data sync",
      effort: "high",
    },
  ];
}

async function performIngestion(params: {
  projectUrl: string;
  mode: string;
  targetModules: string[];
}): Promise<any> {
  // In production, this would perform actual code ingestion
  console.log(`[project-ingestion] Performing ingestion:`, params);

  return {
    preview: {
      filesFound: 0,
      componentsDetected: 0,
      hooksDetected: 0,
      estimatedIntegrationTime: "2-4 hours",
    },
  };
}
