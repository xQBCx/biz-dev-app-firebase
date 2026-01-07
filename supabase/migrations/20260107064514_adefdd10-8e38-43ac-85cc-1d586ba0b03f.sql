-- Ensure vault bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('vault', 'vault', false, 2147483648) -- 2GB limit
ON CONFLICT (id) DO UPDATE SET file_size_limit = 2147483648;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create policy for authenticated users to upload to vault bucket
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vault' 
  AND (storage.foldername(name))[1] = 'raw'
  AND (storage.foldername(name))[2] = 'openai_exports'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- Create policy for users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vault'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- Create policy for users to update their own files (for chunk upserts)
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vault'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- Create policy for users to delete their own files (cleanup chunks)
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vault'
  AND (storage.foldername(name))[3] = auth.uid()::text
);