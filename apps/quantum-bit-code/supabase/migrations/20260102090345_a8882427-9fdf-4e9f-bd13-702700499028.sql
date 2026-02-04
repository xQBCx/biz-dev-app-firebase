-- Product mockups table - stores AI-generated product visualizations
CREATE TABLE public.product_mockups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_claim_id UUID NOT NULL REFERENCES public.glyph_claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL, -- 'jewelry', 'apparel', 'art_print', 'accessory', 'custom'
  product_variant TEXT, -- 'pendant', 'ring', 'tshirt', 'embroidery', 'poster', 'mug', etc.
  mockup_image_url TEXT,
  prompt_used TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'generating', 'complete', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom product requests table - user-submitted ideas
CREATE TABLE public.custom_product_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_claim_id UUID REFERENCES public.glyph_claims(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  product_idea TEXT NOT NULL, -- e.g. 'wallpaper', 'car wrap', 'tattoo design'
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'in_production'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Company shares info table - tracks share structure and purchases
CREATE TABLE public.share_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_shares NUMERIC NOT NULL DEFAULT 100000000000000, -- 100 trillion
  available_percentage NUMERIC NOT NULL DEFAULT 40, -- 40% available
  shares_sold NUMERIC NOT NULL DEFAULT 0,
  price_per_share NUMERIC, -- to be set later
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial share configuration
INSERT INTO public.share_info (total_shares, available_percentage, shares_sold)
VALUES (100000000000000, 40, 0);

-- Enable RLS on all tables
ALTER TABLE public.product_mockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_info ENABLE ROW LEVEL SECURITY;

-- product_mockups policies
CREATE POLICY "Users can view their own mockups"
  ON public.product_mockups FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create mockups"
  ON public.product_mockups FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own mockups"
  ON public.product_mockups FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all mockups"
  ON public.product_mockups FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- custom_product_requests policies
CREATE POLICY "Users can view their own requests"
  ON public.custom_product_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create requests"
  ON public.custom_product_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all requests"
  ON public.custom_product_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- share_info policies - everyone can view, only admins can modify
CREATE POLICY "Anyone can view share info"
  ON public.share_info FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage share info"
  ON public.share_info FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));