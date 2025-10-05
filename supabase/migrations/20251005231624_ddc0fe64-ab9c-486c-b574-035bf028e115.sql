-- AI Gift Cards Platform Schema

-- Enum types
CREATE TYPE ai_provider_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE ai_product_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE ai_order_status AS ENUM ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
CREATE TYPE ai_card_status AS ENUM ('pending', 'active', 'redeemed', 'expired', 'cancelled');
CREATE TYPE ai_card_type AS ENUM ('digital', 'physical');
CREATE TYPE ai_fulfillment_status AS ENUM ('pending', 'processing', 'printed', 'shipped', 'delivered');

-- AI Providers table
CREATE TABLE public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT DEFAULT '#4A90E2',
  status ai_provider_status NOT NULL DEFAULT 'pending',
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  redemption_url TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  sandbox_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Provider application details
CREATE TABLE public.ai_provider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  business_registration TEXT,
  tax_id TEXT,
  application_data JSONB DEFAULT '{}'::jsonb,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Products (denominations/SKUs)
CREATE TABLE public.ai_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  face_value NUMERIC(10,2) NOT NULL CHECK (face_value > 0),
  wholesale_price NUMERIC(10,2) NOT NULL CHECK (wholesale_price > 0),
  retail_price NUMERIC(10,2) NOT NULL CHECK (retail_price >= wholesale_price),
  card_type ai_card_type NOT NULL DEFAULT 'digital',
  status ai_product_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER DEFAULT 100,
  valid_days INTEGER DEFAULT 1825, -- 5 years
  metadata JSONB DEFAULT '{}'::jsonb,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Affiliate terms per provider
CREATE TABLE public.ai_affiliate_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  lifetime_commission_percent NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  first_purchase_bonus NUMERIC(10,2) DEFAULT 0,
  tracking_cookie_days INTEGER DEFAULT 90,
  min_payout_threshold NUMERIC(10,2) DEFAULT 100.00,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  effective_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer orders
CREATE TABLE public.ai_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  product_id UUID NOT NULL REFERENCES public.ai_products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status ai_order_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  delivery_method TEXT DEFAULT 'email',
  delivery_email TEXT,
  delivery_phone TEXT,
  shipping_address JSONB,
  fulfillment_status ai_fulfillment_status,
  campaign_code TEXT,
  event_name TEXT,
  affiliate_code TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Gift cards/vouchers
