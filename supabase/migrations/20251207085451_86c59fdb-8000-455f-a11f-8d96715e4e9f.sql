-- Create table for storing personalized recommendations
CREATE TABLE IF NOT EXISTS public.instincts_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_type text NOT NULL, -- 'workflow', 'agent', 'action', 'module', 'entity'
  title text NOT NULL,
  description text,
  reason text, -- Why this was recommended
  priority_score numeric DEFAULT 0, -- Higher = more relevant
  metadata jsonb DEFAULT '{}'::jsonb,
  entity_type text, -- If recommending an entity: 'company', 'deal', 'contact', etc.
  entity_id uuid, -- Reference to the entity
  action_path text, -- Route or action to take
  is_dismissed boolean DEFAULT false,
  dismissed_at timestamptz,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX idx_instincts_recommendations_user ON public.instincts_recommendations(user_id);
CREATE INDEX idx_instincts_recommendations_active ON public.instincts_recommendations(user_id, is_dismissed, is_completed, expires_at);
CREATE INDEX idx_instincts_recommendations_type ON public.instincts_recommendations(user_id, recommendation_type);
CREATE INDEX idx_instincts_recommendations_priority ON public.instincts_recommendations(user_id, priority_score DESC);

-- Enable RLS
ALTER TABLE public.instincts_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own recommendations
CREATE POLICY "Users can view their own recommendations" 
  ON public.instincts_recommendations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" 
  ON public.instincts_recommendations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations" 
  ON public.instincts_recommendations FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete their own recommendations" 
  ON public.instincts_recommendations FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_instincts_recommendations_updated_at
  BEFORE UPDATE ON public.instincts_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();