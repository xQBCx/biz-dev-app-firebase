-- Create table for AI code generations
CREATE TABLE public.mcp_code_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requirement TEXT NOT NULL,
  context TEXT,
  generated_code JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'implemented')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  implemented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mcp_code_generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own code generations
CREATE POLICY "Users can view their own code generations"
  ON public.mcp_code_generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own code generations
CREATE POLICY "Users can create code generations"
  ON public.mcp_code_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own code generations
CREATE POLICY "Users can update their own code generations"
  ON public.mcp_code_generations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all code generations
CREATE POLICY "Admins can view all code generations"
  ON public.mcp_code_generations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.mcp_code_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();