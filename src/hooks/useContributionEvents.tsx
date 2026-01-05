import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useActiveClient } from "./useActiveClient";

// Type definitions matching the database enums
export type ActorType = 'human' | 'agent' | 'system';

export type ContributionEventType = 
  // Task events
  | 'task_created' | 'task_completed' | 'task_assigned' | 'task_updated'
  // Outreach events
  | 'email_drafted' | 'email_sent' | 'call_made' | 'meeting_scheduled' | 'meeting_held'
  // Deal events
  | 'lead_qualified' | 'deal_created' | 'deal_advanced' | 'deal_closed_won' | 'deal_closed_lost'
  // Content events
  | 'content_created' | 'document_authored' | 'ip_submitted'
  // Agent events
  | 'agent_executed' | 'agent_suggestion' | 'agent_automation'
  // System events
  | 'data_enriched' | 'integration_synced' | 'workflow_triggered';

export type TaskValueCategory = 
  | 'lead' | 'meeting' | 'sale' | 'ip' | 'architecture' 
  | 'ops' | 'research' | 'outreach' | 'analysis' | 'automation';

export type TaskContributorType = 'human' | 'agent' | 'hybrid';

interface EmitContributionOptions {
  actorType?: ActorType;
  actorId?: string;
  eventType: ContributionEventType;
  eventDescription?: string;
  payload?: Record<string, any>;
  workspaceId?: string;
  opportunityId?: string;
  taskId?: string;
  dealRoomId?: string;
  computeCredits?: number;
  actionCredits?: number;
  outcomeCredits?: number;
  attributionTags?: string[];
  valueCategory?: TaskValueCategory;
}

interface ContributionEvent {
  id: string;
  actor_type: ActorType;
  actor_id: string;
  event_type: ContributionEventType;
  event_description: string | null;
  payload: Record<string, any>;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  attribution_tags: string[];
  xodiak_anchor_status: string;
  event_hash: string;
  created_at: string;
}

interface CreditBalance {
  entity_type: string;
  entity_id: string;
  period_start: string;
  period_end: string;
  compute_credits_earned: number;
  compute_credits_used: number;
  action_credits_earned: number;
  action_credits_used: number;
  outcome_credits_earned: number;
  outcome_credits_used: number;
  total_events: number;
}

