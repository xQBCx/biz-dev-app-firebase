
-- Drop the failed policies/table and recreate
DROP TABLE IF EXISTS public.client_knowledge_docs CASCADE;

CREATE TABLE public.client_knowledge_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('knowledge_base', 'project_locations', 'pricing', 'guidelines')),
  title TEXT NOT NULL,
  content TEXT,
  structured_data JSONB,
  is_internal_only BOOLEAN NOT NULL DEFAULT false,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.client_knowledge_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deal room participants can view knowledge docs"
ON public.client_knowledge_docs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants drp
    WHERE drp.deal_room_id = client_knowledge_docs.deal_room_id
    AND drp.user_id = auth.uid()
  )
);

CREATE POLICY "Deal room admins can manage knowledge docs"
ON public.client_knowledge_docs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants drp
    WHERE drp.deal_room_id = client_knowledge_docs.deal_room_id
    AND drp.user_id = auth.uid()
    AND drp.role_type IN ('admin', 'founder')
  )
);

CREATE INDEX idx_client_knowledge_docs_deal_room ON public.client_knowledge_docs(deal_room_id, doc_type);

CREATE TRIGGER update_client_knowledge_docs_updated_at
BEFORE UPDATE ON public.client_knowledge_docs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
