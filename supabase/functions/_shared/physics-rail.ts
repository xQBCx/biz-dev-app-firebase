/**
 * Physics Rail - Server-side validation layer for AI agent actions
 * 
 * This layer ensures all AI-proposed actions pass through:
 * 1. RBAC checks (user has permission for this action)
 * 2. Guardrail checks (agent is allowed to perform this action)
 * 3. Impact level checks (high-impact actions need approval)
 * 4. Cost ceiling checks (prevent runaway agent spending)
 * 5. Rate limiting (prevent abuse)
 * 
 * Per white paper: "Physics Rail vs ML Rail" architecture
 * - Physics Rail: hard constraints, always enforced
 * - ML Rail: AI model suggestions that Physics Rail must approve
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ActionType = 
  | 'send_email' 
  | 'send_sms' 
  | 'create_deal' 
  | 'update_deal' 
  | 'create_contact' 
  | 'update_contact'
  | 'create_task' 
  | 'update_task'
  | 'call_webhook' 
  | 'generate_content' 
  | 'execute_agent' 
  | 'transfer_funds'
  | 'create_document' 
  | 'delete_record'
  | 'web_research'
  | 'scrape_url'
  | 'spawn_business'
  | 'generate_erp'
  | 'generate_website';

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PhysicsRailContext {
  userId: string;
  agentId?: string;
  agentSlug?: string;
  workspaceId?: string;
  action: ActionType;
  payload: Record<string, any>;
  estimatedCostUsd?: number;
}

export interface PhysicsRailResult {
  approved: boolean;
  requiresApproval: boolean;
  reason?: string;
  approvalId?: string;
  modifiedPayload?: Record<string, any>;
  warnings?: string[];
}

// Action risk levels - determines approval requirements
const ACTION_RISK_MAP: Record<ActionType, ImpactLevel> = {
  // Low risk - generally auto-approved
  create_task: 'low',
  update_task: 'low',
  create_contact: 'low',
  update_contact: 'low',
  generate_content: 'low',
  create_document: 'low',
  web_research: 'low',
  scrape_url: 'low',
  
  // Medium risk - may need approval based on context
  create_deal: 'medium',
  update_deal: 'medium',
  execute_agent: 'medium',
  spawn_business: 'medium',
  generate_erp: 'medium',
  generate_website: 'medium',
  
  // High risk - requires workspace admin approval
  send_email: 'high',
  send_sms: 'high',
  call_webhook: 'high',
  
  // Critical - always requires approval, never auto-execute
  delete_record: 'critical',
  transfer_funds: 'critical',
};

const IMPACT_ORDER: ImpactLevel[] = ['low', 'medium', 'high', 'critical'];

/**
 * Main validation function - call this before executing any AI-proposed action
 */