export const useContributionEvents = () => {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();

  /**
   * Emit a contribution event to the unified event log.
   * This automatically:
   * - Creates a hash for XODIAK anchoring
   * - Updates credit balances
   * - Queues for XODIAK anchoring based on threshold
   */
  const emit = useCallback(async (options: EmitContributionOptions): Promise<string | null> => {
    if (!user) {
      console.warn('[ContributionEvents] No user authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('emit_contribution_event', {
        p_actor_type: options.actorType || 'human',
        p_actor_id: options.actorId || user.id,
        p_event_type: options.eventType,
        p_event_description: options.eventDescription || null,
        p_payload: options.payload || {},
        p_workspace_id: options.workspaceId || activeClientId || null,
        p_opportunity_id: options.opportunityId || null,
        p_task_id: options.taskId || null,
        p_deal_room_id: options.dealRoomId || null,
        p_compute_credits: options.computeCredits || 0,
        p_action_credits: options.actionCredits || 0,
        p_outcome_credits: options.outcomeCredits || 0,
        p_attribution_tags: options.attributionTags || [],
        p_value_category: options.valueCategory || null,
      });

      if (error) {
        console.error('[ContributionEvents] Error emitting event:', error);
        return null;
      }

      console.log('[ContributionEvents] Event emitted:', options.eventType, data);
      return data as string;
    } catch (error) {
      console.error('[ContributionEvents] Exception:', error);
      return null;
    }
  }, [user, activeClientId]);

  // Convenience methods for common events
  const trackTaskCreated = useCallback((
    taskId: string, 
    taskTitle: string, 
    valueCategory?: TaskValueCategory,
    opportunityId?: string
  ) => {
    return emit({
      eventType: 'task_created',
      eventDescription: `Task created: ${taskTitle}`,
      taskId,
      opportunityId,
      valueCategory,
      actionCredits: 1,
    });
  }, [emit]);

  const trackTaskCompleted = useCallback((
    taskId: string, 
    taskTitle: string,
    valueCategory?: TaskValueCategory,
    opportunityId?: string
  ) => {
    return emit({
      eventType: 'task_completed',
      eventDescription: `Task completed: ${taskTitle}`,
      taskId,
      opportunityId,
      valueCategory,
      actionCredits: 2, // Completion worth more than creation
      outcomeCredits: valueCategory === 'sale' || valueCategory === 'meeting' ? 1 : 0,
    });
  }, [emit]);

  const trackDealCreated = useCallback((
    dealId: string, 
    dealTitle: string,
    dealValue?: number
  ) => {
    return emit({
      eventType: 'deal_created',
      eventDescription: `Deal created: ${dealTitle}`,
      opportunityId: dealId,
      valueCategory: 'sale',
      actionCredits: 3,
      payload: { deal_value: dealValue },
    });
  }, [emit]);

  const trackDealAdvanced = useCallback((
    dealId: string, 
    dealTitle: string,
    fromStage: string,
    toStage: string
  ) => {
    return emit({
      eventType: 'deal_advanced',
      eventDescription: `Deal advanced: ${dealTitle} (${fromStage} → ${toStage})`,
      opportunityId: dealId,
      valueCategory: 'sale',
      actionCredits: 2,
      outcomeCredits: 1,
      payload: { from_stage: fromStage, to_stage: toStage },
    });
  }, [emit]);

  const trackDealClosed = useCallback((
    dealId: string, 
    dealTitle: string,
    won: boolean,
    dealValue?: number
  ) => {
    return emit({
      eventType: won ? 'deal_closed_won' : 'deal_closed_lost',
      eventDescription: `Deal ${won ? 'won' : 'lost'}: ${dealTitle}`,
      opportunityId: dealId,
      valueCategory: 'sale',
      actionCredits: 5,
      outcomeCredits: won ? 10 : 0,
      payload: { deal_value: dealValue, outcome: won ? 'won' : 'lost' },
    });
  }, [emit]);

  const trackMeetingScheduled = useCallback((
    taskId: string,
    meetingTitle: string,
    opportunityId?: string
  ) => {
    return emit({
      eventType: 'meeting_scheduled',
      eventDescription: `Meeting scheduled: ${meetingTitle}`,
      taskId,
      opportunityId,
      valueCategory: 'meeting',
      actionCredits: 2,
    });
  }, [emit]);

  const trackMeetingHeld = useCallback((
    taskId: string,
    meetingTitle: string,
    opportunityId?: string
  ) => {
    return emit({
      eventType: 'meeting_held',
      eventDescription: `Meeting held: ${meetingTitle}`,
      taskId,
      opportunityId,
      valueCategory: 'meeting',
      actionCredits: 3,
      outcomeCredits: 2,
    });
  }, [emit]);

  const trackAgentExecution = useCallback((
    agentId: string,
    agentName: string,
    tokensUsed: number,
    taskId?: string,
    opportunityId?: string
  ) => {
    return emit({
      actorType: 'agent',
      actorId: agentId,
      eventType: 'agent_executed',
      eventDescription: `Agent executed: ${agentName}`,
      taskId,
      opportunityId,
      valueCategory: 'automation',
      computeCredits: tokensUsed / 1000, // Normalize tokens to credits
      actionCredits: 1,
      payload: { tokens_used: tokensUsed },
    });
  }, [emit]);

  const trackEmailSent = useCallback((
    subject: string,
    opportunityId?: string
  ) => {
    return emit({
      eventType: 'email_sent',
      eventDescription: `Email sent: ${subject}`,
      opportunityId,
      valueCategory: 'outreach',
      actionCredits: 1,
    });
  }, [emit]);

  // Fetch user's credit balance for current period
  const getCurrentCredits = useCallback(async (): Promise<CreditBalance | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('credit_balances')
        .select('*')
        .eq('entity_type', 'user')
        .eq('entity_id', user.id)
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[ContributionEvents] Error fetching credits:', error);
        return null;
      }

      return data as CreditBalance | null;
    } catch (error) {
      console.error('[ContributionEvents] Exception:', error);
      return null;
    }
  }, [user]);

  // Fetch recent contribution events
  const getRecentEvents = useCallback(async (limit = 20): Promise<ContributionEvent[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('contribution_events')
        .select('*')
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[ContributionEvents] Error fetching events:', error);
        return [];
      }

      return (data as ContributionEvent[]) || [];
    } catch (error) {
      console.error('[ContributionEvents] Exception:', error);
      return [];
    }
  }, [user]);

  return {
    emit,
    trackTaskCreated,
    trackTaskCompleted,
    trackDealCreated,
    trackDealAdvanced,
    trackDealClosed,
    trackMeetingScheduled,
    trackMeetingHeld,
    trackAgentExecution,
    trackEmailSent,
    getCurrentCredits,
    getRecentEvents,
  };
};
