-- Create enum types for construction lifecycle
CREATE TYPE construction_asset_type AS ENUM ('residential', 'commercial', 'industrial', 'multifamily', 'infrastructure');
CREATE TYPE project_phase AS ENUM ('discovery', 'design', 'estimating', 'bidding', 'construction', 'closeout', 'warranty');
CREATE TYPE takeoff_unit AS ENUM ('sqft', 'lf', 'cy', 'ea', 'sf', 'ton', 'ls');
CREATE TYPE workflow_item_type AS ENUM ('rfi', 'submittal', 'change_order', 'daily_report', 'punch_list');
CREATE TYPE workflow_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'closed');

-- Construction projects table
CREATE TABLE public.construction_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  project_number TEXT,
  asset_type construction_asset_type NOT NULL,
  phase project_phase DEFAULT 'discovery',
  location TEXT,
  region TEXT,
  currency TEXT DEFAULT 'USD',
  total_estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document management table
CREATE TABLE public.construction_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES public.construction_documents(id),
  ocr_content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Takeoff items table
CREATE TABLE public.takeoff_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.construction_documents(id),
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC NOT NULL,
  unit takeoff_unit NOT NULL,
  coordinates JSONB,
  ai_detected BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost database table
CREATE TABLE public.cost_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  unit takeoff_unit NOT NULL,
  unit_cost NUMERIC NOT NULL,
  region TEXT,
  asset_type construction_asset_type,
  currency TEXT DEFAULT 'USD',
  labor_cost NUMERIC DEFAULT 0,
  material_cost NUMERIC DEFAULT 0,
  equipment_cost NUMERIC DEFAULT 0,
  is_template BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Estimate worksheets table
CREATE TABLE public.estimate_worksheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  subtotal NUMERIC DEFAULT 0,
  markup_percent NUMERIC DEFAULT 0,
  overhead_percent NUMERIC DEFAULT 0,
  contingency_percent NUMERIC DEFAULT 0,
  total_estimate NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Estimate line items table
CREATE TABLE public.estimate_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID NOT NULL REFERENCES public.estimate_worksheets(id) ON DELETE CASCADE,
  takeoff_item_id UUID REFERENCES public.takeoff_items(id),
  cost_item_id UUID REFERENCES public.cost_items(id),
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit takeoff_unit NOT NULL,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow items (RFIs, Submittals, Change Orders, etc.)
CREATE TABLE public.workflow_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_type workflow_item_type NOT NULL,
  item_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status workflow_status DEFAULT 'draft',
  assigned_to UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  cost_impact NUMERIC DEFAULT 0,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Field reports table
CREATE TABLE public.field_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  report_date DATE NOT NULL,
  weather TEXT,
  crew_count INTEGER,
  work_performed TEXT,
  issues TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  progress_percent NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project analytics snapshots
CREATE TABLE public.project_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  cost_variance NUMERIC,
  progress_percent NUMERIC,
  productivity_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.construction_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeoff_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for construction_projects
CREATE POLICY "Users can manage their own construction projects"
ON public.construction_projects
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for construction_documents
CREATE POLICY "Users can manage their project documents"
ON public.construction_documents
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = construction_documents.project_id AND user_id = auth.uid()
));

-- RLS Policies for takeoff_items
CREATE POLICY "Users can manage their project takeoffs"
ON public.takeoff_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = takeoff_items.project_id AND user_id = auth.uid()
));

-- RLS Policies for cost_items
CREATE POLICY "Users can view all cost items"
ON public.cost_items
FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own cost items"
ON public.cost_items
FOR ALL
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- RLS Policies for estimate_worksheets
CREATE POLICY "Users can manage their project estimates"
ON public.estimate_worksheets
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = estimate_worksheets.project_id AND user_id = auth.uid()
));

-- RLS Policies for estimate_line_items
CREATE POLICY "Users can manage their worksheet line items"
ON public.estimate_line_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.estimate_worksheets ew
  JOIN public.construction_projects cp ON cp.id = ew.project_id
  WHERE ew.id = estimate_line_items.worksheet_id AND cp.user_id = auth.uid()
));

-- RLS Policies for workflow_items
CREATE POLICY "Users can manage their project workflows"
ON public.workflow_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = workflow_items.project_id AND user_id = auth.uid()
));

-- RLS Policies for field_reports
CREATE POLICY "Users can manage their project field reports"
ON public.field_reports
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = field_reports.project_id AND user_id = auth.uid()
));

-- RLS Policies for project_analytics
CREATE POLICY "Users can view their project analytics"
ON public.project_analytics
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = project_analytics.project_id AND user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_construction_projects_user_id ON public.construction_projects(user_id);
CREATE INDEX idx_construction_documents_project_id ON public.construction_documents(project_id);
CREATE INDEX idx_takeoff_items_project_id ON public.takeoff_items(project_id);
CREATE INDEX idx_estimate_worksheets_project_id ON public.estimate_worksheets(project_id);
CREATE INDEX idx_workflow_items_project_id ON public.workflow_items(project_id);
CREATE INDEX idx_field_reports_project_id ON public.field_reports(project_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_construction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_construction_projects_updated_at
  BEFORE UPDATE ON public.construction_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_construction_documents_updated_at
  BEFORE UPDATE ON public.construction_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_takeoff_items_updated_at
  BEFORE UPDATE ON public.takeoff_items
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_cost_items_updated_at
  BEFORE UPDATE ON public.cost_items
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_estimate_worksheets_updated_at
  BEFORE UPDATE ON public.estimate_worksheets
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_workflow_items_updated_at
  BEFORE UPDATE ON public.workflow_items
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();