CREATE TABLE public.ai_gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ai_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.ai_products(id),
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id),
  card_code TEXT NOT NULL UNIQUE,
  pin_code TEXT,
  qr_code_url TEXT,
  redemption_url TEXT NOT NULL,
  face_value NUMERIC(10,2) NOT NULL,
  remaining_value NUMERIC(10,2) NOT NULL,
  status ai_card_status NOT NULL DEFAULT 'pending',
  card_type ai_card_type NOT NULL,
  batch_id TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  redemption_count INTEGER DEFAULT 0,
  provider_account_id TEXT,
  provider_credits_applied NUMERIC(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Redemption tracking
CREATE TABLE public.ai_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.ai_gift_cards(id) ON DELETE CASCADE,
  redeemed_by_user_id UUID REFERENCES auth.users(id),
  redeemed_email TEXT,
  redemption_ip TEXT,
  redemption_device TEXT,
  amount_redeemed NUMERIC(10,2) NOT NULL,
  provider_transaction_id TEXT,
  provider_account_created BOOLEAN DEFAULT false,
  provider_account_id TEXT,
  affiliate_eligible BOOLEAN DEFAULT false,
  affiliate_commission_due NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Webhook logs
CREATE TABLE public.ai_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs
CREATE TABLE public.ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ai_providers_status ON public.ai_providers(status);
CREATE INDEX idx_ai_providers_user_id ON public.ai_providers(user_id);
CREATE INDEX idx_ai_products_provider_id ON public.ai_products(provider_id);
CREATE INDEX idx_ai_products_status ON public.ai_products(status);
CREATE INDEX idx_ai_products_sku ON public.ai_products(sku);
CREATE INDEX idx_ai_orders_user_id ON public.ai_orders(user_id);
CREATE INDEX idx_ai_orders_status ON public.ai_orders(status);
CREATE INDEX idx_ai_orders_order_number ON public.ai_orders(order_number);
CREATE INDEX idx_ai_gift_cards_code ON public.ai_gift_cards(card_code);
CREATE INDEX idx_ai_gift_cards_status ON public.ai_gift_cards(status);
CREATE INDEX idx_ai_gift_cards_order_id ON public.ai_gift_cards(order_id);
CREATE INDEX idx_ai_redemptions_gift_card_id ON public.ai_redemptions(gift_card_id);
CREATE INDEX idx_ai_webhooks_provider_id ON public.ai_webhooks(provider_id);
CREATE INDEX idx_ai_webhooks_processed ON public.ai_webhooks(processed);

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_affiliate_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Providers: Providers can view/edit their own, admins can view all, public can view approved
CREATE POLICY "Providers can view their own provider" ON public.ai_providers
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view approved providers" ON public.ai_providers
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create their provider" ON public.ai_providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can update their own provider" ON public.ai_providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any provider" ON public.ai_providers
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Provider applications
CREATE POLICY "Providers can view their applications" ON public.ai_provider_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ai_providers WHERE id = provider_id AND user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Providers can create applications" ON public.ai_provider_applications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.ai_providers WHERE id = provider_id AND user_id = auth.uid())
  );

-- Products: Public can view active, providers can manage their own
CREATE POLICY "Public can view active products" ON public.ai_products
  FOR SELECT USING (status = 'active' OR 
    EXISTS (SELECT 1 FROM public.ai_providers WHERE id = provider_id AND user_id = auth.uid()) OR
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Providers can create their products" ON public.ai_products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.ai_providers WHERE id = provider_id AND user_id = auth.uid())
  );

CREATE POLICY "Providers can update their products" ON public.ai_products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.ai_providers WHERE id = provider_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can update any product" ON public.ai_products
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Affiliate terms
CREATE POLICY "Providers can view their affiliate terms" ON public.ai_affiliate_terms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ai_providers WHERE id = provider_id AND user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- Orders: Users can view their own, admins can view all
CREATE POLICY "Users can view their orders" ON public.ai_orders
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create orders" ON public.ai_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Gift cards: Users can view cards from their orders, admins can view all
CREATE POLICY "Users can view their gift cards" ON public.ai_gift_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ai_orders WHERE id = order_id AND user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can create gift cards" ON public.ai_gift_cards
  FOR INSERT WITH CHECK (true);

-- Redemptions: Users can view their redemptions
CREATE POLICY "Users can view their redemptions" ON public.ai_redemptions
  FOR SELECT USING (
    auth.uid() = redeemed_by_user_id OR
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Anyone can create redemptions" ON public.ai_redemptions
  FOR INSERT WITH CHECK (true);

-- Webhooks: Only admins and system
CREATE POLICY "Admins can view webhooks" ON public.ai_webhooks
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Audit logs: Only admins
CREATE POLICY "Admins can view audit logs" ON public.ai_audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_products_updated_at
  BEFORE UPDATE ON public.ai_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_orders_updated_at
  BEFORE UPDATE ON public.ai_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_gift_cards_updated_at
  BEFORE UPDATE ON public.ai_gift_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique card codes
CREATE OR REPLACE FUNCTION public.generate_ai_card_code()
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
    new_code := 'AIG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 16));
    SELECT EXISTS(SELECT 1 FROM ai_gift_cards WHERE card_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_ai_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'AIG' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM ai_orders WHERE order_number = new_number) INTO number_exists;
    EXIT WHEN NOT number_exists;
  END LOOP;
  RETURN new_number;
END;
$$;