import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Our system modules and their value propositions
const systemModules = {
  crm: {
    name: 'CRM & Contacts',
    benefits: ['more_money', 'help_others'],
    capabilities: ['contact_management', 'deal_tracking', 'relationship_mapping'],
  },
  workflows: {
    name: 'Workflow Automation',
    benefits: ['more_time', 'less_liability'],
    capabilities: ['process_automation', 'task_scheduling', 'approval_flows'],
  },
  analytics: {
    name: 'Analytics & Insights',
    benefits: ['more_money', 'more_time'],
    capabilities: ['business_intelligence', 'predictive_analytics', 'reporting'],
  },
  ai_assistant: {
    name: 'AI Assistant',
    benefits: ['more_time', 'help_others'],
    capabilities: ['natural_language', 'task_automation', 'recommendations'],
  },
  security: {
    name: 'Security & Governance',
    benefits: ['less_liability'],
    capabilities: ['access_control', 'audit_trails', 'compliance'],
  },
  erp: {
    name: 'ERP Generator',
    benefits: ['more_money', 'more_time', 'less_liability'],
    capabilities: ['financial_management', 'inventory', 'operations'],
  },
  marketing: {
    name: 'Marketing Automation',
    benefits: ['more_money', 'help_others'],
    capabilities: ['lead_generation', 'email_campaigns', 'social_media'],
  },
  calendar: {
    name: 'Smart Scheduler',
    benefits: ['more_time'],
    capabilities: ['scheduling', 'availability', 'meeting_coordination'],
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

    const { importId, connectionId, analysisType } = await req.json();

    // Get the project import details
    const { data: projectImport, error: importError } = await supabase
      .from('platform_project_imports')
      .select('*, user_platform_connections(*, external_platform_registry(*))')
      .eq('id', importId)
      .eq('user_id', user.id)
      .single();

    if (importError || !projectImport) {
      return new Response(JSON.stringify({ error: 'Project import not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update status to analyzing
    await supabase
      .from('platform_project_imports')
      .update({ import_status: 'analyzing' })
      .eq('id', importId);

    const platform = projectImport.user_platform_connections?.external_platform_registry;
    
    // Perform AI-powered analysis if available
    let analysisResults;
    if (lovableApiKey) {
      analysisResults = await performAIAnalysis(
        lovableApiKey,
        projectImport,
        platform
      );
    } else {
      analysisResults = generateRuleBasedAnalysis(projectImport, platform);
    }

    // Calculate analysis score
    const analysisScore = calculateAnalysisScore(analysisResults);

    // Update the project import with analysis results
    await supabase
      .from('platform_project_imports')
      .update({
        import_status: 'analyzed',
        analysis_score: analysisScore,
        analysis_data: analysisResults.analysisData,
        identified_gaps: analysisResults.gaps,
        optimization_opportunities: analysisResults.opportunities,
        revenue_potential_estimate: analysisResults.revenuePotential,
        time_savings_estimate: analysisResults.timeSavings,
        risk_reduction_areas: analysisResults.riskAreas,
        collaboration_improvements: analysisResults.collaborationImprovements,
        recommended_modules: analysisResults.recommendedModules,
        last_analyzed_at: new Date().toISOString(),
      })
      .eq('id', importId);

    // Create gap analysis records
    for (const gap of analysisResults.gaps) {
      await supabase
        .from('platform_gap_analysis')
        .insert({
          import_id: importId,
          connection_id: connectionId,
          user_id: user.id,
          gap_category: gap.category,
          gap_type: gap.type,
          gap_severity: gap.severity,
          gap_title: gap.title,
          gap_description: gap.description,
          impacts_revenue: gap.impacts.revenue,
          revenue_impact_estimate: gap.impacts.revenueEstimate,
          impacts_time: gap.impacts.time,
          time_impact_estimate: gap.impacts.timeEstimate,
          impacts_liability: gap.impacts.liability,
          liability_impact_description: gap.impacts.liabilityDescription,
          impacts_collaboration: gap.impacts.collaboration,
          collaboration_impact_description: gap.impacts.collaborationDescription,
          recommended_solution: gap.solution,
          solution_module_slug: gap.moduleSlug,
          solution_complexity: gap.complexity,
          implementation_time_estimate: gap.implementationTime,
        });
    }

    // Create recommendations
    for (const rec of analysisResults.recommendations) {
      await supabase
        .from('platform_recommendations')
        .insert({
          user_id: user.id,
          connection_id: connectionId,
          import_id: importId,
          recommendation_type: rec.type,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          detailed_action_plan: rec.actionPlan,
          primary_benefit: rec.primaryBenefit,
          estimated_value: rec.estimatedValue,
          effort_level: rec.effort,
          roi_score: rec.roiScore,
          related_module_slug: rec.moduleSlug,
          module_features_used: rec.features,
          generated_by: lovableApiKey ? 'ai' : 'rule_engine',
          confidence_score: rec.confidence,
        });
    }

    return new Response(JSON.stringify({
      success: true,
      importId,
      analysisScore,
      gapsFound: analysisResults.gaps.length,
      recommendationsGenerated: analysisResults.recommendations.length,
      summary: {
        revenuePotential: analysisResults.revenuePotential,
        timeSavings: analysisResults.timeSavings,
        topRecommendation: analysisResults.recommendations[0]?.title || 'No recommendations',
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Platform analyze error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performAIAnalysis(apiKey: string, projectImport: any, platform: any) {
  const prompt = `Analyze this digital product/project and provide optimization recommendations.

Platform: ${platform?.platform_name || 'Unknown'}
Category: ${platform?.platform_category || 'Unknown'}
Project: ${projectImport.external_project_name}

Platform's common gaps: ${platform?.common_gaps?.join(', ') || 'None identified'}
Platform's recommended modules: ${platform?.recommended_modules?.join(', ') || 'None'}

Our available optimization modules:
${Object.entries(systemModules).map(([slug, mod]: [string, any]) => 
  `- ${slug}: ${mod.name} - Benefits: ${mod.benefits.join(', ')}`
).join('\n')}

Based on this analysis, provide:
1. Identified gaps (security, automation, analytics, etc.)
2. Optimization opportunities with potential value
3. Revenue potential estimate (Low/Medium/High/Very High)
4. Time savings estimate (e.g., "5-10 hours/week")
5. Risk reduction areas
6. Recommended modules from our system
7. Specific actionable recommendations

Focus on our core value propositions:
- More Money: Revenue opportunities, cost savings
- More Time: Automation, efficiency gains
- Less Liability: Security, compliance, risk reduction
- Help Others: Collaboration, customer experience

Return as JSON with this structure:
{
  "gaps": [{"category", "type", "severity", "title", "description", "impacts", "solution", "moduleSlug", "complexity", "implementationTime"}],
  "opportunities": [{"type", "description", "potentialValue", "effort"}],
  "revenuePotential": "string",
  "timeSavings": "string",
  "riskAreas": ["string"],
  "collaborationImprovements": ["string"],
  "recommendedModules": [{"moduleSlug", "reason", "priority"}],
  "recommendations": [{"type", "priority", "title", "description", "actionPlan", "primaryBenefit", "estimatedValue", "effort", "roiScore", "moduleSlug", "features", "confidence"}]
}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert business optimization consultant. Analyze projects and provide actionable recommendations that help people make more money, save time, reduce liability, and help others.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return generateRuleBasedAnalysis(projectImport, platform);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        analysisData: { aiGenerated: true, model: 'gemini-2.5-flash' },
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error);
  }

  return generateRuleBasedAnalysis(projectImport, platform);
}

function generateRuleBasedAnalysis(projectImport: any, platform: any) {
  const gaps = [];
  const recommendations = [];
  const commonGaps = platform?.common_gaps || [];
  const recommendedModules = platform?.recommended_modules || [];

  // Generate gaps based on platform's known issues
  if (commonGaps.includes('ai_automation') || commonGaps.includes('ai_features')) {
    gaps.push({
      category: 'automation',
      type: 'missing_ai',
      severity: 'high',
      title: 'No AI-Powered Automation',
      description: 'Platform lacks integrated AI capabilities for task automation and intelligent suggestions.',
      impacts: {
        revenue: true,
        revenueEstimate: '$500-2000/month in labor savings',
        time: true,
        timeEstimate: '10-20 hours/week',
        liability: false,
        liabilityDescription: null,
        collaboration: true,
        collaborationDescription: 'Faster response times to clients',
      },
      solution: 'Integrate our AI Assistant module for intelligent automation',
      moduleSlug: 'ai_assistant',
      complexity: 'medium',
      implementationTime: '1-2 weeks',
    });
  }

  if (commonGaps.includes('security') || commonGaps.includes('advanced_security')) {
    gaps.push({
      category: 'security',
      type: 'insufficient_security',
      severity: 'critical',
      title: 'Security & Governance Gaps',
      description: 'Current setup may have security vulnerabilities and lacks comprehensive governance.',
      impacts: {
        revenue: false,
        revenueEstimate: null,
        time: false,
        timeEstimate: null,
        liability: true,
        liabilityDescription: 'Potential data breaches, compliance issues',
        collaboration: false,
        collaborationDescription: null,
      },
      solution: 'Implement our Security & Governance module',
      moduleSlug: 'security',
      complexity: 'complex',
      implementationTime: '2-4 weeks',
    });
  }

  if (commonGaps.includes('analytics') || commonGaps.includes('advanced_analytics')) {
    gaps.push({
      category: 'analytics',
      type: 'limited_insights',
      severity: 'medium',
      title: 'Limited Analytics & Insights',
      description: 'Insufficient visibility into business performance and user behavior.',
      impacts: {
        revenue: true,
        revenueEstimate: '$1000-5000/month in missed opportunities',
        time: true,
        timeEstimate: '5-10 hours/week in manual reporting',
        liability: false,
        liabilityDescription: null,
        collaboration: false,
        collaborationDescription: null,
      },
      solution: 'Deploy our Analytics & Insights module',
      moduleSlug: 'analytics',
      complexity: 'simple',
      implementationTime: '3-5 days',
    });
  }

  // Generate recommendations based on gaps and modules
  for (const moduleSlug of recommendedModules.slice(0, 3)) {
    const module = systemModules[moduleSlug as keyof typeof systemModules];
    if (module) {
      recommendations.push({
        type: 'feature_adoption',
        priority: 'high',
        title: `Enable ${module.name}`,
        description: `Activate ${module.name} to unlock ${module.capabilities.join(', ')}.`,
        actionPlan: [
          { step: 1, action: 'Review current workflow', duration: '1 day' },
          { step: 2, action: `Configure ${module.name} settings`, duration: '2-3 days' },
          { step: 3, action: 'Train team on new features', duration: '1 day' },
          { step: 4, action: 'Monitor and optimize', duration: 'Ongoing' },
        ],
        primaryBenefit: module.benefits[0],
        estimatedValue: module.benefits.includes('more_money') ? '$1000-5000/month' : '10+ hours/week saved',
        effort: 'low',
        roiScore: 85,
        moduleSlug,
        features: module.capabilities,
        confidence: 0.85,
      });
    }
  }

  return {
    gaps,
    opportunities: gaps.map(g => ({
      type: g.category,
      description: g.description,
      potentialValue: g.impacts.revenueEstimate || g.impacts.timeEstimate || 'Significant improvement',
      effort: g.complexity,
    })),
    revenuePotential: gaps.some(g => g.severity === 'high') ? 'High' : 'Medium',
    timeSavings: '15-30 hours/week',
    riskAreas: gaps.filter(g => g.impacts.liability).map(g => g.title),
    collaborationImprovements: gaps.filter(g => g.impacts.collaboration).map(g => g.impacts.collaborationDescription),
    recommendedModules: recommendedModules.slice(0, 5).map((slug: string, idx: number) => ({
      moduleSlug: slug,
      reason: `Addresses common ${platform?.platform_name || 'platform'} gaps`,
      priority: idx < 2 ? 'high' : 'medium',
    })),
    recommendations,
    analysisData: { aiGenerated: false, ruleEngine: true },
  };
}

function calculateAnalysisScore(analysis: any): number {
  let score = 50; // Base score

  // Deduct for gaps
  for (const gap of analysis.gaps || []) {
    if (gap.severity === 'critical') score -= 15;
    else if (gap.severity === 'high') score -= 10;
    else if (gap.severity === 'medium') score -= 5;
    else score -= 2;
  }

  // Add for each addressable opportunity
  score += (analysis.opportunities?.length || 0) * 3;

  // Add for having recommendations
  score += Math.min((analysis.recommendations?.length || 0) * 5, 20);

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}