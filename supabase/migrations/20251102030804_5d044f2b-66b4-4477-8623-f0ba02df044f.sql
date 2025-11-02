-- Extend construction tables for Estimating & Bidding - Fixed references
-- This adds roofing-specific features, bid management, and pricing to existing xBuilderx

-- Add new enum types for bidding
CREATE TYPE bid_status AS ENUM ('draft', 'invited', 'submitted', 'won', 'lost', 'archived');
CREATE TYPE bid_source_type AS ENUM ('email', 'buildingconnected', 'manual', 'ai_discovery');
CREATE TYPE compliance_mode AS ENUM ('standard', 'davis_bacon', 'prevailing_wage');
CREATE TYPE cost_type AS ENUM ('material', 'labor', 'subcontractor', 'equipment', 'overhead', 'bond', 'insurance', 'warranty', 'permit');
CREATE TYPE roof_type AS ENUM ('flat', 'pitched', 'metal', 'tile', 'shingle', 'membrane', 'other');

-- Add company_id to construction_projects for liability separation  
ALTER TABLE public.construction_projects
ADD COLUMN company_id UUID REFERENCES public.businesses(id),
ADD COLUMN gc_contact_id UUID REFERENCES public.crm_contacts(id),
ADD COLUMN bid_status bid_status,
ADD COLUMN bid_due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN retainage_percent NUMERIC DEFAULT 0,
ADD COLUMN bond_required BOOLEAN DEFAULT false,
ADD COLUMN probability_percent INTEGER,
ADD COLUMN compliance_mode compliance_mode DEFAULT 'standard';

-- Bid sources table (tracks where bids came from)
CREATE TABLE public.bid_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  source_type bid_source_type NOT NULL,
  source_reference TEXT,
  email_thread_id TEXT,
  bc_project_id TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plan sheets table (individual pages within a plan set)
CREATE TABLE public.plan_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.construction_documents(id) ON DELETE CASCADE,
  sheet_number TEXT NOT NULL,
  sheet_title TEXT,
  page_number INTEGER,
  scale_ratio NUMERIC,
  scale_locked BOOLEAN DEFAULT false,
  discipline TEXT,
  tags TEXT[],
  ai_extracted_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Construction systems (roofs, walls, foundations, etc.)
CREATE TABLE public.construction_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  system_type TEXT NOT NULL,
  roof_type roof_type,
  elevation_label TEXT,
  warranty_years INTEGER,
  slope_ratio NUMERIC,
  area_sqft NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Takeoff areas (polygons drawn on plans)
CREATE TABLE public.takeoff_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  plan_sheet_id UUID REFERENCES public.plan_sheets(id),
  system_id UUID REFERENCES public.construction_systems(id),
  geometry_json JSONB NOT NULL,
  flat_sqft NUMERIC,
  slope_ratio NUMERIC DEFAULT 1.0,
  true_sqft NUMERIC,
  color_hex TEXT,
  page_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced cost_items with CSI divisions and roofing specifics
ALTER TABLE public.cost_items
ADD COLUMN csi_division TEXT,
ADD COLUMN item_group TEXT,
ADD COLUMN sku TEXT,
ADD COLUMN r_value NUMERIC,
ADD COLUMN thickness_inches NUMERIC,
ADD COLUMN coverage_per_unit NUMERIC,
ADD COLUMN waste_percent NUMERIC DEFAULT 0;

-- Create distributors table first (needed for foreign keys)
CREATE TABLE public.distributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  region TEXT,
  vendor_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Now add vendor_id column to cost_items
ALTER TABLE public.cost_items
ADD COLUMN vendor_id UUID REFERENCES public.distributors(id);

-- Assemblies (recipes that convert quantities to items)
CREATE TABLE public.assemblies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  asset_type construction_asset_type,
  system_type TEXT,
  rules_json JSONB NOT NULL,
  waste_defaults_json JSONB DEFAULT '{}'::jsonb,
  is_template BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bid line items (detailed cost breakdown)
