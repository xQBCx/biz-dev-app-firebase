-- Create team_status table for shift activity tracking
CREATE TABLE public.team_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'off_duty' CHECK (status IN ('off_duty', 'on_shift', 'break', 'inactive')),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_shift_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, property_id)
);

-- Enable RLS
ALTER TABLE public.team_status ENABLE ROW LEVEL SECURITY;

-- Create policies for team_status
CREATE POLICY "Users can view team status for their property" 
ON public.team_status 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = team_status.property_id
));

CREATE POLICY "Managers can manage team status" 
ON public.team_status 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = team_status.property_id 
  AND profiles.role IN ('manager', 'owner', 'regional')
));

CREATE POLICY "Users can update their own status" 
ON public.team_status 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.id = team_status.employee_id
));

-- Create indexes for better performance
CREATE INDEX idx_team_status_property_id ON public.team_status(property_id);
CREATE INDEX idx_team_status_employee_id ON public.team_status(employee_id);
CREATE INDEX idx_team_status_status ON public.team_status(status);

-- Create trigger for updated_at
CREATE TRIGGER update_team_status_updated_at
BEFORE UPDATE ON public.team_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create daily_shifts table for shift scheduling
CREATE TABLE public.daily_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  department TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for daily_shifts
ALTER TABLE public.daily_shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_shifts
CREATE POLICY "Users can view shifts for their property" 
ON public.daily_shifts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = daily_shifts.property_id
));

CREATE POLICY "Managers can manage shifts" 
ON public.daily_shifts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = daily_shifts.property_id 
  AND profiles.role IN ('manager', 'owner', 'regional')
));

-- Create indexes for daily_shifts
CREATE INDEX idx_daily_shifts_property_id ON public.daily_shifts(property_id);
CREATE INDEX idx_daily_shifts_employee_id ON public.daily_shifts(employee_id);
CREATE INDEX idx_daily_shifts_date ON public.daily_shifts(shift_date);

-- Create trigger for daily_shifts updated_at
CREATE TRIGGER update_daily_shifts_updated_at
BEFORE UPDATE ON public.daily_shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to team_status for current_shift_id
ALTER TABLE public.team_status 
ADD CONSTRAINT fk_team_status_current_shift 
FOREIGN KEY (current_shift_id) REFERENCES public.daily_shifts(id);