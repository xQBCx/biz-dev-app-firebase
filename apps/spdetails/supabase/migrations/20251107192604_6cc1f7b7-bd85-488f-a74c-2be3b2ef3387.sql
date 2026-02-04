-- Create storage bucket for job photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos',
  'job-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create job_photos table to track uploaded images
CREATE TABLE public.job_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('before', 'after')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job_photos
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

-- Admins can view all job photos
CREATE POLICY "Admins can view all job photos"
ON public.job_photos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can upload job photos
CREATE POLICY "Admins can upload job photos"
ON public.job_photos
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view photos of their bookings
CREATE POLICY "Users can view their booking photos"
ON public.job_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = job_photos.booking_id
    AND bookings.user_id = auth.uid()
  )
);

-- Anyone can view photos in public bucket
CREATE POLICY "Anyone can view job photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'job-photos');

-- Admins can upload to job-photos bucket
CREATE POLICY "Admins can upload job photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'job-photos'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete from job-photos bucket
CREATE POLICY "Admins can delete job photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'job-photos'
  AND has_role(auth.uid(), 'admin'::app_role)
);