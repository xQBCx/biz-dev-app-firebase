-- Giftly-Style AI Gift Cards Platform Extensions
-- Dynamic Pricing, Personalization, and Corporate Branding

-- Pricing configuration table for dynamic markup and Black Friday promos
CREATE TABLE public.ai_pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_name TEXT NOT NULL UNIQUE,
  base_stripe_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 2.9,
  base_stripe_fee_fixed NUMERIC(10,2) NOT NULL DEFAULT 0.30,
  base_sms_cost NUMERIC(10,2) NOT NULL DEFAULT 0.01,
  base_print_cost NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  base_packaging_cost NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  profit_margin_percent NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  profit_margin_fixed NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  black_friday_discount_percent NUMERIC(5,2) DEFAULT 0,
  black_friday_start TIMESTAMP WITH TIME ZONE,
  black_friday_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default pricing configuration
INSERT INTO public.ai_pricing_config (
  config_name,
  base_stripe_fee_percent,
  base_stripe_fee_fixed,
  base_sms_cost,
  base_print_cost,
  base_packaging_cost,
  profit_margin_percent,
  profit_margin_fixed,
  is_active
) VALUES (
  'default',
  2.9,
  0.30,
  0.01,
  2.00,
  1.00,
  5.00,
  0.00,
  true
);

-- Extend ai_gift_cards with personalization fields
ALTER TABLE public.ai_gift_cards
ADD COLUMN occasion_title TEXT,
ADD COLUMN occasion_message TEXT,
ADD COLUMN occasion_theme TEXT DEFAULT 'custom',
ADD COLUMN sender_name TEXT,
ADD COLUMN recipient_name TEXT,
ADD COLUMN recipient_email TEXT,
ADD COLUMN recipient_phone TEXT,
ADD COLUMN delivery_method_actual TEXT DEFAULT 'email',
ADD COLUMN pdf_url TEXT,
ADD COLUMN sms_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN claim_url TEXT,
ADD COLUMN claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_physical BOOLEAN DEFAULT false;

-- Extend ai_orders with corporate branding fields
ALTER TABLE public.ai_orders
ADD COLUMN brand_name TEXT,
ADD COLUMN brand_logo_url TEXT,
ADD COLUMN campaign_name TEXT,
ADD COLUMN campaign_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_black_friday_promo BOOLEAN DEFAULT false,
ADD COLUMN pricing_config_id UUID REFERENCES public.ai_pricing_config(id),
ADD COLUMN calculated_fees JSONB DEFAULT '{}'::jsonb,
ADD COLUMN escrow_status TEXT DEFAULT 'held',
ADD COLUMN escrow_released_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for new fields
CREATE INDEX idx_ai_gift_cards_occasion_theme ON public.ai_gift_cards(occasion_theme);
CREATE INDEX idx_ai_gift_cards_recipient_email ON public.ai_gift_cards(recipient_email);
CREATE INDEX idx_ai_gift_cards_claim_url ON public.ai_gift_cards(claim_url);
CREATE INDEX idx_ai_orders_campaign_name ON public.ai_orders(campaign_name);
CREATE INDEX idx_ai_orders_black_friday ON public.ai_orders(is_black_friday_promo);
CREATE INDEX idx_ai_orders_escrow_status ON public.ai_orders(escrow_status);
CREATE INDEX idx_ai_pricing_config_active ON public.ai_pricing_config(is_active);

-- Enable RLS on pricing config
ALTER TABLE public.ai_pricing_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing config
CREATE POLICY "Public can view active pricing" ON public.ai_pricing_config
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing" ON public.ai_pricing_config
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Trigger for pricing config updated_at
CREATE TRIGGER update_ai_pricing_config_updated_at
  BEFORE UPDATE ON public.ai_pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate dynamic pricing with Black Friday support
CREATE OR REPLACE FUNCTION public.calculate_gift_card_price(
  face_value NUMERIC,
  delivery_method TEXT,
  config_name TEXT DEFAULT 'default'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config ai_pricing_config%ROWTYPE;
  stripe_fee NUMERIC;
  delivery_cost NUMERIC;
  base_cost NUMERIC;
  profit NUMERIC;
  total_price NUMERIC;
  is_black_friday BOOLEAN;
  result JSONB;
BEGIN
  -- Get active pricing config
  SELECT * INTO config 
  FROM ai_pricing_config 
  WHERE ai_pricing_config.config_name = calculate_gift_card_price.config_name 
    AND is_active = true
  LIMIT 1;
  
  IF config IS NULL THEN
    RAISE EXCEPTION 'Pricing configuration not found';
  END IF;
  
  -- Calculate Stripe fee
  stripe_fee := (face_value * config.base_stripe_fee_percent / 100) + config.base_stripe_fee_fixed;
  
  -- Calculate delivery cost based on method
  IF delivery_method IN ('physical', 'print') THEN
    delivery_cost := config.base_print_cost + config.base_packaging_cost;
  ELSIF delivery_method = 'sms' THEN
    delivery_cost := config.base_sms_cost;
  ELSE
    delivery_cost := 0; -- Email is free
  END IF;
  
  -- Base cost
  base_cost := face_value + stripe_fee + delivery_cost;
  
  -- Calculate profit
  profit := (base_cost * config.profit_margin_percent / 100) + config.profit_margin_fixed;
  
  -- Check if Black Friday is active
  is_black_friday := (
    config.black_friday_start IS NOT NULL AND
    config.black_friday_end IS NOT NULL AND
    NOW() >= config.black_friday_start AND
    NOW() <= config.black_friday_end
  );
  
  -- Apply Black Friday discount to profit
  IF is_black_friday AND config.black_friday_discount_percent > 0 THEN
    profit := profit * (1 - config.black_friday_discount_percent / 100);
  END IF;
  
  -- Total price
  total_price := base_cost + profit;
  
  -- Build result JSON
  result := jsonb_build_object(
    'face_value', face_value,
    'stripe_fee', ROUND(stripe_fee, 2),
    'delivery_cost', ROUND(delivery_cost, 2),
    'base_cost', ROUND(base_cost, 2),
    'profit', ROUND(profit, 2),
    'total_price', ROUND(total_price, 2),
    'is_black_friday', is_black_friday,
    'config_used', config_name
  );
  
  RETURN result;
END;
$$;

-- Function to generate claim URLs
CREATE OR REPLACE FUNCTION public.generate_claim_url()
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
    new_code := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 12));
    SELECT EXISTS(SELECT 1 FROM ai_gift_cards WHERE claim_url = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Update existing gift cards to have claim URLs
UPDATE public.ai_gift_cards 
SET claim_url = generate_claim_url() 
WHERE claim_url IS NULL;