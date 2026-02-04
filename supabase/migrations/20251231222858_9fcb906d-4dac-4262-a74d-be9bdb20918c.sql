-- Drop the auto-create trigger (making domain assignment optional)
DROP TRIGGER IF EXISTS auto_create_business_domain_trigger ON spawned_businesses;
DROP FUNCTION IF EXISTS auto_create_business_domain() CASCADE;

-- Create registrar registry for supported OAuth integrations
CREATE TABLE public.registrar_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registrar_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  oauth_enabled BOOLEAN DEFAULT false,
  oauth_authorize_url TEXT,
  oauth_token_url TEXT,
  api_base_url TEXT,
  required_scopes TEXT[],
  logo_url TEXT,
  setup_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user's connected registrar accounts
CREATE TABLE public.domain_registrar_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  registrar_id UUID NOT NULL REFERENCES registrar_registry(id) ON DELETE CASCADE,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  account_email TEXT,
  account_id TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, registrar_id)
);

-- Create deployment versions table
CREATE TABLE public.deployment_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES spawned_businesses(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_label TEXT,
  website_snapshot JSONB,
  config_snapshot JSONB,
  deployed_by UUID,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_current BOOLEAN DEFAULT false,
  deployment_url TEXT,
  preview_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, version_number)
);

-- Create business transfers table
CREATE TABLE public.business_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES spawned_businesses(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID,
  to_email TEXT,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('sale', 'transfer', 'detachment')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'rejected')),
  sale_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  escrow_status TEXT,
  stripe_transfer_id TEXT,
  transfer_package_url TEXT,
  ecosystem_removal_completed BOOLEAN DEFAULT false,
  proprietary_features_removed BOOLEAN DEFAULT false,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create domain suggestions table (for marketplace)
CREATE TABLE public.domain_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES spawned_businesses(id) ON DELETE CASCADE,
  user_id UUID,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL,
  full_domain TEXT NOT NULL,
  is_available BOOLEAN,
  price_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  registrar TEXT,
  is_premium BOOLEAN DEFAULT false,
  suggestion_type TEXT CHECK (suggestion_type IN ('ai_generated', 'similar', 'trending', 'exact_match')),
  score NUMERIC,
  checked_at TIMESTAMPTZ,
  purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create domain purchases table
