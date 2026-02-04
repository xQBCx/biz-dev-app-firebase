-- Create coach_profiles table for coach applications and approved coaches
CREATE TABLE public.coach_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  experience TEXT,
  certifications TEXT,
  specialties TEXT[] DEFAULT '{}',
  bio TEXT,
  session_price NUMERIC NOT NULL DEFAULT 75,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coach_sessions table for booking coaching sessions
CREATE TABLE public.coach_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  session_type TEXT DEFAULT 'in-person',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  price NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;

-- Coach profiles policies
CREATE POLICY "Anyone can view approved coaches"
  ON public.coach_profiles FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit coach applications"
  ON public.coach_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Coaches can update their own profile"
  ON public.coach_profiles FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coach profiles"
  ON public.coach_profiles FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Coach sessions policies
CREATE POLICY "Coaches can view their sessions"
  ON public.coach_sessions FOR SELECT
  USING (
    coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
    OR client_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Anyone can book a session"
  ON public.coach_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Coaches and clients can update sessions"
  ON public.coach_sessions FOR UPDATE
  USING (
    coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
    OR client_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Trigger for updated_at
CREATE TRIGGER update_coach_profiles_updated_at
  BEFORE UPDATE ON public.coach_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_sessions_updated_at
  BEFORE UPDATE ON public.coach_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();