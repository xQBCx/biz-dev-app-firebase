-- =============================================
-- PHASE 3: WORKFORCE CONTINUUM LAYER
-- =============================================

-- Role lifecycle transitions (Responder -> Worker -> Capital Participant -> Owner)
CREATE TABLE public.workforce_role_transitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_role TEXT,
  to_role TEXT NOT NULL,
  transition_type TEXT NOT NULL DEFAULT 'progression', -- 'progression', 'lateral', 'regression'
  trigger_source TEXT, -- 'eros_deployment', 'trading_graduation', 'investment', 'company_spawn'
  trigger_entity_id UUID,
  trigger_entity_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workforce_role_transitions ENABLE ROW LEVEL SECURITY;

-- User can view their own transitions
CREATE POLICY "Users can view own transitions" ON public.workforce_role_transitions
  FOR SELECT USING (auth.uid() = user_id);

-- User can create their own transitions
CREATE POLICY "Users can create own transitions" ON public.workforce_role_transitions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Engagement tracking (time/work logged)
CREATE TABLE public.workforce_engagements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  engagement_type TEXT NOT NULL, -- 'hourly', 'project', 'retainer', 'equity_swap'
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  hourly_rate NUMERIC(10,2),
  project_value NUMERIC(12,2),
  equity_percentage NUMERIC(5,2),
  start_date DATE,
  end_date DATE,
  total_hours_logged NUMERIC(10,2) DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workforce_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own engagements" ON public.workforce_engagements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own engagements" ON public.workforce_engagements
  FOR ALL USING (auth.uid() = user_id);

-- Time entries for engagements
CREATE TABLE public.workforce_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  engagement_id UUID REFERENCES public.workforce_engagements(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  description TEXT,
  billable BOOLEAN DEFAULT true,
  invoiced BOOLEAN DEFAULT false,
  invoice_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workforce_time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time entries" ON public.workforce_time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own time entries" ON public.workforce_time_entries
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PHASE 4: CAPITAL FORMATION & OWNERSHIP
-- =============================================

-- Equity stakes in companies/deals
CREATE TABLE public.equity_stakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'spawned_business', 'deal_room', 'external_company'
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  stake_type TEXT NOT NULL, -- 'common', 'preferred', 'options', 'sweat_equity', 'revenue_share'
  ownership_percentage NUMERIC(7,4),
  share_count INTEGER,
  vesting_schedule JSONB, -- { cliff_months, vesting_months, vested_percentage }
  acquisition_date DATE,
  acquisition_cost NUMERIC(12,2),
  current_valuation NUMERIC(14,2),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'vesting', 'fully_vested', 'sold', 'forfeited'
  xodiak_anchor_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equity_stakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equity stakes" ON public.equity_stakes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own equity stakes" ON public.equity_stakes
  FOR ALL USING (auth.uid() = user_id);

-- Investment transactions
CREATE TABLE public.capital_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equity_stake_id UUID REFERENCES public.equity_stakes(id),
  investment_type TEXT NOT NULL, -- 'initial', 'follow_on', 'conversion', 'dividend_reinvestment'
  amount NUMERIC(14,2) NOT NULL,
  share_price NUMERIC(10,4),
  shares_acquired INTEGER,
  instrument TEXT, -- 'cash', 'safe', 'convertible_note', 'stock_purchase'
  transaction_date DATE NOT NULL,
  notes TEXT,
  xodiak_anchor_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.capital_investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investments" ON public.capital_investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own investments" ON public.capital_investments
  FOR ALL USING (auth.uid() = user_id);

-- Ownership events (dividends, distributions, exits)
CREATE TABLE public.ownership_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equity_stake_id UUID REFERENCES public.equity_stakes(id),
  event_type TEXT NOT NULL, -- 'dividend', 'distribution', 'buyback', 'exit', 'dilution', 'valuation_update'
  amount NUMERIC(14,2),
  share_count INTEGER,
  description TEXT,
  event_date DATE NOT NULL,
  xodiak_anchor_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ownership_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ownership events" ON public.ownership_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ownership events" ON public.ownership_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portfolio summary view
CREATE OR REPLACE VIEW public.portfolio_summary AS
SELECT 
  user_id,
  COUNT(DISTINCT id) as total_positions,
  COUNT(DISTINCT CASE WHEN status = 'active' THEN id END) as active_positions,
  SUM(COALESCE(acquisition_cost, 0)) as total_invested,
  SUM(COALESCE(current_valuation, 0)) as total_current_value,
  SUM(COALESCE(current_valuation, 0)) - SUM(COALESCE(acquisition_cost, 0)) as total_unrealized_gain,
  CASE 
    WHEN SUM(COALESCE(acquisition_cost, 0)) > 0 
    THEN ((SUM(COALESCE(current_valuation, 0)) - SUM(COALESCE(acquisition_cost, 0))) / SUM(COALESCE(acquisition_cost, 0))) * 100
    ELSE 0
  END as total_return_percentage
FROM public.equity_stakes
WHERE status IN ('active', 'vesting', 'fully_vested')
GROUP BY user_id;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.workforce_engagements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equity_stakes;

-- Indexes for performance
CREATE INDEX idx_workforce_transitions_user ON public.workforce_role_transitions(user_id);
CREATE INDEX idx_workforce_engagements_user ON public.workforce_engagements(user_id);
CREATE INDEX idx_workforce_engagements_client ON public.workforce_engagements(client_id);
CREATE INDEX idx_workforce_time_entries_engagement ON public.workforce_time_entries(engagement_id);
CREATE INDEX idx_equity_stakes_user ON public.equity_stakes(user_id);
CREATE INDEX idx_equity_stakes_entity ON public.equity_stakes(entity_type, entity_id);
CREATE INDEX idx_capital_investments_stake ON public.capital_investments(equity_stake_id);
CREATE INDEX idx_ownership_events_stake ON public.ownership_events(equity_stake_id);