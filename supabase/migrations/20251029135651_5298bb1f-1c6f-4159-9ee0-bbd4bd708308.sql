-- Create storage bucket for IP documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ip-documents',
  'ip-documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
);

-- RLS Policies for ip-documents bucket
-- Users can upload their own documents
CREATE POLICY "Users can upload their own IP documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ip-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own documents
CREATE POLICY "Users can view their own IP documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ip-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own documents
CREATE POLICY "Users can update their own IP documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ip-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own IP documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ip-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);