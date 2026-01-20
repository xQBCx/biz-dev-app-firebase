-- =====================================================
-- DEAL ROOM FINANCIAL ORCHESTRATION INFRASTRUCTURE
-- Adds: Revenue tagging, payment sequencing, confirmation gating, 
-- credit metering, kill switches, and role enforcement
-- =====================================================

-- 1. Enhance settlement_contracts with priority, confirmation gating, and role enforcement
ALTER TABLE public.settlement_contracts 
ADD COLUMN IF NOT EXISTS payout_priority integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS external_confirmation_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS external_confirmation_source text,
ADD COLUMN IF NOT EXISTS minimum_escrow_required numeric(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_source_type text,
ADD COLUMN IF NOT EXISTS originator_role text,
ADD COLUMN IF NOT EXISTS executor_role text;

COMMENT ON COLUMN public.settlement_contracts.payout_priority IS 'Lower number = higher priority. Retainers should be 1, success fees 10+';
COMMENT ON COLUMN public.settlement_contracts.external_confirmation_required IS 'If true, payout waits for external CRM/HubSpot confirmation';
COMMENT ON COLUMN public.settlement_contracts.external_confirmation_source IS 'e.g., hubspot_meeting, hubspot_deal, manual_verification';
COMMENT ON COLUMN public.settlement_contracts.revenue_source_type IS 'meeting_set, deal_closed, retainer, referral_fee';

-- 2. Enhance deal_room_escrow with kill switch threshold
ALTER TABLE public.deal_room_escrow
ADD COLUMN IF NOT EXISTS minimum_balance_threshold numeric(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS workflows_paused boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS paused_reason text,
ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone;

COMMENT ON COLUMN public.deal_room_escrow.minimum_balance_threshold IS 'Kill switch: pause workflows if balance drops below this';
COMMENT ON COLUMN public.deal_room_escrow.workflows_paused IS 'True when escrow drops below threshold';

-- 3. Enhance escrow_transactions with revenue source tagging
ALTER TABLE public.escrow_transactions
ADD COLUMN IF NOT EXISTS revenue_source_type text,
ADD COLUMN IF NOT EXISTS source_entity_id text,
ADD COLUMN IF NOT EXISTS source_entity_type text,
ADD COLUMN IF NOT EXISTS external_reference_id text,
ADD COLUMN IF NOT EXISTS attribution_chain jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.escrow_transactions.revenue_source_type IS 'meeting_set, deal_closed, retainer_deposit, client_payment';
COMMENT ON COLUMN public.escrow_transactions.attribution_chain IS 'Array of signal_id, meeting_id, deal_id linking revenue origin';

-- 4. Create platform credit metering table for Lindy.ai and other services
CREATE TABLE IF NOT EXISTS public.platform_credit_meters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  credit_type text NOT NULL DEFAULT 'api_call',
  credits_purchased numeric(15,4) DEFAULT 0,
  credits_consumed numeric(15,4) DEFAULT 0,
  credits_remaining numeric(15,4) GENERATED ALWAYS AS (credits_purchased - credits_consumed) STORED,
  cost_per_credit numeric(10,4) DEFAULT 0,
  markup_percentage numeric(5,2) DEFAULT 0,
  billing_entity_id text,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_meters_deal_room ON public.platform_credit_meters(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_credit_meters_platform ON public.platform_credit_meters(platform_name);

-- Enable RLS
ALTER TABLE public.platform_credit_meters ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit meters
CREATE POLICY "Users can view credit meters for their deal rooms"
ON public.platform_credit_meters FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants drp
    WHERE drp.deal_room_id = platform_credit_meters.deal_room_id
    AND drp.user_id = auth.uid()
  )
);

CREATE POLICY "Deal room creators can manage credit meters"
ON public.platform_credit_meters FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.deal_rooms dr
    WHERE dr.id = platform_credit_meters.deal_room_id
    AND dr.created_by = auth.uid()
  )
);

