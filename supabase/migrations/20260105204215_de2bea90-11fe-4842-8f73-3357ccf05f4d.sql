-- Credit transactions ledger (detailed history)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'agent')),
  entity_id UUID NOT NULL,
  
  credit_type TEXT NOT NULL CHECK (credit_type IN ('compute', 'action', 'outcome')),
  amount NUMERIC NOT NULL,
  balance_after NUMERIC,
  
  source_type TEXT NOT NULL, -- 'contribution_event', 'deal_room_payout', 'manual_adjustment'
  source_id UUID,
  
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Deal Room credit rules
CREATE TABLE IF NOT EXISTS public.deal_room_credit_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL,
  
  compute_to_usd NUMERIC DEFAULT 0.001,
  action_to_usd NUMERIC DEFAULT 0.01,
  outcome_to_usd NUMERIC DEFAULT 0.10,
  
  attribution_rules JSONB DEFAULT '{}',
  
  min_payout_threshold NUMERIC DEFAULT 10.00,
  payout_frequency TEXT DEFAULT 'monthly',
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_credit_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own transactions" ON public.credit_transactions
  FOR SELECT USING (entity_type = 'user' AND entity_id = auth.uid());

CREATE POLICY "Users view deal room rules" ON public.deal_room_credit_rules
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_credit_transactions_entity ON public.credit_transactions(entity_type, entity_id);
CREATE INDEX idx_credit_transactions_created ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_source ON public.credit_transactions(source_type, source_id);