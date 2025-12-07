import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export interface AgentRunResult {
  summary: string;
  insights: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    action?: string;
  }>;
  metrics?: Record<string, number>;
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

  // Run an agent
  const runMutation = useMutation({
    mutationFn: async (agentId: string): Promise<AgentRunResult> => {
      const { data, error } = await supabase.functions.invoke('run-agent', {
        body: { 
          agent_id: agentId, 
          trigger_type: 'manual' 
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Agent run failed');
      
      return data.result as AgentRunResult;
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

  return {
    agents: agents || [],
    userAgents: userAgents || [],
    isLoading: isLoadingAgents || isLoadingUserAgents,
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    toggle: toggleMutation.mutate,
    runAgent: runMutation.mutateAsync,
    isSubscribed,
    getUserAgent,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
    isRunning: runMutation.isPending,
    runningAgentId: runMutation.variables,
  };
}
