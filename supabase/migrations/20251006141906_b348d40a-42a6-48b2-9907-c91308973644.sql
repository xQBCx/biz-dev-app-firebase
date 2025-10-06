-- Create table for custom CRM properties
CREATE TABLE IF NOT EXISTS public.crm_custom_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  property_label TEXT NOT NULL,
  property_type TEXT NOT NULL, -- text, number, date, email, phone, url, textarea, select, multi-select
  entity_type TEXT NOT NULL, -- contact, company, deal
  field_type TEXT DEFAULT 'standard', -- standard, custom
  options JSONB DEFAULT '[]'::jsonb, -- for select/multi-select options
  is_required BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  default_value TEXT,
  description TEXT,
  group_name TEXT, -- for organizing properties
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, property_name, entity_type)
);

-- Enable RLS
ALTER TABLE public.crm_custom_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own custom properties"
ON public.crm_custom_properties
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_custom_properties_user_entity ON public.crm_custom_properties(user_id, entity_type);
CREATE INDEX idx_custom_properties_name ON public.crm_custom_properties(property_name);

-- Insert standard contact properties
INSERT INTO public.crm_custom_properties (user_id, property_name, property_label, property_type, entity_type, field_type, group_name, display_order)
SELECT 
  auth.uid(),
  unnest(ARRAY['first_name', 'last_name', 'email', 'phone', 'mobile', 'title', 'department', 'linkedin_url', 'twitter_url', 'address', 'city', 'state', 'zip_code', 'country', 'lead_source', 'lead_status', 'lead_score', 'notes']),
  unnest(ARRAY['First Name', 'Last Name', 'Email', 'Phone', 'Mobile', 'Job Title', 'Department', 'LinkedIn URL', 'Twitter URL', 'Address', 'City', 'State', 'Zip Code', 'Country', 'Lead Source', 'Lead Status', 'Lead Score', 'Notes']),
  unnest(ARRAY['text', 'text', 'email', 'phone', 'phone', 'text', 'text', 'url', 'url', 'text', 'text', 'text', 'text', 'text', 'select', 'select', 'number', 'textarea']),
  'contact',
  'standard',
  unnest(ARRAY['Basic Info', 'Basic Info', 'Contact Info', 'Contact Info', 'Contact Info', 'Professional', 'Professional', 'Social', 'Social', 'Address', 'Address', 'Address', 'Address', 'Address', 'Lead Management', 'Lead Management', 'Lead Management', 'Additional']),
  generate_series(1, 18)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, property_name, entity_type) DO NOTHING;

-- Insert standard company properties  
INSERT INTO public.crm_custom_properties (user_id, property_name, property_label, property_type, entity_type, field_type, group_name, display_order)
SELECT 
  auth.uid(),
  unnest(ARRAY['name', 'website', 'industry', 'phone', 'email', 'address', 'city', 'state', 'zip_code', 'country', 'employee_count', 'annual_revenue', 'description', 'status', 'source']),
  unnest(ARRAY['Company Name', 'Website', 'Industry', 'Phone', 'Email', 'Address', 'City', 'State', 'Zip Code', 'Country', 'Employee Count', 'Annual Revenue', 'Description', 'Status', 'Source']),
  unnest(ARRAY['text', 'url', 'text', 'phone', 'email', 'text', 'text', 'text', 'text', 'text', 'number', 'number', 'textarea', 'select', 'select']),
  'company',
  'standard',
  unnest(ARRAY['Basic Info', 'Basic Info', 'Basic Info', 'Contact Info', 'Contact Info', 'Address', 'Address', 'Address', 'Address', 'Address', 'Company Details', 'Company Details', 'Additional', 'Management', 'Management']),
  generate_series(1, 15)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, property_name, entity_type) DO NOTHING;