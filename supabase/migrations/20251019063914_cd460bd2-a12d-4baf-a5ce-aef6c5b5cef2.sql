-- First, backup existing data if user_roles exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    CREATE TEMP TABLE user_roles_backup AS SELECT * FROM public.user_roles;
    DROP TABLE public.user_roles CASCADE;
  END IF;
END $$;

-- Recreate app_role enum
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'team_member', 'client_user', 'partner');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Restore backup data if it exists, converting old roles
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'pg_temp' AND tablename LIKE 'user_roles_backup%') THEN
    INSERT INTO public.user_roles (id, user_id, created_at, created_by, role)
    SELECT id, user_id, created_at, created_by, 
      CASE 
        WHEN role::text = 'user' THEN 'client_user'::app_role
        WHEN role::text = 'admin' THEN 'admin'::app_role
        WHEN role::text = 'moderator' THEN 'team_member'::app_role
        ELSE 'client_user'::app_role
      END
    FROM pg_temp.user_roles_backup;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'client_user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client_user');
  
  RETURN NEW;
END;
$$;