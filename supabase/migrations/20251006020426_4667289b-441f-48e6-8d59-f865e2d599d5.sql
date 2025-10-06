-- Remove only the public read policies that expose data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;

-- Verify that profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;