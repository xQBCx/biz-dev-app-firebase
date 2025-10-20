-- Create enum for company types
CREATE TYPE company_type AS ENUM ('owned', 'affiliate', 'strategic_advisor', 'partner');

-- Create enum for relationship types
CREATE TYPE contact_relationship_type AS ENUM ('prospect', 'customer', 'partner', 'inactive');

-- Portfolio Companies Table
CREATE TABLE portfolio_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4A90E2',
  company_type company_type NOT NULL DEFAULT 'owned',
  email_domains TEXT[] DEFAULT '{}',
  commission_rate NUMERIC(5,2),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company Products/Services Table
CREATE TABLE company_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  pricing_model TEXT,
  base_price NUMERIC(10,2),
  target_audience TEXT,
  pitch_template TEXT,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company-Contact Relationships Table
CREATE TABLE company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type contact_relationship_type DEFAULT 'prospect',
  interest_level INTEGER DEFAULT 0,
  products_interested_in UUID[] DEFAULT '{}',
  last_contacted TIMESTAMPTZ,
  next_followup TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, contact_id)
);

-- Enable RLS
ALTER TABLE portfolio_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_companies
CREATE POLICY "Users can manage their own portfolio companies"
  ON portfolio_companies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for company_products
CREATE POLICY "Users can manage their own company products"
  ON company_products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for company_contacts
CREATE POLICY "Users can manage their own company contacts"
  ON company_contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_portfolio_companies_user_id ON portfolio_companies(user_id);
CREATE INDEX idx_portfolio_companies_active ON portfolio_companies(user_id, is_active);
CREATE INDEX idx_company_products_company_id ON company_products(company_id);
CREATE INDEX idx_company_products_user_id ON company_products(user_id);
CREATE INDEX idx_company_contacts_company_id ON company_contacts(company_id);
CREATE INDEX idx_company_contacts_contact_id ON company_contacts(contact_id);
CREATE INDEX idx_company_contacts_user_id ON company_contacts(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_companies_updated_at
  BEFORE UPDATE ON portfolio_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_products_updated_at
  BEFORE UPDATE ON company_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_contacts_updated_at
  BEFORE UPDATE ON company_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();