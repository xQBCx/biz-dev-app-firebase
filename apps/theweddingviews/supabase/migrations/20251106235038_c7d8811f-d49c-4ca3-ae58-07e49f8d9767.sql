-- Create storage bucket for environment photos and 3D models
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'environments',
  'environments',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'model/gltf-binary', 'application/octet-stream']
);

-- RLS policies for environments bucket
CREATE POLICY "Anyone can view environments"
ON storage.objects FOR SELECT
USING (bucket_id = 'environments');

CREATE POLICY "Authenticated users can upload environments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'environments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own environments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'environments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own environments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'environments' 
  AND auth.uid() IS NOT NULL
);