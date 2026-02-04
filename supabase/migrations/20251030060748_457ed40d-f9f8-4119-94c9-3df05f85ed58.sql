-- Create enums for platform management
CREATE TYPE platform_category AS ENUM (
  'social_media',
  'messaging',
  'video',
  'professional',
  'local_business',
  'creative',
  'audio',
  'emerging',
  'regional',
  'niche'
);

CREATE TYPE platform_status AS ENUM (
  'discovered',
  'preview',
  'claimed',
  'active',
  'suspended',
  'transferred'
);

CREATE TYPE connector_auth_type AS ENUM (
  'oauth2',
  'oauth1',
  'api_key',
  'manual',
  'webhook'
);

CREATE TYPE delegation_type AS ENUM (
  'human',
  'ai',
  'hybrid'
);

CREATE TYPE post_status AS ENUM (
  'draft',
  'scheduled',
  'published',
  'failed',
  'deleted'
);

-- Platform registry (all 60 platforms)
CREATE TABLE public.social_platforms (
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
CREATE TABLE public.business_discovery (
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
CREATE TABLE public.platform_claim_requests (
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
CREATE TABLE public.social_accounts (
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
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform_id, account_handle)
);

-- Credential vault (encrypted storage)
CREATE TABLE public.credential_vault (
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
ALTER TABLE public.social_accounts 
  ADD CONSTRAINT fk_credential_vault 
  FOREIGN KEY (credential_vault_id) 
  REFERENCES public.credential_vault(id) 
  ON DELETE SET NULL;

-- Social posts (content management)
CREATE TABLE public.social_posts (
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
CREATE TABLE public.platform_delegations (
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
CREATE TABLE public.social_analytics (
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
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(social_account_id, platform_id, date)
);

-- Consent logs (legal compliance)
CREATE TABLE public.consent_logs (
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

-- RLS Policies for social_platforms (public read)
CREATE POLICY "Anyone can view platforms"
  ON public.social_platforms FOR SELECT
  USING (true);

-- RLS Policies for business_discovery
CREATE POLICY "Users can manage their discoveries"
  ON public.business_discovery FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for platform_claim_requests
CREATE POLICY "Users can view their claims"
  ON public.platform_claim_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.business_discovery
    WHERE id = platform_claim_requests.business_discovery_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create claims"
  ON public.platform_claim_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.business_discovery
    WHERE id = platform_claim_requests.business_discovery_id
    AND user_id = auth.uid()
  ));

-- RLS Policies for social_accounts
CREATE POLICY "Users can manage their accounts"
  ON public.social_accounts FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for credential_vault (strict)
CREATE POLICY "Users can manage their credentials"
  ON public.credential_vault FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.social_accounts
    WHERE id = credential_vault.social_account_id
    AND user_id = auth.uid()
  ));

-- RLS Policies for social_posts
CREATE POLICY "Users can manage their posts"
  ON public.social_posts FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = delegated_to_human);

-- RLS Policies for platform_delegations
CREATE POLICY "Users can manage their delegations"
  ON public.platform_delegations FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = delegated_to_user);

-- RLS Policies for social_analytics
CREATE POLICY "Users can view their analytics"
  ON public.social_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.social_accounts
    WHERE id = social_analytics.social_account_id
    AND user_id = auth.uid()
  ));

-- RLS Policies for consent_logs
CREATE POLICY "Users can view their consent logs"
  ON public.consent_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_business_discovery_user ON public.business_discovery(user_id);
CREATE INDEX idx_social_accounts_user ON public.social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform_id);
CREATE INDEX idx_social_posts_account ON public.social_posts(social_account_id);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON public.social_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_social_analytics_account_date ON public.social_analytics(social_account_id, date);
CREATE INDEX idx_platform_delegations_user ON public.platform_delegations(user_id);

