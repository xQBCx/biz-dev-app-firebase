-- Create feedback/recommendations table
CREATE TABLE public.platform_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL DEFAULT 'suggestion',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;

-- Users can submit feedback (authenticated or anonymous)
CREATE POLICY "Anyone can submit feedback"
ON public.platform_feedback
FOR INSERT
WITH CHECK (true);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.platform_feedback
FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.platform_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update feedback
CREATE POLICY "Admins can update feedback"
ON public.platform_feedback
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete feedback
CREATE POLICY "Admins can delete feedback"
ON public.platform_feedback
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_platform_feedback_updated_at
BEFORE UPDATE ON public.platform_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();