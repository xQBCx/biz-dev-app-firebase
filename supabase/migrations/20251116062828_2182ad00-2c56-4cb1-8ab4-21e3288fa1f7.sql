-- Create enum for listing types
CREATE TYPE listing_type AS ENUM ('product', 'service');

-- Create enum for listing status
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'paused', 'closed');

-- Create enum for connection status
CREATE TYPE connection_status AS ENUM ('pending', 'active', 'completed', 'cancelled', 'disputed');

-- Create enum for commission types
CREATE TYPE commission_type AS ENUM ('percentage', 'flat_fee', 'tiered');

-- Product/Service Listings Table
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_type listing_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_market TEXT,
  price_range TEXT,
  commission_type commission_type NOT NULL DEFAULT 'percentage',
  commission_value NUMERIC NOT NULL,
  commission_details JSONB,
  expected_volume INTEGER,
  marketing_materials_url TEXT,
  status listing_status NOT NULL DEFAULT 'draft',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketer Profiles Table
CREATE TABLE public.marketer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  specialization TEXT[],
  experience_years INTEGER,
  target_industries TEXT[],
  marketing_channels TEXT[],
  portfolio_url TEXT,
  case_studies JSONB,
  min_commission_rate NUMERIC,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 0,
  total_deals INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Connections/Partnerships Table
CREATE TABLE public.marketplace_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  marketer_id UUID NOT NULL REFERENCES public.marketer_profiles(id) ON DELETE CASCADE,
  product_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  commission_agreed NUMERIC,
  commission_type commission_type,
  terms JSONB,
  contract_start_date TIMESTAMPTZ,
  contract_end_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.marketplace_connections(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  commission_earned NUMERIC DEFAULT 0,
  commission_paid BOOLEAN DEFAULT FALSE,
  roi_percentage NUMERIC,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages Table for connections
CREATE TABLE public.connection_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.marketplace_connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_listings
CREATE POLICY "Users can view active listings"
  ON public.marketplace_listings FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own listings"
  ON public.marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON public.marketplace_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON public.marketplace_listings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for marketer_profiles
CREATE POLICY "Anyone can view marketer profiles"
  ON public.marketer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.marketer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.marketer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.marketer_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for marketplace_connections
CREATE POLICY "Users can view their own connections"
  ON public.marketplace_connections FOR SELECT
  USING (
    auth.uid() = product_owner_id OR 
    auth.uid() IN (SELECT user_id FROM marketer_profiles WHERE id = marketer_id)
  );

CREATE POLICY "Marketers can create connection requests"
  ON public.marketplace_connections FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM marketer_profiles WHERE id = marketer_id)
  );

CREATE POLICY "Users can update their connections"
  ON public.marketplace_connections FOR UPDATE
  USING (
    auth.uid() = product_owner_id OR 
    auth.uid() IN (SELECT user_id FROM marketer_profiles WHERE id = marketer_id)
  );

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view their connection metrics"
  ON public.performance_metrics FOR SELECT
  USING (
    connection_id IN (
      SELECT id FROM marketplace_connections 
      WHERE product_owner_id = auth.uid() OR 
      marketer_id IN (SELECT id FROM marketer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Marketers can create metrics"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (
    connection_id IN (
      SELECT id FROM marketplace_connections 
      WHERE marketer_id IN (SELECT id FROM marketer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Marketers can update their metrics"
  ON public.performance_metrics FOR UPDATE
  USING (
    connection_id IN (
      SELECT id FROM marketplace_connections 
      WHERE marketer_id IN (SELECT id FROM marketer_profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for connection_messages
CREATE POLICY "Users can view messages in their connections"
  ON public.connection_messages FOR SELECT
  USING (
    connection_id IN (
      SELECT id FROM marketplace_connections 
      WHERE product_owner_id = auth.uid() OR 
      marketer_id IN (SELECT id FROM marketer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their connections"
  ON public.connection_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    connection_id IN (
      SELECT id FROM marketplace_connections 
      WHERE product_owner_id = auth.uid() OR 
      marketer_id IN (SELECT id FROM marketer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their messages"
  ON public.connection_messages FOR UPDATE
  USING (
    connection_id IN (
      SELECT id FROM marketplace_connections 
      WHERE product_owner_id = auth.uid() OR 
      marketer_id IN (SELECT id FROM marketer_profiles WHERE user_id = auth.uid())
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketer_profiles_updated_at
  BEFORE UPDATE ON public.marketer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_connections_updated_at
  BEFORE UPDATE ON public.marketplace_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_listings_user ON public.marketplace_listings(user_id);
CREATE INDEX idx_marketer_profiles_user ON public.marketer_profiles(user_id);
CREATE INDEX idx_connections_listing ON public.marketplace_connections(listing_id);
CREATE INDEX idx_connections_marketer ON public.marketplace_connections(marketer_id);
CREATE INDEX idx_connections_owner ON public.marketplace_connections(product_owner_id);
CREATE INDEX idx_performance_connection ON public.performance_metrics(connection_id);
CREATE INDEX idx_messages_connection ON public.connection_messages(connection_id);