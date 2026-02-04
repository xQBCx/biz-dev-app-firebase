-- Create IP Discoveries table for tracking intellectual property
CREATE TABLE public.ip_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'notebook', 'deal_room', 'chat', 'archive_import', 'manual'
  source_id UUID,
  source_title TEXT,
  ip_type TEXT NOT NULL, -- 'patent', 'trademark', 'copyright', 'trade_secret'
  title TEXT NOT NULL,
  description TEXT,
  novelty_score INTEGER CHECK (novelty_score >= 0 AND novelty_score <= 100),
  ownership_status TEXT DEFAULT 'unclear', -- 'ours', 'client', 'joint', 'unclear'
  recommended_action TEXT,
  status TEXT DEFAULT 'discovered', -- 'discovered', 'reviewing', 'filed', 'registered', 'dismissed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create IP Ownership Records for tracking ownership splits
CREATE TABLE public.ip_ownership_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_discovery_id UUID NOT NULL REFERENCES public.ip_discoveries(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL, -- 'user', 'company', 'client', 'partner'
  owner_id UUID,
  owner_name TEXT,
  ownership_percentage NUMERIC(5,2) CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  agreement_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ip_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_ownership_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for ip_discoveries
CREATE POLICY "Users can view their own IP discoveries"
  ON public.ip_discoveries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own IP discoveries"
  ON public.ip_discoveries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own IP discoveries"
  ON public.ip_discoveries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own IP discoveries"
  ON public.ip_discoveries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for ip_ownership_records (via ip_discoveries ownership)
CREATE POLICY "Users can view ownership records for their IP"
  ON public.ip_ownership_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ip_discoveries 
    WHERE id = ip_ownership_records.ip_discovery_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create ownership records for their IP"
  ON public.ip_ownership_records FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ip_discoveries 
    WHERE id = ip_ownership_records.ip_discovery_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update ownership records for their IP"
  ON public.ip_ownership_records FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.ip_discoveries 
    WHERE id = ip_ownership_records.ip_discovery_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete ownership records for their IP"
  ON public.ip_ownership_records FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ip_discoveries 
    WHERE id = ip_ownership_records.ip_discovery_id 
    AND user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_ip_discoveries_updated_at
  BEFORE UPDATE ON public.ip_discoveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes
CREATE INDEX idx_ip_discoveries_user_id ON public.ip_discoveries(user_id);
CREATE INDEX idx_ip_discoveries_status ON public.ip_discoveries(status);
CREATE INDEX idx_ip_discoveries_ip_type ON public.ip_discoveries(ip_type);
CREATE INDEX idx_ip_ownership_records_ip_discovery_id ON public.ip_ownership_records(ip_discovery_id);