CREATE TABLE public.domain_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID REFERENCES spawned_businesses(id) ON DELETE SET NULL,
  domain_name TEXT NOT NULL,
  registrar TEXT NOT NULL,
  purchase_price_cents INTEGER NOT NULL,
  our_markup_cents INTEGER DEFAULT 0,
  total_charged_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  registrar_order_id TEXT,
  registration_years INTEGER DEFAULT 1,
  auto_renew BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  dns_auto_configured BOOLEAN DEFAULT false,
  linked_to_business_domain_id UUID REFERENCES business_domains(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to business_domains
ALTER TABLE public.business_domains
ADD COLUMN IF NOT EXISTS registrar_detected TEXT,
ADD COLUMN IF NOT EXISTS registrar_connection_id UUID REFERENCES domain_registrar_connections(id),
ADD COLUMN IF NOT EXISTS dns_auto_configured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dns_configuration_error TEXT,
ADD COLUMN IF NOT EXISTS oauth_state TEXT,
ADD COLUMN IF NOT EXISTS purchased_through_platform BOOLEAN DEFAULT false;

-- Add deployment fields to spawned_businesses
ALTER TABLE public.spawned_businesses
ADD COLUMN IF NOT EXISTS deployment_status TEXT DEFAULT 'unpublished',
ADD COLUMN IF NOT EXISTS current_version_id UUID,
ADD COLUMN IF NOT EXISTS is_detached BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS detached_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS detachment_reason TEXT,
ADD COLUMN IF NOT EXISTS ecosystem_member BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS transferable BOOLEAN DEFAULT true;

-- Insert supported registrars
INSERT INTO registrar_registry (registrar_name, display_name, oauth_enabled, oauth_authorize_url, oauth_token_url, api_base_url, required_scopes, logo_url) VALUES
('cloudflare', 'Cloudflare', true, 'https://dash.cloudflare.com/oauth2/authorize', 'https://api.cloudflare.com/client/v4/user/tokens', 'https://api.cloudflare.com/client/v4', ARRAY['zone:read', 'zone:edit', 'dns:read', 'dns:edit'], 'https://www.cloudflare.com/favicon.ico'),
('godaddy', 'GoDaddy', true, 'https://sso.godaddy.com/authorize', 'https://sso.godaddy.com/token', 'https://api.godaddy.com/v1', ARRAY['domain:manage'], 'https://www.godaddy.com/favicon.ico'),
('namecheap', 'Namecheap', true, 'https://www.namecheap.com/apps/sso/authorize', 'https://api.namecheap.com/oauth/token', 'https://api.namecheap.com/xml.response', ARRAY['domains'], 'https://www.namecheap.com/favicon.ico'),
('route53', 'AWS Route 53', false, NULL, NULL, 'https://route53.amazonaws.com', ARRAY['route53:ChangeResourceRecordSets'], 'https://aws.amazon.com/favicon.ico'),
('google_domains', 'Google Domains', true, 'https://accounts.google.com/o/oauth2/v2/auth', 'https://oauth2.googleapis.com/token', 'https://domains.googleapis.com/v1', ARRAY['https://www.googleapis.com/auth/domains'], 'https://domains.google/favicon.ico'),
('hover', 'Hover', false, NULL, NULL, 'https://www.hover.com/api', NULL, 'https://www.hover.com/favicon.ico'),
('porkbun', 'Porkbun', false, NULL, NULL, 'https://porkbun.com/api/json/v3', NULL, 'https://porkbun.com/favicon.ico')
ON CONFLICT (registrar_name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.registrar_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_registrar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registrar_registry (public read)
CREATE POLICY "Anyone can view registrars" ON registrar_registry FOR SELECT USING (true);

-- RLS Policies for domain_registrar_connections
CREATE POLICY "Users can view their own registrar connections" ON domain_registrar_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own registrar connections" ON domain_registrar_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own registrar connections" ON domain_registrar_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own registrar connections" ON domain_registrar_connections FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for deployment_versions
CREATE POLICY "Users can view deployment versions for their businesses" ON deployment_versions FOR SELECT 
USING (EXISTS (SELECT 1 FROM spawned_businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can create deployment versions for their businesses" ON deployment_versions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM spawned_businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can update deployment versions for their businesses" ON deployment_versions FOR UPDATE 
USING (EXISTS (SELECT 1 FROM spawned_businesses WHERE id = business_id AND user_id = auth.uid()));

-- RLS Policies for business_transfers
CREATE POLICY "Users can view transfers they're involved in" ON business_transfers FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create transfers for their businesses" ON business_transfers FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update transfers they're involved in" ON business_transfers FOR UPDATE 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- RLS Policies for domain_suggestions
CREATE POLICY "Users can view their domain suggestions" ON domain_suggestions FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM spawned_businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can create domain suggestions" ON domain_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their domain suggestions" ON domain_suggestions FOR UPDATE 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM spawned_businesses WHERE id = business_id AND user_id = auth.uid()));

-- RLS Policies for domain_purchases
CREATE POLICY "Users can view their domain purchases" ON domain_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create domain purchases" ON domain_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their domain purchases" ON domain_purchases FOR UPDATE USING (auth.uid() = user_id);

-- Create function to increment version number
CREATE OR REPLACE FUNCTION get_next_version_number(p_business_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM deployment_versions
  WHERE business_id = p_business_id;
  RETURN next_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers
CREATE TRIGGER update_domain_registrar_connections_updated_at
  BEFORE UPDATE ON domain_registrar_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_transfers_updated_at
  BEFORE UPDATE ON business_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_purchases_updated_at
  BEFORE UPDATE ON domain_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();