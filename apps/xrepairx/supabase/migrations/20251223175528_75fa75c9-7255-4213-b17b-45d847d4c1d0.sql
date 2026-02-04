-- =====================================================
-- xREPAIRx Database Schema Migration
-- =====================================================

-- 1. Create new role enum for xREPAIRx (keeping old one for now, will transition)
CREATE TYPE public.xrepairx_role AS ENUM ('admin', 'operator', 'field_technician', 'remote_expert', 'end_customer');

-- 2. Create organization_type enum
CREATE TYPE public.organization_type AS ENUM (
  'property_manager', 
  'rail_operator', 
  'fleet', 
  'industrial_plant', 
  'equipment_manufacturer',
  'construction',
  'other'
);

-- 3. Create asset_type enum
CREATE TYPE public.asset_type AS ENUM (
  'building', 
  'unit', 
  'railcar', 
  'equipment', 
  'system',
  'vehicle',
  'facility'
);

-- 4. Create component_criticality enum
CREATE TYPE public.component_criticality AS ENUM (
  'non_critical',
  'critical',
  'safety_critical'
);

-- 5. Create work_order_source enum
CREATE TYPE public.work_order_source AS ENUM (
  'remote_self_service',
  'call_center',
  'field_tech',
  'system_alert',
  'scheduled_maintenance'
);

-- 6. Create work_order_category enum
CREATE TYPE public.work_order_category AS ENUM (
  'maintenance',
  'repair',
  'inspection',
  'commissioning',
  'installation'
);

-- 7. Create work_order_priority enum
CREATE TYPE public.work_order_priority AS ENUM (
  'low',
  'normal',
  'high',
  'emergency'
);

-- 8. Create work_order_status enum
CREATE TYPE public.work_order_status AS ENUM (
  'new',
  'triage_in_progress',
  'remote_resolved',
  'scheduled_visit',
  'in_field',
  'completed',
  'cancelled'
);

-- 9. Create session_type enum
CREATE TYPE public.session_type AS ENUM (
  'remote_triage',
  'remote_inspection',
  'remote_guided_repair',
  'remote_sales_demo'
);

-- 10. Create session_outcome enum
CREATE TYPE public.session_outcome AS ENUM (
  'resolved',
  'needs_field_visit',
  'needs_follow_up_call',
  'pending'
);

-- 11. Create inspection_type enum
CREATE TYPE public.inspection_type AS ENUM (
  'move_in',
  'move_out',
  'annual',
  'safety',
  'railcar_turn',
  'equipment_check',
  'compliance'
);

-- 12. Create media_type enum
CREATE TYPE public.media_type AS ENUM (
  'photo',
  'video',
  'snapshot',
  'document'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- 13. Organizations table (replaces businesses for xREPAIRx context)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_type organization_type NOT NULL DEFAULT 'other',
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  timezone TEXT DEFAULT 'America/Chicago',
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. Organization members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role xrepairx_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 15. Assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_type asset_type NOT NULL,
  identifier TEXT NOT NULL,
  name TEXT,
  description TEXT,
  location_address TEXT,
  location_city TEXT,
  location_state TEXT,
  location_zip TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 16. Asset components table
CREATE TABLE public.asset_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  name TEXT NOT NULL,
  oem_part_number TEXT,
  criticality component_criticality NOT NULL DEFAULT 'non_critical',
  can_print_in_field BOOLEAN DEFAULT false,
  digital_twin_ref TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 17. Work orders table
CREATE TABLE public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id),
  asset_component_id UUID REFERENCES public.asset_components(id),
  requested_by_user_id UUID,
  requester_name TEXT,
  requester_email TEXT,
  requester_phone TEXT,
  source work_order_source NOT NULL DEFAULT 'remote_self_service',
  category work_order_category NOT NULL DEFAULT 'repair',
  priority work_order_priority NOT NULL DEFAULT 'normal',
  status work_order_status NOT NULL DEFAULT 'new',
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  scheduled_time TEXT,
  assigned_technician_id UUID,
  assigned_remote_expert_id UUID,
  ai_triage JSONB,
  resolution_summary TEXT,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 18. Remote sessions table
CREATE TABLE public.remote_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES public.work_orders(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  started_by xrepairx_role NOT NULL DEFAULT 'end_customer',
  session_type session_type NOT NULL DEFAULT 'remote_triage',
  join_url_customer TEXT,
  join_url_internal TEXT,
  room_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  recording_url TEXT,
  ai_summary JSONB,
  outcome session_outcome DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 19. Inspection templates table
CREATE TABLE public.inspection_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  inspection_type inspection_type NOT NULL,
  asset_type asset_type,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 20. Inspections table
CREATE TABLE public.inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  template_id UUID REFERENCES public.inspection_templates(id),
  inspection_type inspection_type NOT NULL,
  performed_by_user_id UUID,
  via_session_id UUID REFERENCES public.remote_sessions(id),
  status TEXT NOT NULL DEFAULT 'pending',
  findings JSONB DEFAULT '{}'::jsonb,
  checklist_responses JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT,
  next_actions JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 21. Media table
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES public.work_orders(id),
  inspection_id UUID REFERENCES public.inspections(id),
  remote_session_id UUID REFERENCES public.remote_sessions(id),
  asset_id UUID REFERENCES public.assets(id),
  component_id UUID REFERENCES public.asset_components(id),
  uploaded_by UUID,
  media_type media_type NOT NULL,
  url TEXT NOT NULL,
  filename TEXT,
  file_size INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  annotations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE RLS ON ALL NEW TABLES
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has xrepairx role
CREATE OR REPLACE FUNCTION public.has_xrepairx_role(_user_id uuid, _role xrepairx_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin (via user_roles table)
CREATE OR REPLACE FUNCTION public.is_xrepairx_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Function to get user's organization ids
CREATE OR REPLACE FUNCTION public.get_user_organization_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
$$;

-- Function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_in_organization(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- =====================================================
-- RLS POLICIES FOR ORGANIZATIONS
-- =====================================================

CREATE POLICY "Admins can manage all organizations"
ON public.organizations FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (
  owner_id = auth.uid() OR
  user_in_organization(auth.uid(), id)
);

CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization owners can update"
ON public.organizations FOR UPDATE
USING (owner_id = auth.uid() OR user_in_organization(auth.uid(), id));

-- =====================================================
-- RLS POLICIES FOR ORGANIZATION MEMBERS
-- =====================================================

CREATE POLICY "Admins can manage all members"
ON public.organization_members FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Members can view their org members"
ON public.organization_members FOR SELECT
USING (user_in_organization(auth.uid(), organization_id) OR user_id = auth.uid());

CREATE POLICY "Operators can manage org members"
ON public.organization_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role = 'operator'
  )
);

CREATE POLICY "Operators can delete org members"
ON public.organization_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'operator'
  )
);

