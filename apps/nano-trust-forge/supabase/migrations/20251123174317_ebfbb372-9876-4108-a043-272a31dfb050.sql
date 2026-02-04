-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- IP Assets table (displayed on landing page)
CREATE TABLE public.ip_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value_low NUMERIC NOT NULL,
  value_high NUMERIC NOT NULL,
  estimated_licensing_low_per_year NUMERIC,
  estimated_licensing_high_per_year NUMERIC,
  markets TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.ip_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "IP assets are viewable by everyone"
  ON public.ip_assets FOR SELECT
  USING (true);

-- Seed initial IP assets
INSERT INTO public.ip_assets (name, value_low, value_high, estimated_licensing_low_per_year, estimated_licensing_high_per_year, markets, description) VALUES
  ('NANO™', 5000000, 15000000, 500000, 2000000, 'Health & Wellness, Pharmaceuticals, Consumer Products', 'Premier trademark for nano-scale health technology and wellness products'),
  ('NANO RX™', 3000000, 10000000, 300000, 1500000, 'Pharmaceuticals, Medical Devices', 'Pharmaceutical-grade nano formulations and prescription applications'),
  ('THE UNIVERSAL STANDARD™', 4000000, 12000000, 400000, 1800000, 'Healthcare Standards, Quality Assurance', 'Universal quality and standards framework for health technology'),
  ('NANODOSE™', 2500000, 8000000, 250000, 1200000, 'Pharmaceuticals, Nutraceuticals', 'Precision dosing technology for nano-scale delivery systems'),
  ('NANOBIDIOL™', 3500000, 11000000, 350000, 1600000, 'CBD/Cannabis, Pharmaceuticals, Wellness', 'Nano-enhanced CBD and cannabinoid delivery systems');

-- Deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  detailed_description TEXT,
  is_active BOOLEAN DEFAULT true,
  brand_logo_url TEXT,
  brand_primary_color TEXT DEFAULT '#1e3a8a',
  brand_accent_color TEXT DEFAULT '#d97706',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deals are viewable by authenticated users"
  ON public.deals FOR SELECT
  TO authenticated
  USING (true);

-- NDA Templates table
CREATE TABLE public.nda_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.nda_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NDA templates viewable by authenticated users"
  ON public.nda_templates FOR SELECT
  TO authenticated
  USING (true);

-- NDA Signatures table
CREATE TABLE public.nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  nda_template_id UUID REFERENCES public.nda_templates(id) ON DELETE CASCADE NOT NULL,
  signed_name TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  UNIQUE(user_id, deal_id, nda_template_id)
);

ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own signatures"
  ON public.nda_signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signatures"
  ON public.nda_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Investor Access table
CREATE TABLE public.investor_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'issuer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, deal_id)
);

ALTER TABLE public.investor_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access"
  ON public.investor_access FOR SELECT
  USING (auth.uid() = user_id);

-- Folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Folders viewable by users with access to deal"
  ON public.folders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investor_access
      WHERE investor_access.deal_id = folders.deal_id
      AND investor_access.user_id = auth.uid()
    )
  );

-- Files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Files viewable by users with access and signed NDA"
  ON public.files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investor_access ia
      INNER JOIN public.nda_signatures ns 
        ON ns.user_id = ia.user_id 
        AND ns.deal_id = ia.deal_id
      WHERE ia.deal_id = files.deal_id
      AND ia.user_id = auth.uid()
    )
  );

-- Leads/Contact form table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  investor_type TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);