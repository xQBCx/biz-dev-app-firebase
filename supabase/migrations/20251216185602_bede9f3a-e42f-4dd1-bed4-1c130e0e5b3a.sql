-- Add default_permissions column to access_requests table
ALTER TABLE public.access_requests 
ADD COLUMN IF NOT EXISTS default_permissions jsonb DEFAULT '{}'::jsonb;