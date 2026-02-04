
-- Create personal inventory/reflections table
CREATE TABLE public.reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reflection_type TEXT NOT NULL, -- 'morning', 'midday', 'evening'
  gratitude_items TEXT[] DEFAULT '{}'::TEXT[],
  wins TEXT[] DEFAULT '{}'::TEXT[], -- things done well
  growth_areas TEXT[] DEFAULT '{}'::TEXT[], -- things to improve
  intentions TEXT[] DEFAULT '{}'::TEXT[], -- how I want to feel/be
  feelings_check TEXT, -- current emotional state
  notes TEXT, -- free-form journaling
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create affirmations/mantras table for positive reminders
CREATE TABLE public.affirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'serenity', 'courage', 'wisdom', 'gratitude', 'progress'
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create amends/relationship reflections table (making things right)
CREATE TABLE public.relationship_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT,
  situation TEXT,
  my_part TEXT, -- owning my role
  action_to_take TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_reflections ENABLE ROW LEVEL SECURITY;

-- RLS policies for reflections
CREATE POLICY "Users can view their own reflections"
  ON public.reflections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reflections"
  ON public.reflections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reflections"
  ON public.reflections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reflections"
  ON public.reflections FOR DELETE
  USING (user_id = auth.uid());

-- RLS policies for affirmations
CREATE POLICY "Users can view their own affirmations"
  ON public.affirmations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own affirmations"
  ON public.affirmations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own affirmations"
  ON public.affirmations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own affirmations"
  ON public.affirmations FOR DELETE
  USING (user_id = auth.uid());

-- RLS policies for relationship reflections
CREATE POLICY "Users can view their own relationship reflections"
  ON public.relationship_reflections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own relationship reflections"
  ON public.relationship_reflections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own relationship reflections"
  ON public.relationship_reflections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own relationship reflections"
  ON public.relationship_reflections FOR DELETE
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_reflections_user_date ON public.reflections(user_id, reflection_date);
CREATE INDEX idx_affirmations_user ON public.affirmations(user_id);
CREATE INDEX idx_relationship_reflections_user ON public.relationship_reflections(user_id);
