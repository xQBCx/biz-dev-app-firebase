-- Create government_leads table for government/defense inquiries
CREATE TABLE public.government_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  agency TEXT,
  role_title TEXT,
  clearance_level TEXT,
  interest_area TEXT,
  urgency_level TEXT,
  preferred_contact TEXT,
  message TEXT,
  request_classified_briefing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.government_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all leads
CREATE POLICY "Admins can view all government leads" 
ON public.government_leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create policy for anyone to insert leads (public form)
CREATE POLICY "Anyone can submit government leads" 
ON public.government_leads 
FOR INSERT 
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_government_leads_created_at ON public.government_leads (created_at DESC);
CREATE INDEX idx_government_leads_agency ON public.government_leads (agency);