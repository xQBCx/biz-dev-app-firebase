-- Create rating_responses table for two-way conversation
CREATE TABLE public.rating_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rating_responses
ALTER TABLE public.rating_responses ENABLE ROW LEVEL SECURITY;

-- Users can view responses to their ratings
CREATE POLICY "Users can view responses to their ratings"
ON public.rating_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ratings
    WHERE ratings.id = rating_responses.rating_id
    AND (ratings.rater_id = auth.uid() OR ratings.rated_user_id = auth.uid())
  )
);

-- Users can create responses to ratings they're involved in
CREATE POLICY "Users can create responses"
ON public.rating_responses
FOR INSERT
WITH CHECK (
  auth.uid() = responder_id
  AND EXISTS (
    SELECT 1 FROM public.ratings
    WHERE ratings.id = rating_responses.rating_id
    AND (ratings.rater_id = auth.uid() OR ratings.rated_user_id = auth.uid())
  )
);

-- Admins can view all responses
CREATE POLICY "Admins can view all responses"
ON public.rating_responses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create responses
CREATE POLICY "Admins can create responses"
ON public.rating_responses
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add reminder_sent field to bookings to track if rating reminder was sent
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Add featured field to ratings for public display
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create policy for public to view featured ratings
CREATE POLICY "Anyone can view featured ratings"
ON public.ratings
FOR SELECT
USING (featured = true);