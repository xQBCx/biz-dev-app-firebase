-- Create feature completeness tracking system
CREATE TABLE public.feature_completeness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  page_path TEXT,
  component_path TEXT,
  edge_function TEXT,
  database_tables TEXT[],
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'mock_only', 'partial', 'complete', 'needs_review')),
  issues JSONB DEFAULT '[]',
  notes TEXT,
  priority INTEGER DEFAULT 5,
  estimated_hours NUMERIC(5,1),
  completed_at TIMESTAMPTZ,
  last_audited_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_name, feature_name)
);

-- Enable RLS
ALTER TABLE public.feature_completeness ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view
CREATE POLICY "Authenticated users can view feature completeness"
ON public.feature_completeness FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to manage (we'll restrict via app logic)
CREATE POLICY "Authenticated users can manage feature completeness"
ON public.feature_completeness FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create feature audit log
CREATE TABLE public.feature_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID REFERENCES public.feature_completeness(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL,
  findings JSONB,
  automated BOOLEAN DEFAULT true,
  auditor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
ON public.feature_audit_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create audit logs"
ON public.feature_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_feature_completeness_updated_at
BEFORE UPDATE ON public.feature_completeness
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();