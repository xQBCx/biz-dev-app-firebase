-- Create storage bucket for construction documents
INSERT INTO storage.buckets (id, name, public) VALUES ('construction-documents', 'construction-documents', true);

-- Storage policies for construction documents
CREATE POLICY "Users can upload their construction docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'construction-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their construction docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'construction-documents');

CREATE POLICY "Users can update their construction docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'construction-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their construction docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'construction-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);