-- Add user_feature_toggles table for feature-specific permissions like ElevenLabs voice
CREATE TABLE IF NOT EXISTS public.user_feature_toggles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_by UUID REFERENCES auth.users(id),
  enabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.user_feature_toggles ENABLE ROW LEVEL SECURITY;

-- Users can view their own toggles
CREATE POLICY "Users can view own feature toggles"
ON public.user_feature_toggles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all feature toggles"
ON public.user_feature_toggles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can insert/update feature toggles
CREATE POLICY "Admins can manage feature toggles"
ON public.user_feature_toggles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_user_feature_toggles_updated_at
BEFORE UPDATE ON public.user_feature_toggles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();