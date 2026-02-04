-- Add RLS policies for session-photos storage bucket
-- Allow users to view photos from sessions they're part of
CREATE POLICY "Users can view photos from their sessions"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'session-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM sessions 
    WHERE client_id = auth.uid() OR photographer_id = auth.uid()
  )
);