CREATE TABLE public.bid_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID NOT NULL REFERENCES public.estimate_worksheets(id) ON DELETE CASCADE,
  cost_item_id UUID REFERENCES public.cost_items(id),
  cost_type cost_type NOT NULL,
  csi_division TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit takeoff_unit NOT NULL,
  unit_price NUMERIC NOT NULL,
  extended_price NUMERIC NOT NULL,
  sort_order INTEGER,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sheet metal breakout (roofing specific)
CREATE TABLE public.sheet_metal_breakout (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID NOT NULL REFERENCES public.estimate_worksheets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  linear_feet NUMERIC,
  fabrication_rate NUMERIC,
  installation_rate NUMERIC,
  material_sheets NUMERIC,
  material_price NUMERIC,
  total_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Overhead costs
CREATE TABLE public.overhead_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID NOT NULL REFERENCES public.estimate_worksheets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  unit_price NUMERIC NOT NULL,
  extended_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate factors (insurance, bond, etc.)
CREATE TABLE public.rate_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID NOT NULL REFERENCES public.estimate_worksheets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate_type TEXT NOT NULL,
  applies_to TEXT,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Davis-Bacon wage tables
CREATE TABLE public.wage_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  geo_code TEXT NOT NULL,
  craft TEXT NOT NULL,
  base_rate NUMERIC NOT NULL,
  fringe_rate NUMERIC NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Labor entries (for T&M and Davis-Bacon)
CREATE TABLE public.labor_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID NOT NULL REFERENCES public.estimate_worksheets(id) ON DELETE CASCADE,
  craft TEXT NOT NULL,
  hours NUMERIC NOT NULL,
  base_rate NUMERIC,
  fringe_rate NUMERIC,
  burden_percent NUMERIC DEFAULT 0,
  rate_source TEXT,
  total_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proposal sections
CREATE TABLE public.proposal_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  section_number INTEGER,
  title TEXT NOT NULL,
  scope_markdown TEXT,
  plan_references_json JSONB DEFAULT '[]'::jsonb,
  is_alternate BOOLEAN DEFAULT false,
  amount NUMERIC,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Price lists
CREATE TABLE public.price_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.distributors(id),
  name TEXT NOT NULL,
  effective_date DATE,
  expiration_date DATE,
  price_factor NUMERIC DEFAULT 1.0,
  is_current BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Price list items
CREATE TABLE public.price_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_list_id UUID NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  description TEXT,
  unit takeoff_unit NOT NULL,
  unit_price NUMERIC NOT NULL,
  manufacturer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bid team members (role-based access)
CREATE TABLE public.bid_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI extraction audit log
CREATE TABLE public.ai_extraction_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.construction_documents(id) ON DELETE CASCADE,
  extraction_type TEXT NOT NULL,
  model_used TEXT,
  extracted_data JSONB,
  confidence_score NUMERIC,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.bid_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeoff_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_metal_breakout ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overhead_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_extraction_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their project bid sources"
ON public.bid_sources FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = bid_sources.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their plan sheets"
ON public.plan_sheets FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_documents cd
  JOIN public.construction_projects cp ON cp.id = cd.project_id
  WHERE cd.id = plan_sheets.document_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can manage their construction systems"
ON public.construction_systems FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = construction_systems.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their takeoff areas"
ON public.takeoff_areas FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = takeoff_areas.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can view all assemblies"
ON public.assemblies FOR SELECT USING (true);

CREATE POLICY "Users can manage template assemblies"
ON public.assemblies FOR ALL
USING (is_template = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage bid line items"
ON public.bid_line_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.estimate_worksheets ew
  JOIN public.construction_projects cp ON cp.id = ew.project_id
  WHERE ew.id = bid_line_items.worksheet_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can manage sheet metal breakout"
ON public.sheet_metal_breakout FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.estimate_worksheets ew
  JOIN public.construction_projects cp ON cp.id = ew.project_id
  WHERE ew.id = sheet_metal_breakout.worksheet_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can manage overhead costs"
ON public.overhead_costs FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.estimate_worksheets ew
  JOIN public.construction_projects cp ON cp.id = ew.project_id
  WHERE ew.id = overhead_costs.worksheet_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can manage rate factors"
ON public.rate_factors FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.estimate_worksheets ew
  JOIN public.construction_projects cp ON cp.id = ew.project_id
  WHERE ew.id = rate_factors.worksheet_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Anyone can view wage tables"
ON public.wage_tables FOR SELECT USING (true);

CREATE POLICY "Users can manage labor entries"
ON public.labor_entries FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.estimate_worksheets ew
  JOIN public.construction_projects cp ON cp.id = ew.project_id
  WHERE ew.id = labor_entries.worksheet_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can manage proposal sections"
ON public.proposal_sections FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = proposal_sections.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can view all distributors"
ON public.distributors FOR SELECT USING (true);

CREATE POLICY "Users can manage distributors"
ON public.distributors FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all price lists"
ON public.price_lists FOR SELECT USING (true);

CREATE POLICY "Users can manage price lists"
ON public.price_lists FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view price list items"
ON public.price_list_items FOR SELECT USING (true);

CREATE POLICY "Users can view team members for their projects"
ON public.bid_team_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = bid_team_members.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage team members for their projects"
ON public.bid_team_members FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.construction_projects
  WHERE id = bid_team_members.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can view extraction logs for their documents"
ON public.ai_extraction_log FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.construction_documents cd
  JOIN public.construction_projects cp ON cp.id = cd.project_id
  WHERE cd.id = ai_extraction_log.document_id AND cp.user_id = auth.uid()
));

