-- Deal Room Chemical Blender: Formulation and Attribution System
-- Links to existing deal_rooms table

-- Formulation versions for deal rooms (governance + rule versioning)
CREATE TABLE public.deal_room_formulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'superseded', 'archived')),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  activated_at timestamptz,
  activated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(deal_room_id, version_number)
);

-- Ingredients: contributions registered to a deal room
CREATE TABLE public.deal_room_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id uuid REFERENCES public.deal_room_formulations(id) ON DELETE CASCADE,
  contributor_id text NOT NULL, -- user_id or agent_id
  contributor_type text NOT NULL CHECK (contributor_type IN ('human', 'agent', 'workspace', 'external')),
  ingredient_type text NOT NULL CHECK (ingredient_type IN ('capital', 'technology', 'customers', 'ip', 'expertise', 'distribution', 'labor', 'data')),
  description text,
  value_weight numeric DEFAULT 1.0,
  credit_multiplier numeric DEFAULT 1.0,
  ownership_percent numeric, -- optional fixed ownership
  created_at timestamptz DEFAULT now()
);

-- Attribution rules: how credits convert to revenue
CREATE TABLE public.deal_room_attribution_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id uuid REFERENCES public.deal_room_formulations(id) ON DELETE CASCADE,
  rule_type text NOT NULL CHECK (rule_type IN ('fixed_percent', 'credit_ratio', 'tiered', 'custom')),
  rule_name text NOT NULL,
  rule_config jsonb NOT NULL DEFAULT '{}',
  priority integer DEFAULT 0,
  applies_to_credit_type text CHECK (applies_to_credit_type IN ('compute', 'action', 'outcome', 'all')),
  created_at timestamptz DEFAULT now()
);

-- Participant reviews for formulation activation
CREATE TABLE public.deal_room_formulation_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id uuid REFERENCES public.deal_room_formulations(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'abstained')),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(formulation_id, participant_id)
);

-- Payout calculations (settlement records)
CREATE TABLE public.deal_room_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id uuid REFERENCES public.deal_room_formulations(id),
  deal_room_id uuid REFERENCES public.deal_rooms(id),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_revenue numeric NOT NULL DEFAULT 0,
  total_credits_distributed integer DEFAULT 0,
  payout_breakdown jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid', 'disputed')),
  calculated_at timestamptz DEFAULT now(),
  approved_by uuid,
  approved_at timestamptz,
  paid_at timestamptz
);

-- Enable RLS
ALTER TABLE public.deal_room_formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_attribution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_formulation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view formulations for deal rooms they participate in
CREATE POLICY "Users can view deal room formulations" ON public.deal_room_formulations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants p
      WHERE p.deal_room_id = deal_room_formulations.deal_room_id AND p.user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can manage own formulations" ON public.deal_room_formulations
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view ingredients" ON public.deal_room_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_formulations f
      JOIN public.deal_room_participants p ON p.deal_room_id = f.deal_room_id
      WHERE f.id = formulation_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage ingredients in own formulations" ON public.deal_room_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_formulations f
      WHERE f.id = formulation_id AND f.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view attribution rules" ON public.deal_room_attribution_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_formulations f
      JOIN public.deal_room_participants p ON p.deal_room_id = f.deal_room_id
      WHERE f.id = formulation_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage attribution rules in own formulations" ON public.deal_room_attribution_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_formulations f
      WHERE f.id = formulation_id AND f.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own reviews" ON public.deal_room_formulation_reviews
  FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "Formulation creators can view all reviews" ON public.deal_room_formulation_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_formulations f
      WHERE f.id = formulation_id AND f.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own reviews" ON public.deal_room_formulation_reviews
  FOR UPDATE USING (participant_id = auth.uid());

CREATE POLICY "Users can view payouts for their deal rooms" ON public.deal_room_payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants p
      WHERE p.deal_room_id = deal_room_payouts.deal_room_id AND p.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_formulations_deal_room ON public.deal_room_formulations(deal_room_id);
CREATE INDEX idx_formulations_status ON public.deal_room_formulations(status);
CREATE INDEX idx_ingredients_formulation ON public.deal_room_ingredients(formulation_id);
CREATE INDEX idx_ingredients_contributor ON public.deal_room_ingredients(contributor_id);
CREATE INDEX idx_attribution_formulation ON public.deal_room_attribution_rules(formulation_id);
CREATE INDEX idx_reviews_formulation ON public.deal_room_formulation_reviews(formulation_id);
CREATE INDEX idx_payouts_deal_room ON public.deal_room_payouts(deal_room_id);