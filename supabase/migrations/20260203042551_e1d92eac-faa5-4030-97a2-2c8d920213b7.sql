-- Phase 3A: Workflow-Agent Engine Schema Enhancements

-- 1. Add missing fields to instincts_agents
ALTER TABLE instincts_agents 
  ADD COLUMN IF NOT EXISTS impact_level text DEFAULT 'medium' 
    CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS guardrails jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_approval_for text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS model_preference text DEFAULT 'perplexity',
  ADD COLUMN IF NOT EXISTS fallback_model text DEFAULT 'gemini',
  ADD COLUMN IF NOT EXISTS max_tokens_per_run integer DEFAULT 4000,
  ADD COLUMN IF NOT EXISTS cost_ceiling_usd numeric(10,4) DEFAULT 0.50;

-- 2. Create workflow_triggers table for unified trigger management
CREATE TABLE IF NOT EXISTS workflow_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  trigger_type text NOT NULL CHECK (trigger_type IN ('schedule', 'event', 'webhook', 'manual')),
  trigger_config jsonb NOT NULL DEFAULT '{}',
  -- For scheduled: cron_expression, timezone
  -- For event: entity_type, event_name, filters
  -- For webhook: endpoint_path, auth_method
  is_active boolean DEFAULT true,
  next_run_at timestamptz,
  last_run_at timestamptz,
  run_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for scheduled trigger lookups
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_next_run 
  ON workflow_triggers(next_run_at) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow 
  ON workflow_triggers(workflow_id);

-- 3. Create workspace_settings table for cost ceilings and config
CREATE TABLE IF NOT EXISTS workspace_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, setting_key)
);

-- Insert default cost ceiling settings (will apply when workspace is created)
-- Note: Individual workspaces can override these

-- 4. Create agent_cost_tracking table for per-run cost monitoring
CREATE TABLE IF NOT EXISTS agent_cost_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid,
  agent_id uuid REFERENCES instincts_agents(id) ON DELETE SET NULL,
  run_id uuid,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  tokens_used integer DEFAULT 0,
  model_used text,
  provider text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_cost_tracking_workspace_day 
  ON agent_cost_tracking(workspace_id, created_at);

-- 5. Create approval_overrides table for custom approval routing
CREATE TABLE IF NOT EXISTS approval_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  action_type text NOT NULL,
  approver_type text NOT NULL CHECK (approver_type IN ('workspace_admin', 'specific_role', 'specific_user')),
  approver_value text, -- role name or user_id depending on approver_type
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, action_type)
);

-- 6. Enable RLS on new tables
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_overrides ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for workflow_triggers
CREATE POLICY "Users can view their workflow triggers"
  ON workflow_triggers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows w 
      WHERE w.id = workflow_triggers.workflow_id 
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their workflow triggers"
  ON workflow_triggers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workflows w 
      WHERE w.id = workflow_triggers.workflow_id 
      AND w.user_id = auth.uid()
    )
  );

-- 8. Create RLS policies for workspace_settings (admin only via service role for now)
CREATE POLICY "Authenticated users can view workspace settings"
  ON workspace_settings FOR SELECT
  TO authenticated
  USING (true);

-- 9. Create RLS policies for agent_cost_tracking
CREATE POLICY "Users can view cost tracking"
  ON agent_cost_tracking FOR SELECT
  TO authenticated
  USING (true);

-- 10. Create RLS policies for approval_overrides
CREATE POLICY "Authenticated users can view approval overrides"
  ON approval_overrides FOR SELECT
  TO authenticated
  USING (true);

-- 11. Create helper function for checking daily cost limits
CREATE OR REPLACE FUNCTION check_workspace_daily_cost(
  p_workspace_id uuid,
  p_daily_limit_usd numeric DEFAULT 10.00
)
RETURNS TABLE(
  total_cost_today numeric,
  limit_exceeded boolean,
  remaining_budget numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_cost numeric;
BEGIN
  SELECT COALESCE(SUM(cost_usd), 0)
  INTO v_total_cost
  FROM agent_cost_tracking
  WHERE workspace_id = p_workspace_id
    AND created_at >= CURRENT_DATE;
  
  RETURN QUERY SELECT 
    v_total_cost,
    v_total_cost >= p_daily_limit_usd,
    GREATEST(p_daily_limit_usd - v_total_cost, 0);
END;
$$;

-- 12. Create helper function for getting workspace cost ceiling
CREATE OR REPLACE FUNCTION get_workspace_cost_ceiling(p_workspace_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ceiling numeric;
BEGIN
  SELECT (setting_value->>'daily_limit_usd')::numeric
  INTO v_ceiling
  FROM workspace_settings
  WHERE workspace_id = p_workspace_id
    AND setting_key = 'cost_ceilings';
  
  -- Return default if not set
  RETURN COALESCE(v_ceiling, 10.00);
END;
$$;