-- Create indexes
CREATE INDEX idx_bid_sources_project_id ON public.bid_sources(project_id);
CREATE INDEX idx_plan_sheets_document_id ON public.plan_sheets(document_id);
CREATE INDEX idx_construction_systems_project_id ON public.construction_systems(project_id);
CREATE INDEX idx_takeoff_areas_project_id ON public.takeoff_areas(project_id);
CREATE INDEX idx_takeoff_areas_sheet_id ON public.takeoff_areas(plan_sheet_id);
CREATE INDEX idx_bid_line_items_worksheet_id ON public.bid_line_items(worksheet_id);
CREATE INDEX idx_sheet_metal_worksheet_id ON public.sheet_metal_breakout(worksheet_id);
CREATE INDEX idx_overhead_costs_worksheet_id ON public.overhead_costs(worksheet_id);
CREATE INDEX idx_rate_factors_worksheet_id ON public.rate_factors(worksheet_id);
CREATE INDEX idx_labor_entries_worksheet_id ON public.labor_entries(worksheet_id);
CREATE INDEX idx_proposal_sections_project_id ON public.proposal_sections(project_id);
CREATE INDEX idx_price_list_items_list_id ON public.price_list_items(price_list_id);
CREATE INDEX idx_price_list_items_sku ON public.price_list_items(sku);
CREATE INDEX idx_bid_team_members_project_id ON public.bid_team_members(project_id);
CREATE INDEX idx_ai_extraction_log_document_id ON public.ai_extraction_log(document_id);
CREATE INDEX idx_wage_tables_geo_craft ON public.wage_tables(geo_code, craft);

-- Add updated_at triggers
CREATE TRIGGER update_plan_sheets_updated_at
  BEFORE UPDATE ON public.plan_sheets
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_construction_systems_updated_at
  BEFORE UPDATE ON public.construction_systems
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_takeoff_areas_updated_at
  BEFORE UPDATE ON public.takeoff_areas
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_assemblies_updated_at
  BEFORE UPDATE ON public.assemblies
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_proposal_sections_updated_at
  BEFORE UPDATE ON public.proposal_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_distributors_updated_at
  BEFORE UPDATE ON public.distributors
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();

CREATE TRIGGER update_price_lists_updated_at
  BEFORE UPDATE ON public.price_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_construction_updated_at();