-- Create generated schedules table
CREATE TABLE public.generated_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  schedule_data JSONB NOT NULL,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.generated_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own schedules"
  ON public.generated_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
  ON public.generated_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.generated_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.generated_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_generated_schedules_updated_at
  BEFORE UPDATE ON public.generated_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index
CREATE INDEX idx_generated_schedules_user_date ON public.generated_schedules(user_id, date);