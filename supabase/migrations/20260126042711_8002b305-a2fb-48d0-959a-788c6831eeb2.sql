-- XDK Exchange Rates for USD-to-XDK conversion
CREATE TABLE public.xdk_exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL DEFAULT 'USD',
  xdk_rate numeric NOT NULL DEFAULT 1.00,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_until timestamptz,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Deal Room XDK Treasury - each deal room gets its own XDK address
CREATE TABLE public.deal_room_xdk_treasury (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  xdk_address text NOT NULL,
  balance numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(deal_room_id)
);

-- Escrow Funding Requests - track pending Stripe funding sessions
CREATE TABLE public.escrow_funding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  stripe_session_id text,
  xdk_conversion boolean DEFAULT true,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  xdk_tx_hash text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- XDK Withdrawal Requests - off-ramp from XDK to USD
CREATE TABLE public.xdk_withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  xdk_amount numeric NOT NULL,
  usd_amount numeric NOT NULL,
  exchange_rate numeric NOT NULL,
  withdrawal_method text NOT NULL,
  status text DEFAULT 'pending',
  stripe_payout_id text,
  bank_account_last4 text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- QuickBooks Connections for partner accounting sync
CREATE TABLE public.quickbooks_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  realm_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamptz,
  company_name text,
  is_active boolean DEFAULT true,
  auto_sync_enabled boolean DEFAULT false,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.xdk_exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_xdk_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xdk_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quickbooks_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Exchange rates are publicly readable
CREATE POLICY "Exchange rates are publicly readable" ON public.xdk_exchange_rates
  FOR SELECT USING (true);

-- Deal room treasury visible to deal room participants
CREATE POLICY "Treasury visible to deal room participants" ON public.deal_room_xdk_treasury
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = deal_room_xdk_treasury.deal_room_id
      AND drp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.deal_rooms dr
      WHERE dr.id = deal_room_xdk_treasury.deal_room_id
      AND dr.created_by = auth.uid()
    )
  );

-- Escrow funding requests visible to creator
CREATE POLICY "Funding requests visible to creator" ON public.escrow_funding_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create funding requests" ON public.escrow_funding_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawal requests visible to creator
CREATE POLICY "Withdrawal requests visible to creator" ON public.xdk_withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawal requests" ON public.xdk_withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- QuickBooks connections visible to owner
CREATE POLICY "QB connections visible to owner" ON public.quickbooks_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their QB connections" ON public.quickbooks_connections
  FOR ALL USING (auth.uid() = user_id);

-- Insert initial exchange rate (1 USD = 1 XDK)
INSERT INTO public.xdk_exchange_rates (base_currency, xdk_rate, source)
VALUES ('USD', 1.00, 'system_default');