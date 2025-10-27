-- Create app registry table
CREATE TABLE IF NOT EXISTS public.app_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  app_name TEXT NOT NULL,
  app_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  version TEXT DEFAULT '1.0.0',
  icon_url TEXT,
  banner_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_white_label_ready BOOLEAN DEFAULT false,
  base_price NUMERIC(10,2) DEFAULT 0,
  white_label_price NUMERIC(10,2) DEFAULT 0,
  affiliate_commission_tier1 NUMERIC(5,2) DEFAULT 20,
  affiliate_commission_tier2 NUMERIC(5,2) DEFAULT 5,
  stripe_price_id TEXT,
  stripe_white_label_price_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create app licenses table
CREATE TABLE IF NOT EXISTS public.app_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.app_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  license_type TEXT NOT NULL CHECK (license_type IN ('direct', 'white_label', 'affiliate')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create white label configs table
CREATE TABLE IF NOT EXISTS public.white_label_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES public.app_licenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  app_id UUID NOT NULL REFERENCES public.app_registry(id),
  brand_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4A90E2',
  secondary_color TEXT DEFAULT '#6B7280',
  custom_domain TEXT,
  custom_pricing NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(license_id)
);

-- Create affiliate commissions table
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id),
  referred_user_id UUID NOT NULL REFERENCES auth.users(id),
  app_id UUID NOT NULL REFERENCES public.app_registry(id),
  license_id UUID NOT NULL REFERENCES public.app_licenses(id),
  commission_tier INTEGER NOT NULL CHECK (commission_tier IN (1, 2)),
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create app analytics table
CREATE TABLE IF NOT EXISTS public.app_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.app_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_registry_slug ON public.app_registry(app_slug);
CREATE INDEX IF NOT EXISTS idx_app_registry_published ON public.app_registry(is_published);
CREATE INDEX IF NOT EXISTS idx_app_licenses_user ON public.app_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_app_licenses_app ON public.app_licenses(app_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON public.affiliate_commissions(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_app_user ON public.app_analytics(app_id, user_id);

-- Enable RLS
ALTER TABLE public.app_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_registry
CREATE POLICY "Anyone can view published apps"
  ON public.app_registry FOR SELECT
  USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Creators can manage their apps"
  ON public.app_registry FOR ALL
  USING (created_by = auth.uid());

-- RLS Policies for app_licenses
CREATE POLICY "Users can view their licenses"
  ON public.app_licenses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create licenses"
  ON public.app_licenses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their licenses"
  ON public.app_licenses FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for white_label_configs
CREATE POLICY "Users can manage their white label configs"
  ON public.white_label_configs FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for affiliate_commissions
CREATE POLICY "Affiliates can view their commissions"
  ON public.affiliate_commissions FOR SELECT
  USING (affiliate_user_id = auth.uid());

-- RLS Policies for app_analytics
CREATE POLICY "Users can view their app analytics"
  ON public.app_analytics FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.app_registry 
    WHERE id = app_analytics.app_id AND created_by = auth.uid()
  ));

CREATE POLICY "Users can create analytics events"
  ON public.app_analytics FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_app_registry_updated_at
  BEFORE UPDATE ON public.app_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_licenses_updated_at
  BEFORE UPDATE ON public.app_licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_white_label_configs_updated_at
  BEFORE UPDATE ON public.white_label_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at
  BEFORE UPDATE ON public.affiliate_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();