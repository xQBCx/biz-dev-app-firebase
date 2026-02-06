-- Create public forms tables (no RLS needed as these are public forms)
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_count INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  department TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add timestamp trigger for job_postings
CREATE TRIGGER update_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample job postings
INSERT INTO public.job_postings (title, location, department, type, description) VALUES 
(
  'Property Manager', 
  'Denver, CO', 
  'Operations', 
  'Full-time', 
  'We are seeking an experienced Property Manager to oversee daily operations of our residential properties. The ideal candidate will have strong communication skills, attention to detail, and experience in property management.'
),
(
  'Maintenance Technician', 
  'Boulder, CO', 
  'Maintenance', 
  'Full-time', 
  'Join our maintenance team as a skilled technician responsible for HVAC, plumbing, electrical, and general repairs across our property portfolio. Must have relevant certifications and 3+ years experience.'
),
(
  'Leasing Consultant', 
  'Aurora, CO', 
  'Sales', 
  'Part-time', 
  'We need a customer-focused Leasing Consultant to assist prospective tenants, conduct property tours, and manage the leasing process. Weekend availability required.'
);