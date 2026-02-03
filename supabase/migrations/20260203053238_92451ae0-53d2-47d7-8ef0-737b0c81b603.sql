-- Add daily limits to instincts_agents
ALTER TABLE public.instincts_agents
ADD COLUMN IF NOT EXISTS daily_cost_cap_usd NUMERIC DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS daily_run_cap INTEGER DEFAULT 200;

-- Add daily limits and AI toggle to workflows
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS daily_run_cap INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS enabled_for_ai BOOLEAN DEFAULT true;

-- Create function to get agent daily usage stats
CREATE OR REPLACE FUNCTION public.get_agent_daily_usage(p_agent_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS TABLE (
  run_count BIGINT,
  total_cost NUMERIC,
  total_tokens BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as run_count,
    COALESCE(SUM(act.cost_usd), 0)::NUMERIC as total_cost,
    COALESCE(SUM(act.tokens_used), 0)::BIGINT as total_tokens
  FROM agent_cost_tracking act
  WHERE act.agent_id = p_agent_id
    AND act.created_at >= CURRENT_DATE
    AND (p_workspace_id IS NULL OR act.workspace_id = p_workspace_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to get workflow daily usage stats
CREATE OR REPLACE FUNCTION public.get_workflow_daily_usage(p_workflow_id UUID)
RETURNS TABLE (
  run_count BIGINT,
  total_tokens BIGINT,
  total_credits NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as run_count,
    COALESCE(SUM(wne.tokens_consumed), 0)::BIGINT as total_tokens,
    COALESCE(SUM(wer.credits_consumed), 0)::NUMERIC as total_credits
  FROM workflow_execution_runs wer
  LEFT JOIN workflow_node_executions wne ON wne.run_id = wer.id
  WHERE wer.workflow_id = p_workflow_id
    AND wer.started_at >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to get AI usage analytics for dashboard
CREATE OR REPLACE FUNCTION public.get_ai_usage_analytics(
  p_workspace_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  usage_date DATE,
  total_requests BIGINT,
  total_tokens BIGINT,
  total_cost NUMERIC,
  blocked_runs BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.date::DATE as usage_date,
    COALESCE(amu.requests_count, 0)::BIGINT as total_requests,
    COALESCE(amu.tokens_input + amu.tokens_output, 0)::BIGINT as total_tokens,
    COALESCE(amu.total_cost, 0)::NUMERIC as total_cost,
    COALESCE(blocked.count, 0)::BIGINT as blocked_runs
  FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d(date)
  LEFT JOIN (
    SELECT 
      usage_date as agg_date,
      SUM(requests_count) as requests_count,
      SUM(tokens_input) as tokens_input,
      SUM(COALESCE(tokens_output, 0)) as tokens_output,
      SUM(total_cost) as total_cost
    FROM ai_model_usage
    WHERE usage_date BETWEEN p_start_date AND p_end_date
    GROUP BY usage_date
  ) amu ON d.date::DATE = amu.agg_date
  LEFT JOIN (
    SELECT 
      DATE(started_at) as blocked_date,
      COUNT(*) as count
    FROM workflow_execution_runs
    WHERE status = 'blocked_limit'
      AND started_at >= p_start_date
    GROUP BY DATE(started_at)
  ) blocked ON d.date::DATE = blocked.blocked_date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to get top agents by usage
CREATE OR REPLACE FUNCTION public.get_top_agents_by_usage(
  p_workspace_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  agent_id UUID,
  agent_name TEXT,
  agent_slug TEXT,
  primary_model TEXT,
  runs_24h BIGINT,
  runs_7d BIGINT,
  total_tokens BIGINT,
  total_cost NUMERIC,
  daily_run_cap INTEGER,
  daily_cost_cap_usd NUMERIC,
  blocked_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ia.id as agent_id,
    ia.name as agent_name,
    ia.slug as agent_slug,
    ia.model_preference as primary_model,
    COALESCE(stats_24h.run_count, 0)::BIGINT as runs_24h,
    COALESCE(stats_7d.run_count, 0)::BIGINT as runs_7d,
    COALESCE(stats_7d.total_tokens, 0)::BIGINT as total_tokens,
    COALESCE(stats_7d.total_cost, 0)::NUMERIC as total_cost,
    ia.daily_run_cap,
    ia.daily_cost_cap_usd,
    COALESCE(blocked.count, 0)::BIGINT as blocked_count
  FROM instincts_agents ia
  LEFT JOIN (
    SELECT 
      act.agent_id,
      COUNT(*) as run_count,
      SUM(act.tokens_used) as total_tokens,
      SUM(act.cost_usd) as total_cost
    FROM agent_cost_tracking act
    WHERE act.created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY act.agent_id
  ) stats_24h ON ia.id = stats_24h.agent_id
  LEFT JOIN (
    SELECT 
      act.agent_id,
      COUNT(*) as run_count,
      SUM(act.tokens_used) as total_tokens,
      SUM(act.cost_usd) as total_cost
    FROM agent_cost_tracking act
    WHERE act.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY act.agent_id
  ) stats_7d ON ia.id = stats_7d.agent_id
  LEFT JOIN (
    SELECT 
      iar.agent_id,
      COUNT(*) as count
    FROM instincts_agent_runs iar
    WHERE iar.status = 'blocked_limit'
      AND iar.created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY iar.agent_id
  ) blocked ON ia.id = blocked.agent_id
  WHERE ia.is_public = true OR ia.created_by IS NOT NULL
  ORDER BY COALESCE(stats_7d.total_cost, 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to get top workflows by usage
CREATE OR REPLACE FUNCTION public.get_top_workflows_by_usage(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  workflow_id UUID,
  workflow_name TEXT,
  runs_24h BIGINT,
  runs_7d BIGINT,
  total_tokens BIGINT,
  total_credits NUMERIC,
  avg_cost_per_run NUMERIC,
  daily_run_cap INTEGER,
  enabled_for_ai BOOLEAN,
  blocked_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id as workflow_id,
    w.name as workflow_name,
    COALESCE(stats_24h.run_count, 0)::BIGINT as runs_24h,
    COALESCE(stats_7d.run_count, 0)::BIGINT as runs_7d,
    COALESCE(stats_7d.total_tokens, 0)::BIGINT as total_tokens,
    COALESCE(stats_7d.total_credits, 0)::NUMERIC as total_credits,
    CASE WHEN COALESCE(stats_7d.run_count, 0) > 0 
         THEN (COALESCE(stats_7d.total_credits, 0) / stats_7d.run_count)::NUMERIC 
         ELSE 0 END as avg_cost_per_run,
    w.daily_run_cap,
    w.enabled_for_ai,
    COALESCE(blocked.count, 0)::BIGINT as blocked_count
  FROM workflows w
  LEFT JOIN (
    SELECT 
      wer.workflow_id,
      COUNT(*) as run_count,
      SUM(COALESCE(wer.credits_consumed, 0)) as total_credits,
      SUM(COALESCE(wne.total_tokens, 0)) as total_tokens
    FROM workflow_execution_runs wer
    LEFT JOIN (
      SELECT run_id, SUM(tokens_consumed) as total_tokens 
      FROM workflow_node_executions 
      GROUP BY run_id
    ) wne ON wer.id = wne.run_id
    WHERE wer.started_at >= NOW() - INTERVAL '24 hours'
    GROUP BY wer.workflow_id
  ) stats_24h ON w.id = stats_24h.workflow_id
  LEFT JOIN (
    SELECT 
      wer.workflow_id,
      COUNT(*) as run_count,
      SUM(COALESCE(wer.credits_consumed, 0)) as total_credits,
      SUM(COALESCE(wne.total_tokens, 0)) as total_tokens
    FROM workflow_execution_runs wer
    LEFT JOIN (
      SELECT run_id, SUM(tokens_consumed) as total_tokens 
      FROM workflow_node_executions 
      GROUP BY run_id
    ) wne ON wer.id = wne.run_id
    WHERE wer.started_at >= NOW() - INTERVAL '7 days'
    GROUP BY wer.workflow_id
  ) stats_7d ON w.id = stats_7d.workflow_id
  LEFT JOIN (
    SELECT 
      wer.workflow_id,
      COUNT(*) as count
    FROM workflow_execution_runs wer
    WHERE wer.status = 'blocked_limit'
      AND wer.started_at >= NOW() - INTERVAL '24 hours'
    GROUP BY wer.workflow_id
  ) blocked ON w.id = blocked.workflow_id
  WHERE p_user_id IS NULL OR w.user_id = p_user_id
  ORDER BY COALESCE(stats_7d.total_credits, 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;