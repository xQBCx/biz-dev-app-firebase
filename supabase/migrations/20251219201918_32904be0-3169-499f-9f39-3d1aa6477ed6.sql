-- Ecosystem Apps Registry (for child Lovable apps and external companies)
CREATE TABLE public.ecosystem_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.clients(id),
  app_type TEXT NOT NULL DEFAULT 'external' CHECK (app_type IN ('lovable_child', 'external', 'microsoft_365', 'google_workspace', 'hubspot', 'salesforce', 'zoho', 'other')),
  supabase_url TEXT,
  webhook_url TEXT,
  api_key_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'active', 'suspended', 'disconnected')),
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- External System Authorizations (OAuth tokens for external platforms)
CREATE TABLE public.external_system_authorizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ecosystem_app_id UUID REFERENCES public.ecosystem_apps(id),
  platform TEXT NOT NULL CHECK (platform IN ('microsoft_365', 'google_workspace', 'hubspot', 'salesforce', 'zoho', 'dynamics', 'pipedrive', 'freshsales', 'other')),
  oauth_access_token_encrypted TEXT,
  oauth_refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scopes_granted TEXT[],
  authorization_status TEXT NOT NULL DEFAULT 'pending' CHECK (authorization_status IN ('pending', 'authorized', 'expired', 'revoked', 'failed')),
  authorized_at TIMESTAMP WITH TIME ZONE,
  last_refresh_at TIMESTAMP WITH TIME ZONE,
  last_crawl_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System Discovery Sessions (crawl results)
CREATE TABLE public.system_discovery_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  authorization_id UUID NOT NULL REFERENCES public.external_system_authorizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  discovery_status TEXT NOT NULL DEFAULT 'pending' CHECK (discovery_status IN ('pending', 'in_progress', 'completed', 'failed', 'partial')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  discovered_data JSONB DEFAULT '{}',
  analysis_result JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  migration_roadmap JSONB DEFAULT '{}',
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ecosystem App Features (which features are enabled per app)
CREATE TABLE public.ecosystem_app_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ecosystem_app_id UUID NOT NULL REFERENCES public.ecosystem_apps(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL CHECK (feature_name IN ('crm', 'marketing', 'workflows', 'erp', 'analytics', 'lead_discovery', 'email', 'calendar', 'storage', 'ai_assistant')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID REFERENCES auth.users(id),
  config JSONB DEFAULT '{}',
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ecosystem_app_id, feature_name)
);

-- Ecosystem Contact Sync (track contact flow between apps)
CREATE TABLE public.ecosystem_contact_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_app_id UUID REFERENCES public.ecosystem_apps(id),
  target_app_id UUID REFERENCES public.ecosystem_apps(id),
  contact_id UUID REFERENCES public.crm_contacts(id),
  external_contact_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'bidirectional')),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'conflict')),
  sync_data JSONB DEFAULT '{}',
  synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ecosystem_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_system_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_app_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_contact_sync ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ecosystem_apps
CREATE POLICY "Users can view ecosystem apps they own or are connected to"
ON public.ecosystem_apps FOR SELECT
USING (owner_user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.external_system_authorizations 
  WHERE ecosystem_app_id = ecosystem_apps.id AND user_id = auth.uid()
));

CREATE POLICY "Users can create ecosystem apps"
ON public.ecosystem_apps FOR INSERT
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their own ecosystem apps"
ON public.ecosystem_apps FOR UPDATE
USING (owner_user_id = auth.uid());

CREATE POLICY "Users can delete their own ecosystem apps"
ON public.ecosystem_apps FOR DELETE
USING (owner_user_id = auth.uid());

-- RLS Policies for external_system_authorizations
CREATE POLICY "Users can view their own authorizations"
ON public.external_system_authorizations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own authorizations"
ON public.external_system_authorizations FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own authorizations"
ON public.external_system_authorizations FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own authorizations"
ON public.external_system_authorizations FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for system_discovery_sessions
CREATE POLICY "Users can view their own discovery sessions"
ON public.system_discovery_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own discovery sessions"
ON public.system_discovery_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own discovery sessions"
ON public.system_discovery_sessions FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for ecosystem_app_features
CREATE POLICY "Users can view features for apps they own"
ON public.ecosystem_app_features FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ecosystem_apps 
  WHERE id = ecosystem_app_features.ecosystem_app_id AND owner_user_id = auth.uid()
));

CREATE POLICY "Users can manage features for apps they own"
ON public.ecosystem_app_features FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.ecosystem_apps 
  WHERE id = ecosystem_app_features.ecosystem_app_id AND owner_user_id = auth.uid()
));

-- RLS Policies for ecosystem_contact_sync
CREATE POLICY "Users can view contact syncs for their apps"
ON public.ecosystem_contact_sync FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ecosystem_apps 
  WHERE (id = ecosystem_contact_sync.source_app_id OR id = ecosystem_contact_sync.target_app_id)
  AND owner_user_id = auth.uid()
));

CREATE POLICY "Users can create contact syncs for their apps"
ON public.ecosystem_contact_sync FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ecosystem_apps 
  WHERE id = ecosystem_contact_sync.source_app_id AND owner_user_id = auth.uid()
));

-- Add source_app_id to crm_contacts for tracking contact origin
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS source_ecosystem_app_id UUID REFERENCES public.ecosystem_apps(id);
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS external_source_id TEXT;
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS sync_metadata JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX idx_ecosystem_apps_owner ON public.ecosystem_apps(owner_user_id);
CREATE INDEX idx_ecosystem_apps_status ON public.ecosystem_apps(status);
CREATE INDEX idx_external_auth_user ON public.external_system_authorizations(user_id);
CREATE INDEX idx_external_auth_platform ON public.external_system_authorizations(platform);
CREATE INDEX idx_discovery_sessions_auth ON public.system_discovery_sessions(authorization_id);
CREATE INDEX idx_ecosystem_features_app ON public.ecosystem_app_features(ecosystem_app_id);
CREATE INDEX idx_contact_sync_source ON public.ecosystem_contact_sync(source_app_id);
CREATE INDEX idx_contact_sync_target ON public.ecosystem_contact_sync(target_app_id);

-- Trigger for updated_at
CREATE TRIGGER update_ecosystem_apps_updated_at
BEFORE UPDATE ON public.ecosystem_apps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_auth_updated_at
BEFORE UPDATE ON public.external_system_authorizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discovery_sessions_updated_at
BEFORE UPDATE ON public.system_discovery_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecosystem_features_updated_at
BEFORE UPDATE ON public.ecosystem_app_features
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();