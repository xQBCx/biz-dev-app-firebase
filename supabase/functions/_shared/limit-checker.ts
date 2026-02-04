/**
 * Limit Checker Utility
 * 
 * Shared utility for checking agent and workflow limits before execution.
 * Used by model-gateway, run-agent, and execute-workflow-v2.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AgentLimitStatus {
  agentId: string;
  runCount: number;
  totalCost: number;
  totalTokens: number;
  dailyRunCap: number;
  dailyCostCapUsd: number;
  costCeilingUsd: number;
  runLimitReached: boolean;
  costLimitReached: boolean;
  runPercentUsed: number;
  costPercentUsed: number;
  blocked: boolean;
  reason?: string;
}

export interface WorkflowLimitStatus {
  workflowId: string;
  runCount: number;
  totalTokens: number;
  totalCredits: number;
  dailyRunCap: number;
  enabledForAi: boolean;
  runLimitReached: boolean;
  runPercentUsed: number;
  blocked: boolean;
  reason?: string;
}

/**
 * Check if agent has exceeded its daily limits
 */
export async function checkAgentLimits(
  supabase: SupabaseClient,
  agentId: string,
  workspaceId?: string
): Promise<AgentLimitStatus> {
  // Fetch agent configuration
  const { data: agent, error: agentError } = await supabase
    .from('instincts_agents')
    .select('id, daily_cost_cap_usd, daily_run_cap, cost_ceiling_usd')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) {
    console.error('[limit-checker] Agent not found:', agentError);
    return {
      agentId,
      runCount: 0,
      totalCost: 0,
      totalTokens: 0,
      dailyRunCap: 200,
      dailyCostCapUsd: 10.00,
      costCeilingUsd: 0.50,
      runLimitReached: false,
      costLimitReached: false,
      runPercentUsed: 0,
      costPercentUsed: 0,
      blocked: true,
      reason: 'Agent not found',
    };
  }

  // Fetch daily usage via RPC function
  const { data: usageData, error: usageError } = await supabase
    .rpc('get_agent_daily_usage', {
      p_agent_id: agentId,
      p_workspace_id: workspaceId || null,
    })
    .single();

  const usage = usageData as { run_count?: number; total_cost?: number; total_tokens?: number } | null;
  const runCount = usage?.run_count || 0;
  const totalCost = usage?.total_cost || 0;
  const totalTokens = usage?.total_tokens || 0;

  const dailyRunCap = agent.daily_run_cap || 200;
  const dailyCostCapUsd = agent.daily_cost_cap_usd || 10.00;
  const costCeilingUsd = agent.cost_ceiling_usd || 0.50;

  const runLimitReached = runCount >= dailyRunCap;
  const costLimitReached = totalCost >= dailyCostCapUsd;

  const runPercentUsed = dailyRunCap > 0 ? (runCount / dailyRunCap) * 100 : 0;
  const costPercentUsed = dailyCostCapUsd > 0 ? (totalCost / dailyCostCapUsd) * 100 : 0;

  const blocked = runLimitReached || costLimitReached;
  let reason: string | undefined;

  if (runLimitReached) {
    reason = `Agent daily run cap reached (${runCount}/${dailyRunCap})`;
  } else if (costLimitReached) {
    reason = `Agent daily cost cap reached ($${totalCost.toFixed(2)}/$${dailyCostCapUsd.toFixed(2)})`;
  }

  return {
    agentId,
    runCount,
    totalCost,
    totalTokens,
    dailyRunCap,
    dailyCostCapUsd,
    costCeilingUsd,
    runLimitReached,
    costLimitReached,
    runPercentUsed,
    costPercentUsed,
    blocked,
    reason,
  };
}

/**
 * Check if workflow has exceeded its daily limits
 */
export async function checkWorkflowLimits(
  supabase: SupabaseClient,
  workflowId: string
): Promise<WorkflowLimitStatus> {
  // Fetch workflow configuration
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select('id, daily_run_cap, enabled_for_ai')
    .eq('id', workflowId)
    .single();

  if (workflowError || !workflow) {
    console.error('[limit-checker] Workflow not found:', workflowError);
    return {
      workflowId,
      runCount: 0,
      totalTokens: 0,
      totalCredits: 0,
      dailyRunCap: 100,
      enabledForAi: true,
      runLimitReached: false,
      runPercentUsed: 0,
      blocked: true,
      reason: 'Workflow not found',
    };
  }

  // Fetch daily usage via RPC function
  const { data: usageData, error: usageError } = await supabase
    .rpc('get_workflow_daily_usage', {
      p_workflow_id: workflowId,
    })
    .single();

  const usage = usageData as { run_count?: number; total_tokens?: number; total_credits?: number } | null;
  const runCount = usage?.run_count || 0;
  const totalTokens = usage?.total_tokens || 0;
  const totalCredits = usage?.total_credits || 0;

  const dailyRunCap = workflow.daily_run_cap || 100;
  const enabledForAi = workflow.enabled_for_ai !== false;

  const runLimitReached = runCount >= dailyRunCap;
  const runPercentUsed = dailyRunCap > 0 ? (runCount / dailyRunCap) * 100 : 0;

  const blocked = runLimitReached || !enabledForAi;
  let reason: string | undefined;

  if (!enabledForAi) {
    reason = 'AI is disabled for this workflow';
  } else if (runLimitReached) {
    reason = `Workflow daily run cap reached (${runCount}/${dailyRunCap})`;
  }

  return {
    workflowId,
    runCount,
    totalTokens,
    totalCredits,
    dailyRunCap,
    enabledForAi,
    runLimitReached,
    runPercentUsed,
    blocked,
    reason,
  };
}

/**
 * Record a blocked run attempt
 */
export async function recordBlockedRun(
  supabase: SupabaseClient,
  type: 'agent' | 'workflow',
  entityId: string,
  reason: string,
  userId?: string,
  workspaceId?: string
): Promise<void> {
  try {
    if (type === 'agent') {
      await supabase.from('instincts_agent_runs').insert({
        agent_id: entityId,
        user_id: userId,
        status: 'blocked_limit',
        error_message: reason,
        trigger_type: 'system',
        completed_at: new Date().toISOString(),
      });
    } else {
      await supabase.from('workflow_execution_runs').insert({
        workflow_id: entityId,
        status: 'blocked_limit',
        error_message: reason,
        trigger_type: 'system',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    console.log(`[limit-checker] Recorded blocked ${type}: ${entityId} - ${reason}`);
  } catch (e) {
    console.error(`[limit-checker] Failed to record blocked ${type}:`, e);
  }
}

/**
 * Check if a single run would exceed the cost ceiling
 */
export function wouldExceedCostCeiling(
  estimatedCost: number,
  costCeilingUsd: number
): boolean {
  return estimatedCost > costCeilingUsd;
}
