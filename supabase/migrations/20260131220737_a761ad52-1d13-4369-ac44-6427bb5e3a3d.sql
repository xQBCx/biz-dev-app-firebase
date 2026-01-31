-- Phase 1: Fund Contribution Requests
-- New table to track fund requests from participants
CREATE TABLE public.fund_contribution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_from_participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  requested_from_user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  purpose TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'expired')),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  paid_amount DECIMAL(15,2),
  xdk_amount DECIMAL(15,2),
  xdk_tx_hash TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add can_contribute_funds permission to participants
ALTER TABLE public.deal_room_participants 
ADD COLUMN IF NOT EXISTS can_contribute_funds BOOLEAN DEFAULT false;

-- Add route_to_treasury option for invoices (Phase 2 prep)
ALTER TABLE public.platform_invoices 
ADD COLUMN IF NOT EXISTS route_to_treasury BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS treasury_credited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS treasury_xdk_amount DECIMAL(15,2);

-- Phase 4 prep: Transaction categories for accounting
CREATE TABLE public.transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  tax_treatment TEXT CHECK (tax_treatment IN ('taxable', 'deductible', 'exempt', 'owner_draw')),
  icon TEXT,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add category reference to value_ledger_entries
ALTER TABLE public.value_ledger_entries
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.transaction_categories(id),
ADD COLUMN IF NOT EXISTS is_personal_expense BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_business_expense BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tax_year INTEGER;

-- Phase 5 prep: Platform analytics snapshots
CREATE TABLE public.platform_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  total_volume DECIMAL(20,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  active_deal_rooms INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  settlement_count INTEGER DEFAULT 0,
  settlement_success_rate DECIMAL(5,2),
  avg_settlement_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default transaction categories
INSERT INTO public.transaction_categories (name, type, tax_treatment, icon, description, is_system) VALUES
  ('Client Revenue', 'income', 'taxable', '💰', 'Income from client payments', true),
  ('Partner Payout', 'expense', 'deductible', '👤', 'Payments to partners and contractors', true),
  ('Platform Fee', 'income', 'taxable', '🏢', 'Platform service fees', true),
  ('Agent Costs', 'expense', 'deductible', '🤖', 'AI agent and automation costs', true),
  ('Personal Draw', 'transfer', 'owner_draw', '🏠', 'Owner withdrawal for personal use', true),
  ('Equipment', 'expense', 'deductible', '💻', 'Hardware and equipment purchases', true),
  ('Software/SaaS', 'expense', 'deductible', '⚙️', 'Software subscriptions and licenses', true),
  ('Contractor Payment', 'expense', 'deductible', '🔧', 'Payments to independent contractors', true),
  ('Escrow Funding', 'transfer', 'exempt', '🔒', 'Funds deposited to escrow', true),
  ('Settlement', 'transfer', 'exempt', '✅', 'Settlement contract execution', true);

-- Enable RLS on new tables
ALTER TABLE public.fund_contribution_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Create helper function to check deal room admin status
CREATE OR REPLACE FUNCTION public.is_deal_room_admin(p_deal_room_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deal_room_participants drp
    WHERE drp.deal_room_id = p_deal_room_id
    AND drp.user_id = p_user_id
    AND drp.role_type IN ('admin', 'owner')
  )
  OR EXISTS (
    SELECT 1 FROM public.deal_rooms dr
    WHERE dr.id = p_deal_room_id
    AND dr.created_by = p_user_id
  );
$$;

-- RLS policies for fund_contribution_requests
CREATE POLICY "Users can view fund requests they created" 
ON public.fund_contribution_requests FOR SELECT 
USING (requested_by = auth.uid());

CREATE POLICY "Users can view fund requests addressed to them" 
ON public.fund_contribution_requests FOR SELECT 
USING (requested_from_user_id = auth.uid());

CREATE POLICY "Deal room admins can view all fund requests" 
ON public.fund_contribution_requests FOR SELECT 
USING (public.is_deal_room_admin(deal_room_id, auth.uid()));

CREATE POLICY "Deal room admins can create fund requests" 
ON public.fund_contribution_requests FOR INSERT 
WITH CHECK (public.is_deal_room_admin(deal_room_id, auth.uid()));

CREATE POLICY "Deal room admins can update fund requests" 
ON public.fund_contribution_requests FOR UPDATE 
USING (public.is_deal_room_admin(deal_room_id, auth.uid()));

-- Allow recipients to update their own requests (for payment status)
CREATE POLICY "Recipients can update their fund requests" 
ON public.fund_contribution_requests FOR UPDATE 
USING (requested_from_user_id = auth.uid());

-- RLS policies for transaction_categories (read-only for all authenticated users)
CREATE POLICY "Anyone can view transaction categories" 
ON public.transaction_categories FOR SELECT 
USING (true);

-- RLS policies for platform_analytics_snapshots (use user_roles admin check)
CREATE POLICY "Platform admins can view analytics" 
ON public.platform_analytics_snapshots FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Platform admins can manage analytics" 
ON public.platform_analytics_snapshots FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fund_requests_deal_room ON public.fund_contribution_requests(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_fund_requests_requested_from ON public.fund_contribution_requests(requested_from_user_id);
CREATE INDEX IF NOT EXISTS idx_fund_requests_status ON public.fund_contribution_requests(status);
CREATE INDEX IF NOT EXISTS idx_ledger_category ON public.value_ledger_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tax_year ON public.value_ledger_entries(tax_year);

-- Trigger for updated_at on fund_contribution_requests
CREATE TRIGGER update_fund_contribution_requests_updated_at
BEFORE UPDATE ON public.fund_contribution_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();