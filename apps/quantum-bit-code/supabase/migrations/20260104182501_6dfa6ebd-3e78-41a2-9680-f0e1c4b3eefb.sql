-- IP Projects table for patents, trademarks, copyrights
CREATE TABLE public.ip_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('patent', 'trademark', 'copyright')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'filed', 'granted', 'registered', 'rejected', 'abandoned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  filing_date DATE,
  grant_date DATE,
  expiration_date DATE,
  registration_number TEXT,
  jurisdiction TEXT,
  assigned_to UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IP Tasks for tracking work items within projects
CREATE TABLE public.ip_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.ip_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date DATE,
  assigned_to UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data Rights Requests (GDPR/CCPA)
CREATE TABLE public.data_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'access', 'rectification', 'portability', 'objection')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  reason TEXT,
  admin_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance checks tracking
CREATE TABLE public.compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework TEXT NOT NULL,
  control_id TEXT NOT NULL,
  control_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'compliant', 'non_compliant', 'partial', 'not_applicable')),
  evidence_url TEXT,
  notes TEXT,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  checked_by UUID,
  next_review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Canonical Glyph Registry (add column to existing glyph_claims)
ALTER TABLE public.glyph_claims 
ADD COLUMN is_canonical BOOLEAN DEFAULT false,
ADD COLUMN canonical_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN canonical_by UUID,
ADD COLUMN canonical_notes TEXT;

-- Enable RLS
ALTER TABLE public.ip_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- IP Projects policies (admin only)
CREATE POLICY "Admins can manage IP projects"
ON public.ip_projects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all IP projects"
ON public.ip_projects FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- IP Tasks policies (admin only)
CREATE POLICY "Admins can manage IP tasks"
ON public.ip_tasks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Data Requests policies
CREATE POLICY "Users can create their own data requests"
ON public.data_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own data requests"
ON public.data_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all data requests"
ON public.data_requests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Compliance Checks policies (admin only)
CREATE POLICY "Admins can manage compliance checks"
ON public.compliance_checks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view compliance checks"
ON public.compliance_checks FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_ip_projects_updated_at
  BEFORE UPDATE ON public.ip_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ip_tasks_updated_at
  BEFORE UPDATE ON public.ip_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_requests_updated_at
  BEFORE UPDATE ON public.data_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_checks_updated_at
  BEFORE UPDATE ON public.compliance_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default compliance framework controls
INSERT INTO public.compliance_checks (framework, control_id, control_name, status) VALUES
-- ISO 27001
('ISO 27001', 'A.5', 'Information Security Policies', 'not_started'),
('ISO 27001', 'A.6', 'Organization of Information Security', 'not_started'),
('ISO 27001', 'A.7', 'Human Resource Security', 'not_started'),
('ISO 27001', 'A.8', 'Asset Management', 'not_started'),
('ISO 27001', 'A.9', 'Access Control', 'partial'),
('ISO 27001', 'A.10', 'Cryptography', 'in_progress'),
('ISO 27001', 'A.12', 'Operations Security', 'not_started'),
('ISO 27001', 'A.14', 'System Development Security', 'partial'),
-- SOC 2 Type II
('SOC 2', 'CC1', 'Control Environment', 'not_started'),
('SOC 2', 'CC2', 'Communication and Information', 'not_started'),
('SOC 2', 'CC3', 'Risk Assessment', 'not_started'),
('SOC 2', 'CC5', 'Control Activities', 'not_started'),
('SOC 2', 'CC6', 'Logical and Physical Access', 'partial'),
('SOC 2', 'CC7', 'System Operations', 'not_started'),
('SOC 2', 'CC8', 'Change Management', 'not_started'),
('SOC 2', 'CC9', 'Risk Mitigation', 'not_started'),
-- NIST PQC
('NIST PQC', 'PQ-1', 'Algorithm Selection', 'in_progress'),
('NIST PQC', 'PQ-2', 'Key Management', 'not_started'),
('NIST PQC', 'PQ-3', 'Implementation Security', 'not_started'),
('NIST PQC', 'PQ-4', 'Migration Planning', 'not_started'),
-- GDPR
('GDPR', 'Art.5', 'Principles of Processing', 'partial'),
('GDPR', 'Art.6', 'Lawfulness of Processing', 'partial'),
('GDPR', 'Art.7', 'Consent', 'not_started'),
('GDPR', 'Art.12-14', 'Transparency', 'not_started'),
('GDPR', 'Art.15-22', 'Data Subject Rights', 'in_progress'),
('GDPR', 'Art.25', 'Data Protection by Design', 'partial'),
('GDPR', 'Art.32', 'Security of Processing', 'partial'),
('GDPR', 'Art.33-34', 'Breach Notification', 'not_started'),
-- OWASP
('OWASP', 'A01', 'Broken Access Control', 'partial'),
('OWASP', 'A02', 'Cryptographic Failures', 'in_progress'),
('OWASP', 'A03', 'Injection', 'partial'),
('OWASP', 'A04', 'Insecure Design', 'not_started'),
('OWASP', 'A05', 'Security Misconfiguration', 'not_started'),
('OWASP', 'A07', 'Identity & Authentication Failures', 'partial'),
('OWASP', 'A08', 'Software & Data Integrity Failures', 'not_started'),
('OWASP', 'A09', 'Security Logging & Monitoring', 'partial');

-- Insert default IP projects
INSERT INTO public.ip_projects (type, title, description, status, priority) VALUES
('patent', 'Lattice-Based Visual Language Encoding', 'Method and system for encoding textual information into deterministic geometric patterns using fixed anchor lattices', 'draft', 'critical'),
('patent', 'Polyline Traversal Grammar System', 'Grammar rules for continuous polyline traversal with micro-loops, restart notches, and tick semantics', 'draft', 'critical'),
('patent', 'Cross-Domain Symbolic Encoding', 'Application of lattice encoding across text, code, biology, law, and music domains', 'draft', 'high'),
('patent', 'Glyph-to-Cryptographic Hash Linkage', 'Deterministic mapping between visual glyphs and cryptographic hash fingerprints', 'draft', 'high'),
('patent', 'Geometric Decoding Semantics', 'Methods for resolving ambiguity in glyph decoding using lattice constraints', 'draft', 'medium'),
('trademark', 'Quantum Bit Code™', 'Primary brand name for the encoding system', 'draft', 'critical'),
('trademark', 'QBC™', 'Abbreviated trademark', 'draft', 'critical'),
('trademark', 'Genesis Origin™ / G1™', 'Name for the foundational lattice configuration', 'draft', 'high'),
('trademark', 'QBC Simulator™', 'Name for the interactive encoding tool', 'draft', 'high'),
('trademark', 'Rosetta Library™', 'Name for the canonical glyph collection', 'draft', 'medium'),
('copyright', 'G1 Lattice Configuration', 'The canonical 27-anchor diamond lattice map', 'draft', 'high'),
('copyright', 'Default Glyph Library', 'Collection of pre-generated canonical glyphs', 'draft', 'medium'),
('copyright', 'QBC Simulator Interface', 'User interface design and interactions', 'draft', 'medium'),
('copyright', 'Technical Documentation', 'Specification documents and API documentation', 'draft', 'medium');