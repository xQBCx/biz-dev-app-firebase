-- Create CAD library table for storing part designs
CREATE TABLE public.cad_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'hvac', 'plumbing', 'electrical', 'structural', 'railcar', 'equipment', 'custom'
  part_type TEXT NOT NULL, -- 'bracket', 'fitting', 'cover', 'gasket', 'handle', 'panel', etc.
  compatible_asset_types TEXT[] DEFAULT '{}',
  file_url TEXT, -- URL to CAD file in storage (STL, STEP, OBJ)
  file_format TEXT, -- 'stl', 'step', 'obj', 'gcode'
  thumbnail_url TEXT,
  oem_part_numbers TEXT[] DEFAULT '{}', -- Compatible OEM part numbers
  dimensions JSONB DEFAULT '{}', -- { width_mm, height_mm, depth_mm, volume_cm3 }
  print_specs JSONB DEFAULT '{}', -- { material, infill_percent, layer_height_mm, supports_needed, estimated_print_time_minutes }
  is_verified BOOLEAN DEFAULT false, -- Has been tested and verified
  is_public BOOLEAN DEFAULT false, -- Available to all organizations
  source TEXT, -- 'uploaded', 'ai_generated', 'oem', 'community'
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.cad_library(id), -- For versioning
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fabrication_units table for service vehicles with printers
CREATE TABLE public.fabrication_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL, -- 'Van-01', 'Mobile Fab Unit Alpha'
  unit_type TEXT NOT NULL DEFAULT 'mobile', -- 'mobile', 'stationary', 'partner'
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'in_transit', 'printing', 'maintenance', 'offline'
  current_location JSONB, -- { latitude, longitude, address, last_updated }
  assigned_technician_id UUID,
  printer_specs JSONB DEFAULT '{}', -- { model, build_volume_mm, materials_supported, print_speed }
  cnc_specs JSONB, -- { model, work_area_mm, materials_supported }
  materials_inventory JSONB DEFAULT '[]', -- [{ material_type, color, quantity_grams, spool_id }]
  capabilities TEXT[] DEFAULT '{}', -- ['fdm_printing', 'resin_printing', 'cnc_milling', 'laser_cutting']
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create print_jobs table for tracking fabrication requests
CREATE TABLE public.print_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  work_order_id UUID REFERENCES public.work_orders(id),
  asset_component_id UUID REFERENCES public.asset_components(id),
  cad_library_id UUID REFERENCES public.cad_library(id),
  fabrication_unit_id UUID REFERENCES public.fabrication_units(id),
  
  -- Job details
  job_type TEXT NOT NULL DEFAULT 'print', -- 'print', 'cnc', 'laser_cut'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'queued', 'approved', 'printing', 'completed', 'failed', 'cancelled', 'installed'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'emergency'
  
  -- Part identification
  identified_part_name TEXT,
  identified_part_type TEXT,
  ai_match_confidence NUMERIC, -- 0-100 confidence score
  ai_analysis JSONB, -- Full AI analysis result
  
  -- Custom CAD (for AI-generated or uploaded)
  custom_cad_url TEXT,
  custom_specs JSONB,
  
  -- Print specifications
  material_type TEXT, -- 'PLA', 'PETG', 'ABS', 'TPU', 'Nylon', 'Resin'
  material_color TEXT,
  quantity INTEGER DEFAULT 1,
  infill_percent INTEGER DEFAULT 20,
  layer_height_mm NUMERIC DEFAULT 0.2,
  supports_needed BOOLEAN DEFAULT false,
  
  -- Time tracking
  estimated_print_time_minutes INTEGER,
  actual_print_time_minutes INTEGER,
  
  -- Approval workflow
  requested_by UUID,
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  installed_at TIMESTAMPTZ,
  installed_by UUID,
  quality_check_passed BOOLEAN,
  quality_notes TEXT,
  
  -- Photos
  before_photo_url TEXT,
  printed_part_photo_url TEXT,
  installed_photo_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create part_identifications table for AI analysis history
CREATE TABLE public.part_identifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  work_order_id UUID REFERENCES public.work_orders(id),
  asset_id UUID REFERENCES public.assets(id),
  asset_component_id UUID REFERENCES public.asset_components(id),
  
  -- Input
  image_urls TEXT[] NOT NULL,
  description TEXT,
  
  -- AI Analysis
  identified_part_name TEXT,
  identified_part_type TEXT,
  identified_manufacturer TEXT,
  identified_model_number TEXT,
  confidence_score NUMERIC, -- 0-100
  
  -- Matching
  matched_cad_ids UUID[], -- Matched CAD library entries
  can_print_in_field BOOLEAN,
  recommended_action TEXT, -- 'print_now', 'order_oem', 'custom_design_needed', 'repair_existing'
  
  -- Full analysis
  analysis_result JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cad_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrication_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_identifications ENABLE ROW LEVEL SECURITY;

-- CAD Library policies
CREATE POLICY "Anyone can view public CAD entries" ON public.cad_library
  FOR SELECT USING (is_public = true);

CREATE POLICY "Org members can view their CAD entries" ON public.cad_library
  FOR SELECT USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Org members can manage their CAD entries" ON public.cad_library
  FOR ALL USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Admins can manage all CAD entries" ON public.cad_library
  FOR ALL USING (is_xrepairx_admin(auth.uid()));

-- Fabrication Units policies
CREATE POLICY "Org members can view their fab units" ON public.fabrication_units
  FOR SELECT USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Org members can manage their fab units" ON public.fabrication_units
  FOR ALL USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Admins can manage all fab units" ON public.fabrication_units
  FOR ALL USING (is_xrepairx_admin(auth.uid()));

-- Print Jobs policies
CREATE POLICY "Org members can view their print jobs" ON public.print_jobs
  FOR SELECT USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Org members can create print jobs" ON public.print_jobs
  FOR INSERT WITH CHECK (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Org members can update their print jobs" ON public.print_jobs
  FOR UPDATE USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Admins can manage all print jobs" ON public.print_jobs
  FOR ALL USING (is_xrepairx_admin(auth.uid()));

-- Part Identifications policies
CREATE POLICY "Org members can view their identifications" ON public.part_identifications
  FOR SELECT USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Anyone can create identifications" ON public.part_identifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all identifications" ON public.part_identifications
  FOR ALL USING (is_xrepairx_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_cad_library_updated_at
  BEFORE UPDATE ON public.cad_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fabrication_units_updated_at
  BEFORE UPDATE ON public.fabrication_units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_print_jobs_updated_at
  BEFORE UPDATE ON public.print_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for CAD files
INSERT INTO storage.buckets (id, name, public) VALUES ('cad-files', 'cad-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for CAD files
CREATE POLICY "Anyone can view CAD files" ON storage.objects
  FOR SELECT USING (bucket_id = 'cad-files');

CREATE POLICY "Authenticated users can upload CAD files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cad-files' AND auth.role() = 'authenticated');