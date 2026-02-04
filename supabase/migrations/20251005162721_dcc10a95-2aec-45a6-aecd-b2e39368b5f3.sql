-- Create enum for card materials/quality
CREATE TYPE card_material AS ENUM ('paper', 'plastic', 'aluminum', 'silver', 'gold');

-- Create enum for card status
CREATE TYPE card_status AS ENUM ('draft', 'active', 'minted', 'traded');

-- Create business cards table
CREATE TABLE public.business_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  
  -- Card design details
  card_name TEXT NOT NULL,
  title TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  design_data JSONB DEFAULT '{}'::jsonb,
  
  -- Card quality and verification
  material card_material NOT NULL DEFAULT 'paper',
  edition_number INTEGER,
  total_editions INTEGER,
  serial_number TEXT UNIQUE,
  verification_code TEXT UNIQUE,
  
  -- NFT and blockchain data
  is_minted BOOLEAN DEFAULT false,
  nft_token_id TEXT,
  nft_contract_address TEXT,
  blockchain_network TEXT,
  mint_transaction_hash TEXT,
  
  -- Metadata
  status card_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  minted_at TIMESTAMP WITH TIME ZONE,
  
  -- Collectible metadata
  rarity_score INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all active business cards"
  ON public.business_cards
  FOR SELECT
  USING (status = 'active' OR status = 'minted' OR status = 'traded' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own business cards"
  ON public.business_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business cards"
  ON public.business_cards
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business cards"
  ON public.business_cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create card collections table (for users who collect cards)
CREATE TABLE public.card_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acquisition_price NUMERIC,
  acquisition_method TEXT,
  notes TEXT,
  UNIQUE(collector_id, card_id)
);

-- Enable RLS for collections
ALTER TABLE public.card_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections"
  ON public.card_collections
  FOR SELECT
  USING (auth.uid() = collector_id);

CREATE POLICY "Users can add to their collections"
  ON public.card_collections
  FOR INSERT
  WITH CHECK (auth.uid() = collector_id);

CREATE POLICY "Users can update their collections"
  ON public.card_collections
  FOR UPDATE
  USING (auth.uid() = collector_id);

CREATE POLICY "Users can remove from their collections"
  ON public.card_collections
  FOR DELETE
  USING (auth.uid() = collector_id);

-- Create card trades table
CREATE TABLE public.card_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trade_price NUMERIC,
  trade_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_hash TEXT,
  notes TEXT
);

-- Enable RLS for trades
ALTER TABLE public.card_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trades involving their cards"
  ON public.card_trades
  FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create trades for their cards"
  ON public.card_trades
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_business_cards_updated_at
  BEFORE UPDATE ON public.business_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique serial numbers
CREATE OR REPLACE FUNCTION generate_card_serial()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_serial TEXT;
  serial_exists BOOLEAN;
BEGIN
  LOOP
    new_serial := 'BC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
    SELECT EXISTS(SELECT 1 FROM business_cards WHERE serial_number = new_serial) INTO serial_exists;
    EXIT WHEN NOT serial_exists;
  END LOOP;
  RETURN new_serial;
END;
$$;

-- Function to generate verification codes
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 16));
    SELECT EXISTS(SELECT 1 FROM business_cards WHERE verification_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;