-- =====================================================
-- RLS POLICIES FOR ASSETS
-- =====================================================

CREATE POLICY "Admins can manage all assets"
ON public.assets FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Org members can view their assets"
ON public.assets FOR SELECT
USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Operators can manage assets"
ON public.assets FOR INSERT
WITH CHECK (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Operators can update assets"
ON public.assets FOR UPDATE
USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Operators can delete assets"
ON public.assets FOR DELETE
USING (user_in_organization(auth.uid(), organization_id));

-- =====================================================
-- RLS POLICIES FOR ASSET COMPONENTS
-- =====================================================

CREATE POLICY "Admins can manage all components"
ON public.asset_components FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Org members can view components"
ON public.asset_components FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assets a
    WHERE a.id = asset_components.asset_id
      AND user_in_organization(auth.uid(), a.organization_id)
  )
);

CREATE POLICY "Operators can manage components"
ON public.asset_components FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assets a
    WHERE a.id = asset_components.asset_id
      AND user_in_organization(auth.uid(), a.organization_id)
  )
);

CREATE POLICY "Operators can update components"
ON public.asset_components FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.assets a
    WHERE a.id = asset_components.asset_id
      AND user_in_organization(auth.uid(), a.organization_id)
  )
);

CREATE POLICY "Operators can delete components"
ON public.asset_components FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.assets a
    WHERE a.id = asset_components.asset_id
      AND user_in_organization(auth.uid(), a.organization_id)
  )
);

-- =====================================================
-- RLS POLICIES FOR WORK ORDERS
-- =====================================================

CREATE POLICY "Admins can manage all work orders"
ON public.work_orders FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Org members can view work orders"
ON public.work_orders FOR SELECT
USING (
  user_in_organization(auth.uid(), organization_id) OR
  requested_by_user_id = auth.uid() OR
  assigned_technician_id = auth.uid() OR
  assigned_remote_expert_id = auth.uid()
);

CREATE POLICY "Anyone can create work orders"
ON public.work_orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Org members can update work orders"
ON public.work_orders FOR UPDATE
USING (
  user_in_organization(auth.uid(), organization_id) OR
  assigned_technician_id = auth.uid() OR
  assigned_remote_expert_id = auth.uid()
);

-- =====================================================
-- RLS POLICIES FOR REMOTE SESSIONS
-- =====================================================

CREATE POLICY "Admins can manage all sessions"
ON public.remote_sessions FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Org members can view sessions"
ON public.remote_sessions FOR SELECT
USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Anyone can create sessions"
ON public.remote_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Org members can update sessions"
ON public.remote_sessions FOR UPDATE
USING (user_in_organization(auth.uid(), organization_id));

-- =====================================================
-- RLS POLICIES FOR INSPECTION TEMPLATES
-- =====================================================

CREATE POLICY "Admins can manage all templates"
ON public.inspection_templates FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Anyone can view global templates"
ON public.inspection_templates FOR SELECT
USING (is_global = true OR user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Operators can manage org templates"
ON public.inspection_templates FOR INSERT
WITH CHECK (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Operators can update org templates"
ON public.inspection_templates FOR UPDATE
USING (user_in_organization(auth.uid(), organization_id));

-- =====================================================
-- RLS POLICIES FOR INSPECTIONS
-- =====================================================

CREATE POLICY "Admins can manage all inspections"
ON public.inspections FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Org members can view inspections"
ON public.inspections FOR SELECT
USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Org members can create inspections"
ON public.inspections FOR INSERT
WITH CHECK (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Org members can update inspections"
ON public.inspections FOR UPDATE
USING (user_in_organization(auth.uid(), organization_id));

-- =====================================================
-- RLS POLICIES FOR MEDIA
-- =====================================================

CREATE POLICY "Admins can manage all media"
ON public.media FOR ALL
USING (is_xrepairx_admin(auth.uid()));

CREATE POLICY "Org members can view media"
ON public.media FOR SELECT
USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Anyone can upload media"
ON public.media FOR INSERT
WITH CHECK (true);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_components_updated_at
  BEFORE UPDATE ON public.asset_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_remote_sessions_updated_at
  BEFORE UPDATE ON public.remote_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspection_templates_updated_at
  BEFORE UPDATE ON public.inspection_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();