-- Create vault storage bucket for archive files
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for vault bucket

-- Only owners can read their own files
CREATE POLICY "Users can read their own vault files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vault' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Only owners can upload to their folder
CREATE POLICY "Users can upload to their vault folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vault' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Only owners can delete their files
CREATE POLICY "Users can delete their vault files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vault' AND
  (storage.foldername(name))[2] = auth.uid()::text
);