-- Create hubspot_deals table for full deal records
CREATE TABLE public.hubspot_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hubspot_deal_id BIGINT NOT NULL UNIQUE,
  deal_name TEXT,
  deal_stage TEXT,
  deal_stage_id TEXT,
  amount NUMERIC,
  close_date TIMESTAMPTZ,
  pipeline TEXT,
  pipeline_id TEXT,
  asset_type TEXT,
  pms TEXT,
  ils TEXT,
  web_developer TEXT,
  property_address TEXT,
  owner_id TEXT,
  associated_contact_ids JSONB DEFAULT '[]'::jsonb,
  associated_company_ids JSONB DEFAULT '[]'::jsonb,
  deal_room_id UUID REFERENCES public.deal_rooms(id),
  raw_properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create hubspot_contacts table for full contact records
CREATE TABLE public.hubspot_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hubspot_contact_id BIGINT NOT NULL UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  lifecycle_stage TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  raw_properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create hubspot_companies table for full company records
CREATE TABLE public.hubspot_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hubspot_company_id BIGINT NOT NULL UNIQUE,
  name TEXT,
  domain TEXT,
  industry TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  website TEXT,
  raw_properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_hubspot_deals_deal_stage ON public.hubspot_deals(deal_stage);
CREATE INDEX idx_hubspot_deals_asset_type ON public.hubspot_deals(asset_type);
CREATE INDEX idx_hubspot_deals_pms ON public.hubspot_deals(pms);
CREATE INDEX idx_hubspot_deals_deal_room_id ON public.hubspot_deals(deal_room_id);
CREATE INDEX idx_hubspot_contacts_email ON public.hubspot_contacts(email);
CREATE INDEX idx_hubspot_companies_domain ON public.hubspot_companies(domain);

-- Enable RLS
ALTER TABLE public.hubspot_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubspot_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubspot_companies ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow authenticated users to read HubSpot data
CREATE POLICY "Authenticated users can view hubspot deals"
  ON public.hubspot_deals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view hubspot contacts"
  ON public.hubspot_contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view hubspot companies"
  ON public.hubspot_companies FOR SELECT
  TO authenticated
  USING (true);

-- Service role policies for edge function inserts/updates
CREATE POLICY "Service role can manage hubspot deals"
  ON public.hubspot_deals FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage hubspot contacts"
  ON public.hubspot_contacts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage hubspot companies"
  ON public.hubspot_companies FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_hubspot_deals_updated_at
  BEFORE UPDATE ON public.hubspot_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hubspot_contacts_updated_at
  BEFORE UPDATE ON public.hubspot_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hubspot_companies_updated_at
  BEFORE UPDATE ON public.hubspot_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create analytics view for deal insights
CREATE VIEW public.hubspot_deal_insights AS
SELECT 
  asset_type,
  pms,
  ils,
  deal_stage,
  COUNT(*) as deal_count,
  SUM(amount) as total_value,
  AVG(amount) as avg_deal_size
FROM public.hubspot_deals
GROUP BY asset_type, pms, ils, deal_stage;