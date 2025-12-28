-- =====================================================
-- ENTERPRISE AI SECURITY GOVERNANCE INFRASTRUCTURE
-- Based on ISO 42001, NIST AI RMF, EU AI Act, CSA MAESTRO
-- Implements 8 Governance Principles + 7-Layer Architecture
-- =====================================================

-- AI Governance Compliance Tracking
CREATE TABLE public.ai_governance_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework TEXT NOT NULL,
  control_id TEXT NOT NULL,
  control_name TEXT NOT NULL,
  control_description TEXT,
  implementation_status TEXT DEFAULT 'not_started',
  evidence_url TEXT,
  last_assessment_at TIMESTAMPTZ,
  next_assessment_at TIMESTAMPTZ,
  risk_level TEXT DEFAULT 'medium',
  responsible_role TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Risk Register (NIST AI RMF aligned)
CREATE TABLE public.ai_risk_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL UNIQUE,
  risk_category TEXT NOT NULL,
  risk_title TEXT NOT NULL,
  risk_description TEXT NOT NULL,
  likelihood_score INTEGER CHECK (likelihood_score BETWEEN 1 AND 5),
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood_score * impact_score) STORED,
  mitigation_strategy TEXT,
  mitigation_status TEXT DEFAULT 'open',
  risk_owner_id UUID REFERENCES auth.users(id),
  related_agent_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Agent Security Registry (7-Layer Architecture)
CREATE TABLE public.ai_agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  agent_slug TEXT NOT NULL UNIQUE,
  agent_type TEXT NOT NULL,
  architecture_layer INTEGER CHECK (architecture_layer BETWEEN 1 AND 7),
  security_classification TEXT DEFAULT 'internal',
  impact_level INTEGER DEFAULT 2 CHECK (impact_level BETWEEN 1 AND 5),
  rbac_roles TEXT[] DEFAULT '{}',
  resource_limits JSONB DEFAULT '{"max_tokens": 10000, "max_requests_per_minute": 60, "max_cpu_seconds": 30}',
  rate_limit_config JSONB DEFAULT '{"requests_per_minute": 60, "burst_limit": 10}',
  validation_rules JSONB DEFAULT '{}',
  authentication_required BOOLEAN DEFAULT true,
  data_isolation_level TEXT DEFAULT 'user',
  human_oversight_required BOOLEAN DEFAULT false,
  anomaly_detection_enabled BOOLEAN DEFAULT true,
  audit_enabled BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Security Events (SIEM-style logging)
CREATE TABLE public.ai_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  event_source TEXT NOT NULL,
  event_action TEXT NOT NULL,
  event_outcome TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  event_data JSONB DEFAULT '{}',
  threat_indicators JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Data Lineage Tracking
CREATE TABLE public.ai_data_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_id TEXT NOT NULL,
  data_source TEXT NOT NULL,
  data_type TEXT NOT NULL,
  classification TEXT DEFAULT 'internal',
  transformation_chain JSONB DEFAULT '[]',
  access_history JSONB DEFAULT '[]',
  retention_policy TEXT DEFAULT '90_days',
  pii_detected BOOLEAN DEFAULT false,
  pii_types TEXT[] DEFAULT '{}',
  encryption_status TEXT DEFAULT 'encrypted',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- AI Access Control Policies (RBAC + ABAC)
CREATE TABLE public.ai_access_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  allowed_roles TEXT[] DEFAULT '{}',
  allowed_permissions TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  time_restrictions JSONB,
  priority INTEGER DEFAULT 100,
  action TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Threat Intelligence
CREATE TABLE public.ai_threat_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_type TEXT NOT NULL,
  threat_name TEXT NOT NULL,
  threat_description TEXT NOT NULL,
  detection_pattern JSONB,
  ioc_indicators JSONB DEFAULT '{}',
  mitigation_actions TEXT[],
  severity TEXT DEFAULT 'medium',
  active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  occurrence_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Guardrail Configurations
CREATE TABLE public.ai_guardrails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardrail_name TEXT NOT NULL,
  guardrail_type TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  agent_id UUID REFERENCES public.ai_agent_registry(id),
  enforcement_level TEXT DEFAULT 'block',
  bypass_roles TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  triggered_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Model Governance
CREATE TABLE public.ai_model_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  model_provider TEXT NOT NULL,
  model_version TEXT,
  model_type TEXT NOT NULL,
  approval_status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  use_cases_allowed TEXT[],
  data_restrictions TEXT[],
  risk_assessment JSONB,
  performance_metrics JSONB,
  cost_per_1k_tokens DECIMAL(10, 6),
  last_audit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Incident Response
CREATE TABLE public.ai_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL UNIQUE,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_systems TEXT[],
  affected_users_count INTEGER DEFAULT 0,
  root_cause TEXT,
  resolution TEXT,
  lessons_learned TEXT,
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  detected_at TIMESTAMPTZ NOT NULL,
  contained_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Security Profiles (Enhanced)
CREATE TABLE public.user_security_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  security_clearance TEXT DEFAULT 'basic',
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_methods TEXT[] DEFAULT '{}',
  allowed_ip_ranges INET[] DEFAULT '{}',
  session_timeout_minutes INTEGER DEFAULT 30,
  max_concurrent_sessions INTEGER DEFAULT 3,
  last_security_training_at TIMESTAMPTZ,
  security_training_status TEXT DEFAULT 'required',
  risk_score INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login_at TIMESTAMPTZ,
  account_locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_governance_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_data_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_access_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_guardrails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has admin role (using existing app_role enum)
