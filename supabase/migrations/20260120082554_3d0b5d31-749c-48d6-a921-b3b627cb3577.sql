-- Trading Sessions table with circuit breaker state
CREATE TABLE public.trading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_balance NUMERIC DEFAULT 2000,
  loss_count INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  locked_until TIMESTAMPTZ,
  preflight_completed BOOLEAN DEFAULT false,
  preflight_completed_at TIMESTAMPTZ,
  preflight_calm_focused BOOLEAN DEFAULT false,
  preflight_loss_limit_defined BOOLEAN DEFAULT false,
  preflight_risk_accepted BOOLEAN DEFAULT false,
  pm_high NUMERIC,
  pm_low NUMERIC,
  orb_high NUMERIC,
  orb_low NUMERIC,
  orb_midline NUMERIC,
  orb_calculated_at TIMESTAMPTZ,
  daily_pnl NUMERIC DEFAULT 0,
  trades_won INTEGER DEFAULT 0,
  trades_lost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_date)
);

-- Active positions with automated trade management
CREATE TABLE public.active_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.trading_sessions(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price NUMERIC NOT NULL,
  shares INTEGER NOT NULL,
  max_risk_amount NUMERIC NOT NULL,
  stop_loss_price NUMERIC NOT NULL,
  original_stop_loss NUMERIC NOT NULL,
  target_1_price NUMERIC NOT NULL,
  target_1_shares INTEGER NOT NULL,
  target_1_hit BOOLEAN DEFAULT false,
  target_1_hit_at TIMESTAMPTZ,
  breakeven_triggered BOOLEAN DEFAULT false,
  breakeven_triggered_at TIMESTAMPTZ,
  runner_shares INTEGER DEFAULT 0,
  current_pnl NUMERIC DEFAULT 0,
  exit_price NUMERIC,
  exit_reason TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'partial', 'closed', 'stopped_out')),
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Trading signals and alerts log
CREATE TABLE public.trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.trading_sessions(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('breakout_long', 'breakout_short', 'anomaly', 'pullback_long', 'pullback_short')),
  symbol TEXT NOT NULL,
  candle_timestamp TIMESTAMPTZ NOT NULL,
  candle_open NUMERIC,
  candle_high NUMERIC,
  candle_low NUMERIC,
  candle_close NUMERIC NOT NULL,
  candle_volume NUMERIC NOT NULL,
  orb_line NUMERIC NOT NULL,
  avg_volume_3 NUMERIC,
  volume_ratio NUMERIC,
  distance_to_stop NUMERIC,
  is_valid BOOLEAN DEFAULT false,
  rejection_reasons TEXT[],
  is_anomaly BOOLEAN DEFAULT false,
  anomaly_reason TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  executed BOOLEAN DEFAULT false,
  position_id UUID REFERENCES public.active_positions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Market data cache for 1-min and 5-min bars
CREATE TABLE public.market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('1min', '5min')),
  bar_timestamp TIMESTAMPTZ NOT NULL,
  open_price NUMERIC NOT NULL,
  high_price NUMERIC NOT NULL,
  low_price NUMERIC NOT NULL,
  close_price NUMERIC NOT NULL,
  volume NUMERIC NOT NULL,
  vwap NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(symbol, timeframe, bar_timestamp)
);

-- Create index for efficient queries
CREATE INDEX idx_market_data_cache_lookup ON public.market_data_cache(symbol, timeframe, bar_timestamp DESC);
CREATE INDEX idx_trading_sessions_user_date ON public.trading_sessions(user_id, session_date DESC);
CREATE INDEX idx_active_positions_session ON public.active_positions(session_id, status);
CREATE INDEX idx_trading_signals_session ON public.trading_signals(session_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.trading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading_sessions
CREATE POLICY "Users can view own trading sessions"
  ON public.trading_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trading sessions"
  ON public.trading_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading sessions"
  ON public.trading_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for active_positions
CREATE POLICY "Users can view own positions"
  ON public.active_positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own positions"
  ON public.active_positions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own positions"
  ON public.active_positions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for trading_signals
CREATE POLICY "Users can view own signals"
  ON public.trading_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own signals"
  ON public.trading_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signals"
  ON public.trading_signals FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for market_data_cache (public read, system write)
CREATE POLICY "Anyone can view market data"
  ON public.market_data_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert market data"
  ON public.market_data_cache FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_trading_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_trading_sessions_updated_at
  BEFORE UPDATE ON public.trading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trading_session_timestamp();