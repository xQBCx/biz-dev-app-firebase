-- Add experience level to profiles
ALTER TABLE profiles ADD COLUMN experience_level text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Create portfolio_photos table
CREATE TABLE portfolio_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  title text,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on portfolio_photos
ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view portfolio photos
CREATE POLICY "Anyone can view portfolio photos"
ON portfolio_photos FOR SELECT
USING (true);

-- Photographers can manage their own portfolio
CREATE POLICY "Photographers can insert their portfolio photos"
ON portfolio_photos FOR INSERT
WITH CHECK (auth.uid() = photographer_id);

CREATE POLICY "Photographers can update their portfolio photos"
ON portfolio_photos FOR UPDATE
USING (auth.uid() = photographer_id);

CREATE POLICY "Photographers can delete their portfolio photos"
ON portfolio_photos FOR DELETE
USING (auth.uid() = photographer_id);

-- Create index for better query performance
CREATE INDEX idx_portfolio_photos_photographer ON portfolio_photos(photographer_id, display_order);

-- Create storage bucket for portfolio photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-photos', 'portfolio-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio photos
CREATE POLICY "Anyone can view portfolio photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-photos');

CREATE POLICY "Photographers can upload portfolio photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Photographers can update their portfolio photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portfolio-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Photographers can delete their portfolio photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);