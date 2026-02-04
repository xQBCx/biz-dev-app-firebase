-- Create coach_content table for videos, pictures, and workout content
CREATE TABLE public.coach_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'workout_demo', 'form_tip', 'meal_prep', 'motivation')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  platforms_published JSONB DEFAULT '[]'::jsonb,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create digital_books table for sellable books
CREATE TABLE public.digital_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL DEFAULT 'Coach Bill',
  cover_image_url TEXT,
  pdf_url TEXT,
  epub_url TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  category TEXT CHECK (category IN ('fitness', 'nutrition', 'mindset', 'lifestyle', 'training_program')),
  pages INTEGER,
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create book_purchases table to track who bought what
CREATE TABLE public.book_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.digital_books(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'completed',
  UNIQUE(user_id, book_id)
);

-- Create book_reading_progress table for in-app reading
CREATE TABLE public.book_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.digital_books(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 1,
  total_pages INTEGER,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, book_id)
);

-- Create social_platform_connections for API integration
CREATE TABLE public.social_platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'facebook', 'twitter')),
  account_name TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform)
);

-- Enable RLS
ALTER TABLE public.coach_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_platform_connections ENABLE ROW LEVEL SECURITY;

-- Coach content: admins can manage, everyone can view published
CREATE POLICY "Anyone can view published content"
ON public.coach_content FOR SELECT
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage content"
ON public.coach_content FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Digital books: anyone can view active, admins can manage
CREATE POLICY "Anyone can view active books"
ON public.digital_books FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage books"
ON public.digital_books FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Book purchases: users see their own, admins see all
CREATE POLICY "Users can view their purchases"
ON public.book_purchases FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can purchase books"
ON public.book_purchases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Reading progress: users manage their own
CREATE POLICY "Users can manage their reading progress"
ON public.book_reading_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Social platform connections: admins only
CREATE POLICY "Admins can manage social connections"
ON public.social_platform_connections FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_coach_content_updated_at
BEFORE UPDATE ON public.coach_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_digital_books_updated_at
BEFORE UPDATE ON public.digital_books
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_platform_connections_updated_at
BEFORE UPDATE ON public.social_platform_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for coach content media
INSERT INTO storage.buckets (id, name, public) VALUES ('coach-content', 'coach-content', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('digital-books', 'digital-books', false);

-- Storage policies for coach-content bucket
CREATE POLICY "Public can view coach content"
ON storage.objects FOR SELECT
USING (bucket_id = 'coach-content');

CREATE POLICY "Admins can upload coach content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'coach-content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coach content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'coach-content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coach content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'coach-content' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for digital-books bucket (restricted access)
CREATE POLICY "Purchasers can view books"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'digital-books' AND (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.book_purchases bp
      JOIN public.digital_books db ON bp.book_id = db.id
      WHERE bp.user_id = auth.uid()
      AND (db.pdf_url LIKE '%' || storage.filename(name) OR db.epub_url LIKE '%' || storage.filename(name))
    )
  )
);

CREATE POLICY "Admins can manage book files"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'digital-books' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'digital-books' AND public.has_role(auth.uid(), 'admin'));