-- Create table for government entities
CREATE TABLE IF NOT EXISTS public.crm_governments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  jurisdiction_level text CHECK (jurisdiction_level IN ('federal', 'state', 'local', 'tribal', 'international', 'agency')),
  country text,
  state_province text,
  locality text,
  website text,
  phone text,
  email text,
  description text,
  annual_budget numeric,
  population_served numeric,
  key_initiatives jsonb DEFAULT '[]'::jsonb,
  procurement_portals jsonb DEFAULT '[]'::jsonb,
  grant_programs jsonb DEFAULT '[]'::jsonb,
  industry_focus text[] DEFAULT '{}',
  abundant_resources text[] DEFAULT '{}',
  resource_deficits text[] DEFAULT '{}',
  strategic_opportunities jsonb DEFAULT '[]'::jsonb,
  research_data jsonb,
  tags text[] DEFAULT '{}',
  potential_match_score numeric DEFAULT 0,
  perplexity_last_researched timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create table for geographic regions and economic zones
CREATE TABLE IF NOT EXISTS public.crm_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  region_type text CHECK (region_type IN ('metropolitan', 'rural', 'economic_zone', 'trade_corridor', 'county', 'district', 'territory')),
  country text,
  state_province text,
  boundaries jsonb,
  population numeric,
  gdp_estimate numeric,
  major_industries text[] DEFAULT '{}',
  abundant_resources text[] DEFAULT '{}',
  resource_deficits text[] DEFAULT '{}',
  infrastructure_highlights text[] DEFAULT '{}',
  labor_pool_characteristics jsonb,
  investment_climate text,
  sustainability_challenges text[] DEFAULT '{}',
  strategic_opportunities jsonb DEFAULT '[]'::jsonb,
  research_data jsonb,
  tags text[] DEFAULT '{}',
  potential_match_score numeric DEFAULT 0,
  perplexity_last_researched timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_crm_governments_user_id ON public.crm_governments(user_id);
CREATE INDEX idx_crm_governments_client_id ON public.crm_governments(client_id);
CREATE INDEX idx_crm_governments_jurisdiction ON public.crm_governments(jurisdiction_level);
CREATE INDEX idx_crm_regions_user_id ON public.crm_regions(user_id);
CREATE INDEX idx_crm_regions_client_id ON public.crm_regions(client_id);
CREATE INDEX idx_crm_regions_type ON public.crm_regions(region_type);

-- Enable RLS
ALTER TABLE public.crm_governments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_regions ENABLE ROW LEVEL SECURITY;

-- RLS policies for governments
CREATE POLICY "Users can view their own governments"
  ON public.crm_governments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own governments"
  ON public.crm_governments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own governments"
  ON public.crm_governments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own governments"
  ON public.crm_governments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for regions
CREATE POLICY "Users can view their own regions"
  ON public.crm_regions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own regions"
  ON public.crm_regions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own regions"
  ON public.crm_regions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own regions"
  ON public.crm_regions FOR DELETE
  USING (auth.uid() = user_id);

-- Add research columns to crm_companies if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_companies' AND column_name = 'research_data') THEN
    ALTER TABLE public.crm_companies ADD COLUMN research_data jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_companies' AND column_name = 'perplexity_last_researched') THEN
    ALTER TABLE public.crm_companies ADD COLUMN perplexity_last_researched timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_companies' AND column_name = 'abundant_resources') THEN
    ALTER TABLE public.crm_companies ADD COLUMN abundant_resources text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_companies' AND column_name = 'resource_deficits') THEN
    ALTER TABLE public.crm_companies ADD COLUMN resource_deficits text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_companies' AND column_name = 'strategic_opportunities') THEN
    ALTER TABLE public.crm_companies ADD COLUMN strategic_opportunities jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_companies' AND column_name = 'potential_match_score') THEN
    ALTER TABLE public.crm_companies ADD COLUMN potential_match_score numeric DEFAULT 0;
  END IF;
END $$;

-- Update crm_network_matches to support new entity types
ALTER TABLE public.crm_network_matches 
  DROP CONSTRAINT IF EXISTS crm_network_matches_source_entity_type_check,
  DROP CONSTRAINT IF EXISTS crm_network_matches_matched_entity_type_check,
  DROP CONSTRAINT IF EXISTS crm_network_matches_opportunity_type_check;

ALTER TABLE public.crm_network_matches
  ADD CONSTRAINT crm_network_matches_source_entity_type_check 
    CHECK (source_entity_type IN ('contact', 'company', 'government', 'region')),
  ADD CONSTRAINT crm_network_matches_matched_entity_type_check 
    CHECK (matched_entity_type IN ('contact', 'company', 'deal_room', 'business', 'government', 'region')),
  ADD CONSTRAINT crm_network_matches_opportunity_type_check 
    CHECK (opportunity_type IN ('partnership', 'client', 'vendor', 'advisor', 'investor', 'talent', 'referral', 'infrastructure', 'grant_opportunity', 'procurement', 'trade_corridor', 'resource_exchange', 'sustainability'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_governments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_regions;