-- Phase 2: Entity API Framework
-- Creates the digital interface layer that wraps company SOPs as standardized API endpoints

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Entity API action types - standardized business actions
CREATE TYPE public.entity_api_type AS ENUM (
  'publish_work_order', 
  'submit_bid', 
  'accept_bid', 
  'reject_bid', 
  'approve_completion', 
  'reject_completion',
  'submit_invoice', 
  'approve_invoice', 
  'issue_payment',
  'issue_change_order', 
  'approve_change_order',
  'confirm_delivery', 
  'report_issue', 
  'custom'
);

-- Authentication types for entity APIs
CREATE TYPE public.entity_auth_type AS ENUM (
  'api_key', 
  'oauth2', 
  'jwt', 
  'basic', 
  'none'
);

-- Sources that can bind to smart contracts
CREATE TYPE public.binding_source_type AS ENUM (
  'oracle_feed', 
  'entity_api', 
  'attestation', 
  'manual'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Entity API Endpoints: Registered API endpoints for each company
CREATE TABLE public.entity_api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  endpoint_name TEXT NOT NULL,
  endpoint_type public.entity_api_type NOT NULL DEFAULT 'custom',
  http_method TEXT NOT NULL DEFAULT 'POST' CHECK (http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  endpoint_path TEXT NOT NULL,
  base_url TEXT NOT NULL,
  request_schema JSONB DEFAULT '{}',
  response_schema JSONB DEFAULT '{}',
  auth_type public.entity_auth_type NOT NULL DEFAULT 'api_key',
  auth_config JSONB DEFAULT '{}', -- Encrypted credentials reference
  webhook_url TEXT,
  headers_template JSONB DEFAULT '{}',
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  retry_config JSONB DEFAULT '{"max_retries": 3, "backoff_ms": 1000}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_invoked_at TIMESTAMPTZ,
  invocation_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entity SOP Mappings: Maps SOP documents to their trigger points
CREATE TABLE public.entity_sop_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  sop_name TEXT NOT NULL,
  sop_description TEXT,
  sop_document_url TEXT,
  sop_version TEXT DEFAULT '1.0',
  trigger_points JSONB NOT NULL DEFAULT '[]', -- Array of {name, description, gate_type, sequence}
  mapped_api_endpoints UUID[] DEFAULT '{}',
  ai_extracted BOOLEAN NOT NULL DEFAULT false,
  ai_extraction_confidence NUMERIC(5,2),
  ai_extraction_log JSONB,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entity API Call Logs: Audit trail of all API invocations
CREATE TABLE public.entity_api_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES public.entity_api_endpoints(id) ON DELETE CASCADE,
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  settlement_contract_id UUID REFERENCES public.settlement_contracts(id) ON DELETE SET NULL,
  invoked_by UUID NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  response_status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  triggered_bindings UUID[] DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Smart Contract Bindings: Links oracles/APIs to settlement contracts
CREATE TABLE public.smart_contract_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_contract_id UUID NOT NULL REFERENCES public.settlement_contracts(id) ON DELETE CASCADE,
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  binding_name TEXT NOT NULL,
  binding_description TEXT,
  binding_source_type public.binding_source_type NOT NULL,
  binding_source_id UUID NOT NULL, -- Can reference oracle_data_feeds, entity_api_endpoints, or attestation configs
  condition_expression TEXT NOT NULL, -- e.g., "response.status == 'approved' && response.amount > 0"
  action_on_trigger TEXT NOT NULL DEFAULT 'execute_settlement', -- What to do when triggered
  action_payload_template JSONB DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 1, -- Lower = higher priority
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_evaluated_at TIMESTAMPTZ,
  last_triggered_at TIMESTAMPTZ,
  evaluation_count INTEGER NOT NULL DEFAULT 0,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_entity_api_endpoints_entity ON public.entity_api_endpoints(entity_id);
CREATE INDEX idx_entity_api_endpoints_type ON public.entity_api_endpoints(endpoint_type);
CREATE INDEX idx_entity_api_endpoints_active ON public.entity_api_endpoints(is_active) WHERE is_active = true;

CREATE INDEX idx_entity_sop_mappings_entity ON public.entity_sop_mappings(entity_id);
CREATE INDEX idx_entity_sop_mappings_status ON public.entity_sop_mappings(review_status);

CREATE INDEX idx_entity_api_call_logs_endpoint ON public.entity_api_call_logs(endpoint_id);
CREATE INDEX idx_entity_api_call_logs_deal_room ON public.entity_api_call_logs(deal_room_id);
CREATE INDEX idx_entity_api_call_logs_created ON public.entity_api_call_logs(created_at DESC);
CREATE INDEX idx_entity_api_call_logs_success ON public.entity_api_call_logs(success);

CREATE INDEX idx_smart_contract_bindings_contract ON public.smart_contract_bindings(settlement_contract_id);
CREATE INDEX idx_smart_contract_bindings_deal_room ON public.smart_contract_bindings(deal_room_id);
CREATE INDEX idx_smart_contract_bindings_source ON public.smart_contract_bindings(binding_source_type, binding_source_id);
CREATE INDEX idx_smart_contract_bindings_active ON public.smart_contract_bindings(is_active) WHERE is_active = true;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_entity_api_endpoints_updated_at
  BEFORE UPDATE ON public.entity_api_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_sop_mappings_updated_at
  BEFORE UPDATE ON public.entity_sop_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_contract_bindings_updated_at
  BEFORE UPDATE ON public.smart_contract_bindings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.entity_api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_sop_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_api_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contract_bindings ENABLE ROW LEVEL SECURITY;

-- Entity API Endpoints policies
CREATE POLICY "Entity API endpoints are viewable by entity members"
  ON public.entity_api_endpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.id = entity_api_endpoints.entity_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Entity API endpoints can be created by entity members"
  ON public.entity_api_endpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.id = entity_api_endpoints.entity_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Entity API endpoints can be updated by entity members"
  ON public.entity_api_endpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.id = entity_api_endpoints.entity_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Entity API endpoints can be deleted by entity members"
  ON public.entity_api_endpoints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.id = entity_api_endpoints.entity_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Entity SOP Mappings policies
CREATE POLICY "SOP mappings are viewable by entity members"
  ON public.entity_sop_mappings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.id = entity_sop_mappings.entity_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "SOP mappings can be created by entity members"
  ON public.entity_sop_mappings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.id = entity_sop_mappings.entity_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "SOP mappings can be updated by entity members"
  ON public.entity_sop_mappings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.id = entity_sop_mappings.entity_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- API Call Logs policies (read-only for audit purposes)
CREATE POLICY "API call logs are viewable by entity members"
  ON public.entity_api_call_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.entity_api_endpoints eae
      JOIN public.deal_room_participants drp ON drp.id = eae.entity_id
      WHERE eae.id = entity_api_call_logs.endpoint_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "API call logs can be created by system"
  ON public.entity_api_call_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Smart Contract Bindings policies
CREATE POLICY "Bindings are viewable by deal room participants"
  ON public.smart_contract_bindings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = smart_contract_bindings.deal_room_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Bindings can be created by deal room participants"
  ON public.smart_contract_bindings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = smart_contract_bindings.deal_room_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Bindings can be updated by deal room participants"
  ON public.smart_contract_bindings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = smart_contract_bindings.deal_room_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Bindings can be deleted by deal room participants"
  ON public.smart_contract_bindings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = smart_contract_bindings.deal_room_id
      AND drp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.entity_api_endpoints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_contract_bindings;