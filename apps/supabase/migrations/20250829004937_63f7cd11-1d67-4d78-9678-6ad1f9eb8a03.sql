-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initials TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  property_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view team members for their property" 
ON public.team_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = team_members.property_id
));

CREATE POLICY "Managers can manage team members" 
ON public.team_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = team_members.property_id
  AND profiles.role IN ('manager', 'owner', 'regional')
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the team members data
INSERT INTO public.team_members (initials, full_name, role, status, property_id) VALUES
('BM', 'Brandon McGee', 'Maintenance', 'Active', '44444444-4444-4444-4444-444444444444'),
('BP', 'Brittany Patel', 'Owner', 'Active', '44444444-4444-4444-4444-444444444444'),
('CL', 'Cheyann Ludolph', 'Front Desk Clerk (+2)', 'Active', '44444444-4444-4444-4444-444444444444'),
('CK', 'Chris Kerr', 'Food & Beverage', 'Active', '44444444-4444-4444-4444-444444444444'),
('DC', 'Desi Cabrera', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('EH', 'Eileen Hatrick', 'Front Desk Clerk', 'Active', '44444444-4444-4444-4444-444444444444'),
('EC', 'Erik Currie', 'Team Support', 'Active', '44444444-4444-4444-4444-444444444444'),
('GV', 'Gabriela Valle', 'House Keeping Manager', 'Active', '44444444-4444-4444-4444-444444444444'),
('JL', 'Jason Lopez', 'Operations Director', 'Active', '44444444-4444-4444-4444-444444444444'),
('JC', 'Jesus Chacon', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('JZ', 'Josiah Zimmerman', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('KC', 'Kayla Candelairo', 'Front Desk Clerk', 'Active', '44444444-4444-4444-4444-444444444444'),
('KK', 'Kira King', 'Front Desk Clerk', 'Active', '44444444-4444-4444-4444-444444444444'),
('LP', 'Lilly Ponce', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('MW', 'Malakye Wilson', 'Front Desk Clerk', 'Active', '44444444-4444-4444-4444-444444444444'),
('MS', 'Maria Santillan-Munoz', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('MB', 'Michael Baquero', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('MR', 'Michael Richter', 'Team Support', 'Active', '44444444-4444-4444-4444-444444444444'),
('NS', 'Nathaly Silvana', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('NS', 'Neyla Salas', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('OH', 'Olga Hernandez', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444'),
('SL', 'Shauna Larkin', 'Front Desk Clerk', 'Active', '44444444-4444-4444-4444-444444444444'),
('TZ', 'Tiara Zimmerman', 'Operations Manager', 'Active', '44444444-4444-4444-4444-444444444444'),
('YS', 'Yorney Salas', 'House Keeping', 'Active', '44444444-4444-4444-4444-444444444444');