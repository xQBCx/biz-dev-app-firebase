import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyUsageData {
  usage_date: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  blocked_runs: number;
}

export interface TopAgent {
  agent_id: string;
  agent_name: string;
  agent_slug: string;
  primary_model: string;
  runs_24h: number;
  runs_7d: number;
  total_tokens: number;
  total_cost: number;
  daily_run_cap: number;
  daily_cost_cap_usd: number;
  blocked_count: number;
}

export interface TopWorkflow {
  workflow_id: string;
  workflow_name: string;
  runs_24h: number;
  runs_7d: number;
  total_tokens: number;
  total_credits: number;
  avg_cost_per_run: number;
  daily_run_cap: number;
  enabled_for_ai: boolean;
  blocked_count: number;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  blockedRuns: number;
}

export function useAIUsageAnalytics(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
) {
  const dailyUsageQuery = useQuery({
    queryKey: ["ai-usage-daily", startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<DailyUsageData[]> => {
      const { data, error } = await supabase.rpc("get_ai_usage_analytics", {
        p_workspace_id: null,
        p_start_date: startDate.toISOString().split("T")[0],
        p_end_date: endDate.toISOString().split("T")[0],
      });

      if (error) {
        console.error("Failed to fetch daily usage:", error);
        return [];
      }

      return (data || []).map((d: any) => ({
        usage_date: d.usage_date,
        total_requests: Number(d.total_requests) || 0,
        total_tokens: Number(d.total_tokens) || 0,
        total_cost: Number(d.total_cost) || 0,
        blocked_runs: Number(d.blocked_runs) || 0,
      }));
    },
  });

  const topAgentsQuery = useQuery({
    queryKey: ["ai-usage-top-agents"],
    queryFn: async (): Promise<TopAgent[]> => {
      const { data, error } = await supabase.rpc("get_top_agents_by_usage", {
        p_workspace_id: null,
        p_limit: 10,
      });

      if (error) {
        console.error("Failed to fetch top agents:", error);
        return [];
      }

      return (data || []).map((d: any) => ({
        agent_id: d.agent_id,
        agent_name: d.agent_name || "Unknown Agent",
        agent_slug: d.agent_slug || "",
        primary_model: d.primary_model || "gemini",
        runs_24h: Number(d.runs_24h) || 0,
        runs_7d: Number(d.runs_7d) || 0,
        total_tokens: Number(d.total_tokens) || 0,
        total_cost: Number(d.total_cost) || 0,
        daily_run_cap: d.daily_run_cap || 200,
        daily_cost_cap_usd: Number(d.daily_cost_cap_usd) || 10,
        blocked_count: Number(d.blocked_count) || 0,
      }));
    },
  });

  const topWorkflowsQuery = useQuery({
    queryKey: ["ai-usage-top-workflows"],
    queryFn: async (): Promise<TopWorkflow[]> => {
      const { data, error } = await supabase.rpc("get_top_workflows_by_usage", {
        p_user_id: null,
        p_limit: 10,
      });

      if (error) {
        console.error("Failed to fetch top workflows:", error);
        return [];
      }

      return (data || []).map((d: any) => ({
        workflow_id: d.workflow_id,
        workflow_name: d.workflow_name || "Unnamed Workflow",
        runs_24h: Number(d.runs_24h) || 0,
        runs_7d: Number(d.runs_7d) || 0,
        total_tokens: Number(d.total_tokens) || 0,
        total_credits: Number(d.total_credits) || 0,
        avg_cost_per_run: Number(d.avg_cost_per_run) || 0,
        daily_run_cap: d.daily_run_cap || 100,
        enabled_for_ai: d.enabled_for_ai !== false,
        blocked_count: Number(d.blocked_count) || 0,
      }));
    },
  });

  // Calculate summary from daily data
  const summary: UsageSummary = {
    totalRequests: dailyUsageQuery.data?.reduce((acc, d) => acc + d.total_requests, 0) || 0,
    totalTokens: dailyUsageQuery.data?.reduce((acc, d) => acc + d.total_tokens, 0) || 0,
    totalCost: dailyUsageQuery.data?.reduce((acc, d) => acc + d.total_cost, 0) || 0,
    blockedRuns: dailyUsageQuery.data?.reduce((acc, d) => acc + d.blocked_runs, 0) || 0,
  };

  // Check if any agents or workflows have hit their caps today
  const blockedAgents = topAgentsQuery.data?.filter(
    (a) => a.runs_24h >= a.daily_run_cap || (a.total_cost > 0 && a.total_cost >= a.daily_cost_cap_usd)
  ) || [];

  const blockedWorkflows = topWorkflowsQuery.data?.filter(
    (w) => w.runs_24h >= w.daily_run_cap || !w.enabled_for_ai
  ) || [];

  return {
    dailyUsage: dailyUsageQuery.data || [],
    topAgents: topAgentsQuery.data || [],
    topWorkflows: topWorkflowsQuery.data || [],
    summary,
    blockedAgents,
    blockedWorkflows,
    isLoading: dailyUsageQuery.isLoading || topAgentsQuery.isLoading || topWorkflowsQuery.isLoading,
    error: dailyUsageQuery.error || topAgentsQuery.error || topWorkflowsQuery.error,
    refetch: () => {
      dailyUsageQuery.refetch();
      topAgentsQuery.refetch();
      topWorkflowsQuery.refetch();
    },
  };
}
