-- Create enums for platform management (conditional)
DO $$ BEGIN
  CREATE TYPE platform_status AS ENUM (
    'discovered',
    'preview',
    'claimed',
    'active',
    'suspended',
    'transferred'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE connector_auth_type AS ENUM (
    'oauth2',
    'oauth1',
    'api_key',
    'manual',
    'webhook'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE delegation_type AS ENUM (
    'human',
    'ai',
    'hybrid'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM (
    'draft',
    'scheduled',
    'published',
    'failed',
    'deleted'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Platform registry (all 60 platforms)
CREATE TABLE IF NOT EXISTS public.social_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL UNIQUE,
  platform_slug TEXT NOT NULL UNIQUE,
  category platform_category NOT NULL,
  display_order INTEGER NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  api_available BOOLEAN DEFAULT false,
  requires_app_review BOOLEAN DEFAULT false,
  supports_posting BOOLEAN DEFAULT true,
  supports_analytics BOOLEAN DEFAULT false,
  supports_messaging BOOLEAN DEFAULT false,
  auth_type connector_auth_type NOT NULL,
  connector_config JSONB DEFAULT '{}'::jsonb,
  rate_limits JSONB DEFAULT '{}'::jsonb,
  media_constraints JSONB DEFAULT '{}'::jsonb,
  handover_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business discovery and digital presence
CREATE TABLE IF NOT EXISTS public.business_discovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  business_website TEXT,
  industry TEXT,
  ein TEXT,
  discovery_source TEXT,
  discovery_data JSONB DEFAULT '{}'::jsonb,
  digital_presence_score INTEGER DEFAULT 0,
  platforms_found TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Claim requests with legal compliance
CREATE TABLE IF NOT EXISTS public.platform_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_discovery_id UUID REFERENCES public.business_discovery(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.social_platforms(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  requester_title TEXT,
  verification_code TEXT NOT NULL,
  verification_sent_at TIMESTAMPTZ DEFAULT now(),
  verification_expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  verified_at TIMESTAMPTZ,
  consent_given BOOLEAN DEFAULT false,
  consent_ip TEXT,
  consent_user_agent TEXT,
  consent_timestamp TIMESTAMPTZ,
  terms_accepted BOOLEAN DEFAULT false,
  dpa_accepted BOOLEAN DEFAULT false,
  status platform_status DEFAULT 'discovered',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social accounts (connected platforms)
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_discovery_id UUID REFERENCES public.business_discovery(id) ON DELETE SET NULL,
  platform_id UUID REFERENCES public.social_platforms(id) ON DELETE CASCADE,
  claim_request_id UUID REFERENCES public.platform_claim_requests(id) ON DELETE SET NULL,
  account_handle TEXT,
  account_name TEXT,
  account_url TEXT,
  profile_image_url TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  status platform_status DEFAULT 'discovered',
  is_verified BOOLEAN DEFAULT false,
  is_business_account BOOLEAN DEFAULT false,
  credential_vault_id UUID,
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.social_accounts ADD CONSTRAINT social_accounts_unique_handle 
    UNIQUE(user_id, platform_id, account_handle);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Credential vault (encrypted storage)
CREATE TABLE IF NOT EXISTS public.credential_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  encrypted_credentials TEXT NOT NULL,
  token_type TEXT,
  expires_at TIMESTAMPTZ,
  refresh_token_encrypted TEXT,
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update social_accounts to reference credential_vault
DO $$ BEGIN
  ALTER TABLE public.social_accounts 
    ADD CONSTRAINT fk_credential_vault 
    FOREIGN KEY (credential_vault_id) 
    REFERENCES public.credential_vault(id) 
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Social posts (content management)
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.social_platforms(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status post_status DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  platform_post_id TEXT,
  platform_url TEXT,
  engagement_data JSONB DEFAULT '{}'::jsonb,
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  delegated_to_human UUID REFERENCES auth.users(id),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Platform delegation (human & AI assignments)
CREATE TABLE IF NOT EXISTS public.platform_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.social_platforms(id) ON DELETE CASCADE,
  delegation_type delegation_type NOT NULL,
  delegated_to_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ai_agent_config JSONB DEFAULT '{}'::jsonb,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social analytics (aggregated metrics)
CREATE TABLE IF NOT EXISTS public.social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.social_platforms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  followers_lost INTEGER DEFAULT 0,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.social_analytics ADD CONSTRAINT social_analytics_unique_date 
    UNIQUE(social_account_id, platform_id, date);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Consent logs (legal compliance)
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_request_id UUID REFERENCES public.platform_claim_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  signature_data TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_discovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Anyone can view platforms"
    ON public.social_platforms FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their discoveries"
    ON public.business_discovery FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their claims"
    ON public.platform_claim_requests FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.business_discovery
      WHERE id = platform_claim_requests.business_discovery_id
      AND user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create claims"
    ON public.platform_claim_requests FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.business_discovery
      WHERE id = platform_claim_requests.business_discovery_id
      AND user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their accounts"
    ON public.social_accounts FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their credentials"
    ON public.credential_vault FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.social_accounts
      WHERE id = credential_vault.social_account_id
      AND user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their posts"
    ON public.social_posts FOR ALL
    USING (auth.uid() = user_id OR auth.uid() = delegated_to_human);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their delegations"
    ON public.platform_delegations FOR ALL
    USING (auth.uid() = user_id OR auth.uid() = delegated_to_user);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their analytics"
    ON public.social_analytics FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.social_accounts
      WHERE id = social_analytics.social_account_id
      AND user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their consent logs"
    ON public.consent_logs FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_discovery_user ON public.business_discovery(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_account ON public.social_posts(social_account_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_analytics_account_date ON public.social_analytics(social_account_id, date);
CREATE INDEX IF NOT EXISTS idx_platform_delegations_user ON public.platform_delegations(user_id);

-- Insert all 60 platforms (only if table is empty)
INSERT INTO public.social_platforms (platform_name, platform_slug, category, display_order, api_available, requires_app_review, auth_type, connector_config)
SELECT * FROM (VALUES
  ('Instagram', 'instagram', 'social_media'::platform_category, 1, true, true, 'oauth2'::connector_auth_type, '{"app_review_required": true, "permissions": ["instagram_basic", "instagram_content_publish"]}'::jsonb),
  ('Facebook', 'facebook', 'social_media'::platform_category, 2, true, true, 'oauth2'::connector_auth_type, '{"app_review_required": true, "permissions": ["pages_manage_posts", "pages_read_engagement"]}'::jsonb),
  ('LinkedIn', 'linkedin', 'professional'::platform_category, 3, true, true, 'oauth2'::connector_auth_type, '{"app_review_required": true, "permissions": ["w_member_social", "r_organization_admin"]}'::jsonb),
  ('X (Twitter)', 'twitter', 'social_media'::platform_category, 4, true, false, 'oauth2'::connector_auth_type, '{"elevated_access": true}'::jsonb),
  ('TikTok', 'tiktok', 'video'::platform_category, 5, true, true, 'oauth2'::connector_auth_type, '{"content_posting_api": true}'::jsonb),
  ('YouTube', 'youtube', 'video'::platform_category, 6, true, true, 'oauth2'::connector_auth_type, '{"resumable_upload": true, "permissions": ["youtube.upload"]}'::jsonb),
  ('Pinterest', 'pinterest', 'social_media'::platform_category, 7, true, false, 'oauth2'::connector_auth_type, '{"api_version": "v5"}'::jsonb),
  ('Snapchat', 'snapchat', 'social_media'::platform_category, 8, true, true, 'oauth2'::connector_auth_type, '{"marketing_api": true}'::jsonb),
  ('Reddit', 'reddit', 'social_media'::platform_category, 9, true, false, 'oauth2'::connector_auth_type, '{"note": "API pricing applies"}'::jsonb),
  ('Threads', 'threads', 'social_media'::platform_category, 10, true, true, 'oauth2'::connector_auth_type, '{"part_of_meta": true}'::jsonb),
  ('WhatsApp Business', 'whatsapp', 'messaging'::platform_category, 11, true, true, 'api_key'::connector_auth_type, '{"phone_verification": true, "template_approval": true}'::jsonb),
  ('Telegram', 'telegram', 'messaging'::platform_category, 12, true, false, 'api_key'::connector_auth_type, '{"bot_token": true}'::jsonb),
  ('Discord', 'discord', 'messaging'::platform_category, 13, true, false, 'api_key'::connector_auth_type, '{"bot_or_webhook": true}'::jsonb),
  ('Quora', 'quora', 'social_media'::platform_category, 14, false, false, 'manual'::connector_auth_type, '{"limited_api": true}'::jsonb),
  ('Medium', 'medium', 'creative'::platform_category, 15, true, false, 'oauth2'::connector_auth_type, '{"integration_tokens": true}'::jsonb),
  ('Tumblr', 'tumblr', 'social_media'::platform_category, 16, true, false, 'oauth1'::connector_auth_type, '{"oauth_1.0a": true}'::jsonb),
  ('BeReal', 'bereal', 'emerging'::platform_category, 17, false, false, 'manual'::connector_auth_type, '{"no_public_api": true}'::jsonb),
  ('Vimeo', 'vimeo', 'video'::platform_category, 18, true, false, 'oauth2'::connector_auth_type, '{"resumable_upload": true}'::jsonb),
  ('Google Business Profile', 'google_business', 'local_business'::platform_category, 19, true, true, 'oauth2'::connector_auth_type, '{"verification_required": true}'::jsonb),
  ('Nextdoor', 'nextdoor', 'local_business'::platform_category, 20, false, false, 'manual'::connector_auth_type, '{"partnership_required": true}'::jsonb),
  ('Twitch', 'twitch', 'video'::platform_category, 21, true, false, 'oauth2'::connector_auth_type, '{"streaming_api": true}'::jsonb),
  ('WeChat', 'wechat', 'regional'::platform_category, 22, true, true, 'api_key'::connector_auth_type, '{"china_verification": true, "local_phone": true}'::jsonb),
  ('Line', 'line', 'messaging'::platform_category, 23, true, false, 'api_key'::connector_auth_type, '{"channel_access_token": true}'::jsonb),
  ('Signal', 'signal', 'messaging'::platform_category, 24, false, false, 'manual'::connector_auth_type, '{"no_public_api": true}'::jsonb),
  ('Clubhouse', 'clubhouse', 'emerging'::platform_category, 25, false, false, 'manual'::connector_auth_type, '{"no_public_api": true}'::jsonb),
  ('Truth Social', 'truth_social', 'emerging'::platform_category, 26, false, false, 'manual'::connector_auth_type, '{"limited_api": true}'::jsonb),
  ('Mastodon', 'mastodon', 'emerging'::platform_category, 27, true, false, 'oauth2'::connector_auth_type, '{"federation": true, "per_instance": true}'::jsonb),
  ('Bluesky', 'bluesky', 'emerging'::platform_category, 28, true, false, 'api_key'::connector_auth_type, '{"at_protocol": true}'::jsonb),
  ('Rumble', 'rumble', 'video'::platform_category, 29, false, true, 'manual'::connector_auth_type, '{"partnership_required": true}'::jsonb),
  ('Substack', 'substack', 'creative'::platform_category, 30, true, false, 'oauth2'::connector_auth_type, '{"newsletter_api": true}'::jsonb),
  ('Flickr', 'flickr', 'creative'::platform_category, 31, true, false, 'oauth1'::connector_auth_type, '{"oauth_1.0a": true}'::jsonb),
  ('Dailymotion', 'dailymotion', 'video'::platform_category, 32, true, false, 'oauth2'::connector_auth_type, '{"video_upload": true}'::jsonb),
  ('MeWe', 'mewe', 'social_media'::platform_category, 33, false, false, 'manual'::connector_auth_type, '{"limited_api": true}'::jsonb),
  ('Gab', 'gab', 'emerging'::platform_category, 34, false, false, 'manual'::connector_auth_type, '{"limited_api": true}'::jsonb),
  ('Locals', 'locals', 'emerging'::platform_category, 35, false, false, 'manual'::connector_auth_type, '{"creator_platform": true}'::jsonb),
  ('VK (VKontakte)', 'vk', 'regional'::platform_category, 36, true, false, 'oauth2'::connector_auth_type, '{"russia_platform": true}'::jsonb),
  ('QQ', 'qq', 'regional'::platform_category, 37, true, true, 'api_key'::connector_auth_type, '{"china_verification": true}'::jsonb),
  ('Sina Weibo', 'weibo', 'regional'::platform_category, 38, true, true, 'oauth2'::connector_auth_type, '{"china_verification": true}'::jsonb),
  ('Mix', 'mix', 'niche'::platform_category, 39, false, false, 'manual'::connector_auth_type, '{"formerly_stumbleupon": true}'::jsonb),
  ('BitChute', 'bitchute', 'video'::platform_category, 40, false, false, 'manual'::connector_auth_type, '{"limited_api": true}'::jsonb),
  ('Patreon', 'patreon', 'creative'::platform_category, 41, true, false, 'oauth2'::connector_auth_type, '{"creator_api": true}'::jsonb),
  ('OnlyFans', 'onlyfans', 'creative'::platform_category, 42, false, false, 'manual'::connector_auth_type, '{"no_public_api": true, "creator_only": true}'::jsonb),
  ('SoundCloud', 'soundcloud', 'audio'::platform_category, 43, true, false, 'oauth2'::connector_auth_type, '{"audio_upload": true}'::jsonb),
  ('Bandcamp', 'bandcamp', 'audio'::platform_category, 44, false, false, 'manual'::connector_auth_type, '{"artist_platform": true}'::jsonb),
  ('DeviantArt', 'deviantart', 'creative'::platform_category, 45, true, false, 'oauth2'::connector_auth_type, '{"art_upload": true}'::jsonb),
  ('Behance', 'behance', 'creative'::platform_category, 46, true, false, 'api_key'::connector_auth_type, '{"adobe_platform": true}'::jsonb),
  ('Dribbble', 'dribbble', 'creative'::platform_category, 47, true, false, 'oauth2'::connector_auth_type, '{"designer_platform": true}'::jsonb),
  ('Goodreads', 'goodreads', 'niche'::platform_category, 48, true, false, 'api_key'::connector_auth_type, '{"limited_posting": true}'::jsonb),
  ('Yelp', 'yelp', 'local_business'::platform_category, 49, true, false, 'api_key'::connector_auth_type, '{"business_claiming": true}'::jsonb),
  ('Foursquare', 'foursquare', 'local_business'::platform_category, 50, true, false, 'oauth2'::connector_auth_type, '{"venue_management": true}'::jsonb),
  ('Product Hunt', 'producthunt', 'professional'::platform_category, 51, true, false, 'oauth2'::connector_auth_type, '{"product_launch": true}'::jsonb),
  ('AngelList', 'angellist', 'professional'::platform_category, 52, true, false, 'oauth2'::connector_auth_type, '{"startup_platform": true}'::jsonb),
  ('Crunchbase', 'crunchbase', 'professional'::platform_category, 53, true, false, 'api_key'::connector_auth_type, '{"data_focused": true}'::jsonb),
  ('SlideShare', 'slideshare', 'professional'::platform_category, 54, true, false, 'api_key'::connector_auth_type, '{"linkedin_owned": true}'::jsonb),
  ('Flipboard', 'flipboard', 'niche'::platform_category, 55, false, false, 'manual'::connector_auth_type, '{"curation_platform": true}'::jsonb),
  ('ReverbNation', 'reverbnation', 'audio'::platform_category, 56, false, false, 'manual'::connector_auth_type, '{"musician_platform": true}'::jsonb),
  ('Ello', 'ello', 'creative'::platform_category, 57, false, false, 'manual'::connector_auth_type, '{"artist_network": true}'::jsonb),
  ('Caffeine', 'caffeine', 'video'::platform_category, 58, false, false, 'manual'::connector_auth_type, '{"streaming_platform": true}'::jsonb),
  ('Steam Community', 'steam', 'niche'::platform_category, 59, true, false, 'api_key'::connector_auth_type, '{"gaming_platform": true}'::jsonb),
  ('Gaia Online', 'gaia', 'niche'::platform_category, 60, false, false, 'manual'::connector_auth_type, '{"gaming_social": true}'::jsonb)
) AS v(platform_name, platform_slug, category, display_order, api_available, requires_app_review, auth_type, connector_config)
WHERE NOT EXISTS (SELECT 1 FROM public.social_platforms LIMIT 1);