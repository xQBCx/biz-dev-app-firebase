-- Enterprise Risk Register
CREATE TABLE public.enterprise_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('strategic', 'operational', 'financial', 'compliance', 'technology', 'reputational')),
  title TEXT NOT NULL,
  description TEXT,
  likelihood_score INTEGER CHECK (likelihood_score BETWEEN 1 AND 5),
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
  inherent_risk_score INTEGER GENERATED ALWAYS AS (likelihood_score * impact_score) STORED,
  residual_risk_score INTEGER,
  risk_owner_id UUID,
  risk_appetite_threshold INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'accepted', 'closed')),
  linked_deal_rooms UUID[],
  linked_workflows UUID[],
  mitigation_strategy TEXT,
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Key Risk Indicators
CREATE TABLE public.key_risk_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES public.enterprise_risks(id) ON DELETE CASCADE,
  kri_name TEXT NOT NULL,
  metric_source TEXT CHECK (metric_source IN ('crm', 'workflows', 'financial', 'compliance', 'custom')),
  current_value NUMERIC,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  unit TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  trend TEXT CHECK (trend IN ('increasing', 'stable', 'decreasing')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor Risk Assessments
CREATE TABLE public.vendor_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT NOT NULL,
  vendor_company_id UUID,
  assessment_type TEXT CHECK (assessment_type IN ('initial', 'annual', 'triggered', 'continuous')),
  overall_risk_score INTEGER CHECK (overall_risk_score BETWEEN 1 AND 100),
  soc2_status TEXT CHECK (soc2_status IN ('certified', 'in_progress', 'not_certified', 'unknown')),
  iso27001_status TEXT CHECK (iso27001_status IN ('certified', 'in_progress', 'not_certified', 'unknown')),
  gdpr_compliance TEXT CHECK (gdpr_compliance IN ('compliant', 'partial', 'non_compliant', 'unknown')),
  financial_health_score INTEGER CHECK (financial_health_score BETWEEN 1 AND 100),
  last_assessment_date DATE,
  next_assessment_date DATE,
  assessor_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Controls
CREATE TABLE public.compliance_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id TEXT UNIQUE NOT NULL,
  framework TEXT NOT NULL CHECK (framework IN ('soc2', 'iso27001', 'gdpr', 'ccpa', 'sox', 'hipaa', 'pci_dss', 'custom')),
  control_name TEXT NOT NULL,
  control_description TEXT,
  control_type TEXT CHECK (control_type IN ('preventive', 'detective', 'corrective')),
  implementation_status TEXT DEFAULT 'not_implemented' CHECK (implementation_status IN ('not_implemented', 'in_progress', 'implemented', 'not_applicable')),
  effectiveness_rating TEXT CHECK (effectiveness_rating IN ('effective', 'partially_effective', 'ineffective', 'not_tested')),
  test_frequency TEXT CHECK (test_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  last_test_date DATE,
  next_test_date DATE,
  evidence_required TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Control Testing
CREATE TABLE public.control_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID REFERENCES public.compliance_controls(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  tester_id UUID,
  test_result TEXT CHECK (test_result IN ('pass', 'fail', 'partial', 'not_applicable')),
  findings TEXT,
  remediation_required BOOLEAN DEFAULT false,
  remediation_due_date DATE,
  remediation_completed_date DATE,
  evidence_urls TEXT[],
  xodiak_anchor_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Security Incidents
CREATE TABLE public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  category TEXT CHECK (category IN ('data_breach', 'system_outage', 'unauthorized_access', 'malware', 'phishing', 'insider_threat', 'physical', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  detected_at TIMESTAMPTZ,
  reported_at TIMESTAMPTZ DEFAULT now(),
  contained_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  root_cause TEXT,
  remediation_steps TEXT,
  affected_systems TEXT[],
  affected_users_count INTEGER,
  linked_risks UUID[],
  reporter_id UUID,
  assignee_id UUID,
  lessons_learned TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insurance Policies
CREATE TABLE public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number TEXT NOT NULL,
  policy_type TEXT CHECK (policy_type IN ('cyber', 'directors_officers', 'errors_omissions', 'general_liability', 'property', 'business_interruption', 'other')),
  carrier TEXT NOT NULL,
  coverage_limit NUMERIC,
  deductible NUMERIC,
  premium_annual NUMERIC,
  effective_date DATE,
  expiration_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  covered_risks UUID[],
  broker_contact TEXT,
  policy_document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business Continuity Plans
CREATE TABLE public.continuity_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('disaster_recovery', 'business_continuity', 'incident_response', 'crisis_management')),
  critical_process TEXT,
  rto_hours INTEGER,
  rpo_hours INTEGER,
  last_test_date DATE,
  next_test_date DATE,
  test_result TEXT CHECK (test_result IN ('pass', 'fail', 'partial', 'not_tested')),
  plan_document_url TEXT,
  version TEXT,
  owner_id UUID,
  dependencies TEXT[],
  recovery_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.enterprise_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_risk_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuity_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enterprise_risks
CREATE POLICY "Authenticated users can view enterprise risks" ON public.enterprise_risks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create enterprise risks" ON public.enterprise_risks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update enterprise risks" ON public.enterprise_risks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete enterprise risks" ON public.enterprise_risks
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for key_risk_indicators
CREATE POLICY "Authenticated users can view KRIs" ON public.key_risk_indicators
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage KRIs" ON public.key_risk_indicators
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for vendor_assessments
CREATE POLICY "Authenticated users can view vendor assessments" ON public.vendor_assessments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage vendor assessments" ON public.vendor_assessments
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for compliance_controls
CREATE POLICY "Authenticated users can view compliance controls" ON public.compliance_controls
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage compliance controls" ON public.compliance_controls
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for control_tests
CREATE POLICY "Authenticated users can view control tests" ON public.control_tests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage control tests" ON public.control_tests
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for security_incidents
CREATE POLICY "Authenticated users can view security incidents" ON public.security_incidents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage security incidents" ON public.security_incidents
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for insurance_policies
CREATE POLICY "Authenticated users can view insurance policies" ON public.insurance_policies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage insurance policies" ON public.insurance_policies
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for continuity_plans
CREATE POLICY "Authenticated users can view continuity plans" ON public.continuity_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage continuity plans" ON public.continuity_plans
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_enterprise_risks_category ON public.enterprise_risks(category);
CREATE INDEX idx_enterprise_risks_status ON public.enterprise_risks(status);
CREATE INDEX idx_kri_risk_id ON public.key_risk_indicators(risk_id);
CREATE INDEX idx_vendor_assessments_score ON public.vendor_assessments(overall_risk_score);
CREATE INDEX idx_compliance_controls_framework ON public.compliance_controls(framework);
CREATE INDEX idx_control_tests_control_id ON public.control_tests(control_id);
CREATE INDEX idx_security_incidents_severity ON public.security_incidents(severity);
CREATE INDEX idx_security_incidents_status ON public.security_incidents(status);
CREATE INDEX idx_insurance_policies_type ON public.insurance_policies(policy_type);
CREATE INDEX idx_continuity_plans_type ON public.continuity_plans(plan_type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enterprise_risks_updated_at
  BEFORE UPDATE ON public.enterprise_risks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_assessments_updated_at
  BEFORE UPDATE ON public.vendor_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_controls_updated_at
  BEFORE UPDATE ON public.compliance_controls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at
  BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_continuity_plans_updated_at
  BEFORE UPDATE ON public.continuity_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();