CREATE OR REPLACE FUNCTION public.is_security_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'admin'::app_role
  );
$$;

-- Helper function to check if user has manager-level access (admin, auditor, regulator)
CREATE OR REPLACE FUNCTION public.is_security_manager(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role IN ('admin'::app_role, 'auditor'::app_role, 'regulator'::app_role)
  );
$$;

-- RLS Policies
CREATE POLICY "governance_compliance_select" ON public.ai_governance_compliance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "governance_compliance_admin" ON public.ai_governance_compliance
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));

CREATE POLICY "risk_register_select" ON public.ai_risk_register
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "risk_register_modify" ON public.ai_risk_register
  FOR ALL TO authenticated USING (public.is_security_manager(auth.uid()));

CREATE POLICY "agent_registry_select" ON public.ai_agent_registry
  FOR SELECT TO authenticated USING (active = true OR created_by = auth.uid());
CREATE POLICY "agent_registry_admin" ON public.ai_agent_registry
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));

CREATE POLICY "security_events_user" ON public.ai_security_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "security_events_admin" ON public.ai_security_events
  FOR SELECT TO authenticated USING (public.is_security_admin(auth.uid()));
CREATE POLICY "security_events_insert" ON public.ai_security_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "data_lineage_select" ON public.ai_data_lineage
  FOR SELECT TO authenticated USING (created_by = auth.uid() OR classification = 'public');
CREATE POLICY "data_lineage_admin" ON public.ai_data_lineage
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));

CREATE POLICY "access_policies_select" ON public.ai_access_policies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "access_policies_admin" ON public.ai_access_policies
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));

CREATE POLICY "threat_intel_select" ON public.ai_threat_intelligence
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "threat_intel_admin" ON public.ai_threat_intelligence
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));

CREATE POLICY "guardrails_select" ON public.ai_guardrails
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "guardrails_admin" ON public.ai_guardrails
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));

CREATE POLICY "model_governance_select" ON public.ai_model_governance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "model_governance_admin" ON public.ai_model_governance
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));

CREATE POLICY "incidents_select" ON public.ai_incidents
  FOR SELECT TO authenticated USING (
    reported_by = auth.uid() OR assigned_to = auth.uid() OR public.is_security_manager(auth.uid())
  );
CREATE POLICY "incidents_insert" ON public.ai_incidents
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "incidents_update" ON public.ai_incidents
  FOR UPDATE TO authenticated USING (
    assigned_to = auth.uid() OR public.is_security_admin(auth.uid())
  );

CREATE POLICY "security_profiles_own" ON public.user_security_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "security_profiles_admin" ON public.user_security_profiles
  FOR ALL TO authenticated USING (public.is_security_admin(auth.uid()));
CREATE POLICY "security_profiles_insert" ON public.user_security_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_security_events_type ON public.ai_security_events(event_type);
CREATE INDEX idx_security_events_user ON public.ai_security_events(user_id);
CREATE INDEX idx_security_events_created ON public.ai_security_events(created_at DESC);
CREATE INDEX idx_security_events_severity ON public.ai_security_events(severity);
CREATE INDEX idx_agent_registry_slug ON public.ai_agent_registry(agent_slug);
CREATE INDEX idx_risk_register_category ON public.ai_risk_register(risk_category);
CREATE INDEX idx_incidents_status ON public.ai_incidents(status);
CREATE INDEX idx_data_lineage_classification ON public.ai_data_lineage(classification);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_event_source TEXT,
  p_event_action TEXT,
  p_event_outcome TEXT,
  p_event_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.ai_security_events (
    event_type, severity, event_source, event_action, event_outcome, 
    user_id, event_data
  ) VALUES (
    p_event_type, p_severity, p_event_source, p_event_action, p_event_outcome,
    auth.uid(), p_event_data
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to check access policy
CREATE OR REPLACE FUNCTION public.check_access_policy(
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_policy RECORD;
  v_allowed BOOLEAN := false;
BEGIN
  SELECT role::text INTO v_user_role FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
  
  FOR v_policy IN 
    SELECT * FROM public.ai_access_policies 
    WHERE resource_type = p_resource_type 
      AND (resource_id IS NULL OR resource_id = p_resource_id)
      AND active = true
    ORDER BY priority ASC
  LOOP
    IF v_user_role = ANY(v_policy.allowed_roles) THEN
      IF v_policy.action = 'allow' THEN
        v_allowed := true;
        EXIT;
      ELSIF v_policy.action = 'deny' THEN
        v_allowed := false;
        EXIT;
      END IF;
    END IF;
  END LOOP;
  
  PERFORM public.log_security_event(
    'authorization',
    CASE WHEN v_allowed THEN 'info' ELSE 'warning' END,
    'access_control',
    p_action,
    CASE WHEN v_allowed THEN 'success' ELSE 'blocked' END,
    jsonb_build_object('resource_type', p_resource_type, 'resource_id', p_resource_id, 'user_role', v_user_role)
  );
  
  RETURN v_allowed;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_governance_compliance
  BEFORE UPDATE ON public.ai_governance_compliance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_risk_register
  BEFORE UPDATE ON public.ai_risk_register
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_agent_registry
  BEFORE UPDATE ON public.ai_agent_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_access_policies
  BEFORE UPDATE ON public.ai_access_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_guardrails
  BEFORE UPDATE ON public.ai_guardrails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_model_governance
  BEFORE UPDATE ON public.ai_model_governance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_incidents
  BEFORE UPDATE ON public.ai_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_security_profiles
  BEFORE UPDATE ON public.user_security_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();