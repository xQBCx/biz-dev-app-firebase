-- Make user_id nullable to support guest bookings
ALTER TABLE public.bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Add policy to allow guest users to create bookings
CREATE POLICY "Guest users can create bookings"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Add policy to allow guest users to insert with their own user_id if authenticated
CREATE POLICY "Authenticated users can create their bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update the existing insert policy name for clarity (drop old one first)
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;

-- Admins can view guest bookings too (already covered by existing policy)