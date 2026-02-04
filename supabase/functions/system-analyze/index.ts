import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Biz Dev feature mapping
const bizDevFeatures = {
  crm: {
    name: 'CRM Management',
    description: 'Full contact, company, and deal management with AI-powered insights',
    capabilities: ['contacts', 'companies', 'deals', 'pipelines', 'activities'],
  },
  marketing: {
    name: 'Marketing Automation',
    description: 'Lead discovery, email campaigns, and outreach sequences',
    capabilities: ['lead_discovery', 'email_campaigns', 'sequences', 'templates'],
  },
  workflows: {
    name: 'Workflow Builder',
    description: 'Visual workflow automation with AI-generated workflows',
    capabilities: ['automation', 'triggers', 'actions', 'integrations'],
  },
  erp: {
    name: 'ERP Generator',
    description: 'AI-generated ERP systems with custom modules',
    capabilities: ['invoicing', 'inventory', 'reporting', 'custom_modules'],
  },
  analytics: {
    name: 'Analytics Dashboard',
    description: 'Comprehensive activity tracking and business intelligence',
    capabilities: ['activity_tracking', 'reports', 'insights', 'forecasting'],
  },
  email: {
    name: 'Unified Inbox',
    description: 'Multi-account email management with AI drafting',
    capabilities: ['email', 'templates', 'scheduling', 'ai_drafting'],
  },
  calendar: {
    name: 'Smart Scheduler',
    description: 'AI-powered scheduling with preference learning',
    capabilities: ['calendar', 'meetings', 'availability', 'preferences'],
  },
  storage: {
    name: 'Document Management',
    description: 'Centralized document storage with AI organization',
    capabilities: ['files', 'folders', 'sharing', 'ai_organization'],
  },
  ai_assistant: {
    name: 'AI Assistant',
    description: 'Context-aware AI assistant across all modules',
    capabilities: ['chat', 'task_suggestions', 'content_generation', 'analysis'],
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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

    const { sessionId } = await req.json();

    // Get the discovery session
    const { data: session, error: sessionError } = await supabase
      .from('system_discovery_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing discovery session: ${sessionId}`);

    const discoveredData = session.discovered_data;
    let recommendations: any[] = [];
    let migrationRoadmap: any = {};

    // Use AI to generate recommendations if API key is available
    if (lovableApiKey) {
      try {
        const analysisPrompt = `Analyze this discovered system data and recommend which Biz Dev features would benefit this business:

Discovered Data:
${JSON.stringify(discoveredData, null, 2)}

Available Biz Dev Features:
${JSON.stringify(bizDevFeatures, null, 2)}

Provide recommendations in this JSON format:
{
  "recommendations": [
    {
      "category": "feature_name",
      "current_tool": "tool they currently use",
      "biz_dev_feature": "our feature name",
      "benefit": "why they should switch",
      "migration_effort": "low|medium|high",
      "data_to_migrate": ["list", "of", "data"],
      "estimated_time": "time estimate"
    }
  ],
  "ecosystem_opportunities": [
    {
      "insight": "what we noticed",
      "recommendation": "what we suggest"
    }
  ],
  "priority_order": ["feature1", "feature2"]
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
              { role: 'system', content: 'You are a business system integration expert. Analyze the discovered data and provide actionable recommendations. Return ONLY valid JSON.' },
              { role: 'user', content: analysisPrompt },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          const content = aiResult.choices?.[0]?.message?.content || '';
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              recommendations = parsed.recommendations || [];
              migrationRoadmap = {
                ecosystem_opportunities: parsed.ecosystem_opportunities || [],
                priority_order: parsed.priority_order || [],
              };
            }
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
          }
        }
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
      }
    }

    // Fall back to rule-based recommendations if AI didn't work
    if (recommendations.length === 0) {
      recommendations = generateRuleBasedRecommendations(discoveredData);
    }

    // Update the session with analysis results
    await supabase
      .from('system_discovery_sessions')
      .update({
        analysis_result: { analyzed_at: new Date().toISOString() },
        recommendations,
        migration_roadmap: migrationRoadmap,
      })
      .eq('id', sessionId);

    return new Response(JSON.stringify({
      success: true,
      recommendations,
      migrationRoadmap,
      message: 'Analysis completed successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('System analyze error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateRuleBasedRecommendations(discoveredData: any): any[] {
  const recommendations: any[] = [];
  const capabilities = discoveredData.capabilities || [];
  const appsInUse = discoveredData.apps_in_use || [];
  const dataVolumes = discoveredData.data_volumes || {};

  // CRM recommendation
  if (capabilities.includes('crm') || dataVolumes.contacts > 100) {
    recommendations.push({
      category: 'crm',
      current_tool: appsInUse.find((a: string) => ['Salesforce', 'HubSpot', 'Dynamics'].some(c => a.includes(c))) || 'Unknown CRM',
      biz_dev_feature: 'CRM Management',
      benefit: 'Unified ecosystem integration with AI-powered deal scoring and cross-referral opportunities',
      migration_effort: dataVolumes.contacts > 5000 ? 'high' : dataVolumes.contacts > 1000 ? 'medium' : 'low',
      data_to_migrate: ['contacts', 'companies', 'deals', 'activities'],
      estimated_time: dataVolumes.contacts > 5000 ? '2-4 hours' : '30-60 minutes',
    });
  }

  // Email recommendation
  if (capabilities.includes('email') || dataVolumes.emails > 1000) {
    recommendations.push({
      category: 'email',
      current_tool: appsInUse.find((a: string) => ['Outlook', 'Gmail'].some(c => a.includes(c))) || 'Email Client',
      biz_dev_feature: 'Unified Inbox',
      benefit: 'AI-powered email drafting, CRM integration, and smart scheduling',
      migration_effort: 'low',
      data_to_migrate: ['email_templates', 'signatures'],
      estimated_time: '15-30 minutes',
    });
  }

  // Calendar recommendation
  if (capabilities.includes('calendar') || dataVolumes.events > 50) {
    recommendations.push({
      category: 'calendar',
      current_tool: appsInUse.find((a: string) => ['Calendar', 'Outlook'].some(c => a.includes(c))) || 'Calendar App',
      biz_dev_feature: 'Smart Scheduler',
      benefit: 'AI learns your preferences and optimizes meeting scheduling',
      migration_effort: 'low',
      data_to_migrate: ['calendar_sync'],
      estimated_time: '10 minutes',
    });
  }

  // Workflow recommendation
  if (discoveredData.workflows?.length > 0 || capabilities.includes('automation')) {
    recommendations.push({
      category: 'workflows',
      current_tool: discoveredData.integrations_found?.includes('Power Automate') ? 'Power Automate' : 
                    discoveredData.integrations_found?.includes('Zapier') ? 'Zapier' : 'Current Automation',
      biz_dev_feature: 'Workflow Builder',
      benefit: 'AI-generated workflows with deep ecosystem integration',
      migration_effort: 'medium',
      data_to_migrate: ['workflow_templates'],
      estimated_time: '1-2 hours',
    });
  }

  return recommendations;
}
