-- Create coach availability table
CREATE TABLE public.coach_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view availability
CREATE POLICY "Anyone can view coach availability"
ON public.coach_availability
FOR SELECT
USING (true);

-- Coaches can manage their own availability
CREATE POLICY "Coaches can manage their availability"
ON public.coach_availability
FOR ALL
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Admins can manage all availability
CREATE POLICY "Admins can manage all coach availability"
ON public.coach_availability
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_coach_availability_updated_at
BEFORE UPDATE ON public.coach_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();