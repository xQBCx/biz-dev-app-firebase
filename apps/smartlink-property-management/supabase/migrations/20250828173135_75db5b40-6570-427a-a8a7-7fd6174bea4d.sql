-- Enable RLS on public forms tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create public access policies for forms (allow anonymous submissions)
CREATE POLICY "Anyone can submit leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view job postings" 
ON public.job_postings 
FOR SELECT 
USING (active = true);

CREATE POLICY "Anyone can submit job applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can submit inquiries" 
ON public.inquiries 
FOR INSERT 
WITH CHECK (true);

-- Admin policies for authenticated users to view submissions
CREATE POLICY "Authenticated users can view leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view job applications" 
ON public.job_applications 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view inquiries" 
ON public.inquiries 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage job postings" 
ON public.job_postings 
FOR ALL 
TO authenticated
USING (true);

-- Update profiles to assign users to default org on signup
UPDATE public.profiles 
SET org_id = '11111111-1111-1111-1111-111111111111', 
    property_id = '33333333-3333-3333-3333-333333333333'
WHERE org_id IS NULL;