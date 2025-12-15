
-- Store Launch Module Tables

-- App Projects table
CREATE TABLE public.store_launch_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  connected_source_type TEXT NOT NULL CHECK (connected_source_type IN ('lovable', 'replit', 'github', 'url', 'zip')),
  source_url TEXT,
  github_repo TEXT,
  bundle_id_ios TEXT,
  package_name_android TEXT,
  app_icon_url TEXT,
  splash_screen_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'configuring', 'building', 'testing', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Developer Accounts table
CREATE TABLE public.store_launch_developer_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('apple', 'google')),
  account_name TEXT,
  account_email TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  team_id TEXT,
  credentials_metadata JSONB DEFAULT '{}',
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Builds table
CREATE TABLE public.store_launch_builds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.store_launch_projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  build_type TEXT NOT NULL CHECK (build_type IN ('dev', 'release', 'store')),
  version_name TEXT NOT NULL DEFAULT '1.0.0',
  version_code INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'building', 'success', 'failed', 'cancelled')),
  build_logs TEXT,
  artifact_url TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Native Feature Configs table
CREATE TABLE public.store_launch_native_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.store_launch_projects(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  setup_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, feature_key)
);

-- Store Listing Checklist table
CREATE TABLE public.store_launch_listing_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.store_launch_projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  privacy_policy_url TEXT,
  screenshots_uploaded BOOLEAN NOT NULL DEFAULT false,
  description_completed BOOLEAN NOT NULL DEFAULT false,
  age_rating_completed BOOLEAN NOT NULL DEFAULT false,
  data_disclosures_completed BOOLEAN NOT NULL DEFAULT false,
  review_notes TEXT,
  testflight_group_created BOOLEAN DEFAULT false,
  internal_testing_track_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, platform)
);

-- Revenue Share Agreement table
CREATE TABLE public.store_launch_revenue_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.store_launch_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  revenue_share_percent NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_method TEXT CHECK (verification_method IN ('stripe', 'revenuecat', 'app_store_connect', 'google_play', 'manual')),
  verification_account_id TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Revenue Events table
CREATE TABLE public.store_launch_revenue_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.store_launch_projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('purchase', 'subscription', 'refund', 'chargeback')),
  gross_amount NUMERIC(12,2) NOT NULL,
  store_fee NUMERIC(12,2) DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  platform_share NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  source TEXT NOT NULL,
  external_transaction_id TEXT,
  event_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payouts table
CREATE TABLE public.store_launch_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method TEXT,
  external_payout_id TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.store_launch_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_launch_developer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_launch_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_launch_native_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_launch_listing_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_launch_revenue_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_launch_revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_launch_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON public.store_launch_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.store_launch_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.store_launch_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.store_launch_projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for developer accounts
CREATE POLICY "Users can view their own developer accounts" ON public.store_launch_developer_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own developer accounts" ON public.store_launch_developer_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own developer accounts" ON public.store_launch_developer_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own developer accounts" ON public.store_launch_developer_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for builds (via project ownership)
CREATE POLICY "Users can view builds for their projects" ON public.store_launch_builds FOR SELECT USING (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Users can create builds for their projects" ON public.store_launch_builds FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Users can update builds for their projects" ON public.store_launch_builds FOR UPDATE USING (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));

-- RLS Policies for native features
CREATE POLICY "Users can view native features for their projects" ON public.store_launch_native_features FOR SELECT USING (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage native features for their projects" ON public.store_launch_native_features FOR ALL USING (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));

-- RLS Policies for listing checklist
CREATE POLICY "Users can view listing checklist for their projects" ON public.store_launch_listing_checklist FOR SELECT USING (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage listing checklist for their projects" ON public.store_launch_listing_checklist FOR ALL USING (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));

-- RLS Policies for revenue agreements
CREATE POLICY "Users can view their own revenue agreements" ON public.store_launch_revenue_agreements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own revenue agreements" ON public.store_launch_revenue_agreements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for revenue events (via project ownership)
CREATE POLICY "Users can view revenue events for their projects" ON public.store_launch_revenue_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.store_launch_projects WHERE id = project_id AND user_id = auth.uid()));

-- RLS Policies for payouts
CREATE POLICY "Users can view their own payouts" ON public.store_launch_payouts FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_store_launch_projects_user ON public.store_launch_projects(user_id);
CREATE INDEX idx_store_launch_builds_project ON public.store_launch_builds(project_id);
CREATE INDEX idx_store_launch_builds_status ON public.store_launch_builds(status);
CREATE INDEX idx_store_launch_revenue_events_project ON public.store_launch_revenue_events(project_id);
CREATE INDEX idx_store_launch_revenue_events_date ON public.store_launch_revenue_events(event_date);

-- Update timestamp trigger
CREATE TRIGGER update_store_launch_projects_updated_at BEFORE UPDATE ON public.store_launch_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_store_launch_developer_accounts_updated_at BEFORE UPDATE ON public.store_launch_developer_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_store_launch_native_features_updated_at BEFORE UPDATE ON public.store_launch_native_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_store_launch_listing_checklist_updated_at BEFORE UPDATE ON public.store_launch_listing_checklist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
