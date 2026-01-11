-- Creator Studio Tables
-- Brand licensing and royalty management
CREATE TABLE public.creator_brand_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_name TEXT NOT NULL,
  brand_category TEXT NOT NULL DEFAULT 'personal', -- personal, product, service, media
  license_type TEXT NOT NULL DEFAULT 'exclusive', -- exclusive, non-exclusive, limited
  royalty_percent NUMERIC NOT NULL DEFAULT 10,
  minimum_guarantee NUMERIC DEFAULT 0,
  territory TEXT DEFAULT 'worldwide',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active', -- draft, active, paused, expired, terminated
  licensee_info JSONB DEFAULT '{}',
  terms_summary TEXT,
  total_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Royalty transactions
CREATE TABLE public.creator_royalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.creator_brand_licenses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'royalty', -- royalty, minimum_guarantee, bonus, adjustment
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  gross_sales NUMERIC,
  notes TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, paid, failed
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Passive income businesses spawned by creators
CREATE TABLE public.creator_passive_businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- course, ebook, merchandise, saas, subscription, affiliate
  description TEXT,
  setup_cost NUMERIC DEFAULT 0,
  monthly_revenue NUMERIC DEFAULT 0,
  monthly_expenses NUMERIC DEFAULT 0,
  automation_level TEXT DEFAULT 'partial', -- manual, partial, full
  status TEXT NOT NULL DEFAULT 'idea', -- idea, planning, building, launched, scaling, paused
  launch_date TIMESTAMPTZ,
  spawned_business_id UUID, -- link to spawned_businesses if applicable
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- White-label content templates
CREATE TABLE public.creator_content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  content_type TEXT NOT NULL, -- social_post, email, video_script, blog, ad_copy
  template_body TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- placeholders like {{product_name}}, {{benefit}}
  tone TEXT DEFAULT 'authentic', -- authentic, professional, casual, enthusiastic
  use_count INTEGER DEFAULT 0,
  performance_score NUMERIC,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_brand_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_royalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_passive_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_content_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand licenses
CREATE POLICY "Users can manage their own licenses"
  ON public.creator_brand_licenses FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for royalty transactions
CREATE POLICY "Users can view royalties for their licenses"
  ON public.creator_royalty_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_brand_licenses
      WHERE id = creator_royalty_transactions.license_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage royalties for their licenses"
  ON public.creator_royalty_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_brand_licenses
      WHERE id = creator_royalty_transactions.license_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for passive businesses
CREATE POLICY "Users can manage their own passive businesses"
  ON public.creator_passive_businesses FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for content templates
CREATE POLICY "Users can manage their own templates"
  ON public.creator_content_templates FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates"
  ON public.creator_content_templates FOR SELECT
  USING (is_public = true);

-- Triggers for updated_at
CREATE TRIGGER update_creator_brand_licenses_updated_at
  BEFORE UPDATE ON public.creator_brand_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_passive_businesses_updated_at
  BEFORE UPDATE ON public.creator_passive_businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_content_templates_updated_at
  BEFORE UPDATE ON public.creator_content_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();