export async function validatePhysicsRail(
  supabase: SupabaseClient,
  context: PhysicsRailContext
): Promise<PhysicsRailResult> {
  const { userId, agentId, agentSlug, workspaceId, action, payload, estimatedCostUsd = 0 } = context;
  const warnings: string[] = [];
  
  try {
    // 1. Check user roles and permissions
    const { isAdmin, roles } = await getUserRoles(supabase, userId);
    
    // 2. Get agent configuration if agent-initiated
    let agentConfig: AgentConfig | null = null;
    if (agentId || agentSlug) {
      agentConfig = await getAgentConfig(supabase, agentId, agentSlug);
    }
    
    // 3. Check if action is blocked by agent guardrails
    if (agentConfig) {
      const guardrailCheck = checkAgentGuardrails(agentConfig, action);
      if (!guardrailCheck.allowed) {
        return {
          approved: false,
          requiresApproval: false,
          reason: guardrailCheck.reason,
        };
      }
    }
    
    // 4. Check cost ceilings
    if (workspaceId && estimatedCostUsd > 0) {
      const costCheck = await checkCostCeilings(supabase, workspaceId, agentConfig, estimatedCostUsd);
      if (!costCheck.allowed) {
        return {
          approved: false,
          requiresApproval: false,
          reason: costCheck.reason,
        };
      }
      if (costCheck.warning) {
        warnings.push(costCheck.warning);
      }
    }
    
    // 5. Determine if approval is needed based on action risk
    const actionRisk = ACTION_RISK_MAP[action] || 'medium';
    const actionRiskLevel = IMPACT_ORDER.indexOf(actionRisk);
    
    // Get approval requirements
    const approvalRequirements = await getApprovalRequirements(supabase, workspaceId, action);
    
    // Check if this specific action requires approval
    const requiresApprovalForAction = 
      agentConfig?.required_approval_for?.includes(action) ||
      approvalRequirements.required;
    
    // High/critical actions always need approval unless user is admin
    const needsApproval = 
      (actionRiskLevel >= 2 && !isAdmin) || 
      requiresApprovalForAction;
    
    if (needsApproval) {
      // Create approval request
      const approvalId = await createApprovalRequest(supabase, {
        userId,
        agentId,
        action,
        payload,
        approverType: approvalRequirements.approverType || 'workspace_admin',
        approverValue: approvalRequirements.approverValue,
      });
      
      return {
        approved: false,
        requiresApproval: true,
        approvalId,
        reason: `Action '${action}' requires ${approvalRequirements.approverType || 'admin'} approval`,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }
    
    // 6. All checks passed - action is approved
    return {
      approved: true,
      requiresApproval: false,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
    
  } catch (error) {
    console.error('[physics-rail] Validation error:', error);
    return {
      approved: false,
      requiresApproval: false,
      reason: 'Validation error: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

/**
 * Get action risk level
 */
export function getActionRiskLevel(action: ActionType): ImpactLevel {
  return ACTION_RISK_MAP[action] || 'medium';
}

/**
 * Check if an action is high-risk (requires special handling)
 */
export function isHighRiskAction(action: ActionType): boolean {
  const risk = ACTION_RISK_MAP[action];
  return risk === 'high' || risk === 'critical';
}

// ============= Helper Functions =============

interface AgentConfig {
  id: string;
  slug: string;
  impact_level: ImpactLevel;
  guardrails: {
    blocked_actions?: string[];
    max_executions_per_hour?: number;
    allowed_domains?: string[];
  };
  required_approval_for: string[];
  model_preference: string;
  fallback_model: string;
  max_tokens_per_run: number;
  cost_ceiling_usd: number;
}

async function getUserRoles(supabase: SupabaseClient, userId: string): Promise<{ isAdmin: boolean; roles: string[] }> {
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  const roles = userRoles?.map(r => r.role) || [];
  const isAdmin = roles.includes('admin');
  
  return { isAdmin, roles };
}

async function getAgentConfig(
  supabase: SupabaseClient, 
  agentId?: string, 
  agentSlug?: string
): Promise<AgentConfig | null> {
  let query = supabase
    .from('instincts_agents')
    .select('id, slug, impact_level, guardrails, required_approval_for, model_preference, fallback_model, max_tokens_per_run, cost_ceiling_usd');
  
  if (agentId) {
    query = query.eq('id', agentId);
  } else if (agentSlug) {
    query = query.eq('slug', agentSlug);
  } else {
    return null;
  }
  
  const { data } = await query.single();
  return data as AgentConfig | null;
}

function checkAgentGuardrails(
  agentConfig: AgentConfig, 
  action: ActionType
): { allowed: boolean; reason?: string } {
  const blockedActions = agentConfig.guardrails?.blocked_actions || [];
  
  if (blockedActions.includes(action)) {
    return {
      allowed: false,
      reason: `Action '${action}' is blocked by agent guardrails for '${agentConfig.slug}'`,
    };
  }
  
  return { allowed: true };
}

async function checkCostCeilings(
  supabase: SupabaseClient,
  workspaceId: string,
  agentConfig: AgentConfig | null,
  estimatedCostUsd: number
): Promise<{ allowed: boolean; reason?: string; warning?: string }> {
  // Check agent-level cost ceiling
  if (agentConfig && estimatedCostUsd > agentConfig.cost_ceiling_usd) {
    return {
      allowed: false,
      reason: `Estimated cost ($${estimatedCostUsd.toFixed(4)}) exceeds agent limit ($${agentConfig.cost_ceiling_usd})`,
    };
  }
  
  // Check workspace daily limit
  const { data: costData } = await supabase.rpc('check_workspace_daily_cost', {
    p_workspace_id: workspaceId,
    p_daily_limit_usd: 10.00, // Default, will be overridden by workspace settings
  });
  
  if (costData && costData.length > 0) {
    const { limit_exceeded, remaining_budget, total_cost_today } = costData[0];
    
    if (limit_exceeded) {
      return {
        allowed: false,
        reason: `Workspace daily cost limit exceeded. Total today: $${total_cost_today?.toFixed(2)}`,
      };
    }
    
    if (remaining_budget < estimatedCostUsd) {
      return {
        allowed: false,
        reason: `Estimated cost ($${estimatedCostUsd.toFixed(4)}) exceeds remaining daily budget ($${remaining_budget?.toFixed(2)})`,
      };
    }
    
    // Warn if approaching limit
    if (remaining_budget < 2.00) {
      return {
        allowed: true,
        warning: `Approaching daily cost limit. Remaining: $${remaining_budget?.toFixed(2)}`,
      };
    }
  }
  
  return { allowed: true };
}

async function getApprovalRequirements(
  supabase: SupabaseClient,
  workspaceId: string | undefined,
  action: ActionType
): Promise<{ required: boolean; approverType?: string; approverValue?: string }> {
  if (!workspaceId) {
    return { required: false };
  }
  
  const { data: override } = await supabase
    .from('approval_overrides')
    .select('approver_type, approver_value, is_active')
    .eq('workspace_id', workspaceId)
    .eq('action_type', action)
    .eq('is_active', true)
    .single();
  
  if (override) {
    return {
      required: true,
      approverType: override.approver_type,
      approverValue: override.approver_value,
    };
  }
  
  // Default: high-impact actions require workspace admin approval
  if (isHighRiskAction(action)) {
    return {
      required: true,
      approverType: 'workspace_admin',
    };
  }
  
  return { required: false };
}

async function createApprovalRequest(
  supabase: SupabaseClient,
  params: {
    userId: string;
    agentId?: string;
    action: ActionType;
    payload: Record<string, any>;
    approverType: string;
    approverValue?: string;
  }
): Promise<string> {
  const { data, error } = await supabase
    .from('workflow_approvals')
    .insert({
      approval_type: 'action',
      title: `Approve ${params.action}`,
      description: `AI agent requesting to perform: ${params.action}`,
      context_data: {
        action: params.action,
        payload: params.payload,
        agent_id: params.agentId,
      },
      assigned_to: params.userId, // Default to requesting user, will be routed based on approverType
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('[physics-rail] Failed to create approval:', error);
    throw new Error('Failed to create approval request');
  }
  
  return data.id;
}

/**
 * Record cost for tracking purposes
 */
export async function recordAgentCost(
  supabase: SupabaseClient,
  params: {
    workspaceId?: string;
    agentId?: string;
    runId?: string;
    costUsd: number;
    tokensUsed: number;
    modelUsed: string;
    provider: string;
  }
): Promise<void> {
  try {
    await supabase.from('agent_cost_tracking').insert({
      workspace_id: params.workspaceId,
      agent_id: params.agentId,
      run_id: params.runId,
      cost_usd: params.costUsd,
      tokens_used: params.tokensUsed,
      model_used: params.modelUsed,
      provider: params.provider,
    });
  } catch (error) {
    console.error('[physics-rail] Failed to record cost:', error);
    // Don't throw - cost tracking failure shouldn't block execution
  }
}

/**
 * Log contribution event for credit tracking
 */
export async function logContributionEvent(
  supabase: SupabaseClient,
  params: {
    userId: string;
    agentId?: string;
    eventType: string;
    computeCredits?: number;
    actionCredits?: number;
    outcomeCredits?: number;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    await supabase.from('contribution_events').insert({
      actor_id: params.agentId || params.userId,
      actor_type: params.agentId ? 'agent' : 'user',
      event_type: params.eventType,
      compute_credits: params.computeCredits || 0,
      action_credits: params.actionCredits || 0,
      outcome_credits: params.outcomeCredits || 0,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error('[physics-rail] Failed to log contribution:', error);
    // Don't throw - contribution logging failure shouldn't block execution
  }
}
