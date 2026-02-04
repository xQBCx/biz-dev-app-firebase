-- Create domains table
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_name TEXT NOT NULL,
  category TEXT,
  estimated_value_low NUMERIC,
  estimated_value_high NUMERIC,
  strategic_role TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tlds table
CREATE TABLE public.tlds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tld_name TEXT NOT NULL,
  acquisition_target BOOLEAN DEFAULT false,
  estimated_cost_low NUMERIC,
  estimated_cost_high NUMERIC,
  strategic_value TEXT,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create domain_appraisal_notes table
CREATE TABLE public.domain_appraisal_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
  appraisal_source TEXT,
  estimated_value NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create digital_asset_narratives table
CREATE TABLE public.digital_asset_narratives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add includes_digital_asset_acquisitions to deals table
ALTER TABLE public.deals 
ADD COLUMN includes_digital_asset_acquisitions BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_appraisal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_asset_narratives ENABLE ROW LEVEL SECURITY;

-- RLS Policies for domains (viewable by authenticated users with VDR access)
CREATE POLICY "Domains viewable by authenticated users" 
ON public.domains 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for tlds (viewable by authenticated users)
CREATE POLICY "TLDs viewable by authenticated users" 
ON public.tlds 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for domain_appraisal_notes (viewable by authenticated users)
CREATE POLICY "Appraisal notes viewable by authenticated users" 
ON public.domain_appraisal_notes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for digital_asset_narratives (viewable by everyone)
CREATE POLICY "Narratives viewable by everyone" 
ON public.digital_asset_narratives 
FOR SELECT 
USING (true);

-- Seed .nano TLD
INSERT INTO public.tlds (tld_name, acquisition_target, estimated_cost_low, estimated_cost_high, strategic_value, status)
VALUES (
  '.nano',
  true,
  50000,
  250000,
  'Global digital namespace for Nano ecosystem, subdomain licensing, brand sovereignty.',
  'planned'
);

-- Seed digital asset narratives
INSERT INTO public.digital_asset_narratives (title, body)
VALUES 
(
  'Role of Domain Portfolio',
  'The domain portfolio of 400+ NANO-related domains functions as a digital asset class that strengthens trademark defensibility, enhances brand equity, and expands global licensing potential. This materially increases the collateral value of the IP Trust and improves lender confidence.'
),
(
  'Strategic Purpose of Acquiring ".nano"',
  'Acquiring the .nano TLD forms the digital infrastructure for an entire Nano-branded ecosystem. It enables subdomain licensing, brand protection, future tokenization layers, and enterprise-level digital sovereignty across health, science, and technology markets. This materially expands the Trust''s asset base and long-term monetization capacity.'
),
(
  'Integration with IP-Backed Lending',
  'Digital assets—including domain clusters and category-defining TLDs—reinforce the durability, market reach, and enforceability of the Nano trademark family. When combined with formal IP valuations and licensing agreements, the domain ecosystem enhances the replacement cost and competitive moat, supporting stronger IP-backed financing terms.'
);