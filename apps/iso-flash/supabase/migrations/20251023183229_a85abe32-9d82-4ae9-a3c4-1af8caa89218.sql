-- Fix security: Restrict profile viewing to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix security: Restrict ratings viewing to authenticated users only  
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.ratings;

CREATE POLICY "Authenticated users can view ratings"
ON public.ratings
FOR SELECT
TO authenticated
USING (true);