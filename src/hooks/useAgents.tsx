import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AgentType = 'outbound' | 'enrichment' | 'follow_up' | 'analysis' | 'automation' | 'scheduling' | 'research';

export interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  capabilities: string[];
  is_active: boolean;
  is_premium: boolean;
  // New fields
  owner_id?: string;
  version?: string;
  agent_type?: AgentType;
  reusable_flag?: boolean;
  default_compute_credits?: number;
}

export interface UserAgent {
  id: string;
  user_id: string;
  agent_id: string;
  config: Record<string, any>;
  is_enabled: boolean;
  last_run_at: string | null;
  run_count: number;
  agent?: Agent;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  user_id: string;
  trigger_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  result: Record<string, any> | null;
  // New execution logging fields
  input_summary: string | null;
  tools_called: any[];
  external_apis_called: any[];
  tokens_used: number;
  compute_credits_consumed: number;
  linked_task_id: string | null;
  linked_opportunity_id: string | null;
  outputs_generated: Record<string, any>;
  contribution_event_id: string | null;
  model_used: string | null;
  agent?: Partial<Agent>;
}

export interface AgentRunResult {
  summary: string;
  insights: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    action?: string;
  }>;
  metrics?: Record<string, number>;
  runId?: string;
  tokensUsed?: number;
}

export interface AgentExecutionOptions {
  triggerType?: 'manual' | 'scheduled' | 'event' | 'api';
  linkedTaskId?: string;
  linkedOpportunityId?: string;
  context?: Record<string, any>;
}

export function useAgents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available agents
  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instincts_agents')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }

      return data as Agent[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user's subscribed agents
  const { data: userAgents, isLoading: isLoadingUserAgents } = useQuery({
    queryKey: ['user-agents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('instincts_user_agents')
        .select(`
          *,
          agent:instincts_agents(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user agents:', error);
        return [];
      }

      return data as UserAgent[];
    },
    enabled: !!user?.id,
  });

  // Fetch agent execution history
  const { data: agentRuns, isLoading: isLoadingRuns, refetch: refetchRuns } = useQuery({
    queryKey: ['agent-runs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('instincts_agent_runs')
        .select(`
          *,
          agent:instincts_agents(id, name, slug, icon, agent_type)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching agent runs:', error);
        return [];
      }

      return data as AgentRun[];
    },
    enabled: !!user?.id,
  });

  // Subscribe to an agent
  const subscribeMutation = useMutation({
    mutationFn: async (agentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('instincts_user_agents')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          is_enabled: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agents'] });
    },
  });

  // Unsubscribe from an agent
  const unsubscribeMutation = useMutation({
    mutationFn: async (userAgentId: string) => {
      const { error } = await supabase
        .from('instincts_user_agents')
        .delete()
        .eq('id', userAgentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agents'] });
    },
  });

  // Toggle agent enabled state
  const toggleMutation = useMutation({
    mutationFn: async ({ userAgentId, enabled }: { userAgentId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('instincts_user_agents')
        .update({ is_enabled: enabled })
        .eq('id', userAgentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agents'] });
    },
  });

  // Run an agent with execution logging
  const runMutation = useMutation({
    mutationFn: async ({ 
      agentId, 
      options = {} 
    }: { 
      agentId: string; 
      options?: AgentExecutionOptions 
    }): Promise<AgentRunResult> => {
      const { data, error } = await supabase.functions.invoke('run-agent', {
        body: { 
          agent_id: agentId, 
          trigger_type: options.triggerType || 'manual',
          linked_task_id: options.linkedTaskId,
          linked_opportunity_id: options.linkedOpportunityId,
          context: options.context,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Agent run failed');
      
      // Invalidate runs to show new execution
      queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
      
      return {
        ...data.result,
        runId: data.run_id,
        tokensUsed: data.tokens_used,
      } as AgentRunResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agents'] });
    },
  });

  // Check if user is subscribed to an agent
  const isSubscribed = (agentId: string) => {
    return userAgents?.some(ua => ua.agent_id === agentId) ?? false;
  };

  // Get user agent by agent ID
  const getUserAgent = (agentId: string) => {
    return userAgents?.find(ua => ua.agent_id === agentId);
  };

  // Get runs for a specific agent
  const getAgentRuns = (agentId: string) => {
    return agentRuns?.filter(run => run.agent_id === agentId) ?? [];
  };

  // Get execution stats for an agent
  const getAgentStats = (agentId: string) => {
    const runs = getAgentRuns(agentId);
    return {
      totalRuns: runs.length,
      successfulRuns: runs.filter(r => r.status === 'completed').length,
      failedRuns: runs.filter(r => r.status === 'failed').length,
      totalTokens: runs.reduce((sum, r) => sum + (r.tokens_used || 0), 0),
      totalCredits: runs.reduce((sum, r) => sum + (r.compute_credits_consumed || 0), 0),
      avgDuration: runs.length > 0 
        ? runs.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / runs.length 
        : 0,
    };
  };

  return {
    agents: agents || [],
    userAgents: userAgents || [],
    agentRuns: agentRuns || [],
    isLoading: isLoadingAgents || isLoadingUserAgents,
    isLoadingRuns,
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    toggle: toggleMutation.mutate,
    runAgent: (agentId: string, options?: AgentExecutionOptions) => 
      runMutation.mutateAsync({ agentId, options }),
    isSubscribed,
    getUserAgent,
    getAgentRuns,
    getAgentStats,
    refetchRuns,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
    isRunning: runMutation.isPending,
    runningAgentId: runMutation.variables?.agentId,
  };
}
