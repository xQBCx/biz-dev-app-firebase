-- TLD Registry & Marketplace System (Fixed RLS)

-- Table: owned_tlds - Stores TLDs you own and manage
CREATE TABLE public.owned_tlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  provider TEXT NOT NULL DEFAULT 'freename',
  blockchain_network TEXT,
  token_id TEXT,
  owner_wallet_address TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  acquisition_date TIMESTAMPTZ,
  acquisition_cost_usd NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tld_registered_domains - Domains registered under owned TLDs
CREATE TABLE public.tld_registered_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_id UUID NOT NULL REFERENCES public.owned_tlds(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  full_domain TEXT NOT NULL,
  owner_type TEXT NOT NULL DEFAULT 'available',
  owner_user_id UUID REFERENCES auth.users(id),
  owner_business_id UUID REFERENCES public.spawned_businesses(id),
  owner_initiative_id UUID,
  price_xdk NUMERIC,
  price_usd NUMERIC,
  is_premium BOOLEAN DEFAULT FALSE,
  pricing_tier TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'available',
  registration_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  dns_configured BOOLEAN DEFAULT FALSE,
  a_record_ip TEXT,
  web2_mirrored BOOLEAN DEFAULT FALSE,
  resolution_status TEXT,
  nft_token_id TEXT,
  blockchain_tx_hash TEXT,
  category TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tld_id, domain_name)
);

-- Table: tld_pricing_tiers - Pricing configuration for domains
CREATE TABLE public.tld_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_id UUID REFERENCES public.owned_tlds(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  min_length INT,
  max_length INT,
  base_price_usd NUMERIC NOT NULL,
  base_price_xdk NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tld_domain_sales - Sales records
CREATE TABLE public.tld_domain_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.tld_registered_domains(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES auth.users(id),
  buyer_wallet_address TEXT,
  sale_price_xdk NUMERIC NOT NULL,
  sale_price_usd NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'xodiak',
  payment_tx_hash TEXT,
  payment_status TEXT DEFAULT 'pending',
  platform_fee_percent NUMERIC DEFAULT 10,
  platform_fee_amount NUMERIC,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tld_priority_domains - Priority domains to reserve
CREATE TABLE public.tld_priority_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_id UUID REFERENCES public.owned_tlds(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  category TEXT,
  suggested_price_usd NUMERIC,
  notes TEXT,
  is_reserved BOOLEAN DEFAULT TRUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.owned_tlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tld_registered_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tld_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tld_domain_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tld_priority_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for owned_tlds (use has_role function with app_role)
CREATE POLICY "Admins can manage TLDs" ON public.owned_tlds
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view TLDs" ON public.owned_tlds
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for tld_registered_domains
CREATE POLICY "Admins can manage domains" ON public.tld_registered_domains
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view domains" ON public.tld_registered_domains
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own domains" ON public.tld_registered_domains
  FOR SELECT USING (owner_user_id = auth.uid());

-- RLS Policies for tld_pricing_tiers
CREATE POLICY "Anyone can view pricing tiers" ON public.tld_pricing_tiers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pricing tiers" ON public.tld_pricing_tiers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tld_domain_sales
CREATE POLICY "Admins can manage sales" ON public.tld_domain_sales
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Buyers can view their own sales" ON public.tld_domain_sales
  FOR SELECT USING (buyer_user_id = auth.uid());

-- RLS Policies for tld_priority_domains
CREATE POLICY "Admins can manage priority domains" ON public.tld_priority_domains
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view priority domains" ON public.tld_priority_domains
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger for owned_tlds
CREATE TRIGGER update_owned_tlds_updated_at
  BEFORE UPDATE ON public.owned_tlds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for tld_registered_domains
CREATE TRIGGER update_tld_registered_domains_updated_at
  BEFORE UPDATE ON public.tld_registered_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();