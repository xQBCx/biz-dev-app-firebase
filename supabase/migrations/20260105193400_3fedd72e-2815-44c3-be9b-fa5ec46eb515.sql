-- Phase 1: Extend crm_activities (tasks) with contribution fields
-- ==================================================================

-- Create enum for task types
DO $$ BEGIN
  CREATE TYPE public.task_contributor_type AS ENUM ('human', 'agent', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for value categories
DO $$ BEGIN
  CREATE TYPE public.task_value_category AS ENUM (
    'lead', 'meeting', 'sale', 'ip', 'architecture', 
    'ops', 'research', 'outreach', 'analysis', 'automation'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add contribution tracking fields to crm_activities
ALTER TABLE public.crm_activities 
ADD COLUMN IF NOT EXISTS task_type public.task_contributor_type DEFAULT 'human',
ADD COLUMN IF NOT EXISTS value_category public.task_value_category,
ADD COLUMN IF NOT EXISTS linked_opportunity_id uuid REFERENCES public.crm_deals(id),
ADD COLUMN IF NOT EXISTS linked_agent_id uuid REFERENCES public.instincts_agents(id),
ADD COLUMN IF NOT EXISTS estimated_value_weight numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS requires_xodiak_log boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS contribution_emitted boolean DEFAULT false;

-- Create indexes for contribution queries
CREATE INDEX IF NOT EXISTS idx_activities_task_type ON public.crm_activities(task_type);
CREATE INDEX IF NOT EXISTS idx_activities_value_category ON public.crm_activities(value_category);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity ON public.crm_activities(linked_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_agent ON public.crm_activities(linked_agent_id);


-- Phase 2: Contribution Event Log
-- ================================

-- Create enum for actor types
DO $$ BEGIN
  CREATE TYPE public.actor_type AS ENUM ('human', 'agent', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for event types
DO $$ BEGIN
  CREATE TYPE public.contribution_event_type AS ENUM (
    -- Task events
    'task_created', 'task_completed', 'task_assigned', 'task_updated',
    -- Outreach events
    'email_drafted', 'email_sent', 'call_made', 'meeting_scheduled', 'meeting_held',
    -- Deal events
    'lead_qualified', 'deal_created', 'deal_advanced', 'deal_closed_won', 'deal_closed_lost',
    -- Content events
    'content_created', 'document_authored', 'ip_submitted',
    -- Agent events
    'agent_executed', 'agent_suggestion', 'agent_automation',
    -- System events
    'data_enriched', 'integration_synced', 'workflow_triggered'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Main Contribution Event Log table
CREATE TABLE IF NOT EXISTS public.contribution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  workspace_id uuid REFERENCES public.clients(id),
  opportunity_id uuid REFERENCES public.crm_deals(id),
  task_id uuid REFERENCES public.crm_activities(id),
  deal_room_id uuid REFERENCES public.deal_rooms(id),
  
  -- Actor
  actor_type public.actor_type NOT NULL,
  actor_id uuid NOT NULL, -- user_id or agent_id depending on actor_type
  
  -- Event
  event_type public.contribution_event_type NOT NULL,
  event_description text,
  payload jsonb DEFAULT '{}',
  
  -- Credits (three parallel meters)
  compute_credits numeric DEFAULT 0, -- tokens, API calls, runtime
  action_credits numeric DEFAULT 0,  -- emails, tasks, enrichments
  outcome_credits numeric DEFAULT 0, -- meetings, deals, revenue
  
  -- Attribution
  attribution_tags text[] DEFAULT '{}',
  attribution_weight numeric DEFAULT 1.0,
  value_category public.task_value_category,
  
  -- XODIAK anchoring
  requires_xodiak_log boolean DEFAULT true,
  xodiak_anchor_status text DEFAULT 'pending', -- pending, queued, anchored, skipped
  event_hash text, -- SHA-256 hash of event data
  xodiak_tx_hash text, -- Reference to XODIAK transaction
  merkle_batch_id uuid, -- For batched anchoring
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  anchored_at timestamptz,
  
  CONSTRAINT valid_credits CHECK (
    compute_credits >= 0 AND action_credits >= 0 AND outcome_credits >= 0
  )
);

-- Enable RLS
ALTER TABLE public.contribution_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contribution_events
CREATE POLICY "Users can view their own contribution events"
  ON public.contribution_events FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid() OR 
         workspace_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR
         public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert contribution events"
  ON public.contribution_events FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contribution events"
  ON public.contribution_events FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for contribution_events
CREATE INDEX IF NOT EXISTS idx_contrib_actor ON public.contribution_events(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_contrib_event_type ON public.contribution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_contrib_opportunity ON public.contribution_events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_contrib_task ON public.contribution_events(task_id);
CREATE INDEX IF NOT EXISTS idx_contrib_workspace ON public.contribution_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contrib_anchor_status ON public.contribution_events(xodiak_anchor_status);
CREATE INDEX IF NOT EXISTS idx_contrib_created ON public.contribution_events(created_at DESC);


-- Credit Balances (aggregated view per actor)
-- =============================================

CREATE TABLE IF NOT EXISTS public.credit_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner
  entity_type text NOT NULL, -- 'user', 'agent', 'workspace'
  entity_id uuid NOT NULL,
  
  -- Period (for time-windowed queries)
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  -- Credit meters
  compute_credits_earned numeric DEFAULT 0,
  compute_credits_used numeric DEFAULT 0,
  action_credits_earned numeric DEFAULT 0,
  action_credits_used numeric DEFAULT 0,
  outcome_credits_earned numeric DEFAULT 0,
  outcome_credits_used numeric DEFAULT 0,
  
  -- Aggregations
  total_events integer DEFAULT 0,
  last_event_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(entity_type, entity_id, period_start, period_end)
);

ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit balances"
  ON public.credit_balances FOR SELECT
  TO authenticated
  USING (
    (entity_type = 'user' AND entity_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can manage credit balances"
  ON public.credit_balances FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- XODIAK Anchoring Queue (Threshold-based)
-- =========================================

CREATE TABLE IF NOT EXISTS public.xodiak_anchor_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event reference
  contribution_event_id uuid REFERENCES public.contribution_events(id),
  
  -- Anchoring data
  event_hash text NOT NULL,
  combined_value numeric DEFAULT 0, -- compute + action + outcome for threshold
  
  -- Status
  status text DEFAULT 'pending', -- pending, approved, anchored, skipped
  requires_approval boolean DEFAULT false, -- true if above threshold
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  -- Merkle batching
  merkle_batch_id uuid,
  merkle_root text,
  merkle_proof jsonb,
  
  -- XODIAK reference
  xodiak_block_number bigint,
  xodiak_tx_hash text,
  anchored_at timestamptz,
  
  -- Config
  anchor_threshold numeric DEFAULT 10.0, -- Auto-anchor if combined_value < threshold
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.xodiak_anchor_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view anchor queue"
  ON public.xodiak_anchor_queue FOR SELECT
  TO authenticated
  USING (
    contribution_event_id IN (
      SELECT id FROM public.contribution_events WHERE actor_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage anchor queue"
  ON public.xodiak_anchor_queue FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- Function to emit contribution event
-- ====================================

CREATE OR REPLACE FUNCTION public.emit_contribution_event(
  p_actor_type public.actor_type,
  p_actor_id uuid,
  p_event_type public.contribution_event_type,
  p_event_description text DEFAULT NULL,
  p_payload jsonb DEFAULT '{}',
  p_workspace_id uuid DEFAULT NULL,
  p_opportunity_id uuid DEFAULT NULL,
  p_task_id uuid DEFAULT NULL,
  p_deal_room_id uuid DEFAULT NULL,
  p_compute_credits numeric DEFAULT 0,
  p_action_credits numeric DEFAULT 0,
  p_outcome_credits numeric DEFAULT 0,
  p_attribution_tags text[] DEFAULT '{}',
  p_value_category public.task_value_category DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_event_hash text;
  v_combined_value numeric;
  v_requires_approval boolean;
  v_anchor_threshold numeric := 10.0; -- Configurable threshold
BEGIN
  -- Generate event hash (SHA-256 simulation using MD5 for now)
  v_event_hash := '0x' || MD5(
    p_actor_type::text || 
    p_actor_id::text || 
    p_event_type::text || 
    COALESCE(p_payload::text, '') ||
    CLOCK_TIMESTAMP()::text
  );
  
  -- Calculate combined value for threshold check
  v_combined_value := COALESCE(p_compute_credits, 0) + COALESCE(p_action_credits, 0) + COALESCE(p_outcome_credits, 0);
  v_requires_approval := v_combined_value >= v_anchor_threshold;
  
  -- Insert contribution event
  INSERT INTO public.contribution_events (
    actor_type, actor_id, event_type, event_description, payload,
    workspace_id, opportunity_id, task_id, deal_room_id,
    compute_credits, action_credits, outcome_credits,
    attribution_tags, value_category,
    event_hash,
    xodiak_anchor_status
  ) VALUES (
    p_actor_type, p_actor_id, p_event_type, p_event_description, p_payload,
    p_workspace_id, p_opportunity_id, p_task_id, p_deal_room_id,
    p_compute_credits, p_action_credits, p_outcome_credits,
    p_attribution_tags, p_value_category,
    v_event_hash,
    CASE WHEN v_requires_approval THEN 'pending' ELSE 'queued' END
  )
  RETURNING id INTO v_event_id;
  
  -- Queue for XODIAK anchoring
  INSERT INTO public.xodiak_anchor_queue (
    contribution_event_id,
    event_hash,
    combined_value,
    requires_approval,
    status
  ) VALUES (
    v_event_id,
    v_event_hash,
    v_combined_value,
    v_requires_approval,
    CASE WHEN v_requires_approval THEN 'pending' ELSE 'pending' END
  );
  
  -- Update credit balances (current month)
  INSERT INTO public.credit_balances (
    entity_type, entity_id,
    period_start, period_end,
    compute_credits_earned, action_credits_earned, outcome_credits_earned,
    total_events, last_event_at
  ) VALUES (
    CASE WHEN p_actor_type = 'agent' THEN 'agent' ELSE 'user' END,
    p_actor_id,
    DATE_TRUNC('month', CURRENT_DATE)::date,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date,
    p_compute_credits,
    p_action_credits,
    p_outcome_credits,
    1,
    NOW()
  )
  ON CONFLICT (entity_type, entity_id, period_start, period_end)
  DO UPDATE SET
    compute_credits_earned = credit_balances.compute_credits_earned + EXCLUDED.compute_credits_earned,
    action_credits_earned = credit_balances.action_credits_earned + EXCLUDED.action_credits_earned,
    outcome_credits_earned = credit_balances.outcome_credits_earned + EXCLUDED.outcome_credits_earned,
    total_events = credit_balances.total_events + 1,
    last_event_at = NOW(),
    updated_at = NOW();
  
  RETURN v_event_id;
END;
$$;


-- Function to auto-anchor low-value events
-- =========================================

CREATE OR REPLACE FUNCTION public.process_auto_anchor_queue()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anchored_count integer := 0;
  v_batch_id uuid;
  v_merkle_root text;
BEGIN
  -- Generate batch ID
  v_batch_id := gen_random_uuid();
  
  -- Generate simple merkle root (hash of all event hashes)
  SELECT '0x' || MD5(STRING_AGG(event_hash, ''))
  INTO v_merkle_root
  FROM public.xodiak_anchor_queue
  WHERE status = 'pending' AND requires_approval = false;
  
  -- Update all auto-anchor events
  UPDATE public.xodiak_anchor_queue
  SET 
    status = 'anchored',
    merkle_batch_id = v_batch_id,
    merkle_root = v_merkle_root,
    anchored_at = NOW(),
    updated_at = NOW()
  WHERE status = 'pending' AND requires_approval = false;
  
  GET DIAGNOSTICS v_anchored_count = ROW_COUNT;
  
  -- Update corresponding contribution events
  UPDATE public.contribution_events
  SET 
    xodiak_anchor_status = 'anchored',
    merkle_batch_id = v_batch_id,
    anchored_at = NOW()
  WHERE id IN (
    SELECT contribution_event_id 
    FROM public.xodiak_anchor_queue 
    WHERE merkle_batch_id = v_batch_id
  );
  
  RETURN v_anchored_count;
END;
$$;


-- Enable realtime for contribution events
ALTER PUBLICATION supabase_realtime ADD TABLE public.contribution_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xodiak_anchor_queue;