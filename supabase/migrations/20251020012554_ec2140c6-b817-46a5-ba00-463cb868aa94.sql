-- Create enum for company relationship types
CREATE TYPE company_relationship_type AS ENUM (
  'parent_subsidiary',
  'wholly_owned_subsidiary',
  'distribution_rights',
  'licensing_agreement',
  'joint_venture',
  'strategic_partnership',
  'minority_stake',
  'holding_company',
  'sister_company',
  'franchise'
);

-- Create company_relationships table
CREATE TABLE public.company_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_company_id UUID NOT NULL REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  child_company_id UUID NOT NULL REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  relationship_type company_relationship_type NOT NULL,
  ownership_percentage NUMERIC(5,2),
  effective_date DATE,
  end_date DATE,
  notes TEXT,
  contract_details JSONB DEFAULT '{}'::jsonb,
  liability_protection_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_companies CHECK (parent_company_id != child_company_id)
);

-- Enable RLS
ALTER TABLE public.company_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own company relationships"
ON public.company_relationships
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add additional fields to portfolio_companies for entity structure
ALTER TABLE public.portfolio_companies
ADD COLUMN IF NOT EXISTS entity_structure_notes TEXT,
ADD COLUMN IF NOT EXISTS liability_shield_strategy TEXT,
ADD COLUMN IF NOT EXISTS tax_optimization_notes TEXT,
ADD COLUMN IF NOT EXISTS is_holding_company BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_operating_company BOOLEAN DEFAULT TRUE;

-- Create indexes for performance
CREATE INDEX idx_company_relationships_parent ON public.company_relationships(parent_company_id);
CREATE INDEX idx_company_relationships_child ON public.company_relationships(child_company_id);
CREATE INDEX idx_company_relationships_user ON public.company_relationships(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_company_relationships_updated_at
  BEFORE UPDATE ON public.company_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();