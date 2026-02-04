-- Health goals tracking table
CREATE TABLE public.health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'general', -- injury, strength, mobility, pain_management, etc.
  status TEXT NOT NULL DEFAULT 'active', -- active, achieved, paused
  body_area TEXT, -- knee, back, shoulder, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Goal conversations (chat history with AI)
CREATE TABLE public.goal_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.health_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  image_url TEXT, -- for user-uploaded photos
  generated_images JSONB, -- AI-generated exercise diagrams
  metadata JSONB, -- additional context like pain level, timing, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI recommendations tracking
CREATE TABLE public.health_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.health_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL, -- exercise, stretch, professional_referral, lifestyle
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions JSONB, -- step-by-step instructions
  diagram_url TEXT, -- generated exercise diagram
  frequency TEXT, -- daily, 3x/week, etc.
  priority TEXT DEFAULT 'medium', -- high, medium, low
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, skipped
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Liability waiver acceptance
CREATE TABLE public.health_waivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  waiver_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_waivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_goals
CREATE POLICY "Users can view their own health goals"
  ON public.health_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health goals"
  ON public.health_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health goals"
  ON public.health_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health goals"
  ON public.health_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for goal_conversations
CREATE POLICY "Users can view their own goal conversations"
  ON public.goal_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal conversations"
  ON public.goal_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for health_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.health_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations"
  ON public.health_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.health_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for health_waivers
CREATE POLICY "Users can view their own waivers"
  ON public.health_waivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own waivers"
  ON public.health_waivers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_health_goals_updated_at
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_recommendations_updated_at
  BEFORE UPDATE ON public.health_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for health goal images
INSERT INTO storage.buckets (id, name, public) VALUES ('health-images', 'health-images', false);

-- Storage policies for health images
CREATE POLICY "Users can upload their own health images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'health-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own health images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'health-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own health images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'health-images' AND auth.uid()::text = (storage.foldername(name))[1]);