-- Create ingredient_change_proposals table for change order workflow
CREATE TABLE public.ingredient_change_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES public.blender_ingredients(id) ON DELETE SET NULL,
  proposed_by UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('modify', 'remove', 'add')),
  proposed_changes JSONB NOT NULL DEFAULT '{}',
  justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approvals JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ingredient_change_proposals ENABLE ROW LEVEL SECURITY;

-- Participants can view proposals in their deal rooms
CREATE POLICY "Participants can view ingredient change proposals"
ON public.ingredient_change_proposals FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_participant(deal_room_id, auth.uid())
);

-- Participants can propose changes
CREATE POLICY "Participants can propose ingredient changes"
ON public.ingredient_change_proposals FOR INSERT
WITH CHECK (
  is_deal_room_participant(deal_room_id, auth.uid())
);

-- Participants can update proposals (for voting)
CREATE POLICY "Participants can update ingredient change proposals"
ON public.ingredient_change_proposals FOR UPDATE
USING (
  is_deal_room_participant(deal_room_id, auth.uid())
);

-- Add indexes
CREATE INDEX idx_ingredient_change_proposals_deal_room ON public.ingredient_change_proposals(deal_room_id);
CREATE INDEX idx_ingredient_change_proposals_status ON public.ingredient_change_proposals(status);