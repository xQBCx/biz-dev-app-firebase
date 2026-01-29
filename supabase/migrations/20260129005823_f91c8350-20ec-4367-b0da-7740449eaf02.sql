-- Create value_ledger_entries table for complete transaction attribution
CREATE TABLE public.value_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  
  -- SOURCE: Who provided the value?
  source_user_id UUID,
  source_entity_type TEXT NOT NULL, -- 'individual', 'company', 'deal_room', 'agent'
  source_entity_id UUID,
  source_entity_name TEXT NOT NULL,
  
  -- DESTINATION: Where did the value go?
  destination_user_id UUID,
  destination_entity_type TEXT,
  destination_entity_id UUID,
  destination_entity_name TEXT,
  
  -- TRANSACTION DETAILS
  entry_type TEXT NOT NULL, -- 'escrow_deposit', 'invoice_payment', 'payout', 'fee', 'subscription', 'service_credit'
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  xdk_amount NUMERIC,
  
  -- PURPOSE & CONTEXT
  purpose TEXT,
  reference_type TEXT, -- 'escrow_funding_request', 'platform_invoice', 'contribution_event'
  reference_id UUID,
  
  -- CREDITS EARNED
  contribution_credits NUMERIC DEFAULT 0,
  credit_category TEXT, -- 'funding', 'execution', 'outcome'
  
  -- VERIFICATION
  verification_source TEXT, -- 'stripe', 'hubspot', 'manual', 'agent'
  verification_id TEXT,
  verified_at TIMESTAMPTZ,
  
  -- BLOCKCHAIN ANCHOR
  xdk_tx_hash TEXT,
  xodiak_block_number BIGINT,
  
  -- NARRATIVE (Human-readable)
  narrative TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.value_ledger_entries ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_value_ledger_deal_room ON public.value_ledger_entries(deal_room_id);
CREATE INDEX idx_value_ledger_source_user ON public.value_ledger_entries(source_user_id);
CREATE INDEX idx_value_ledger_destination_user ON public.value_ledger_entries(destination_user_id);
CREATE INDEX idx_value_ledger_entry_type ON public.value_ledger_entries(entry_type);
CREATE INDEX idx_value_ledger_created_at ON public.value_ledger_entries(created_at DESC);
CREATE INDEX idx_value_ledger_xdk_tx_hash ON public.value_ledger_entries(xdk_tx_hash);

-- RLS Policies: Users can view ledger entries for deal rooms they participate in
CREATE POLICY "Users can view ledger entries for their deal rooms"
ON public.value_ledger_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants drp
    WHERE drp.deal_room_id = value_ledger_entries.deal_room_id
    AND drp.user_id = auth.uid()
  )
  OR source_user_id = auth.uid()
  OR destination_user_id = auth.uid()
);

-- Service role can insert/update (edge functions)
CREATE POLICY "Service role can manage ledger entries"
ON public.value_ledger_entries
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.value_ledger_entries;