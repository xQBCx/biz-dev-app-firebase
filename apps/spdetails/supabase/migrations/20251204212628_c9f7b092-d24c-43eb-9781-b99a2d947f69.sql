-- Add column to store selected add-ons in bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS selected_add_ons jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.bookings.selected_add_ons IS 'Array of selected add-on services with their IDs and prices';