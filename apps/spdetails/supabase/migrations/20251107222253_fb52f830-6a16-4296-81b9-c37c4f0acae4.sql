-- Create businesses table for multi-tenant support
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_email)
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Create business_members table to link users to businesses
CREATE TABLE public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- Create business_pricing table for custom pricing per business
CREATE TABLE public.business_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL,
  service_label TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, service_type)
);

ALTER TABLE public.business_pricing ENABLE ROW LEVEL SECURITY;

-- Add business_id and other fields to bookings table
ALTER TABLE public.bookings 
  ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  ADD COLUMN assigned_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN latitude NUMERIC(10, 8),
  ADD COLUMN longitude NUMERIC(11, 8);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.user_belongs_to_business(_user_id UUID, _business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE user_id = _user_id
      AND business_id = _business_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_business_role(_user_id UUID, _business_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.business_members
  WHERE user_id = _user_id
    AND business_id = _business_id
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_businesses(_user_id UUID)
RETURNS TABLE(business_id UUID, role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id, role
  FROM public.business_members
  WHERE user_id = _user_id
$$;

-- Triggers
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_pricing_updated_at
BEFORE UPDATE ON public.business_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();