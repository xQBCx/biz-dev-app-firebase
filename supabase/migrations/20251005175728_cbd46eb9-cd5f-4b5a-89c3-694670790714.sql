-- Create franchise reviews table
CREATE TABLE public.franchise_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  verified_franchisee BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(franchise_id, user_id)
);

-- Enable RLS
ALTER TABLE public.franchise_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved reviews"
ON public.franchise_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.franchise_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.franchise_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.franchise_reviews FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update franchise ratings
CREATE OR REPLACE FUNCTION update_franchise_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.franchises
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.franchise_reviews
    WHERE franchise_id = COALESCE(NEW.franchise_id, OLD.franchise_id)
  )
  WHERE id = COALESCE(NEW.franchise_id, OLD.franchise_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_franchise_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.franchise_reviews
FOR EACH ROW EXECUTE FUNCTION update_franchise_rating();