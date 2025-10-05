-- Create franchise categories table for NAICS code mapping
CREATE TABLE public.franchise_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  naics_code TEXT NOT NULL,
  naics_title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create franchises table
CREATE TABLE public.franchises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.franchise_categories(id),
  naics_code TEXT,
  industry TEXT NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  investment_min NUMERIC NOT NULL,
  investment_max NUMERIC NOT NULL,
  franchise_fee NUMERIC NOT NULL,
  royalty_fee_percent NUMERIC,
  training_provided BOOLEAN DEFAULT true,
  training_duration_weeks INTEGER,
  support_provided TEXT,
  territories_available INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,
  year_established INTEGER,
  franchise_since INTEGER,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create franchise applications table
CREATE TABLE public.franchise_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id),
  status TEXT NOT NULL DEFAULT 'pending',
  investment_amount NUMERIC,
  desired_location TEXT,
  experience_years INTEGER,
  capital_available NUMERIC,
  message TEXT,
  application_data JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.franchise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchise_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for franchise_categories
CREATE POLICY "Anyone can view franchise categories"
ON public.franchise_categories FOR SELECT
USING (true);

-- RLS Policies for franchises
CREATE POLICY "Anyone can view active franchises"
ON public.franchises FOR SELECT
USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own franchises"
ON public.franchises FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own franchises"
ON public.franchises FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own franchises"
ON public.franchises FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for franchise_applications
CREATE POLICY "Users can view their own applications"
ON public.franchise_applications FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT user_id FROM public.franchises WHERE id = franchise_id
));

CREATE POLICY "Users can create applications"
ON public.franchise_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
ON public.franchise_applications FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_franchises_updated_at
BEFORE UPDATE ON public.franchises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_franchise_applications_updated_at
BEFORE UPDATE ON public.franchise_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_franchises_status ON public.franchises(status);
CREATE INDEX idx_franchises_industry ON public.franchises(industry);
CREATE INDEX idx_franchises_user_id ON public.franchises(user_id);
CREATE INDEX idx_franchise_applications_user_id ON public.franchise_applications(user_id);
CREATE INDEX idx_franchise_applications_franchise_id ON public.franchise_applications(franchise_id);