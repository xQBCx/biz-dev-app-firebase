-- Create private storage bucket for verification media
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-media', 'verification-media', false);

-- Policy: Users can upload their own verification media
CREATE POLICY "Users can upload their own verification media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own verification media
CREATE POLICY "Users can view their own verification media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view verification media for sessions they're part of
CREATE POLICY "Users can view media from their sessions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-media'
  AND EXISTS (
    SELECT 1 FROM public.verification_records vr
    JOIN public.consent_sessions cs ON vr.session_id = cs.id
    WHERE vr.media_url LIKE '%' || storage.objects.name || '%'
    AND (cs.initiator_id = auth.uid() OR cs.partner_id = auth.uid())
  )
);

-- Policy: Users can update their own verification media
CREATE POLICY "Users can update their own verification media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own verification media
CREATE POLICY "Users can delete their own verification media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);