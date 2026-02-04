-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for property status
CREATE TYPE property_status AS ENUM (
  'NEW_LEAD',
  'ANALYZED', 
  'SELLER_OUTREACH',
  'SELLER_NEGOTIATING',
  'UNDER_CONTRACT',
  'BUYER_MARKETING',
  'BUYER_FOUND',
  'ASSIGNMENT_DRAFTED',
  'SENT_TO_TITLE',
  'CLOSED',
  'DEAD'
);

-- Create enum for outreach status
CREATE TYPE outreach_status AS ENUM ('DRAFT', 'SENT', 'REJECTED');

-- Create enum for contract type
CREATE TYPE contract_type AS ENUM ('PURCHASE', 'ASSIGNMENT');

-- Create enum for contract status
CREATE TYPE contract_status AS ENUM ('DRAFT', 'SENT_FOR_SIGNATURE', 'SIGNED', 'VOID');

-- Create enum for buyer status
CREATE TYPE buyer_status AS ENUM ('ACTIVE', 'INACTIVE');

-- Properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  list_price NUMERIC(12, 2),
  arv_estimate NUMERIC(12, 2),
  seller_name TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  notes TEXT,
  motivation_score INTEGER DEFAULT 0,
  deal_score INTEGER DEFAULT 0,
  seller_offer_price NUMERIC(12, 2),
  buyer_ask_price NUMERIC(12, 2),
  spread NUMERIC(12, 2),
  status property_status DEFAULT 'NEW_LEAD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Buyers table
CREATE TABLE public.buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  target_counties TEXT,
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  property_types TEXT,
  status buyer_status DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Seller outreach messages table
CREATE TABLE public.seller_outreach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('SMS', 'EMAIL', 'CALL_SCRIPT')),
  message_body TEXT NOT NULL,
  status outreach_status DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyer outreach messages table
CREATE TABLE public.buyer_outreach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE NOT NULL,
  message_body TEXT NOT NULL,
  status outreach_status DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  type contract_type NOT NULL,
  body TEXT NOT NULL,
  status contract_status DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties
CREATE POLICY "Users can view their own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for buyers
CREATE POLICY "Users can view their own buyers"
  ON public.buyers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own buyers"
  ON public.buyers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyers"
  ON public.buyers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buyers"
  ON public.buyers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for seller_outreach_messages
CREATE POLICY "Users can view messages for their properties"
  ON public.seller_outreach_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = seller_outreach_messages.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their properties"
  ON public.seller_outreach_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = seller_outreach_messages.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages for their properties"
  ON public.seller_outreach_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = seller_outreach_messages.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages for their properties"
  ON public.seller_outreach_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = seller_outreach_messages.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- RLS Policies for buyer_outreach_messages
CREATE POLICY "Users can view buyer messages for their properties"
  ON public.buyer_outreach_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = buyer_outreach_messages.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create buyer messages for their properties"
  ON public.buyer_outreach_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = buyer_outreach_messages.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- RLS Policies for contracts
CREATE POLICY "Users can view contracts for their properties"
  ON public.contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = contracts.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create contracts for their properties"
  ON public.contracts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = contracts.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update contracts for their properties"
  ON public.contracts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = contracts.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON public.buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();