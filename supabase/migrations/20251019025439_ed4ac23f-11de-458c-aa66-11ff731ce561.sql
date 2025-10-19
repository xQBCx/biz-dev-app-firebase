-- Create enum for activity types
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'task', 'project_work', 'document', 'other');

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SOPs table
CREATE TABLE public.sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT,
  frequency TEXT,
  confidence_score NUMERIC DEFAULT 0,
  based_on_activities JSONB DEFAULT '[]'::jsonb,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs"
  ON public.activity_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity logs"
  ON public.activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sops
CREATE POLICY "Users can view their own SOPs"
  ON public.sops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SOPs"
  ON public.sops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOPs"
  ON public.sops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SOPs"
  ON public.sops FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_started_at ON public.activity_logs(started_at DESC);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_sops_user_id ON public.sops(user_id);

-- Create trigger to update updated_at on sops
CREATE TRIGGER update_sops_updated_at
  BEFORE UPDATE ON public.sops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();