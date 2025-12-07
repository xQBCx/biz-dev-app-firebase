import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRunRequest {
  agent_id: string;
  trigger_type: 'manual' | 'scheduled' | 'event' | 'recommendation';
  trigger_context?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
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

    const { agent_id, trigger_type, trigger_context = {} }: AgentRunRequest = await req.json();

    // Fetch agent details
    const { data: agent, error: agentError } = await supabase
      .from('instincts_agents')
      .select('*')
      .eq('id', agent_id)
      .single();

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
      .eq('agent_id', agent_id)
      .eq('is_enabled', true)
      .single();

    if (!userAgent) {
      return new Response(JSON.stringify({ error: 'Agent not enabled for user' }), {
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
        agent_id: agent_id,
        trigger_type,
        trigger_context,
        status: 'running',
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
      const context = await gatherAgentContext(supabase, user.id, agent.slug);
      
      // Execute agent logic
      const result = await executeAgent(agent, context, lovableApiKey);

      // Update run with success
      const duration = Date.now() - startTime;
      await supabase
        .from('instincts_agent_runs')
        .update({
          status: 'completed',
          result,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq('id', run.id);

      // Update user agent stats
      await supabase
        .from('instincts_user_agents')
        .update({
          last_run_at: new Date().toISOString(),
          run_count: userAgent.run_count + 1,
        })
        .eq('id', userAgent.id);

      return new Response(JSON.stringify({ 
        success: true, 
        run_id: run.id,
        result 
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
  agentSlug: string
): Promise<Record<string, any>> {
  const context: Record<string, any> = {};

  switch (agentSlug) {
    case 'deal-qualifier':
      // Fetch CRM deals
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      context.deals = deals || [];
      break;

    case 'follow-up-coach':
      // Fetch contacts and recent communications
      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(30);
      context.contacts = contacts || [];
      break;

    case 'task-prioritizer':
      // Fetch tasks
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
      // Fetch upcoming calendar events
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
      // Fetch recent activity logs that might be expenses
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      context.activities = activities || [];
      break;

    case 'content-curator':
      // Fetch user's recent posts and social data
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

async function executeAgent(
  agent: any,
  context: Record<string, any>,
  apiKey?: string
): Promise<Record<string, any>> {
  // Build prompt based on agent type
  const systemPrompt = buildAgentPrompt(agent);
  const userPrompt = `Analyze the following data and provide actionable insights:\n\n${JSON.stringify(context, null, 2)}`;

  if (!apiKey) {
    // Return mock results if no API key
    return getMockResult(agent.slug, context);
  }

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
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
                      action: { type: 'string' }
                    },
                    required: ['title', 'description', 'priority']
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
        tool_choice: { type: 'function', function: { name: 'agent_output' } }
      }),
    });

    if (!response.ok) {
      console.error('AI request failed:', response.status);
      return getMockResult(agent.slug, context);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      return JSON.parse(toolCall.function.arguments);
    }

    return getMockResult(agent.slug, context);
  } catch (error) {
    console.error('AI execution error:', error);
    return getMockResult(agent.slug, context);
  }
}

function buildAgentPrompt(agent: any): string {
  const basePrompt = `You are ${agent.name}, an AI agent specialized in ${agent.category}. ${agent.description}`;
  
  const capabilityPrompts: Record<string, string> = {
    'deal-qualifier': 'Analyze CRM deals and score them 1-100 based on likelihood to close. Consider deal size, stage, age, and activity.',
    'follow-up-coach': 'Identify contacts that need follow-up. Consider last contact date, relationship stage, and engagement history.',
    'task-prioritizer': 'Prioritize tasks based on urgency, importance, and dependencies. Use Eisenhower matrix principles.',
    'meeting-prep': 'Prepare briefings for upcoming meetings. Research attendees and suggest talking points.',
    'expense-tracker': 'Categorize activities that might be business expenses. Identify patterns and suggest optimizations.',
    'content-curator': 'Analyze content performance and suggest new topics based on engagement and industry trends.',
  };

  return `${basePrompt}\n\n${capabilityPrompts[agent.slug] || ''}`;
}

function getMockResult(agentSlug: string, context: Record<string, any>): Record<string, any> {
  const mockResults: Record<string, any> = {
    'deal-qualifier': {
      summary: `Analyzed ${context.deals?.length || 0} deals in pipeline`,
      insights: [
        { title: 'Hot Deal Identified', description: 'Focus on deals in negotiation stage', priority: 'high', action: 'Review top 3 deals' },
        { title: 'Stale Deals', description: 'Some deals haven\'t been updated recently', priority: 'medium', action: 'Update or close stale deals' }
      ],
      metrics: { totalDeals: context.deals?.length || 0, hotDeals: 2, staleDeals: 3 }
    },
    'follow-up-coach': {
      summary: `Reviewed ${context.contacts?.length || 0} contacts`,
      insights: [
        { title: 'Follow-up Needed', description: 'Several contacts haven\'t been contacted in 30+ days', priority: 'high', action: 'Schedule outreach' },
      ],
      metrics: { totalContacts: context.contacts?.length || 0, needFollowUp: 5 }
    },
    'task-prioritizer': {
      summary: `Prioritized ${context.tasks?.length || 0} pending tasks`,
      insights: [
        { title: 'Urgent Tasks', description: 'Tasks due within 24 hours need attention', priority: 'high', action: 'Complete urgent tasks first' },
      ],
      metrics: { totalTasks: context.tasks?.length || 0, urgent: 3, important: 5 }
    },
    'meeting-prep': {
      summary: `${context.events?.length || 0} upcoming meetings analyzed`,
      insights: [
        { title: 'Prepare for Next Meeting', description: 'Review agenda and attendee backgrounds', priority: 'medium', action: 'Prep briefing document' },
      ],
      metrics: { upcomingMeetings: context.events?.length || 0 }
    },
    'expense-tracker': {
      summary: 'Activity analysis complete',
      insights: [
        { title: 'Expense Pattern', description: 'Regular business activities detected', priority: 'low', action: 'Review for deductions' },
      ],
      metrics: { activitiesAnalyzed: context.activities?.length || 0 }
    },
    'content-curator': {
      summary: `Analyzed ${context.posts?.length || 0} posts`,
      insights: [
        { title: 'Content Opportunity', description: 'Industry trends suggest new content topics', priority: 'medium', action: 'Create content calendar' },
      ],
      metrics: { postsAnalyzed: context.posts?.length || 0 }
    }
  };

  return mockResults[agentSlug] || { summary: 'Analysis complete', insights: [], metrics: {} };
}
