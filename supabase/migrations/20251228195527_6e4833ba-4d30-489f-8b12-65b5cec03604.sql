-- External Platform Registry: Comprehensive catalog of 30+ digital product development platforms
CREATE TABLE IF NOT EXISTS public.external_platform_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_slug TEXT NOT NULL UNIQUE,
  platform_name TEXT NOT NULL,
  platform_category TEXT NOT NULL,
  platform_subcategory TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  documentation_url TEXT,
  integration_type TEXT[] DEFAULT '{}',
  supported_auth_methods TEXT[] DEFAULT '{}',
  api_base_url TEXT,
  oauth_authorize_url TEXT,
  oauth_token_url TEXT,
  webhook_support BOOLEAN DEFAULT false,
  realtime_sync_capable BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT true,
  can_import_data BOOLEAN DEFAULT true,
  supported_data_formats TEXT[] DEFAULT '{}',
  data_types_available TEXT[] DEFAULT '{}',
  optimization_score INTEGER DEFAULT 0,
  common_gaps TEXT[] DEFAULT '{}',
  recommended_modules TEXT[] DEFAULT '{}',
  popularity_rank INTEGER,
  monthly_active_users TEXT,
  pricing_model TEXT,
  target_audience TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User platform connections
CREATE TABLE IF NOT EXISTS public.user_platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_id UUID NOT NULL REFERENCES public.external_platform_registry(id),
  connection_name TEXT,
  connection_status TEXT DEFAULT 'pending',
  auth_method TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  api_key_encrypted TEXT,
  webhook_url TEXT,
  webhook_secret_encrypted TEXT,
  external_account_id TEXT,
  external_account_name TEXT,
  external_workspace_id TEXT,
  platform_metadata JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT,
  last_sync_error TEXT,
  sync_frequency_minutes INTEGER DEFAULT 60,
  auto_sync_enabled BOOLEAN DEFAULT true,
  discovery_completed_at TIMESTAMP WITH TIME ZONE,
  discovered_projects JSONB DEFAULT '[]',
  discovered_capabilities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_id, external_account_id)
);

-- Platform project imports
CREATE TABLE IF NOT EXISTS public.platform_project_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.user_platform_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  external_project_id TEXT NOT NULL,
  external_project_name TEXT NOT NULL,
  external_project_url TEXT,
  external_created_at TIMESTAMP WITH TIME ZONE,
  external_updated_at TIMESTAMP WITH TIME ZONE,
  import_status TEXT DEFAULT 'discovered',
  import_started_at TIMESTAMP WITH TIME ZONE,
  import_completed_at TIMESTAMP WITH TIME ZONE,
  import_error TEXT,
  analysis_score INTEGER,
  analysis_data JSONB DEFAULT '{}',
  identified_gaps JSONB DEFAULT '[]',
  optimization_opportunities JSONB DEFAULT '[]',
  revenue_potential_estimate TEXT,
  time_savings_estimate TEXT,
  risk_reduction_areas TEXT[] DEFAULT '{}',
  collaboration_improvements TEXT[] DEFAULT '{}',
  recommended_modules JSONB DEFAULT '[]',
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  is_actively_monitored BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(connection_id, external_project_id)
);

-- Platform gap analysis
CREATE TABLE IF NOT EXISTS public.platform_gap_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_id UUID REFERENCES public.platform_project_imports(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.user_platform_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  gap_category TEXT NOT NULL,
  gap_type TEXT NOT NULL,
  gap_severity TEXT DEFAULT 'medium',
  gap_title TEXT NOT NULL,
  gap_description TEXT,
  impacts_revenue BOOLEAN DEFAULT false,
  revenue_impact_estimate TEXT,
  impacts_time BOOLEAN DEFAULT false,
  time_impact_estimate TEXT,
  impacts_liability BOOLEAN DEFAULT false,
  liability_impact_description TEXT,
  impacts_collaboration BOOLEAN DEFAULT false,
  collaboration_impact_description TEXT,
  recommended_solution TEXT,
  solution_module_slug TEXT,
  solution_complexity TEXT DEFAULT 'medium',
  implementation_time_estimate TEXT,
  status TEXT DEFAULT 'identified',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform recommendations
CREATE TABLE IF NOT EXISTS public.platform_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connection_id UUID REFERENCES public.user_platform_connections(id) ON DELETE CASCADE,
  import_id UUID REFERENCES public.platform_project_imports(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  detailed_action_plan JSONB DEFAULT '[]',
  primary_benefit TEXT,
  estimated_value TEXT,
  effort_level TEXT DEFAULT 'medium',
  roi_score INTEGER,
  related_module_slug TEXT,
  module_features_used TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  user_feedback TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  generated_by TEXT DEFAULT 'system',
  confidence_score DECIMAL(3,2),
  generation_context JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_platform_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_project_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "view_platform_registry" ON public.external_platform_registry FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "admin_manage_platform_registry" ON public.external_platform_registry FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "view_own_connections" ON public.user_platform_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "create_own_connections" ON public.user_platform_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_connections" ON public.user_platform_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_connections" ON public.user_platform_connections FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "view_own_imports" ON public.platform_project_imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "create_own_imports" ON public.platform_project_imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_imports" ON public.platform_project_imports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_imports" ON public.platform_project_imports FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "view_own_gaps" ON public.platform_gap_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "create_own_gaps" ON public.platform_gap_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_gaps" ON public.platform_gap_analysis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "view_own_recs" ON public.platform_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update_own_recs" ON public.platform_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "system_create_recs" ON public.platform_recommendations FOR INSERT WITH CHECK (true);

-- Triggers
CREATE TRIGGER trg_ext_platform_registry_updated BEFORE UPDATE ON public.external_platform_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_platform_conn_updated BEFORE UPDATE ON public.user_platform_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_platform_proj_imports_updated BEFORE UPDATE ON public.platform_project_imports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_platform_gap_analysis_updated BEFORE UPDATE ON public.platform_gap_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_platform_recs_updated BEFORE UPDATE ON public.platform_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();