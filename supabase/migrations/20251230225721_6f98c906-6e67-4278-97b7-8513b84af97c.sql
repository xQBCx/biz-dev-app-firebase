-- xCOMMODITYx: Commodity Trading Platform Tables
-- Replace "COMMODITY NEXUS" with "xCOMMODITYx" throughout

-- Create enum types for commodity trading
CREATE TYPE commodity_user_tier AS ENUM ('silver', 'gold', 'platinum');
CREATE TYPE commodity_listing_status AS ENUM ('draft', 'active', 'pending_verification', 'verified', 'sold', 'expired', 'cancelled');
CREATE TYPE commodity_deal_status AS ENUM ('draft', 'escrow_funded', 'pop_verified', 'in_progress', 'completed', 'disputed', 'cancelled');
CREATE TYPE commodity_verification_status AS ENUM ('unverified', 'document_verified', 'okari_live', 'fully_verified');
CREATE TYPE commodity_escrow_status AS ENUM ('pending', 'funded', 'partial_release', 'released', 'refunded', 'disputed');

-- Commodity user profiles (extends existing auth users)
CREATE TABLE commodity_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'seller', 'broker', 'all')),
  trust_tier commodity_user_tier DEFAULT 'silver',
  company_name TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  kyc_verified_at TIMESTAMPTZ,
  okari_enabled BOOLEAN DEFAULT false,
  okari_device_ids TEXT[],
  completed_deals INTEGER DEFAULT 0,
  total_volume_traded DECIMAL(20, 2) DEFAULT 0,
  broker_commission_rate DECIMAL(5, 4) DEFAULT 0.01, -- 1% default
  wallet_address TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Commodity listings (the marketplace)
CREATE TABLE commodity_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES commodity_user_profiles(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL, -- D6, D2, JetA1, Gold, etc.
  product_grade TEXT,
  quantity DECIMAL(20, 2) NOT NULL,
  quantity_unit TEXT NOT NULL DEFAULT 'barrels', -- barrels, MT, kg, etc.
  origin_country TEXT,
  location TEXT NOT NULL, -- e.g., "Vopak Houston Terminal"
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'platts_linked', 'negotiable')),
  price_per_unit DECIMAL(20, 4),
  currency TEXT DEFAULT 'USD',
  platts_index TEXT, -- if platts_linked
  platts_discount DECIMAL(10, 4), -- discount/premium to platts
  delivery_terms TEXT, -- FOB, CIF, etc.
  min_order_quantity DECIMAL(20, 2),
  okari_device_id TEXT, -- linked Okari GX device
  verification_status commodity_verification_status DEFAULT 'unverified',
  sgs_document_hash TEXT,
  sgs_document_url TEXT,
  sgs_verified_at TIMESTAMPTZ,
  tank_level_percent DECIMAL(5, 2), -- real-time from Okari
  last_okari_sync TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  status commodity_listing_status DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Broker mandates (tracking referrals)
CREATE TABLE commodity_broker_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES commodity_user_profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES commodity_listings(id) ON DELETE SET NULL,
  mandate_type TEXT NOT NULL CHECK (mandate_type IN ('buy_side', 'sell_side', 'dual')),
  mandate_code TEXT NOT NULL UNIQUE, -- for tracking links
  referred_buyer_id UUID REFERENCES commodity_user_profiles(id),
  referred_seller_id UUID REFERENCES commodity_user_profiles(id),
  commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.01,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commodity deals (the deal room)
CREATE TABLE commodity_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_number TEXT NOT NULL UNIQUE,
  listing_id UUID REFERENCES commodity_listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES commodity_user_profiles(id),
  seller_id UUID NOT NULL REFERENCES commodity_user_profiles(id),
  buy_broker_id UUID REFERENCES commodity_user_profiles(id),
  sell_broker_id UUID REFERENCES commodity_user_profiles(id),
  buy_broker_mandate_id UUID REFERENCES commodity_broker_mandates(id),
  sell_broker_mandate_id UUID REFERENCES commodity_broker_mandates(id),
  product_type TEXT NOT NULL,
  quantity DECIMAL(20, 2) NOT NULL,
  quantity_unit TEXT NOT NULL,
  agreed_price DECIMAL(20, 4) NOT NULL,
  currency TEXT DEFAULT 'USD',
  total_value DECIMAL(20, 2) NOT NULL,
  escrow_amount DECIMAL(20, 2), -- deposit required
  escrow_status commodity_escrow_status DEFAULT 'pending',
  escrow_funded_at TIMESTAMPTZ,
  escrow_wallet_address TEXT,
  escrow_transaction_hash TEXT,
  status commodity_deal_status DEFAULT 'draft',
  pop_verified BOOLEAN DEFAULT false,
  pop_verified_at TIMESTAMPTZ,
  pop_verification_method TEXT, -- 'sgs_document', 'okari_live', 'both'
  injection_started_at TIMESTAMPTZ,
  injection_completed_at TIMESTAMPTZ,
  okari_flow_data JSONB, -- real-time flow metrics
  title_transfer_document_url TEXT,
  buy_broker_commission DECIMAL(20, 2),
  sell_broker_commission DECIMAL(20, 2),
  platform_fee DECIMAL(20, 2),
  settlement_status TEXT DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  dispute_resolution TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal messages/chat
CREATE TABLE commodity_deal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES commodity_deals(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES commodity_user_profiles(id),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'system', 'escrow_update', 'verification_update')),
  content TEXT NOT NULL,
  document_url TEXT,
  document_name TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Escrow transactions
