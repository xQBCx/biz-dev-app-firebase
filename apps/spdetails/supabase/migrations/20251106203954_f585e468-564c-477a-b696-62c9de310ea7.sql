-- Create ratings table for two-way ratings (customer rates service, admin rates customer)
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  rating_type TEXT CHECK (rating_type IN ('service_rating', 'customer_rating')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(booking_id, rater_id, rating_type)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Users can view ratings they gave or received
CREATE POLICY "Users can view their ratings"
  ON public.ratings
  FOR SELECT
  USING (auth.uid() = rater_id OR auth.uid() = rated_user_id);

-- Users can create ratings for their bookings
CREATE POLICY "Users can create ratings"
  ON public.ratings
  FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
  ON public.ratings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins can create ratings
CREATE POLICY "Admins can create ratings"
  ON public.ratings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Function to update customer rating average
CREATE OR REPLACE FUNCTION public.update_customer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the rated user's average rating
  UPDATE public.profiles
  SET customer_rating = (
    SELECT COALESCE(AVG(rating), 5.0)
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id
      AND rating_type = 'customer_rating'
  )
  WHERE id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update customer rating when new rating is added
CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_rating();