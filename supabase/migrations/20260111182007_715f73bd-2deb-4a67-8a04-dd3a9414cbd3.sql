-- Human Growth Instruments Tables
-- Core table for growth instruments (performance-backed investments in human development)
CREATE TABLE public.human_growth_instruments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instrument_type TEXT NOT NULL DEFAULT 'training', -- training, nutrition, equipment, legal, team, production
  target_amount NUMERIC NOT NULL DEFAULT 0,
  funded_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, seeking_funding, funded, in_progress, completed, cancelled
  performance_metrics JSONB DEFAULT '{}',
  upside_share_percent NUMERIC DEFAULT 10, -- percentage of upside shared with backers
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Investments in growth instruments
CREATE TABLE public.growth_instrument_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instrument_id UUID NOT NULL REFERENCES public.human_growth_instruments(id) ON DELETE CASCADE,
  investor_user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  investment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active', -- active, returned, distributed
  expected_return_percent NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Milestones for tracking progress
CREATE TABLE public.growth_instrument_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instrument_id UUID NOT NULL REFERENCES public.human_growth_instruments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  release_percent NUMERIC DEFAULT 0, -- percentage of funds released on completion
  verification_method TEXT, -- self, peer, system, xodiak
  xodiak_anchor_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, verified
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROI distributions to backers
CREATE TABLE public.growth_instrument_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instrument_id UUID NOT NULL REFERENCES public.human_growth_instruments(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES public.growth_instrument_investments(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  distribution_type TEXT NOT NULL DEFAULT 'roi', -- roi, refund, bonus
  distributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_reference TEXT,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.human_growth_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_instrument_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_instrument_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_instrument_distributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for human_growth_instruments
CREATE POLICY "Users can view their own growth instruments"
  ON public.human_growth_instruments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view funded instruments they invested in"
  ON public.human_growth_instruments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.growth_instrument_investments
      WHERE instrument_id = human_growth_instruments.id
      AND investor_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own growth instruments"
  ON public.human_growth_instruments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth instruments"
  ON public.human_growth_instruments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft instruments"
  ON public.human_growth_instruments FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- RLS Policies for investments
CREATE POLICY "Investors can view their own investments"
  ON public.growth_instrument_investments FOR SELECT
  USING (auth.uid() = investor_user_id);

CREATE POLICY "Instrument owners can view investments in their instruments"
  ON public.growth_instrument_investments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.human_growth_instruments
      WHERE id = growth_instrument_investments.instrument_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create investments"
  ON public.growth_instrument_investments FOR INSERT
  WITH CHECK (auth.uid() = investor_user_id);

-- RLS Policies for milestones
CREATE POLICY "Users can view milestones for their instruments"
  ON public.growth_instrument_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.human_growth_instruments
      WHERE id = growth_instrument_milestones.instrument_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can view milestones for invested instruments"
  ON public.growth_instrument_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.growth_instrument_investments inv
      JOIN public.human_growth_instruments inst ON inv.instrument_id = inst.id
      WHERE inst.id = growth_instrument_milestones.instrument_id
      AND inv.investor_user_id = auth.uid()
    )
  );

CREATE POLICY "Instrument owners can manage milestones"
  ON public.growth_instrument_milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.human_growth_instruments
      WHERE id = growth_instrument_milestones.instrument_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for distributions
CREATE POLICY "Investors can view their distributions"
  ON public.growth_instrument_distributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.growth_instrument_investments
      WHERE id = growth_instrument_distributions.investment_id
      AND investor_user_id = auth.uid()
    )
  );

CREATE POLICY "Instrument owners can manage distributions"
  ON public.growth_instrument_distributions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.human_growth_instruments
      WHERE id = growth_instrument_distributions.instrument_id
      AND user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_human_growth_instruments_updated_at
  BEFORE UPDATE ON public.human_growth_instruments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();