-- Add fitness-specific fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fitness_goals text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_level text DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS injuries text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS equipment_access text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS available_days text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS workout_duration_minutes integer DEFAULT 45,
ADD COLUMN IF NOT EXISTS viome_results jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS nano_stack jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create programs table
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  weeks integer NOT NULL DEFAULT 4,
  frequency_per_week integer NOT NULL DEFAULT 3,
  equipment_required text[] DEFAULT '{}',
  target_audience text[] DEFAULT '{}',
  difficulty_level text NOT NULL DEFAULT 'beginner',
  creator_coach_id uuid REFERENCES auth.users(id),
  is_template boolean DEFAULT false,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create workouts table
CREATE TABLE public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL,
  day_number integer NOT NULL,
  name text NOT NULL,
  description text,
  estimated_duration_minutes integer DEFAULT 45,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sets integer NOT NULL DEFAULT 3,
  reps text NOT NULL DEFAULT '10',
  weight_type text DEFAULT 'bodyweight',
  rest_seconds integer DEFAULT 60,
  form_cues text[] DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_programs to track assigned programs
CREATE TABLE public.user_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  current_week integer DEFAULT 1,
  current_day integer DEFAULT 1,
  status text DEFAULT 'active',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create workout_logs table
CREATE TABLE public.workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name text NOT NULL,
  set_number integer NOT NULL,
  reps_completed integer,
  weight_used numeric,
  rpe integer CHECK (rpe >= 1 AND rpe <= 10),
  form_score integer CHECK (form_score >= 0 AND form_score <= 100),
  notes text,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create nutrition_targets table
CREATE TABLE public.nutrition_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calories integer,
  protein_g integer,
  carbs_g integer,
  fats_g integer,
  plate_template text DEFAULT 'balanced',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create form_analysis table
CREATE TABLE public.form_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_log_id uuid REFERENCES public.workout_logs(id) ON DELETE SET NULL,
  exercise_name text NOT NULL,
  form_score integer CHECK (form_score >= 0 AND form_score <= 100),
  issues_detected text[] DEFAULT '{}',
  cues_given text[] DEFAULT '{}',
  video_clip_url text,
  analysis_result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create activity_logs table (for robotics future)
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  exercise_name text,
  rep_count integer,
  form_quality integer CHECK (form_quality >= 0 AND form_quality <= 100),
  joint_angles jsonb DEFAULT '{}',
  detected_issues text[] DEFAULT '{}',
  rpe integer CHECK (rpe >= 1 AND rpe <= 10),
  pain_locations text[] DEFAULT '{}',
  user_mood integer CHECK (user_mood >= 1 AND user_mood <= 5),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  soreness_scale integer CHECK (soreness_scale >= 1 AND soreness_scale <= 10),
  sleep_hours numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create supplement_stacks table
CREATE TABLE public.supplement_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purpose text,
  ingredients jsonb DEFAULT '[]',
  dosage text,
  disclaimer text DEFAULT 'Consult physician before use.',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create health_partners table
CREATE TABLE public.health_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  link text,
  logo_url text,
  recommended_for text[] DEFAULT '{}',
  disclaimer text DEFAULT 'Independent service. Not medical advice.',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create coach_chat_messages table for Bill Coach AI
CREATE TABLE public.coach_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_chat_messages ENABLE ROW LEVEL SECURITY;

-- Programs policies
CREATE POLICY "Anyone can view public programs" ON public.programs FOR SELECT USING (is_public = true);
CREATE POLICY "Coaches can manage their programs" ON public.programs FOR ALL USING (creator_coach_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Coaches can create programs" ON public.programs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Workouts policies (inherit from programs)
CREATE POLICY "Anyone can view workouts of public programs" ON public.workouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.programs WHERE id = program_id AND is_public = true)
);
CREATE POLICY "Coaches can manage workouts" ON public.workouts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.programs WHERE id = program_id AND (creator_coach_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
);

-- Exercises policies
CREATE POLICY "Anyone can view exercises of public programs" ON public.exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workouts w JOIN public.programs p ON w.program_id = p.id WHERE w.id = workout_id AND p.is_public = true)
);
CREATE POLICY "Coaches can manage exercises" ON public.exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workouts w JOIN public.programs p ON w.program_id = p.id WHERE w.id = workout_id AND (p.creator_coach_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
);

-- User programs policies
CREATE POLICY "Users can view their programs" ON public.user_programs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their programs" ON public.user_programs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view all user programs" ON public.user_programs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Workout logs policies
CREATE POLICY "Users can view their workout logs" ON public.workout_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create workout logs" ON public.workout_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their workout logs" ON public.workout_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all workout logs" ON public.workout_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Nutrition targets policies
CREATE POLICY "Users can view their nutrition targets" ON public.nutrition_targets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their nutrition targets" ON public.nutrition_targets FOR ALL USING (user_id = auth.uid());

-- Form analysis policies
CREATE POLICY "Users can view their form analysis" ON public.form_analysis FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create form analysis" ON public.form_analysis FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all form analysis" ON public.form_analysis FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Activity logs policies
CREATE POLICY "Users can view their activity logs" ON public.activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create activity logs" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Supplement stacks policies (public read)
CREATE POLICY "Anyone can view active supplement stacks" ON public.supplement_stacks FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage supplement stacks" ON public.supplement_stacks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Health partners policies (public read)
CREATE POLICY "Anyone can view active health partners" ON public.health_partners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage health partners" ON public.health_partners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Coach chat messages policies
CREATE POLICY "Users can view their chat messages" ON public.coach_chat_messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create chat messages" ON public.coach_chat_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all chat messages" ON public.coach_chat_messages FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_programs_updated_at BEFORE UPDATE ON public.user_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nutrition_targets_updated_at BEFORE UPDATE ON public.nutrition_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplement_stacks_updated_at BEFORE UPDATE ON public.supplement_stacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();