-- Brand Marketing Configuration (linked to franchises)
CREATE TABLE public.brand_marketing_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  brand_voice TEXT, -- e.g., "professional, innovative, trustworthy"
  content_themes TEXT[], -- e.g., ["infrastructure", "sustainability", "technology"]
  target_audiences TEXT[], -- e.g., ["municipalities", "contractors", "fleet managers"]
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e293b',
  logo_url TEXT,
  automation_enabled BOOLEAN DEFAULT true,
  automation_schedule TEXT DEFAULT '0 6 * * *', -- cron: 6am daily
  signal_boost_enabled BOOLEAN DEFAULT true, -- respond to high-priority signals
  signal_boost_threshold INTEGER DEFAULT 70, -- urgency score threshold
  content_types_enabled TEXT[] DEFAULT ARRAY['blog', 'social_post', 'email', 'image', 'video', 'audio'],
  social_platforms TEXT[], -- platform slugs to deploy to
  physical_stations TEXT[], -- station IDs for physical displays
  upn_broadcast_enabled BOOLEAN DEFAULT true,
  notification_email TEXT,
  notification_webhook_url TEXT,
  last_content_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing Content Queue
CREATE TABLE public.marketing_content_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_config_id UUID REFERENCES public.brand_marketing_config(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'blog', 'social_post', 'email', 'image', 'flyer', 'video', 'audio'
  title TEXT NOT NULL,
  content TEXT, -- main content body or script
  media_url TEXT, -- generated image/video/audio URL
  thumbnail_url TEXT,
  market_driver TEXT, -- what signal/insight triggered this
  market_driver_signal_id UUID, -- link to situation_signals if applicable
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'deployed', 'rejected', 'archived'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  scheduled_for TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  metadata JSONB DEFAULT '{}',
  ai_model_used TEXT,
  generation_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing Deployments
CREATE TABLE public.marketing_deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.marketing_content_queue(id) ON DELETE CASCADE,
  brand_config_id UUID REFERENCES public.brand_marketing_config(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  deployment_target TEXT NOT NULL, -- 'upn', 'social', 'physical_station', 'email_campaign'
  platform_slug TEXT, -- for social: 'twitter', 'linkedin', etc.
  station_id TEXT, -- for physical stations
  external_post_id TEXT, -- ID from the external platform
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  error_message TEXT,
  deployed_at TIMESTAMPTZ,
  engagement_metrics JSONB DEFAULT '{}', -- likes, shares, views, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_marketing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_marketing_config
CREATE POLICY "Users can view own brand configs" ON public.brand_marketing_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own brand configs" ON public.brand_marketing_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand configs" ON public.brand_marketing_config FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand configs" ON public.brand_marketing_config FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for marketing_content_queue
CREATE POLICY "Users can view own content queue" ON public.marketing_content_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own content" ON public.marketing_content_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON public.marketing_content_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON public.marketing_content_queue FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for marketing_deployments
CREATE POLICY "Users can view own deployments" ON public.marketing_deployments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own deployments" ON public.marketing_deployments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deployments" ON public.marketing_deployments FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_brand_config_user ON public.brand_marketing_config(user_id);
CREATE INDEX idx_brand_config_franchise ON public.brand_marketing_config(franchise_id);
CREATE INDEX idx_content_queue_brand ON public.marketing_content_queue(brand_config_id);
CREATE INDEX idx_content_queue_status ON public.marketing_content_queue(status);
CREATE INDEX idx_content_queue_user ON public.marketing_content_queue(user_id);
CREATE INDEX idx_deployments_content ON public.marketing_deployments(content_id);
CREATE INDEX idx_deployments_status ON public.marketing_deployments(status);

-- Trigger for updated_at
CREATE TRIGGER update_brand_config_updated_at BEFORE UPDATE ON public.brand_marketing_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_queue_updated_at BEFORE UPDATE ON public.marketing_content_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();