-- ============================================================
-- PHASE 3: Agent Framework Upgrade - Execution Logging
-- ============================================================

-- Add agent type enum
DO $$ BEGIN
  CREATE TYPE public.agent_type AS ENUM ('outbound', 'enrichment', 'follow_up', 'analysis', 'automation', 'scheduling', 'research');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Upgrade instincts_agents table with ownership and versioning
ALTER TABLE public.instincts_agents 
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS agent_type public.agent_type DEFAULT 'analysis',
  ADD COLUMN IF NOT EXISTS reusable_flag BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_compute_credits NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS system_prompt TEXT,
  ADD COLUMN IF NOT EXISTS tools_config JSONB DEFAULT '[]'::jsonb;

-- Upgrade instincts_agent_runs with detailed execution logging
ALTER TABLE public.instincts_agent_runs
  ADD COLUMN IF NOT EXISTS input_summary TEXT,
  ADD COLUMN IF NOT EXISTS tools_called JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS external_apis_called JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS compute_credits_consumed NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS linked_task_id UUID,
  ADD COLUMN IF NOT EXISTS linked_opportunity_id UUID,
  ADD COLUMN IF NOT EXISTS outputs_generated JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contribution_event_id UUID,
  ADD COLUMN IF NOT EXISTS model_used TEXT,
  ADD COLUMN IF NOT EXISTS run_version TEXT;

-- Create index for faster agent run queries
CREATE INDEX IF NOT EXISTS idx_agent_runs_linked_task ON public.instincts_agent_runs(linked_task_id) WHERE linked_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_runs_linked_opportunity ON public.instincts_agent_runs(linked_opportunity_id) WHERE linked_opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_runs_contribution ON public.instincts_agent_runs(contribution_event_id) WHERE contribution_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_owner ON public.instincts_agents(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_type ON public.instincts_agents(agent_type);

-- Create agent execution summary view for dashboards
CREATE OR REPLACE VIEW public.agent_execution_summary AS
SELECT 
  a.id AS agent_id,
  a.name AS agent_name,
  a.agent_type,
  a.owner_id,
  COUNT(r.id) AS total_runs,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) AS successful_runs,
  COUNT(CASE WHEN r.status = 'failed' THEN 1 END) AS failed_runs,
  COALESCE(SUM(r.tokens_used), 0) AS total_tokens,
  COALESCE(SUM(r.compute_credits_consumed), 0) AS total_compute_credits,
  AVG(r.duration_ms)::INTEGER AS avg_duration_ms,
  MAX(r.started_at) AS last_run_at
FROM public.instincts_agents a
LEFT JOIN public.instincts_agent_runs r ON r.agent_id = a.id
GROUP BY a.id, a.name, a.agent_type, a.owner_id;

-- Function to log agent execution with automatic contribution event emission
CREATE OR REPLACE FUNCTION public.log_agent_execution(
  p_agent_id UUID,
  p_user_id UUID,
  p_trigger_type TEXT,
  p_input_summary TEXT DEFAULT NULL,
  p_tools_called JSONB DEFAULT '[]'::jsonb,
  p_external_apis JSONB DEFAULT '[]'::jsonb,
  p_tokens_used INTEGER DEFAULT 0,
  p_linked_task_id UUID DEFAULT NULL,
  p_linked_opportunity_id UUID DEFAULT NULL,
  p_model_used TEXT DEFAULT NULL,
  p_trigger_context JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run_id UUID;
  v_agent_name TEXT;
  v_agent_type TEXT;
  v_compute_credits NUMERIC(10,2);
  v_contribution_event_id UUID;
BEGIN
  -- Get agent info
  SELECT name, agent_type::TEXT, default_compute_credits 
  INTO v_agent_name, v_agent_type, v_compute_credits
  FROM instincts_agents WHERE id = p_agent_id;
  
  -- Calculate compute credits based on tokens if not set
  IF v_compute_credits IS NULL OR v_compute_credits = 0 THEN
    v_compute_credits := (p_tokens_used::NUMERIC / 1000.0);
  END IF;
  
  -- Create the agent run record
  INSERT INTO instincts_agent_runs (
    agent_id, user_id, trigger_type, status, started_at,
    input_summary, tools_called, external_apis_called, tokens_used,
    compute_credits_consumed, linked_task_id, linked_opportunity_id,
    model_used, trigger_context
  ) VALUES (
    p_agent_id, p_user_id, p_trigger_type, 'running', NOW(),
    p_input_summary, p_tools_called, p_external_apis, p_tokens_used,
    v_compute_credits, p_linked_task_id, p_linked_opportunity_id,
    p_model_used, p_trigger_context
  ) RETURNING id INTO v_run_id;
  
  -- Emit contribution event for the agent execution
  v_contribution_event_id := emit_contribution_event(
    p_actor_type := 'agent',
    p_actor_id := p_agent_id,
    p_event_type := 'agent_executed',
    p_event_description := 'Agent executed: ' || v_agent_name,
    p_payload := jsonb_build_object(
      'run_id', v_run_id,
      'agent_type', v_agent_type,
      'tokens_used', p_tokens_used,
      'tools_called', p_tools_called
    ),
    p_workspace_id := NULL,
    p_opportunity_id := p_linked_opportunity_id,
    p_task_id := p_linked_task_id,
    p_deal_room_id := NULL,
    p_compute_credits := v_compute_credits,
    p_action_credits := 1,
    p_outcome_credits := 0,
    p_attribution_tags := ARRAY[v_agent_type, 'agent_run'],
    p_value_category := 'automation'
  );
  
  -- Link contribution event to run
  UPDATE instincts_agent_runs 
  SET contribution_event_id = v_contribution_event_id
  WHERE id = v_run_id;
  
  RETURN v_run_id;
END;
$$;

-- Function to complete an agent run
CREATE OR REPLACE FUNCTION public.complete_agent_run(
  p_run_id UUID,
  p_status TEXT,
  p_result JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_outputs_generated JSONB DEFAULT '{}'::jsonb,
  p_additional_tokens INTEGER DEFAULT 0
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_started_at TIMESTAMPTZ;
  v_duration_ms INTEGER;
BEGIN
  -- Get start time
  SELECT started_at INTO v_started_at FROM instincts_agent_runs WHERE id = p_run_id;
  
  IF v_started_at IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate duration
  v_duration_ms := EXTRACT(EPOCH FROM (NOW() - v_started_at)) * 1000;
  
  -- Update the run record
  UPDATE instincts_agent_runs SET
    status = p_status,
    completed_at = NOW(),
    duration_ms = v_duration_ms,
    result = p_result,
    error_message = p_error_message,
    outputs_generated = p_outputs_generated,
    tokens_used = tokens_used + p_additional_tokens,
    compute_credits_consumed = compute_credits_consumed + (p_additional_tokens::NUMERIC / 1000.0)
  WHERE id = p_run_id;
  
  -- Update user agent stats
  UPDATE instincts_user_agents ua
  SET 
    run_count = run_count + 1,
    last_run_at = NOW()
  FROM instincts_agent_runs r
  WHERE r.id = p_run_id
    AND ua.agent_id = r.agent_id 
    AND ua.user_id = r.user_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_agent_execution TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_agent_run TO authenticated;
GRANT SELECT ON public.agent_execution_summary TO authenticated;