-- Add voting control and contract lock fields to deal_rooms
ALTER TABLE public.deal_rooms
ADD COLUMN IF NOT EXISTS voting_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS contract_locked boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS contract_locked_at timestamptz,
ADD COLUMN IF NOT EXISTS contract_locked_by uuid REFERENCES auth.users(id);

-- Create table for voting questions (both template and custom)
CREATE TABLE IF NOT EXISTS public.deal_room_voting_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'custom', -- 'template' or 'custom'
  template_id text, -- reference to template question if from library
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create table for voting question responses
CREATE TABLE IF NOT EXISTS public.deal_room_voting_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.deal_room_voting_questions(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  vote_value text NOT NULL, -- 'yes', 'no', 'abstain'
  reasoning text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(question_id, participant_id)
);

-- Create table for change orders (post-lock amendments)
CREATE TABLE IF NOT EXISTS public.deal_room_change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  change_type text NOT NULL, -- 'deliverable', 'term', 'formulation', 'participant'
  entity_id uuid, -- ID of the entity being changed
  entity_type text, -- table name
  change_description text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  requested_by uuid REFERENCES auth.users(id),
  approved_by jsonb DEFAULT '[]'::jsonb, -- array of user IDs who approved
  rejected_by uuid,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- Enable RLS on new tables
ALTER TABLE public.deal_room_voting_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_voting_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_change_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for voting questions
CREATE POLICY "Participants can view voting questions" ON public.deal_room_voting_questions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants
    WHERE deal_room_id = deal_room_voting_questions.deal_room_id
    AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.deal_rooms
    WHERE id = deal_room_voting_questions.deal_room_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage voting questions" ON public.deal_room_voting_questions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deal_rooms
    WHERE id = deal_room_voting_questions.deal_room_id
    AND created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS policies for voting responses
CREATE POLICY "Participants can view voting responses" ON public.deal_room_voting_responses
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_voting_questions q
    JOIN public.deal_room_participants p ON p.deal_room_id = q.deal_room_id
    WHERE q.id = deal_room_voting_responses.question_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Participants can submit their votes" ON public.deal_room_voting_responses
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants
    WHERE id = deal_room_voting_responses.participant_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Participants can update their votes" ON public.deal_room_voting_responses
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants
    WHERE id = deal_room_voting_responses.participant_id
    AND user_id = auth.uid()
  )
);

-- RLS policies for change orders
CREATE POLICY "Participants can view change orders" ON public.deal_room_change_orders
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants
    WHERE deal_room_id = deal_room_change_orders.deal_room_id
    AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.deal_rooms
    WHERE id = deal_room_change_orders.deal_room_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create change orders" ON public.deal_room_change_orders
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants
    WHERE deal_room_id = deal_room_change_orders.deal_room_id
    AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.deal_rooms
    WHERE id = deal_room_change_orders.deal_room_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage change orders" ON public.deal_room_change_orders
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deal_rooms
    WHERE id = deal_room_change_orders.deal_room_id
    AND created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_voting_questions_deal_room ON public.deal_room_voting_questions(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_voting_responses_question ON public.deal_room_voting_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_deal_room ON public.deal_room_change_orders(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON public.deal_room_change_orders(status);