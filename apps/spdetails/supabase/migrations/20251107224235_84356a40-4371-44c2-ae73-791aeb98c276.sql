-- Fix bookings security: Require authentication
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Authenticated users can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix job_photos security
DROP POLICY IF EXISTS "Anyone can insert job photos" ON public.job_photos;

CREATE POLICY "Business members can upload job photos"
ON public.job_photos FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.business_members bm ON b.business_id = bm.business_id
    WHERE b.id = job_photos.booking_id AND bm.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can upload photos for their bookings"
ON public.job_photos FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.bookings WHERE id = job_photos.booking_id AND user_id = auth.uid()
  )
);

-- Add cancellation policy to businesses (default for all their bookings)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS cancellation_hours integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS cancellation_refund_percent integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS cancellation_partial_hours integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS cancellation_partial_refund_percent integer DEFAULT 50;

-- Add per-booking cancellation overrides and payment status
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS cancellation_hours integer,
ADD COLUMN IF NOT EXISTS cancellation_refund_percent integer,
ADD COLUMN IF NOT EXISTS cancellation_partial_hours integer,
ADD COLUMN IF NOT EXISTS cancellation_partial_refund_percent integer,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_intent_id text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS refund_amount numeric,
ADD COLUMN IF NOT EXISTS refund_status text;