-- Create storage buckets for maintenance request media
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES 
  ('maintenance-photos', 'maintenance-photos', true, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('maintenance-videos', 'maintenance-videos', true, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('maintenance-audio', 'maintenance-audio', false, ARRAY['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4']);

-- Create RLS policies for maintenance photos
CREATE POLICY "Authenticated users can upload maintenance photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'maintenance-photos' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view maintenance photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'maintenance-photos');

CREATE POLICY "Users can update their own maintenance photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'maintenance-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for maintenance videos
CREATE POLICY "Authenticated users can upload maintenance videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'maintenance-videos' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view maintenance videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'maintenance-videos');

CREATE POLICY "Users can update their own maintenance videos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'maintenance-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for maintenance audio
CREATE POLICY "Authenticated users can upload maintenance audio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'maintenance-audio' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own maintenance audio" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'maintenance-audio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own maintenance audio" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'maintenance-audio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add media attachments column to maintenance_requests table
ALTER TABLE maintenance_requests 
ADD COLUMN media_attachments JSONB DEFAULT '[]'::jsonb;