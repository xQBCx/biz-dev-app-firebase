-- Allow anyone to insert job photos (for customer booking photos)
CREATE POLICY "Anyone can insert job photos"
ON public.job_photos
FOR INSERT
WITH CHECK (true);