-- Insert all 60 platforms
INSERT INTO public.social_platforms (platform_name, platform_slug, category, display_order, api_available, requires_app_review, auth_type, connector_config) VALUES
  ('Instagram', 'instagram', 'social_media', 1, true, true, 'oauth2', '{"app_review_required": true, "permissions": ["instagram_basic", "instagram_content_publish"]}'),
  ('Facebook', 'facebook', 'social_media', 2, true, true, 'oauth2', '{"app_review_required": true, "permissions": ["pages_manage_posts", "pages_read_engagement"]}'),
  ('LinkedIn', 'linkedin', 'professional', 3, true, true, 'oauth2', '{"app_review_required": true, "permissions": ["w_member_social", "r_organization_admin"]}'),
  ('X (Twitter)', 'twitter', 'social_media', 4, true, false, 'oauth2', '{"elevated_access": true}'),
  ('TikTok', 'tiktok', 'video', 5, true, true, 'oauth2', '{"content_posting_api": true}'),
  ('YouTube', 'youtube', 'video', 6, true, true, 'oauth2', '{"resumable_upload": true, "permissions": ["youtube.upload"]}'),
  ('Pinterest', 'pinterest', 'social_media', 7, true, false, 'oauth2', '{"api_version": "v5"}'),
  ('Snapchat', 'snapchat', 'social_media', 8, true, true, 'oauth2', '{"marketing_api": true}'),
  ('Reddit', 'reddit', 'social_media', 9, true, false, 'oauth2', '{"note": "API pricing applies"}'),
  ('Threads', 'threads', 'social_media', 10, true, true, 'oauth2', '{"part_of_meta": true}'),
  ('WhatsApp Business', 'whatsapp', 'messaging', 11, true, true, 'api_key', '{"phone_verification": true, "template_approval": true}'),
  ('Telegram', 'telegram', 'messaging', 12, true, false, 'api_key', '{"bot_token": true}'),
  ('Discord', 'discord', 'messaging', 13, true, false, 'api_key', '{"bot_or_webhook": true}'),
  ('Quora', 'quora', 'social_media', 14, false, false, 'manual', '{"limited_api": true}'),
  ('Medium', 'medium', 'creative', 15, true, false, 'oauth2', '{"integration_tokens": true}'),
  ('Tumblr', 'tumblr', 'social_media', 16, true, false, 'oauth1', '{"oauth_1.0a": true}'),
  ('BeReal', 'bereal', 'emerging', 17, false, false, 'manual', '{"no_public_api": true}'),
  ('Vimeo', 'vimeo', 'video', 18, true, false, 'oauth2', '{"resumable_upload": true}'),
  ('Google Business Profile', 'google_business', 'local_business', 19, true, true, 'oauth2', '{"verification_required": true}'),
  ('Nextdoor', 'nextdoor', 'local_business', 20, false, false, 'manual', '{"partnership_required": true}'),
  ('Twitch', 'twitch', 'video', 21, true, false, 'oauth2', '{"streaming_api": true}'),
  ('WeChat', 'wechat', 'regional', 22, true, true, 'api_key', '{"china_verification": true, "local_phone": true}'),
  ('Line', 'line', 'messaging', 23, true, false, 'api_key', '{"channel_access_token": true}'),
  ('Signal', 'signal', 'messaging', 24, false, false, 'manual', '{"no_public_api": true}'),
  ('Clubhouse', 'clubhouse', 'emerging', 25, false, false, 'manual', '{"no_public_api": true}'),
  ('Truth Social', 'truth_social', 'emerging', 26, false, false, 'manual', '{"limited_api": true}'),
  ('Mastodon', 'mastodon', 'emerging', 27, true, false, 'oauth2', '{"federation": true, "per_instance": true}'),
  ('Bluesky', 'bluesky', 'emerging', 28, true, false, 'api_key', '{"at_protocol": true}'),
  ('Rumble', 'rumble', 'video', 29, false, true, 'manual', '{"partnership_required": true}'),
  ('Substack', 'substack', 'creative', 30, true, false, 'oauth2', '{"newsletter_api": true}'),
  ('Flickr', 'flickr', 'creative', 31, true, false, 'oauth1', '{"oauth_1.0a": true}'),
  ('Dailymotion', 'dailymotion', 'video', 32, true, false, 'oauth2', '{"video_upload": true}'),
  ('MeWe', 'mewe', 'social_media', 33, false, false, 'manual', '{"limited_api": true}'),
  ('Gab', 'gab', 'emerging', 34, false, false, 'manual', '{"limited_api": true}'),
  ('Locals', 'locals', 'emerging', 35, false, false, 'manual', '{"creator_platform": true}'),
  ('VK (VKontakte)', 'vk', 'regional', 36, true, false, 'oauth2', '{"russia_platform": true}'),
  ('QQ', 'qq', 'regional', 37, true, true, 'api_key', '{"china_verification": true}'),
  ('Sina Weibo', 'weibo', 'regional', 38, true, true, 'oauth2', '{"china_verification": true}'),
  ('Mix', 'mix', 'niche', 39, false, false, 'manual', '{"formerly_stumbleupon": true}'),
  ('BitChute', 'bitchute', 'video', 40, false, false, 'manual', '{"limited_api": true}'),
  ('Patreon', 'patreon', 'creative', 41, true, false, 'oauth2', '{"creator_api": true}'),
  ('OnlyFans', 'onlyfans', 'creative', 42, false, false, 'manual', '{"no_public_api": true, "creator_only": true}'),
  ('SoundCloud', 'soundcloud', 'audio', 43, true, false, 'oauth2', '{"audio_upload": true}'),
  ('Bandcamp', 'bandcamp', 'audio', 44, false, false, 'manual', '{"artist_platform": true}'),
  ('DeviantArt', 'deviantart', 'creative', 45, true, false, 'oauth2', '{"art_upload": true}'),
  ('Behance', 'behance', 'creative', 46, true, false, 'api_key', '{"adobe_platform": true}'),
  ('Dribbble', 'dribbble', 'creative', 47, true, false, 'oauth2', '{"designer_platform": true}'),
  ('Goodreads', 'goodreads', 'niche', 48, true, false, 'api_key', '{"limited_posting": true}'),
  ('Yelp', 'yelp', 'local_business', 49, true, false, 'api_key', '{"business_claiming": true}'),
  ('Foursquare', 'foursquare', 'local_business', 50, true, false, 'oauth2', '{"venue_management": true}'),
  ('Product Hunt', 'producthunt', 'professional', 51, true, false, 'oauth2', '{"product_launch": true}'),
  ('AngelList', 'angellist', 'professional', 52, true, false, 'oauth2', '{"startup_platform": true}'),
  ('Crunchbase', 'crunchbase', 'professional', 53, true, false, 'api_key', '{"data_focused": true}'),
  ('SlideShare', 'slideshare', 'professional', 54, true, false, 'api_key', '{"linkedin_owned": true}'),
  ('Flipboard', 'flipboard', 'niche', 55, false, false, 'manual', '{"curation_platform": true}'),
  ('ReverbNation', 'reverbnation', 'audio', 56, false, false, 'manual', '{"musician_platform": true}'),
  ('Ello', 'ello', 'creative', 57, false, false, 'manual', '{"artist_network": true}'),
  ('Caffeine', 'caffeine', 'video', 58, false, false, 'manual', '{"streaming_platform": true}'),
  ('Steam Community', 'steam', 'niche', 59, true, false, 'api_key', '{"gaming_platform": true}'),
  ('Gaia Online', 'gaia', 'niche', 60, false, false, 'manual', '{"gaming_social": true}');