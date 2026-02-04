/**
 * Unified Model Gateway
 * 
 * Routes AI requests to the optimal provider based on task type:
 * - Perplexity: Web search, real-time research, prospect intelligence (DEFAULT for research)
 * - Gemini Pro: Complex reasoning, tool calling, multi-step workflows
 * - Gemini Flash: General Q&A, summaries, fast responses
 * - Claude: (Scaffolded) Long-form generation, document analysis
 * - OpenAI: (Available) Alternative for specific use cases
 * 
 * Per user requirements:
 * - Perplexity = DEFAULT for company/prospect/market research
 * - Gemini = FALLBACK when Perplexity unavailable
 * - Claude = SCAFFOLDED but not implemented until API key provided
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkAgentLimits, recordBlockedRun } from "../_shared/limit-checker.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Task types that determine routing
export type TaskType = 
  // Research tasks → Perplexity first
  | 'web_research' 
  | 'prospect_intelligence' 
  | 'company_research'
  | 'market_research'
  | 'real_time_search'
  | 'competitor_analysis'
  | 'news_search'
  
  // Reasoning tasks → Gemini Pro
  | 'complex_reasoning' 
  | 'tool_calling' 
  | 'multi_step_workflow'
  | 'document_analysis'
  | 'code_generation'
  
  // Fast tasks → Gemini Flash
  | 'general_qa' 
  | 'summary' 
  | 'classification' 
  | 'extraction'
  | 'translation'
  
  // Content tasks → Gemini (or Claude when available)
  | 'content_generation'
  | 'email_drafting'
  | 'proposal_writing';

export type ModelProvider = 'perplexity' | 'gemini' | 'openai' | 'claude';
export type ModelTier = 'nano' | 'fast' | 'pro' | 'premium';

interface GatewayRequest {
  task_type: TaskType;
  preferred_provider?: ModelProvider;
  fallback_providers?: ModelProvider[];
  prompt: string;
  system_prompt?: string;
  tools?: any[];
  context?: Record<string, any>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  // For tracking
  agent_id?: string;
  run_id?: string;
  workspace_id?: string;
}

interface GatewayResponse {
  content: string;
  citations?: string[];
  tool_calls?: any[];
  provider: ModelProvider;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost_usd?: number;
}

// Default provider routing based on task type
// Perplexity is DEFAULT for all research tasks per user requirement
const TASK_PROVIDER_MAP: Record<TaskType, ModelProvider> = {
  // Research → Perplexity (DEFAULT)
  web_research: 'perplexity',
  prospect_intelligence: 'perplexity',
  company_research: 'perplexity',
  market_research: 'perplexity',
  real_time_search: 'perplexity',
  competitor_analysis: 'perplexity',
  news_search: 'perplexity',
  
  // Reasoning → Gemini Pro
  complex_reasoning: 'gemini',
  tool_calling: 'gemini',
  multi_step_workflow: 'gemini',
  document_analysis: 'gemini',
  code_generation: 'gemini',
  
  // Fast → Gemini Flash (handled in model selection)
  general_qa: 'gemini',
  summary: 'gemini',
  classification: 'gemini',
  extraction: 'gemini',
  translation: 'gemini',
  
  // Content → Gemini (Claude when available)
  content_generation: 'gemini',
  email_drafting: 'gemini',
  proposal_writing: 'gemini',
};

// Model selection within providers
const GEMINI_MODELS: Record<ModelTier, string> = {
  nano: 'google/gemini-2.5-flash-lite',
  fast: 'google/gemini-2.5-flash',
  pro: 'google/gemini-2.5-pro',
  premium: 'google/gemini-3-pro-preview',
};

// Cost per 1K tokens (approximate)
const MODEL_COSTS: Record<string, number> = {
  'sonar': 0.001,
  'sonar-pro': 0.003,
  'google/gemini-2.5-flash-lite': 0.0001,
  'google/gemini-2.5-flash': 0.0003,
  'google/gemini-2.5-pro': 0.003,
  'google/gemini-3-pro-preview': 0.006,
};

// Task to Gemini tier mapping
const TASK_GEMINI_TIER: Record<TaskType, ModelTier> = {
  // Fast tasks → Flash
  general_qa: 'fast',
  summary: 'fast',
  classification: 'nano',
  extraction: 'nano',
  translation: 'fast',
  
  // Pro tasks
  complex_reasoning: 'pro',
  tool_calling: 'pro',
  multi_step_workflow: 'pro',
  document_analysis: 'pro',
  code_generation: 'pro',
  content_generation: 'fast',
  email_drafting: 'fast',
  proposal_writing: 'pro',
  
  // Research (fallback to Gemini)
  web_research: 'pro',
  prospect_intelligence: 'pro',
  company_research: 'pro',
  market_research: 'pro',
  real_time_search: 'pro',
  competitor_analysis: 'pro',
  news_search: 'fast',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: GatewayRequest = await req.json();
    const { 
      task_type, 
      preferred_provider, 
      fallback_providers = ['gemini'], // Default fallback to Gemini
      prompt,
      system_prompt,
      tools,
      max_tokens = 4000,
      temperature = 0.7,
      stream = false,
      agent_id,
      run_id,
      workspace_id,
    } = request;

    // Determine primary provider
    const primaryProvider = preferred_provider || TASK_PROVIDER_MAP[task_type] || 'gemini';
    
    // Check agent limits before making AI call
    if (agent_id) {
      const limitStatus = await checkAgentLimits(supabase, agent_id, workspace_id);
      
      if (limitStatus.blocked) {
        console.log(`[model-gateway] Agent ${agent_id} blocked: ${limitStatus.reason}`);
        await recordBlockedRun(supabase, 'agent', agent_id, limitStatus.reason || 'Limit exceeded');
        
        return new Response(JSON.stringify({
          error: 'blocked_limit',
          message: limitStatus.reason,
          usage: {
            runCount: limitStatus.runCount,
            totalCost: limitStatus.totalCost,
            dailyRunCap: limitStatus.dailyRunCap,
            dailyCostCapUsd: limitStatus.dailyCostCapUsd,
          },
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Build provider chain (primary + fallbacks, no duplicates)
    const providerChain = [primaryProvider, ...fallback_providers.filter(p => p !== primaryProvider)];
    
    let lastError: Error | null = null;
    let result: GatewayResponse | null = null;
    
    for (const provider of providerChain) {
      try {
        console.log(`[model-gateway] Trying provider: ${provider} for task: ${task_type}`);
        
        result = await callProvider(provider, task_type, {
          prompt,
          system_prompt,
          tools,
          max_tokens,
          temperature,
          stream,
        });

        // Track usage
        if (result.usage && workspace_id) {
          await trackGatewayUsage(supabase, {
            provider,
            model: result.model,
            task_type,
            tokens_used: result.usage.total_tokens,
            cost_usd: result.cost_usd || 0,
            agent_id,
            run_id,
            workspace_id,
          });
        }

        console.log(`[model-gateway] Success with ${provider}: ${result.model}`);
        break; // Success - exit loop
        
      } catch (err) {
        lastError = err as Error;
        console.error(`[model-gateway] ${provider} failed:`, err);
        continue; // Try next provider
      }
    }

    if (!result) {
      throw lastError || new Error('All providers failed');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[model-gateway] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function callProvider(
  provider: ModelProvider, 
  taskType: TaskType,
  params: any
): Promise<GatewayResponse> {
  switch (provider) {
    case 'perplexity':
      return callPerplexity(params);
    case 'gemini':
      return callGemini(taskType, params);
    case 'openai':
      return callOpenAI(taskType, params);
    case 'claude':
      throw new Error('Claude integration not yet configured. Please provide ANTHROPIC_API_KEY.');
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callPerplexity(params: any): Promise<GatewayResponse> {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const model = 'sonar'; // Default to sonar for web search
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: params.system_prompt || 'You are a helpful research assistant. Provide accurate, up-to-date information with citations.' },
        { role: 'user', content: params.prompt }
      ],
      max_tokens: params.max_tokens,
      temperature: params.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const usage = data.usage || {};
  const totalTokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    citations: data.citations || [],
    provider: 'perplexity',
    model,
    usage: {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: totalTokens,
    },
    cost_usd: (totalTokens / 1000) * (MODEL_COSTS[model] || 0.001),
  };
}

async function callGemini(taskType: TaskType, params: any): Promise<GatewayResponse> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  // Select appropriate model tier based on task
  const tier = TASK_GEMINI_TIER[taskType] || 'fast';
  const model = GEMINI_MODELS[tier];

  const body: any = {
    model,
    messages: [
      { role: 'system', content: params.system_prompt || 'You are a helpful AI assistant.' },
      { role: 'user', content: params.prompt }
    ],
    max_tokens: params.max_tokens,
    temperature: params.temperature,
  };

  if (params.tools?.length) {
    body.tools = params.tools;
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const usage = data.usage || {};
  const totalTokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    tool_calls: data.choices?.[0]?.message?.tool_calls,
    provider: 'gemini',
    model,
    usage: {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: totalTokens,
    },
    cost_usd: (totalTokens / 1000) * (MODEL_COSTS[model] || 0.0003),
  };
}

async function callOpenAI(taskType: TaskType, params: any): Promise<GatewayResponse> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Use GPT-5-mini for most tasks, GPT-5 for complex ones
  const complexTasks: TaskType[] = ['complex_reasoning', 'multi_step_workflow', 'document_analysis'];
  const model = complexTasks.includes(taskType) ? 'openai/gpt-5' : 'openai/gpt-5-mini';

  const body: any = {
    model,
    messages: [
      { role: 'system', content: params.system_prompt || 'You are a helpful AI assistant.' },
      { role: 'user', content: params.prompt }
    ],
    max_tokens: params.max_tokens,
    temperature: params.temperature,
  };

  if (params.tools?.length) {
    body.tools = params.tools;
  }

  // Route through Lovable gateway for OpenAI as well
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const usage = data.usage || {};
  const totalTokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    tool_calls: data.choices?.[0]?.message?.tool_calls,
    provider: 'openai',
    model,
    usage: {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: totalTokens,
    },
    cost_usd: (totalTokens / 1000) * 0.003, // Approximate
  };
}

async function trackGatewayUsage(supabase: any, data: {
  provider: string;
  model: string;
  task_type: TaskType;
  tokens_used: number;
  cost_usd: number;
  agent_id?: string;
  run_id?: string;
  workspace_id?: string;
}): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Track in ai_model_usage table
    const { data: existing } = await supabase
      .from('ai_model_usage')
      .select('id, requests_count, tokens_input, total_cost')
      .eq('model_name', data.model)
      .eq('model_provider', data.provider)
      .eq('usage_date', today)
      .single();

    if (existing) {
      await supabase.from('ai_model_usage').update({
        requests_count: existing.requests_count + 1,
        tokens_input: (existing.tokens_input || 0) + data.tokens_used,
        total_cost: (existing.total_cost || 0) + data.cost_usd,
      }).eq('id', existing.id);
    } else {
      await supabase.from('ai_model_usage').insert({
        model_name: data.model,
        model_provider: data.provider,
        tokens_input: data.tokens_used,
        requests_count: 1,
        total_cost: data.cost_usd,
        usage_date: today,
        metadata: { task_type: data.task_type },
      });
    }

    // Track in agent_cost_tracking if workspace provided
    if (data.workspace_id) {
      await supabase.from('agent_cost_tracking').insert({
        workspace_id: data.workspace_id,
        agent_id: data.agent_id,
        run_id: data.run_id,
        cost_usd: data.cost_usd,
        tokens_used: data.tokens_used,
        model_used: data.model,
        provider: data.provider,
      });
    }
  } catch (e) {
    console.error('[model-gateway] Usage tracking error:', e);
    // Don't throw - tracking failure shouldn't block response
  }
}