-- 5. Create credit usage log for detailed tracking
CREATE TABLE IF NOT EXISTS public.platform_credit_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id uuid REFERENCES public.platform_credit_meters(id) ON DELETE CASCADE,
  deal_room_id uuid REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  agent_id text,
  workflow_id text,
  action_type text NOT NULL,
  credits_used numeric(15,4) NOT NULL,
  raw_cost numeric(15,4),
  billed_cost numeric(15,4),
  external_transaction_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_usage_meter ON public.platform_credit_usage(meter_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_deal_room ON public.platform_credit_usage(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_agent ON public.platform_credit_usage(agent_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_created ON public.platform_credit_usage(created_at);

-- Enable RLS
ALTER TABLE public.platform_credit_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit usage
CREATE POLICY "Users can view credit usage for their deal rooms"
ON public.platform_credit_usage FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants drp
    WHERE drp.deal_room_id = platform_credit_usage.deal_room_id
    AND drp.user_id = auth.uid()
  )
);

-- 6. Create external confirmation queue for gated payouts
CREATE TABLE IF NOT EXISTS public.settlement_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL,
  contract_id uuid REFERENCES public.settlement_contracts(id) ON DELETE CASCADE,
  confirmation_source text NOT NULL,
  external_entity_type text,
  external_entity_id text,
  confirmation_status text DEFAULT 'pending',
  confirmed_at timestamp with time zone,
  confirmed_by uuid,
  rejection_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlement_confirmations_execution ON public.settlement_confirmations(execution_id);
CREATE INDEX IF NOT EXISTS idx_settlement_confirmations_status ON public.settlement_confirmations(confirmation_status);

-- Enable RLS
ALTER TABLE public.settlement_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS policies for confirmations
CREATE POLICY "Users can view confirmations for their contracts"
ON public.settlement_confirmations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.settlement_contracts sc
    JOIN public.deal_room_participants drp ON drp.deal_room_id = sc.deal_room_id
    WHERE sc.id = settlement_confirmations.contract_id
    AND drp.user_id = auth.uid()
  )
);

-- 7. Add deal room lifecycle and party roles
ALTER TABLE public.deal_rooms
ADD COLUMN IF NOT EXISTS lifecycle_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS originator_entity_name text,
ADD COLUMN IF NOT EXISTS platform_fee_percentage numeric(5,2) DEFAULT 0;

-- 8. Enhance deal_room_participants with explicit roles
ALTER TABLE public.deal_room_participants
ADD COLUMN IF NOT EXISTS party_role text,
ADD COLUMN IF NOT EXISTS can_approve_payouts boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_fund_escrow boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_view_financials boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS payout_method text,
ADD COLUMN IF NOT EXISTS payout_details jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.deal_room_participants.party_role IS 'originator, executor, platform, vendor, client';
COMMENT ON COLUMN public.deal_room_participants.payout_method IS 'stripe_connect, bank_transfer, manual, crypto';

-- 9. Function to check escrow kill switch
CREATE OR REPLACE FUNCTION public.check_escrow_kill_switch()
RETURNS trigger AS $$
BEGIN
  -- Check if balance dropped below threshold
  IF NEW.current_balance < NEW.minimum_balance_threshold AND NEW.minimum_balance_threshold > 0 THEN
    NEW.workflows_paused := true;
    NEW.paused_reason := 'Escrow balance dropped below minimum threshold of $' || NEW.minimum_balance_threshold;
    NEW.paused_at := now();
  END IF;
  
  -- Check if balance recovered
  IF NEW.current_balance >= NEW.minimum_balance_threshold AND OLD.workflows_paused = true THEN
    NEW.workflows_paused := false;
    NEW.paused_reason := null;
    NEW.paused_at := null;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for kill switch
DROP TRIGGER IF EXISTS escrow_kill_switch_trigger ON public.deal_room_escrow;
CREATE TRIGGER escrow_kill_switch_trigger
BEFORE UPDATE ON public.deal_room_escrow
FOR EACH ROW
EXECUTE FUNCTION public.check_escrow_kill_switch();

-- 10. Function to update credit meter on usage
CREATE OR REPLACE FUNCTION public.update_credit_meter_on_usage()
RETURNS trigger AS $$
BEGIN
  UPDATE public.platform_credit_meters
  SET 
    credits_consumed = credits_consumed + NEW.credits_used,
    updated_at = now()
  WHERE id = NEW.meter_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for credit usage
DROP TRIGGER IF EXISTS credit_usage_update_meter_trigger ON public.platform_credit_usage;
CREATE TRIGGER credit_usage_update_meter_trigger
AFTER INSERT ON public.platform_credit_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_credit_meter_on_usage();

-- 11. Enable realtime for credit meters
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_credit_meters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_credit_usage;