-- Allow anyone to upload to job-photos bucket (for customer booking photos)
CREATE POLICY "Anyone can upload to job-photos bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'job-photos');