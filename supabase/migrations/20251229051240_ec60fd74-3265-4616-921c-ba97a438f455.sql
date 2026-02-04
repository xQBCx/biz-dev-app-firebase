-- Add deal_room_id to blender_ingredients if not exists
ALTER TABLE public.blender_ingredients 
ADD COLUMN IF NOT EXISTS deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE CASCADE;

ALTER TABLE public.blender_ingredients 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Attribution rules table
CREATE TABLE IF NOT EXISTS public.blender_attribution_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  credit_type TEXT NOT NULL DEFAULT 'contribution',
  payout_percentage NUMERIC NOT NULL DEFAULT 0,
  min_payout NUMERIC,
  max_payout NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS public.blender_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID NOT NULL REFERENCES public.blender_ingredients(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL DEFAULT 'api_call',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'calls',
  cost_incurred NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blender_attribution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blender_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for attribution rules
CREATE POLICY "Users can view attribution rules for their deal rooms"
ON public.blender_attribution_rules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM deal_room_participants drp
    WHERE drp.deal_room_id = blender_attribution_rules.deal_room_id
    AND drp.user_id = auth.uid()
  )
);

CREATE POLICY "Participants can manage attribution rules"
ON public.blender_attribution_rules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM deal_room_participants drp
    WHERE drp.deal_room_id = blender_attribution_rules.deal_room_id
    AND drp.user_id = auth.uid()
  )
);

-- RLS policies for usage logs (simplified - anyone can view logs for ingredients they can see)
CREATE POLICY "Users can view usage logs"
ON public.blender_usage_logs FOR SELECT
USING (true);

CREATE POLICY "System can insert usage logs"
ON public.blender_usage_logs FOR INSERT
WITH CHECK (true);

-- Enable realtime for usage logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.blender_usage_logs;