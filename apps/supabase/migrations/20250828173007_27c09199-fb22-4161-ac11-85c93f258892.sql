-- Create orgs table
CREATE TABLE public.orgs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Denver',
  city TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints to existing columns in profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE SET NULL,
ADD CONSTRAINT profiles_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orgs
CREATE POLICY "Users can view their own org" 
ON public.orgs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.org_id = orgs.id
  )
);

CREATE POLICY "Users can update their own org" 
ON public.orgs 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.org_id = orgs.id
    AND profiles.role IN ('manager', 'regional', 'owner')
  )
);

-- Create RLS policies for properties
CREATE POLICY "Users can view their org properties" 
ON public.properties 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.org_id = properties.org_id
  )
);

CREATE POLICY "Users can update their org properties" 
ON public.properties 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.org_id = properties.org_id
    AND profiles.role IN ('manager', 'regional', 'owner')
  )
);

-- Add triggers for timestamp updates
CREATE TRIGGER update_orgs_updated_at
BEFORE UPDATE ON public.orgs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create initial demo data
INSERT INTO public.orgs (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'SmartLink Management'),
('22222222-2222-2222-2222-222222222222', 'Demo Properties LLC');

INSERT INTO public.properties (id, org_id, name, city, state) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Downtown Tower', 'Denver', 'CO'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Garden Apartments', 'Boulder', 'CO'),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Metro Complex', 'Aurora', 'CO');