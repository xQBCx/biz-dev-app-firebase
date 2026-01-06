-- Create settlement_adjustments table for multi-party approval workflow
CREATE TABLE public.settlement_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('expense_reimbursement', 'bonus_payment', 'credit_adjustment', 'penalty_deduction')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'partial')),
  approvals JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.settlement_adjustments ENABLE ROW LEVEL SECURITY;

-- Participants in the deal room can view adjustments
CREATE POLICY "Participants can view settlement adjustments"
ON public.settlement_adjustments FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_participant(deal_room_id, auth.uid())
);

-- Participants can propose adjustments
CREATE POLICY "Participants can propose settlement adjustments"
ON public.settlement_adjustments FOR INSERT
WITH CHECK (
  is_deal_room_participant(deal_room_id, auth.uid())
);

-- Participants can update adjustments (for voting)
CREATE POLICY "Participants can update settlement adjustments"
ON public.settlement_adjustments FOR UPDATE
USING (
  is_deal_room_participant(deal_room_id, auth.uid())
);

-- Add index for efficient queries
CREATE INDEX idx_settlement_adjustments_deal_room ON public.settlement_adjustments(deal_room_id);
CREATE INDEX idx_settlement_adjustments_status ON public.settlement_adjustments(status);