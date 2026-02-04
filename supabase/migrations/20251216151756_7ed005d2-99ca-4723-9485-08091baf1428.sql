-- Create user scheduling preferences table
CREATE TABLE public.user_scheduling_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Working hours
  work_start_time TIME NOT NULL DEFAULT '09:00',
  work_end_time TIME NOT NULL DEFAULT '17:00',
  work_days INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5], -- 0=Sun, 1=Mon, etc.
  
  -- Break preferences
  lunch_start_time TIME DEFAULT '12:00',
  lunch_duration_minutes INTEGER DEFAULT 60,
  short_break_duration_minutes INTEGER DEFAULT 15,
  short_break_frequency_hours INTEGER DEFAULT 2,
  
  -- Energy patterns
  peak_energy_time TEXT DEFAULT 'morning', -- 'morning', 'afternoon', 'evening'
  low_energy_time TEXT DEFAULT 'afternoon',
  
  -- Focus time preferences
  focus_block_duration_minutes INTEGER DEFAULT 90,
  prefer_focus_time_morning BOOLEAN DEFAULT true,
  max_meetings_per_day INTEGER DEFAULT 5,
  min_buffer_between_meetings_minutes INTEGER DEFAULT 15,
  
  -- Location preferences
  default_location TEXT,
  default_location_lat DOUBLE PRECISION,
  default_location_lng DOUBLE PRECISION,
  commute_buffer_minutes INTEGER DEFAULT 30,
  
  -- Task preferences
  task_time_estimates_json JSONB DEFAULT '{}', -- Learned estimates by task type
  preferred_task_order TEXT DEFAULT 'priority', -- 'priority', 'due_date', 'energy_match'
  batch_similar_tasks BOOLEAN DEFAULT true,
  
  -- Learning data
  avg_task_completion_accuracy DOUBLE PRECISION DEFAULT 1.0, -- How accurate user estimates are
  total_tasks_tracked INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create task time tracking table for learning
CREATE TABLE public.task_time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL,
  task_type TEXT,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_scheduling_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_time_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduling preferences
CREATE POLICY "Users can view their own scheduling preferences"
  ON public.user_scheduling_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduling preferences"
  ON public.user_scheduling_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduling preferences"
  ON public.user_scheduling_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for task time tracking
CREATE POLICY "Users can view their own task time tracking"
  ON public.task_time_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task time tracking"
  ON public.task_time_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task time tracking"
  ON public.task_time_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_scheduling_preferences_updated_at
  BEFORE UPDATE ON public.user_scheduling_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_task_time_tracking_user_id ON public.task_time_tracking(user_id);
CREATE INDEX idx_task_time_tracking_task_type ON public.task_time_tracking(task_type);