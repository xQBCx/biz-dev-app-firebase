-- BD Achievements table for verified business wins
CREATE TABLE public.bd_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id),
  title TEXT NOT NULL,
  description TEXT,
  achievement_type TEXT NOT NULL DEFAULT 'deal_closed',
  risk_tolerance NUMERIC(3,2) CHECK (risk_tolerance >= 0 AND risk_tolerance <= 1),
  execution_speed NUMERIC(3,2) CHECK (execution_speed >= 0 AND execution_speed <= 1),
  metrics JSONB DEFAULT '{}',
  source_entity_type TEXT,
  source_entity_id UUID,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Broadcast segments (news/achievement stories)
CREATE TABLE public.broadcast_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_type TEXT NOT NULL DEFAULT 'news',
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_urls TEXT[],
  source_data JSONB DEFAULT '{}',
  video_url TEXT,
  video_status TEXT DEFAULT 'pending',
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  achievement_id UUID REFERENCES public.bd_achievements(id),
  sector TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Broadcast interactions for behavioral logging
CREATE TABLE public.broadcast_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  segment_id UUID REFERENCES public.broadcast_segments(id) NOT NULL,
  interaction_type TEXT NOT NULL,
  watch_duration_seconds INTEGER,
  completion_rate NUMERIC(5,2),
  question_text TEXT,
  answer_text TEXT,
  answer_sources JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Achievement interactions for tracking engagement
CREATE TABLE public.achievement_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_id UUID REFERENCES public.bd_achievements(id) NOT NULL,
  interaction_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bd_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_interactions ENABLE ROW LEVEL SECURITY;

-- BD Achievements policies
CREATE POLICY "Users can view public achievements" ON public.bd_achievements
  FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can create own achievements" ON public.bd_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.bd_achievements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements" ON public.bd_achievements
  FOR DELETE USING (auth.uid() = user_id);

-- Broadcast segments policies (public read, admin write)
CREATE POLICY "Anyone can view published segments" ON public.broadcast_segments
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can create segments" ON public.broadcast_segments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update segments" ON public.broadcast_segments
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Broadcast interactions policies
CREATE POLICY "Users can view own interactions" ON public.broadcast_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interactions" ON public.broadcast_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievement interactions policies
CREATE POLICY "Users can view own achievement interactions" ON public.achievement_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own achievement interactions" ON public.achievement_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_bd_achievements_user ON public.bd_achievements(user_id);
CREATE INDEX idx_bd_achievements_company ON public.bd_achievements(company_id);
CREATE INDEX idx_bd_achievements_type ON public.bd_achievements(achievement_type);
CREATE INDEX idx_broadcast_segments_type ON public.broadcast_segments(segment_type);
CREATE INDEX idx_broadcast_segments_published ON public.broadcast_segments(published, published_at DESC);
CREATE INDEX idx_broadcast_interactions_user ON public.broadcast_interactions(user_id);
CREATE INDEX idx_broadcast_interactions_segment ON public.broadcast_interactions(segment_id);
CREATE INDEX idx_achievement_interactions_user ON public.achievement_interactions(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_bd_achievements_updated_at
  BEFORE UPDATE ON public.bd_achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broadcast_segments_updated_at
  BEFORE UPDATE ON public.broadcast_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();