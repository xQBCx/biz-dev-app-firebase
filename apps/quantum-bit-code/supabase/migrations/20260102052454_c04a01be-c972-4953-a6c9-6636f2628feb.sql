-- Create glyph_claims table for tokenized glyph ownership
CREATE TABLE public.glyph_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canonical_text TEXT NOT NULL,
  display_text TEXT NOT NULL,
  lattice_id UUID NOT NULL REFERENCES public.lattices(id),
  lattice_version INTEGER NOT NULL DEFAULT 1,
  orientation_json JSONB NOT NULL DEFAULT '{"rotation": 0, "mirror": false}'::jsonb,
  style_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  path_json JSONB NOT NULL,
  image_svg_url TEXT,
  image_png_url TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'listed', 'minted', 'fractionalized')),
  content_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create listings table for marketplace
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_claim_id UUID NOT NULL REFERENCES public.glyph_claims(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transfers table for ownership history
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_claim_id UUID NOT NULL REFERENCES public.glyph_claims(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  tx_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mints table for NFT records
CREATE TABLE public.mints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_claim_id UUID NOT NULL REFERENCES public.glyph_claims(id) ON DELETE CASCADE,
  chain TEXT NOT NULL,
  contract_address TEXT,
  token_id TEXT,
  metadata_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'minted', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.glyph_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mints ENABLE ROW LEVEL SECURITY;

-- glyph_claims policies
CREATE POLICY "Anyone can view claimed glyphs"
ON public.glyph_claims FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create claims"
ON public.glyph_claims FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their claims"
ON public.glyph_claims FOR UPDATE
USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can delete their claims"
ON public.glyph_claims FOR DELETE
USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can manage all claims"
ON public.glyph_claims FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- listings policies
CREATE POLICY "Anyone can view active listings"
ON public.listings FOR SELECT
USING (active = true);

CREATE POLICY "Claim owners can manage listings"
ON public.listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.glyph_claims 
    WHERE glyph_claims.id = listings.glyph_claim_id 
    AND glyph_claims.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all listings"
ON public.listings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- transfers policies
CREATE POLICY "Users can view their transfers"
ON public.transfers FOR SELECT
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "System can insert transfers"
ON public.transfers FOR INSERT
WITH CHECK (from_user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all transfers"
ON public.transfers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- mints policies
CREATE POLICY "Claim owners can view their mints"
ON public.mints FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.glyph_claims 
    WHERE glyph_claims.id = mints.glyph_claim_id 
    AND glyph_claims.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage mints"
ON public.mints FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_glyph_claims_content_hash ON public.glyph_claims(content_hash);
CREATE INDEX idx_glyph_claims_canonical_text ON public.glyph_claims(canonical_text);
CREATE INDEX idx_glyph_claims_owner ON public.glyph_claims(owner_user_id);
CREATE INDEX idx_glyph_claims_lattice ON public.glyph_claims(lattice_id);
CREATE INDEX idx_listings_active ON public.listings(active) WHERE active = true;
CREATE INDEX idx_listings_glyph ON public.listings(glyph_claim_id);

-- Trigger for updated_at
CREATE TRIGGER update_glyph_claims_updated_at
BEFORE UPDATE ON public.glyph_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();