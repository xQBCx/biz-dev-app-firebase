-- Create storage bucket for session photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-photos', 'session-photos', false);

-- Policy: Users can view photos from their own sessions
CREATE POLICY "Users can view their session photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'session-photos' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM sessions 
    WHERE client_id = auth.uid() OR photographer_id = auth.uid()
  )
);

-- Policy: Photographers can upload photos to their active sessions
CREATE POLICY "Photographers can upload session photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'session-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM sessions 
    WHERE photographer_id = auth.uid() AND status = 'active'
  )
);

-- Add photo_url column to messages table to store photo references
ALTER TABLE messages ADD COLUMN photo_url text;