-- Fleet Intelligence Partners System

-- Partners providing visual data (Tesla, Waymo, municipalities, etc.)
CREATE TABLE public.fleet_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('vehicle_fleet', 'municipality', 'delivery_service', 'rideshare', 'other')),
  contact_email TEXT,
  contact_name TEXT,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  revenue_share_percent NUMERIC(5,2) DEFAULT 2.00,
  data_types TEXT[] DEFAULT ARRAY['image', 'video', 'telemetry'],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  contract_start_date DATE,
  contract_end_date DATE,
  total_data_points_received BIGINT DEFAULT 0,
  total_leads_generated INTEGER DEFAULT 0,
  total_revenue_shared NUMERIC(12,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Visual data intake queue
CREATE TABLE public.fleet_data_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES fleet_partners(id),
  data_type TEXT NOT NULL CHECK (data_type IN ('image', 'video', 'telemetry')),
  source_url TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  location_address TEXT,
  captured_at TIMESTAMPTZ,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'analyzed', 'lead_created', 'no_opportunity', 'failed')),
  ai_analysis JSONB,
  detected_issues TEXT[],
  confidence_score NUMERIC(3,2),
  processed_at TIMESTAMPTZ,
  lead_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service franchises/categories (pothole repair, lighting, plumbing, etc.)
CREATE TABLE public.service_franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_code TEXT UNIQUE NOT NULL,
  franchise_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  typical_job_value_min NUMERIC(10,2),
  typical_job_value_max NUMERIC(10,2),
  materials_advance_percent NUMERIC(5,2) DEFAULT 30.00,
  platform_fee_percent NUMERIC(5,2) DEFAULT 8.00,
  material_referral_percent NUMERIC(5,2) DEFAULT 3.00,
  partner_data_share_percent NUMERIC(5,2) DEFAULT 2.00,
  proof_requirements TEXT[] DEFAULT ARRAY['before_photo', 'after_photo', 'completion_timestamp'],
  certification_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Verified vendors who can perform work
CREATE TABLE public.service_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  service_area_geo JSONB,
  service_radius_miles INTEGER DEFAULT 25,
  certifications TEXT[],
  franchise_ids UUID[],
  wallet_address TEXT,
  bank_account_last4 TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'suspended', 'rejected')),
  rating NUMERIC(3,2) DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  total_revenue_earned NUMERIC(12,2) DEFAULT 0,
  avg_completion_time_hours NUMERIC(6,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Work orders with escrow tracking
CREATE TABLE public.fleet_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  intake_id UUID REFERENCES fleet_data_intake(id),
  partner_id UUID REFERENCES fleet_partners(id),
  franchise_id UUID REFERENCES service_franchises(id),
  vendor_id UUID REFERENCES service_vendors(id),
  issue_type TEXT NOT NULL,
  issue_description TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  location_address TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'materials_funded', 'in_progress', 'pending_verification', 'completed', 'disputed', 'cancelled')),
  estimated_cost NUMERIC(10,2),
  materials_cost NUMERIC(10,2),
  labor_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  materials_advance_amount NUMERIC(10,2),
  escrow_funded_at TIMESTAMPTZ,
  escrow_released_at TIMESTAMPTZ,
  smart_contract_address TEXT,
  smart_contract_tx_hash TEXT,
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  proof_before_photos TEXT[],
  proof_after_photos TEXT[],
  proof_materials_receipts TEXT[],
  completion_notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Revenue distribution ledger
CREATE TABLE public.revenue_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES fleet_work_orders(id),
  distribution_type TEXT NOT NULL CHECK (distribution_type IN ('vendor_advance', 'vendor_completion', 'partner_share', 'platform_fee', 'material_referral', 'escrow_fund', 'escrow_release')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('vendor', 'partner', 'platform', 'material_supplier', 'escrow')),
  recipient_id UUID,
  recipient_name TEXT,
  amount NUMERIC(12,2) NOT NULL,
  percentage_of_total NUMERIC(5,2),
  transaction_status TEXT DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'processing', 'completed', 'failed')),
  blockchain_tx_hash TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generate work order numbers
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM fleet_work_orders WHERE order_number = new_number) INTO number_exists;
    EXIT WHEN NOT number_exists;
  END LOOP;
  RETURN new_number;
END;
$$;

-- Trigger for work order numbers
CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_work_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_work_order_number_trigger
  BEFORE INSERT ON fleet_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_work_order_number();

-- Update timestamps triggers
CREATE TRIGGER update_fleet_partners_updated_at
  BEFORE UPDATE ON fleet_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_franchises_updated_at
  BEFORE UPDATE ON service_franchises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_vendors_updated_at
  BEFORE UPDATE ON service_vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_work_orders_updated_at
  BEFORE UPDATE ON fleet_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE fleet_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_data_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_distribution ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin/platform users can manage all
CREATE POLICY "Admins can manage fleet partners"
  ON fleet_partners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage fleet data intake"
  ON fleet_data_intake FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active franchises"
  ON service_franchises FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage franchises"
  ON service_franchises FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendors can view and update their own record"
  ON service_vendors FOR ALL
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendors can view assigned work orders"
  ON fleet_work_orders FOR SELECT
  USING (vendor_id IN (SELECT id FROM service_vendors WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage work orders"
  ON fleet_work_orders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View own revenue distributions"
  ON revenue_distribution FOR SELECT
  USING (
    recipient_id IN (SELECT id FROM service_vendors WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Seed initial service franchises
INSERT INTO service_franchises (franchise_code, franchise_name, category, description, icon_name, typical_job_value_min, typical_job_value_max) VALUES
('POTHOLE', 'Pothole Repair', 'Infrastructure', 'Road surface repair and patching', 'construction', 150, 2500),
('LIGHTING', 'Street Lighting', 'Infrastructure', 'Light pole repair and installation', 'lightbulb', 200, 5000),
('FENCE', 'Fence Repair', 'Property', 'Fence repair and installation', 'fence', 100, 3000),
('PAINTING', 'Building Painting', 'Property', 'Exterior and interior painting', 'paintbrush', 500, 15000),
('PLUMBING', 'Plumbing Repair', 'Maintenance', 'Pipe repair and leak fixing', 'wrench', 100, 5000),
('ELECTRICAL', 'Electrical Repair', 'Maintenance', 'Electrical system repairs', 'zap', 150, 8000),
('SIGNAGE', 'Sign Repair', 'Infrastructure', 'Traffic and business sign repair', 'signpost', 75, 1500),
('HVAC', 'HVAC Services', 'Maintenance', 'Heating and cooling repairs', 'thermometer', 200, 10000),
('LANDSCAPING', 'Landscaping', 'Property', 'Lawn care and landscaping', 'trees', 100, 5000),
('CLEANING', 'Commercial Cleaning', 'Property', 'Building and facility cleaning', 'sparkles', 100, 3000);

-- Enable realtime for work orders
ALTER PUBLICATION supabase_realtime ADD TABLE fleet_work_orders;