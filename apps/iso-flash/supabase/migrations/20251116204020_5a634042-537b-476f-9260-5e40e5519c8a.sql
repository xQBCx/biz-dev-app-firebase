-- Add RLS policies for session-photos storage bucket
CREATE POLICY "Session participants can upload photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'session-photos' AND
  auth.uid() IN (
    SELECT client_id FROM sessions WHERE id::text = (storage.foldername(name))[1]
    UNION
    SELECT photographer_id FROM sessions WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Session participants can view photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'session-photos' AND
  auth.uid() IN (
    SELECT client_id FROM sessions WHERE id::text = (storage.foldername(name))[1]
    UNION
    SELECT photographer_id FROM sessions WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Session participants can delete photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'session-photos' AND
  auth.uid() IN (
    SELECT client_id FROM sessions WHERE id::text = (storage.foldername(name))[1]
    UNION
    SELECT photographer_id FROM sessions WHERE id::text = (storage.foldername(name))[1]
  )
);