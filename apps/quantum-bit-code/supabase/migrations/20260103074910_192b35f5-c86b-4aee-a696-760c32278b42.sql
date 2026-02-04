-- Create app role enum if not exists (for organization roles)
DO $$ BEGIN
  CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'encoder', 'decoder', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Pricing Plans table
CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  monthly_base_cents INTEGER NOT NULL DEFAULT 0,
  per_glyph_cents NUMERIC(10, 4) NOT NULL DEFAULT 0.01,
  per_word_cents NUMERIC(10, 4) NOT NULL DEFAULT 0.05,
  included_glyphs_monthly INTEGER NOT NULL DEFAULT 0,
  included_words_monthly INTEGER NOT NULL DEFAULT 0,
  max_lattices INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 5,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_id UUID REFERENCES public.pricing_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  billing_email TEXT,
  logo_url TEXT,
  custom_domain TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Organization Members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'viewer',
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Organization Lattice Access (which lattices each org can use)
CREATE TABLE public.organization_lattices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  lattice_id UUID REFERENCES public.lattices(id) ON DELETE CASCADE NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  custom_config JSONB,
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(org_id, lattice_id)
);

-- Usage Events for metering
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('encode', 'decode', 'batch_encode', 'batch_decode')),
  word_count INTEGER NOT NULL DEFAULT 0,
  glyph_count INTEGER NOT NULL DEFAULT 0,
  byte_count INTEGER DEFAULT 0,
  lattice_id UUID REFERENCES public.lattices(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Decoder Licenses
CREATE TABLE public.decoder_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  license_key TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  name TEXT,
  lattice_ids UUID[] DEFAULT '{}',
  permissions JSONB DEFAULT '{"decode": true, "encode": false}',
  rate_limit_per_minute INTEGER DEFAULT 60,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- API Keys for programmatic access
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '{"encode": true, "decode": true}',
  rate_limit_per_minute INTEGER DEFAULT 100,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lattice Audit Log
CREATE TABLE public.lattice_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  decoder_license_id UUID REFERENCES public.decoder_licenses(id) ON DELETE SET NULL,
  lattice_id UUID REFERENCES public.lattices(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  input_hash TEXT,
  output_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_usage_events_org_created ON public.usage_events(org_id, created_at DESC);
CREATE INDEX idx_usage_events_type ON public.usage_events(event_type);
CREATE INDEX idx_decoder_licenses_org ON public.decoder_licenses(org_id);
CREATE INDEX idx_decoder_licenses_key ON public.decoder_licenses(license_key);
CREATE INDEX idx_api_keys_org ON public.api_keys(org_id);
CREATE INDEX idx_api_keys_prefix ON public.api_keys(key_prefix);
CREATE INDEX idx_lattice_audit_org ON public.lattice_audit_log(org_id, created_at DESC);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);

-- Enable RLS on all tables
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_lattices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decoder_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lattice_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND org_id = _org_id AND is_active = true
  )
$$;

-- Helper function to check org role
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role org_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND org_id = _org_id AND role = _role AND is_active = true
  )
$$;

-- Helper function to check org admin (owner or admin)
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND org_id = _org_id 
    AND role IN ('owner', 'admin') AND is_active = true
  )
$$;

-- RLS Policies

-- Pricing Plans: Anyone can view active plans
CREATE POLICY "Anyone can view active pricing plans"
ON public.pricing_plans FOR SELECT
USING (is_active = true);

-- Admins can manage pricing plans
CREATE POLICY "Admins can manage pricing plans"
ON public.pricing_plans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Organizations: Members can view their orgs
CREATE POLICY "Members can view their organizations"
ON public.organizations FOR SELECT
USING (is_org_member(auth.uid(), id));

-- Org owners/admins can update their org
CREATE POLICY "Org admins can update organization"
ON public.organizations FOR UPDATE
USING (is_org_admin(auth.uid(), id));

-- Authenticated users can create organizations
CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- System admins can manage all orgs
CREATE POLICY "System admins can manage all organizations"
ON public.organizations FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Organization Members: Members can view their org's members
CREATE POLICY "Members can view org members"
ON public.organization_members FOR SELECT
USING (is_org_member(auth.uid(), org_id));

-- Org admins can manage members
CREATE POLICY "Org admins can manage members"
ON public.organization_members FOR ALL
USING (is_org_admin(auth.uid(), org_id));

-- Organization Lattices: Members can view their org's lattices
CREATE POLICY "Members can view org lattices"
ON public.organization_lattices FOR SELECT
USING (is_org_member(auth.uid(), org_id));

-- Org admins can manage lattice access
CREATE POLICY "Org admins can manage lattice access"
ON public.organization_lattices FOR ALL
USING (is_org_admin(auth.uid(), org_id));

-- Usage Events: Members can view their org's usage
CREATE POLICY "Members can view org usage"
ON public.usage_events FOR SELECT
USING (is_org_member(auth.uid(), org_id));

-- System can insert usage events
CREATE POLICY "System can insert usage events"
ON public.usage_events FOR INSERT
WITH CHECK (true);

-- Decoder Licenses: Org admins can manage licenses
CREATE POLICY "Org admins can manage decoder licenses"
ON public.decoder_licenses FOR ALL
USING (is_org_admin(auth.uid(), org_id));

-- Users can view their own licenses
CREATE POLICY "Users can view their licenses"
ON public.decoder_licenses FOR SELECT
USING (user_id = auth.uid());

-- API Keys: Org admins can manage API keys
CREATE POLICY "Org admins can manage API keys"
ON public.api_keys FOR ALL
USING (is_org_admin(auth.uid(), org_id));

-- Audit Log: Org admins can view audit logs
CREATE POLICY "Org admins can view audit logs"
ON public.lattice_audit_log FOR SELECT
USING (is_org_admin(auth.uid(), org_id));

-- System admins can view all audit logs
CREATE POLICY "System admins can view all audit logs"
ON public.lattice_audit_log FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, slug, description, monthly_base_cents, per_glyph_cents, per_word_cents, included_glyphs_monthly, included_words_monthly, max_lattices, max_members, features) VALUES
('Free', 'free', 'Try QBC encoding with limited usage', 0, 0.05, 0.25, 100, 20, 1, 1, '{"support": "community", "api_access": false}'),
('Starter', 'starter', 'For individuals and small projects', 2900, 0.02, 0.10, 5000, 1000, 2, 3, '{"support": "email", "api_access": true, "custom_lattice": false}'),
('Professional', 'professional', 'For teams and businesses', 9900, 0.01, 0.05, 25000, 5000, 5, 10, '{"support": "priority", "api_access": true, "custom_lattice": true, "white_label": false}'),
('Enterprise', 'enterprise', 'For large organizations with custom needs', 49900, 0.005, 0.025, 250000, 50000, -1, -1, '{"support": "dedicated", "api_access": true, "custom_lattice": true, "white_label": true, "sla": true}');

-- Create trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at
BEFORE UPDATE ON public.pricing_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();