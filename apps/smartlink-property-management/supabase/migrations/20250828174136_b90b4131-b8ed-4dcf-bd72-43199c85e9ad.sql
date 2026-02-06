-- Create SOPs table
CREATE TABLE public.sops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department TEXT NOT NULL CHECK (department IN ('frontdesk', 'housekeeping', 'maintenance', 'general')),
  title TEXT NOT NULL,
  sop_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;

-- Create policies for SOPs (readable by all authenticated users)
CREATE POLICY "Authenticated users can view SOPs" 
ON public.sops 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage SOPs" 
ON public.sops 
FOR ALL 
TO authenticated
USING (true);

-- Add timestamp trigger
CREATE TRIGGER update_sops_updated_at
BEFORE UPDATE ON public.sops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample SOPs
INSERT INTO public.sops (department, title, sop_url) VALUES 
('general', 'Property Management Overview', 'https://docs.smartlink.com/general/overview'),
('general', 'Emergency Procedures', 'https://docs.smartlink.com/general/emergency'),
('frontdesk', 'Tenant Check-in Process', 'https://docs.smartlink.com/frontdesk/checkin'),
('frontdesk', 'Visitor Management', 'https://docs.smartlink.com/frontdesk/visitors'),
('frontdesk', 'Service Request Processing', 'https://docs.smartlink.com/frontdesk/requests'),
('housekeeping', 'Unit Turnover Cleaning', 'https://docs.smartlink.com/housekeeping/turnover'),
('housekeeping', 'Daily Cleaning Standards', 'https://docs.smartlink.com/housekeeping/daily'),
('housekeeping', 'Supply Management', 'https://docs.smartlink.com/housekeeping/supplies'),
('maintenance', 'HVAC System Maintenance', 'https://docs.smartlink.com/maintenance/hvac'),
('maintenance', 'Plumbing Repairs', 'https://docs.smartlink.com/maintenance/plumbing'),
('maintenance', 'Vendor Coordination', 'https://docs.smartlink.com/maintenance/vendors');