/**
 * Enhanced Agent Runner
 * 
 * Integrates with:
 * - Physics Rail: Validates actions before execution
 * - Model Gateway: Routes to optimal AI provider (Perplexity → Gemini fallback)
 * - Contribution Events: Tracks credits for agent work
 * - Cost Tracking: Monitors and enforces spending limits
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  validatePhysicsRail, 
  recordAgentCost, 
  logContributionEvent,
  type ActionType 
} from "../_shared/physics-rail.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRunRequest {
  agent_id?: string;
  agent_slug?: string;
  trigger_type: 'manual' | 'scheduled' | 'event' | 'recommendation' | 'workflow';
  trigger_context?: Record<string, any>;
  workspace_id?: string;
}

interface AgentConfig {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  capabilities: Record<string, any>;
  system_prompt: string;
  tools_config: any[];
  impact_level: string;
  model_preference: string;
  fallback_model: string;
  max_tokens_per_run: number;
  cost_ceiling_usd: number;
  required_approval_for: string[];
  guardrails: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      agent_id, 
      agent_slug, 
      trigger_type, 
      trigger_context = {},
      workspace_id 
    }: AgentRunRequest = await req.json();

    // Fetch agent details (by ID or slug)
    let agentQuery = supabase
      .from('instincts_agents')
      .select('*');
    
    if (agent_id) {
      agentQuery = agentQuery.eq('id', agent_id);
    } else if (agent_slug) {
      agentQuery = agentQuery.eq('slug', agent_slug);
    } else {
      return new Response(JSON.stringify({ error: 'agent_id or agent_slug required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: agent, error: agentError } = await agentQuery.single();

    if (agentError || !agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user has this agent enabled
    const { data: userAgent } = await supabase
      .from('instincts_user_agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('agent_id', agent.id)
      .eq('is_enabled', true)
      .single();

    if (!userAgent) {
      return new Response(JSON.stringify({ error: 'Agent not enabled for user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Physics Rail: Validate agent execution is allowed
    const validationResult = await validatePhysicsRail(supabase, {
      userId: user.id,
      agentId: agent.id,
      agentSlug: agent.slug,
      workspaceId: workspace_id,
      action: 'execute_agent',
      payload: { trigger_type, trigger_context },
      estimatedCostUsd: agent.cost_ceiling_usd || 0.50,
    });

    if (!validationResult.approved) {
      if (validationResult.requiresApproval) {
        return new Response(JSON.stringify({ 
          error: 'Approval required',
          approval_id: validationResult.approvalId,
          reason: validationResult.reason,
        }), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: validationResult.reason || 'Agent execution blocked by Physics Rail' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create run record
    const startTime = Date.now();
    const { data: run, error: runError } = await supabase
      .from('instincts_agent_runs')
      .insert({
        user_id: user.id,
        agent_id: agent.id,
        trigger_type,
        trigger_context,
        status: 'running',
        model_used: agent.model_preference || 'perplexity',
      })
      .select()
      .single();

    if (runError) {
      console.error('Failed to create run:', runError);
      return new Response(JSON.stringify({ error: 'Failed to start agent' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Gather context for the agent
      const context = await gatherAgentContext(supabase, user.id, agent.slug, trigger_context);
      
      // Execute agent logic via Model Gateway
      const result = await executeAgentWithGateway(
        supabase,
        agent,
        context,
        {
          runId: run.id,
          userId: user.id,
          workspaceId: workspace_id,
        }
      );

      // Update run with success
      const duration = Date.now() - startTime;
      await supabase
        .from('instincts_agent_runs')
        .update({
          status: 'completed',
          result: result.output,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          tokens_used: result.tokensUsed,
          compute_credits_consumed: result.computeCredits,
          model_used: result.modelUsed,
        })
        .eq('id', run.id);

      // Update user agent stats
      await supabase
        .from('instincts_user_agents')
        .update({
          last_run_at: new Date().toISOString(),
          run_count: (userAgent.run_count || 0) + 1,
        })
        .eq('id', userAgent.id);

      // Log contribution event
      await logContributionEvent(supabase, {
        userId: user.id,
        agentId: agent.id,
        eventType: 'agent_run_completed',
        computeCredits: result.computeCredits,
        actionCredits: result.actionCredits,
        metadata: {
          agent_slug: agent.slug,
          trigger_type,
          duration_ms: duration,
          model_used: result.modelUsed,
        },
      });

      return new Response(JSON.stringify({ 
        success: true, 
        run_id: run.id,
        result: result.output,
        model_used: result.modelUsed,
        tokens_used: result.tokensUsed,
        warnings: validationResult.warnings,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (execError) {
      // Update run with failure
      const duration = Date.now() - startTime;
      await supabase
        .from('instincts_agent_runs')
        .update({
          status: 'failed',
          error_message: execError instanceof Error ? execError.message : 'Unknown error',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq('id', run.id);

      throw execError;
    }

  } catch (error) {
    console.error('Agent run error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function gatherAgentContext(
  supabase: any, 
  userId: string, 
  agentSlug: string,
  triggerContext: Record<string, any>
): Promise<Record<string, any>> {
  const context: Record<string, any> = { ...triggerContext };

  switch (agentSlug) {
    case 'deal-qualifier':
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      context.deals = deals || [];
      break;

    case 'follow-up-coach':
      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(30);
      context.contacts = contacts || [];
      break;

    case 'signal_scout':
      // Get companies and contacts for signal detection
      const { data: companies } = await supabase
        .from('crm_companies')
        .select('*')
        .eq('user_id', userId)
        .limit(50);
      context.companies = companies || [];
      break;

    case 'task-prioritizer':
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(50);
      context.tasks = tasks || [];
      break;

    case 'meeting-prep':
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);
      context.events = events || [];
      break;

    case 'expense-tracker':
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      context.activities = activities || [];
      break;

    case 'content-curator':
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      context.posts = posts || [];
      break;
  }

  // Always include user stats
  const { data: stats } = await supabase
    .from('instincts_user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  context.userStats = stats;

  return context;
}

async function executeAgentWithGateway(
  supabase: any,
  agent: AgentConfig,
  context: Record<string, any>,
  tracking: { runId: string; userId: string; workspaceId?: string }
): Promise<{
  output: Record<string, any>;
  tokensUsed: number;
  computeCredits: number;
  actionCredits: number;
  modelUsed: string;
}> {
  // Build system prompt
  const systemPrompt = buildAgentPrompt(agent);
  const userPrompt = `Analyze the following data and provide actionable insights:\n\n${JSON.stringify(context, null, 2)}`;

  // Determine task type based on agent category
  const taskTypeMap: Record<string, string> = {
    'sales': 'complex_reasoning',
    'operations': 'complex_reasoning',
    'finance': 'extraction',
    'marketing': 'content_generation',
    'research': 'prospect_intelligence',
    'legal': 'document_analysis',
  };
  
  const taskType = taskTypeMap[agent.category] || 'complex_reasoning';

  // Call Model Gateway
  const gatewayUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/model-gateway`;
  
  const response = await fetch(gatewayUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_type: taskType,
      preferred_provider: agent.model_preference || 'perplexity',
      fallback_providers: [agent.fallback_model || 'gemini'],
      prompt: userPrompt,
      system_prompt: systemPrompt,
      tools: [{
        type: 'function',
        function: {
          name: 'agent_output',
          description: 'Return structured agent analysis results',
          parameters: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: 'Brief summary of findings' },
              insights: { 
                type: 'array', 
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    action: { type: 'string' },
                    entity_type: { type: 'string' },
                    entity_id: { type: 'string' },
                  },
                  required: ['title', 'description', 'priority']
                }
              },
              proposed_actions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    action_type: { type: 'string' },
                    target_entity: { type: 'string' },
                    payload: { type: 'object' },
                  }
                }
              },
              metrics: {
                type: 'object',
                additionalProperties: { type: 'number' }
              }
            },
            required: ['summary', 'insights']
          }
        }
      }],
      max_tokens: agent.max_tokens_per_run || 4000,
      agent_id: agent.id,
      run_id: tracking.runId,
      workspace_id: tracking.workspaceId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[run-agent] Gateway error:', errorText);
    throw new Error(`Model Gateway error: ${response.status}`);
  }

  const gatewayResult = await response.json();
  
  // Parse tool call result
  let output: Record<string, any>;
  if (gatewayResult.tool_calls?.[0]?.function?.arguments) {
    try {
      output = JSON.parse(gatewayResult.tool_calls[0].function.arguments);
    } catch {
      output = { summary: gatewayResult.content, insights: [] };
    }
  } else {
    output = { summary: gatewayResult.content, insights: [] };
  }

  // Process proposed actions through Physics Rail
  if (output.proposed_actions?.length > 0) {
    const validatedActions = [];
    
    for (const action of output.proposed_actions) {
      const validation = await validatePhysicsRail(supabase, {
        userId: tracking.userId,
        agentId: agent.id,
        workspaceId: tracking.workspaceId,
        action: action.action_type as ActionType,
        payload: action.payload || {},
      });
      
      validatedActions.push({
        ...action,
        approved: validation.approved,
        requires_approval: validation.requiresApproval,
        approval_id: validation.approvalId,
        blocked_reason: validation.reason,
      });
    }
    
    output.proposed_actions = validatedActions;
  }

  // Calculate credits
  const tokensUsed = gatewayResult.usage?.total_tokens || 0;
  const computeCredits = Math.ceil(tokensUsed / 100); // 1 credit per 100 tokens
  const actionCredits = (output.proposed_actions?.filter((a: any) => a.approved)?.length || 0) * 5;

  // Record cost
  await recordAgentCost(supabase, {
    workspaceId: tracking.workspaceId,
    agentId: agent.id,
    runId: tracking.runId,
    costUsd: gatewayResult.cost_usd || 0,
    tokensUsed,
    modelUsed: gatewayResult.model,
    provider: gatewayResult.provider,
  });

  return {
    output,
    tokensUsed,
    computeCredits,
    actionCredits,
    modelUsed: gatewayResult.model,
  };
}

function buildAgentPrompt(agent: AgentConfig): string {
  const basePrompt = agent.system_prompt || 
    `You are ${agent.name}, an AI agent specialized in ${agent.category}. ${agent.description || ''}`;
  
  const capabilityPrompts: Record<string, string> = {
    'deal-qualifier': 'Analyze CRM deals and score them 1-100 based on likelihood to close. Consider deal size, stage, age, and activity. Identify hot deals and stale ones.',
    'follow-up-coach': 'Identify contacts that need follow-up. Consider last contact date, relationship stage, and engagement history. Suggest optimal follow-up timing and approach.',
    'signal_scout': 'Detect business signals from companies and contacts. Look for buying signals, job changes, funding announcements, and expansion indicators.',
    'task-prioritizer': 'Prioritize tasks based on urgency, importance, and dependencies. Use Eisenhower matrix principles. Suggest which to tackle first.',
    'meeting-prep': 'Prepare briefings for upcoming meetings. Research attendees and suggest talking points. Identify potential discussion topics and outcomes.',
    'expense-tracker': 'Categorize activities that might be business expenses. Identify patterns and suggest optimizations. Flag items for tax deductions.',
    'content-curator': 'Analyze content performance and suggest new topics based on engagement and industry trends. Recommend content calendar updates.',
  };

  return `${basePrompt}\n\n${capabilityPrompts[agent.slug] || ''}\n\nAlways provide actionable insights with clear priorities.`;
}
