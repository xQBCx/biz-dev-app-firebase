-- TrueOdds Database Schema
-- Enums
CREATE TYPE market_category AS ENUM ('SPORTS', 'STOCKS', 'CRYPTO', 'WORLD');
CREATE TYPE market_status AS ENUM ('OPEN', 'SUSPENDED', 'SETTLED', 'VOID');
CREATE TYPE outcome_result AS ENUM ('WIN', 'LOSE', 'PUSH', 'VOID');
CREATE TYPE signal_kind AS ENUM ('INJURY', 'WEATHER', 'EARNINGS', 'MERGER', 'SENTIMENT', 'TREND', 'NEWS', 'LINEUP');
CREATE TYPE bet_type AS ENUM ('SINGLE', 'PARLAY');
CREATE TYPE bet_status AS ENUM ('PENDING', 'WON', 'LOST', 'VOID', 'CASHED_OUT');
CREATE TYPE kyc_status AS ENUM ('NOT_REQUIRED', 'PENDING', 'VERIFIED', 'REJECTED');

-- Wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 1000.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_simulation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Markets table
CREATE TABLE public.trueodds_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category market_category NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  status market_status NOT NULL DEFAULT 'OPEN',
  open_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  close_at TIMESTAMPTZ NOT NULL,
  settle_at TIMESTAMPTZ,
  base_odds NUMERIC(6,3) NOT NULL DEFAULT 2.00,
  live_odds NUMERIC(6,3) NOT NULL DEFAULT 2.00,
  signal_score NUMERIC(4,3) NOT NULL DEFAULT 0.00,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Outcomes table
CREATE TABLE public.trueodds_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.trueodds_markets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  live_odds NUMERIC(6,3) NOT NULL DEFAULT 2.00,
  result outcome_result,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bets table
CREATE TABLE public.trueodds_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type bet_type NOT NULL DEFAULT 'SINGLE',
  stake NUMERIC(10,2) NOT NULL,
  potential_payout NUMERIC(10,2) NOT NULL,
  actual_payout NUMERIC(10,2) DEFAULT 0,
  status bet_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ
);

-- Bet Legs table (for parlays)
CREATE TABLE public.trueodds_bet_legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID NOT NULL REFERENCES public.trueodds_bets(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.trueodds_markets(id),
  outcome_id UUID NOT NULL REFERENCES public.trueodds_outcomes(id),
  locked_odds NUMERIC(6,3) NOT NULL,
  result outcome_result,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Signals table
CREATE TABLE public.trueodds_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.trueodds_markets(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  kind signal_kind NOT NULL,
  weight NUMERIC(3,2) NOT NULL DEFAULT 0.50,
  impact NUMERIC(4,3) NOT NULL DEFAULT 0.00,
  summary TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs for compliance
CREATE TABLE public.trueodds_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User preferences for TrueOdds
CREATE TABLE public.trueodds_user_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  jurisdiction TEXT DEFAULT 'US-TX',
  kyc_status kyc_status NOT NULL DEFAULT 'NOT_REQUIRED',
  feature_real_money BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_bet_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_user_prefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Wallets
CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet"
  ON public.wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Markets (public read, admin create/update)
CREATE POLICY "Anyone can view open markets"
  ON public.trueodds_markets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage markets"
  ON public.trueodds_markets FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Outcomes (public read, admin manage)
CREATE POLICY "Anyone can view outcomes"
  ON public.trueodds_outcomes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage outcomes"
  ON public.trueodds_outcomes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Bets (users manage their own)
CREATE POLICY "Users can view their own bets"
  ON public.trueodds_bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets"
  ON public.trueodds_bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bets"
  ON public.trueodds_bets FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bets"
  ON public.trueodds_bets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Bet Legs
CREATE POLICY "Users can view their bet legs"
  ON public.trueodds_bet_legs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.trueodds_bets
    WHERE trueodds_bets.id = trueodds_bet_legs.bet_id
    AND trueodds_bets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create bet legs"
  ON public.trueodds_bet_legs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trueodds_bets
    WHERE trueodds_bets.id = trueodds_bet_legs.bet_id
    AND trueodds_bets.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage bet legs"
  ON public.trueodds_bet_legs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Signals (public read, system create)
CREATE POLICY "Anyone can view signals"
  ON public.trueodds_signals FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage signals"
  ON public.trueodds_signals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Audit logs (admin only)
CREATE POLICY "Admins can view audit logs"
  ON public.trueodds_audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create audit logs"
  ON public.trueodds_audit_logs FOR INSERT
  WITH CHECK (true);

-- User prefs
CREATE POLICY "Users can view their own prefs"
  ON public.trueodds_user_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own prefs"
  ON public.trueodds_user_prefs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trueodds_markets_updated_at
  BEFORE UPDATE ON public.trueodds_markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trueodds_user_prefs_updated_at
  BEFORE UPDATE ON public.trueodds_user_prefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_markets_category ON public.trueodds_markets(category);
CREATE INDEX idx_markets_status ON public.trueodds_markets(status);
CREATE INDEX idx_markets_close_at ON public.trueodds_markets(close_at);
CREATE INDEX idx_bets_user_id ON public.trueodds_bets(user_id);
CREATE INDEX idx_bets_status ON public.trueodds_bets(status);
CREATE INDEX idx_signals_market_id ON public.trueodds_signals(market_id);
CREATE INDEX idx_outcomes_market_id ON public.trueodds_outcomes(market_id);