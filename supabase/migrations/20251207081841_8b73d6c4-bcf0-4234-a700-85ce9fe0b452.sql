-- Drive-By Intelligence Module Schema

-- Companies the user owns, consults for, or distributes
CREATE TABLE public.biz_company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'consultant', 'distributor')),
  parent_group text,
  description text,
  logo_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product bundles offered by companies
CREATE TABLE public.product_bundle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.biz_company(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  playbook_slug text,
  pain_points text[],
  benefits text[],
  script_checkpoints text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Field captures from drive-by scanning
CREATE TABLE public.field_capture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_by uuid NOT NULL,
  ts timestamptz DEFAULT now(),
  lat double precision,
  lon double precision,
  address text,
  photo_url text,
  voice_note_url text,
  raw_ocr jsonb DEFAULT '{}',
  ai_tags text[],
  confidence real,
  status text DEFAULT 'new' CHECK (status IN ('new', 'processing', 'converted', 'dismissed')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Leads extracted from field captures
CREATE TABLE public.driveby_lead (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_capture_id uuid REFERENCES public.field_capture(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  place_name text,
  place_phone text,
  website text,
  category text,
  soc_code text,
  normalized_id text,
  quality_score real DEFAULT 0,
  notes text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lead assignments to companies/bundles
CREATE TABLE public.lead_assignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.driveby_lead(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.biz_company(id) ON DELETE CASCADE,
  bundle_id uuid REFERENCES public.product_bundle(id) ON DELETE SET NULL,
  rationale text,
  assigned_by uuid,
  ts timestamptz DEFAULT now()
);

-- Work items generated from leads
CREATE TABLE public.driveby_work_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.driveby_lead(id) ON DELETE CASCADE,
  assignee_type text NOT NULL CHECK (assignee_type IN ('human', 'agent')),
  assignee_ref text,
  kind text NOT NULL CHECK (kind IN ('email', 'call', 'visit', 'proposal', 'follow_up')),
  payload jsonb DEFAULT '{}',
  due_at timestamptz,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- SOC codes reference table
CREATE TABLE public.soc_codes (
  code text PRIMARY KEY,
  occupational_group text NOT NULL
);

-- Insert SOC codes
INSERT INTO public.soc_codes (code, occupational_group) VALUES
('11-0000', 'Management Occupations'),
('13-0000', 'Business and Financial Operations Occupations'),
('15-0000', 'Computer and Mathematical Occupations'),
('17-0000', 'Architecture and Engineering Occupations'),
('19-0000', 'Life, Physical, and Social Science Occupations'),
('21-0000', 'Community and Social Service Occupations'),
('23-0000', 'Legal Occupations'),
('25-0000', 'Educational Instruction and Library Occupations'),
('27-0000', 'Arts, Design, Entertainment, Sports, and Media Occupations'),
('29-0000', 'Healthcare Practitioners and Technical Occupations'),
('31-0000', 'Healthcare Support Occupations'),
('33-0000', 'Protective Service Occupations'),
('35-0000', 'Food Preparation and Serving Related Occupations'),
('37-0000', 'Building and Grounds Cleaning and Maintenance Occupations'),
('39-0000', 'Personal Care and Service Occupations'),
('41-0000', 'Sales and Related Occupations'),
('43-0000', 'Office and Administrative Support Occupations'),
('45-0000', 'Farming, Fishing, and Forestry Occupations'),
('47-0000', 'Construction and Extraction Occupations'),
('49-0000', 'Installation, Maintenance, and Repair Occupations'),
('51-0000', 'Production Occupations'),
('53-0000', 'Transportation and Material Moving Occupations');

-- Enable RLS
ALTER TABLE public.biz_company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_capture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driveby_lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driveby_work_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soc_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for biz_company
CREATE POLICY "Users can manage their companies" ON public.biz_company
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for product_bundle
CREATE POLICY "Users can manage bundles for their companies" ON public.product_bundle
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.biz_company WHERE id = product_bundle.company_id AND user_id = auth.uid()
  ));

-- RLS Policies for field_capture
CREATE POLICY "Users can manage their captures" ON public.field_capture
  FOR ALL USING (auth.uid() = captured_by);

-- RLS Policies for driveby_lead
CREATE POLICY "Users can manage their leads" ON public.driveby_lead
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for lead_assignment
CREATE POLICY "Users can manage their lead assignments" ON public.lead_assignment
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.driveby_lead WHERE id = lead_assignment.lead_id AND user_id = auth.uid()
  ));

-- RLS Policies for driveby_work_item
CREATE POLICY "Users can manage work items for their leads" ON public.driveby_work_item
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.driveby_lead WHERE id = driveby_work_item.lead_id AND user_id = auth.uid()
  ));

-- SOC codes are public read
CREATE POLICY "Anyone can read SOC codes" ON public.soc_codes
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_field_capture_captured_by ON public.field_capture(captured_by);
CREATE INDEX idx_field_capture_status ON public.field_capture(status);
CREATE INDEX idx_driveby_lead_user_id ON public.driveby_lead(user_id);
CREATE INDEX idx_driveby_lead_status ON public.driveby_lead(status);
CREATE INDEX idx_lead_assignment_lead_id ON public.lead_assignment(lead_id);
CREATE INDEX idx_driveby_work_item_lead_id ON public.driveby_work_item(lead_id);
CREATE INDEX idx_driveby_work_item_status ON public.driveby_work_item(status);