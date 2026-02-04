-- CRITICAL SECURITY FIX: Remove public access policies and enforce authentication

-- Fix 1: Drop any public access policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Fix 2: Ensure bookings table requires authentication
-- Existing policies already restrict to authenticated users, but ensure user_id is required
-- First, we need to handle any existing NULL user_id bookings
-- Delete any orphaned bookings without a user_id (data cleanup)
DELETE FROM public.bookings WHERE user_id IS NULL;

-- Now make user_id required
ALTER TABLE public.bookings 
  ALTER COLUMN user_id SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.user_id IS 'Required: Every booking must be associated with an authenticated user';