CREATE TABLE commodity_escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES commodity_deals(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'release', 'refund', 'commission_payout')),
  from_user_id UUID REFERENCES commodity_user_profiles(id),
  to_user_id UUID REFERENCES commodity_user_profiles(id),
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- 'wire', 'usdc', 'stripe'
  transaction_reference TEXT,
  blockchain_tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Okari GX device data (mock for now, will integrate with real API)
CREATE TABLE commodity_okari_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  owner_user_id UUID REFERENCES commodity_user_profiles(id),
  device_type TEXT NOT NULL, -- 'tank', 'pipeline', 'truck'
  location TEXT NOT NULL,
  facility_name TEXT,
  capacity DECIMAL(20, 2),
  capacity_unit TEXT DEFAULT 'barrels',
  current_level DECIMAL(20, 2),
  current_level_percent DECIMAL(5, 2),
  temperature DECIMAL(10, 2),
  pressure DECIMAL(10, 2),
  valve_status TEXT DEFAULT 'closed' CHECK (valve_status IN ('open', 'closed', 'partial')),
  last_inspection TIMESTAMPTZ,
  product_type TEXT,
  product_grade TEXT,
  is_verified BOOLEAN DEFAULT false,
  last_telemetry_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document verification log
CREATE TABLE commodity_document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES commodity_deals(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES commodity_listings(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL, -- 'sgs_report', 'passport', 'certificate'
  document_url TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  ai_extracted_data JSONB, -- OCR/AI extracted fields
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'manual_review')),
  verification_notes TEXT,
  verified_by_user_id UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE commodity_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_broker_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_deal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_okari_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_document_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: users can view all, but only edit their own
CREATE POLICY "Users can view all commodity profiles" ON commodity_user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own commodity profile" ON commodity_user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own commodity profile" ON commodity_user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Listings: active listings visible to all, sellers can manage their own
CREATE POLICY "Anyone can view active listings" ON commodity_listings FOR SELECT USING (status IN ('active', 'verified') OR seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can insert listings" ON commodity_listings FOR INSERT WITH CHECK (seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can update their listings" ON commodity_listings FOR UPDATE USING (seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));

-- Broker mandates: brokers can manage their own
CREATE POLICY "Brokers can view their mandates" ON commodity_broker_mandates FOR SELECT USING (broker_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Brokers can create mandates" ON commodity_broker_mandates FOR INSERT WITH CHECK (broker_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Brokers can update their mandates" ON commodity_broker_mandates FOR UPDATE USING (broker_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));

-- Deals: participants can view and manage
CREATE POLICY "Deal participants can view deals" ON commodity_deals FOR SELECT USING (
  buyer_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
  seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
  buy_broker_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
  sell_broker_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Buyers can create deals" ON commodity_deals FOR INSERT WITH CHECK (buyer_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Deal participants can update deals" ON commodity_deals FOR UPDATE USING (
  buyer_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
  seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid())
);

-- Deal messages: participants can view
CREATE POLICY "Deal participants can view messages" ON commodity_deal_messages FOR SELECT USING (
  deal_id IN (SELECT id FROM commodity_deals WHERE 
    buyer_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
    seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
    buy_broker_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
    sell_broker_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Deal participants can send messages" ON commodity_deal_messages FOR INSERT WITH CHECK (
  sender_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid())
);

-- Escrow transactions: participants can view
CREATE POLICY "Deal participants can view escrow transactions" ON commodity_escrow_transactions FOR SELECT USING (
  deal_id IN (SELECT id FROM commodity_deals WHERE 
    buyer_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
    seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid())
  )
);

-- Okari devices: owners can view and manage
CREATE POLICY "Device owners can view their devices" ON commodity_okari_devices FOR SELECT USING (owner_user_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Device owners can manage their devices" ON commodity_okari_devices FOR ALL USING (owner_user_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()));

-- Document verifications: deal participants can view
CREATE POLICY "Deal participants can view verifications" ON commodity_document_verifications FOR SELECT USING (
  deal_id IN (SELECT id FROM commodity_deals WHERE 
    buyer_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()) OR
    seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid())
  ) OR
  listing_id IN (SELECT id FROM commodity_listings WHERE seller_id IN (SELECT id FROM commodity_user_profiles WHERE user_id = auth.uid()))
);

-- Create indexes for performance
CREATE INDEX idx_commodity_listings_status ON commodity_listings(status);
CREATE INDEX idx_commodity_listings_product_type ON commodity_listings(product_type);
CREATE INDEX idx_commodity_listings_seller ON commodity_listings(seller_id);
CREATE INDEX idx_commodity_deals_status ON commodity_deals(status);
CREATE INDEX idx_commodity_deals_buyer ON commodity_deals(buyer_id);
CREATE INDEX idx_commodity_deals_seller ON commodity_deals(seller_id);
CREATE INDEX idx_commodity_deal_messages_deal ON commodity_deal_messages(deal_id);
CREATE INDEX idx_commodity_broker_mandates_code ON commodity_broker_mandates(mandate_code);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE commodity_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE commodity_deal_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE commodity_escrow_transactions;

-- Create function to generate deal numbers
CREATE OR REPLACE FUNCTION generate_commodity_deal_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deal_number := 'XCX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_commodity_deal_number
  BEFORE INSERT ON commodity_deals
  FOR EACH ROW
  WHEN (NEW.deal_number IS NULL)
  EXECUTE FUNCTION generate_commodity_deal_number();

-- Create function to update timestamps
CREATE TRIGGER update_commodity_user_profiles_updated_at
  BEFORE UPDATE ON commodity_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commodity_listings_updated_at
  BEFORE UPDATE ON commodity_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commodity_deals_updated_at
  BEFORE UPDATE ON commodity_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commodity_okari_devices_updated_at
  BEFORE UPDATE ON commodity_okari_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();