-- =============================================================
-- OPENAI ARCHIVE IMPORTER - COMPLETE DATABASE SCHEMA
-- =============================================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================
-- 1) IMPORTS & RAW FILES
-- =============================================================

-- Main imports table
CREATE TABLE public.archive_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  target_workspace_type TEXT NOT NULL CHECK (target_workspace_type IN ('personal', 'org', 'business')),
  target_business_id UUID NULL,
  permission_scope TEXT NOT NULL CHECK (permission_scope IN ('private', 'org_admins', 'selected_roles')) DEFAULT 'private',
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'extracting', 'parsing', 'chunking', 'extracting_entities', 'building_graph', 'review_pending', 'committed', 'failed')) DEFAULT 'uploaded',
  storage_zip_path TEXT NOT NULL,
  zip_sha256 TEXT NOT NULL,
  stats_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Import files table
CREATE TABLE public.archive_import_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.archive_imports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('json', 'image', 'audio', 'pdf', 'other')),
  source_message_id UUID NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 2) PARSED CONVERSATIONS/MESSAGES/ATTACHMENTS
-- =============================================================

CREATE TABLE public.archive_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.archive_imports(id) ON DELETE CASCADE,
  external_conversation_key TEXT NOT NULL,
  title TEXT NULL,
  started_at TIMESTAMPTZ NULL,
  ended_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.archive_conversations(id) ON DELETE CASCADE,
  external_message_key TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'audio', 'mixed', 'other')),
  content_text TEXT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  sequence_index INT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.archive_messages(id) ON DELETE CASCADE,
  import_file_id UUID NOT NULL REFERENCES public.archive_import_files(id) ON DELETE CASCADE,
  attachment_kind TEXT NOT NULL CHECK (attachment_kind IN ('image', 'audio', 'file')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 3) CHUNKING + EMBEDDINGS
-- =============================================================

CREATE TABLE public.archive_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.archive_imports(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.archive_conversations(id) ON DELETE CASCADE,
  start_message_id UUID NOT NULL REFERENCES public.archive_messages(id),
  end_message_id UUID NOT NULL REFERENCES public.archive_messages(id),
  occurred_start_at TIMESTAMPTZ NOT NULL,
  occurred_end_at TIMESTAMPTZ NOT NULL,
  chunk_text TEXT NOT NULL,
  token_estimate INT NOT NULL,
  chunk_hash TEXT NOT NULL,
  chunk_summary TEXT NULL,
  embedding_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  object_type TEXT NOT NULL CHECK (object_type IN ('chunk', 'business', 'strategy', 'contact', 'company')),
  object_id UUID NOT NULL,
  model TEXT NOT NULL,
  vector vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vector index for similarity search
CREATE INDEX archive_embeddings_vector_idx ON public.archive_embeddings 
  USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);

-- =============================================================
-- 4) BUSINESS HUB (BUSINESS DETECTION)
-- =============================================================

CREATE TABLE public.archive_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('concept', 'active', 'client', 'partner', 'target', 'vendor', 'archived')) DEFAULT 'concept',
  description TEXT NULL,
  primary_domain TEXT NULL,
  vertical TEXT NULL,
  tags TEXT[] NULL,
  first_seen_at TIMESTAMPTZ NULL,
  created_from_import_id UUID NULL REFERENCES public.archive_imports(id),
  confidence NUMERIC NULL,
  provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_business_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.archive_businesses(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_type TEXT NOT NULL CHECK (alias_type IN ('name', 'domain', 'handle', 'product')),
  created_from_import_id UUID NULL REFERENCES public.archive_imports(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_business_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.archive_imports(id) ON DELETE CASCADE,
  chunk_id UUID NOT NULL REFERENCES public.archive_chunks(id) ON DELETE CASCADE,
  detected_name TEXT NOT NULL,
  detected_domain TEXT NULL,
  confidence NUMERIC NOT NULL,
  resolved_business_id UUID NULL REFERENCES public.archive_businesses(id),
  resolution_method TEXT NULL CHECK (resolution_method IN ('exact', 'domain', 'embedding', 'manual', 'unresolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 5) STRATEGY OBJECTS
-- =============================================================

CREATE TABLE public.archive_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  title TEXT NOT NULL,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN (
    'gtm', 'pricing', 'positioning', 'operations', 'product', 'legal', 'compliance',
    'fundraising', 'deal_structure', 'marketing', 'sales', 'automation', 'technical_architecture'
  )),
  summary TEXT NOT NULL,
  playbook_steps JSONB NULL,
  templates JSONB NULL,
  inputs_required JSONB NULL,
  outputs_produced JSONB NULL,
  stage TEXT NOT NULL CHECK (stage IN ('idea', 'tested', 'active', 'deprecated')) DEFAULT 'idea',
  created_from_import_id UUID NULL REFERENCES public.archive_imports(id),
  confidence NUMERIC NOT NULL DEFAULT 0,
  provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_strategy_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES public.archive_strategies(id) ON DELETE CASCADE,
  linked_object_type TEXT NOT NULL CHECK (linked_object_type IN ('business', 'deal', 'service', 'project')),
  linked_object_id UUID NOT NULL,
  strength NUMERIC NOT NULL DEFAULT 0.5,
  created_from_import_id UUID NULL REFERENCES public.archive_imports(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 6) CRM ENTITIES + RELATIONSHIP SCORING
-- =============================================================

CREATE TABLE public.archive_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  domain TEXT NULL,
  industry TEXT NULL,
  created_from_import_id UUID NULL REFERENCES public.archive_imports(id),
  confidence NUMERIC NULL,
  provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  full_name TEXT NOT NULL,
  first_name TEXT NULL,
  last_name TEXT NULL,
  email TEXT NULL,
  phone TEXT NULL,
  company_id UUID NULL REFERENCES public.archive_companies(id),
  role_title TEXT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('client', 'partner', 'investor', 'advisor', 'vendor', 'lead', 'friend', 'unknown')) DEFAULT 'unknown',
  created_from_import_id UUID NULL REFERENCES public.archive_imports(id),
  confidence NUMERIC NOT NULL DEFAULT 0,
  provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_relationship_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  from_contact_id UUID NULL REFERENCES public.archive_contacts(id),
  to_contact_id UUID NULL REFERENCES public.archive_contacts(id),
  to_company_id UUID NULL REFERENCES public.archive_companies(id),
  linked_business_id UUID NULL REFERENCES public.archive_businesses(id),
  edge_type TEXT NOT NULL CHECK (edge_type IN ('works_with', 'introduced_by', 'advises', 'invests_in', 'sells_to', 'partners_with', 'employed_by')),
  strength NUMERIC NOT NULL DEFAULT 0.5,
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  created_from_import_id UUID NULL REFERENCES public.archive_imports(id),
  provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NULL REFERENCES public.archive_imports(id),
  contact_id UUID NULL REFERENCES public.archive_contacts(id),
  company_id UUID NULL REFERENCES public.archive_companies(id),
  conversation_id UUID NULL REFERENCES public.archive_conversations(id),
  chunk_id UUID NULL REFERENCES public.archive_chunks(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('call', 'email', 'meeting', 'chat', 'doc_share', 'unknown')),
  occurred_at TIMESTAMPTZ NOT NULL,
  sentiment NUMERIC NULL CHECK (sentiment >= -1 AND sentiment <= 1),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_relationship_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  organization_id UUID NULL,
  contact_id UUID NOT NULL REFERENCES public.archive_contacts(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  components_json JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 7) REVIEW QUEUE + AUDIT
-- =============================================================

CREATE TABLE public.archive_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.archive_imports(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('business_create', 'business_update', 'contact_create', 'company_create', 'strategy_create', 'merge_suggestion')),
  payload_json JSONB NOT NULL,
  confidence NUMERIC NOT NULL,
  evidence_chunk_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'merged')) DEFAULT 'pending',
  assigned_to_user_id UUID NULL,
  decision_notes TEXT NULL,
  decided_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL,
  actor_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id UUID NOT NULL,
  import_id UUID NULL REFERENCES public.archive_imports(id),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 8) PERMISSIONS / RBAC
-- =============================================================

-- Archive-specific roles (separate from existing user_roles)
CREATE TABLE public.archive_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL,
  name TEXT NOT NULL CHECK (name IN ('owner', 'admin', 'archivist', 'reviewer', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.archive_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NULL,
  role_name TEXT NOT NULL CHECK (role_name IN ('owner', 'admin', 'archivist', 'reviewer', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, role_name)
);

CREATE TABLE public.archive_workspace_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('personal', 'org', 'business')),
  scope_id UUID NULL,
  user_id UUID NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view_raw', 'import', 'review', 'commit', 'view_entities')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, scope_type, scope_id, user_id, permission)
);

-- =============================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================

CREATE INDEX idx_archive_imports_owner ON public.archive_imports(owner_user_id);
CREATE INDEX idx_archive_imports_status ON public.archive_imports(status);
CREATE INDEX idx_archive_import_files_import ON public.archive_import_files(import_id);
CREATE INDEX idx_archive_conversations_import ON public.archive_conversations(import_id);
CREATE INDEX idx_archive_messages_conversation ON public.archive_messages(conversation_id);
CREATE INDEX idx_archive_messages_occurred ON public.archive_messages(occurred_at);
CREATE INDEX idx_archive_chunks_import ON public.archive_chunks(import_id);
CREATE INDEX idx_archive_chunks_hash ON public.archive_chunks(chunk_hash);
CREATE INDEX idx_archive_embeddings_object ON public.archive_embeddings(object_type, object_id);
CREATE INDEX idx_archive_businesses_normalized ON public.archive_businesses(normalized_name);
CREATE INDEX idx_archive_businesses_domain ON public.archive_businesses(primary_domain);
CREATE INDEX idx_archive_business_mentions_import ON public.archive_business_mentions(import_id);
CREATE INDEX idx_archive_strategies_type ON public.archive_strategies(strategy_type);
CREATE INDEX idx_archive_companies_normalized ON public.archive_companies(normalized_name);
CREATE INDEX idx_archive_contacts_email ON public.archive_contacts(email);
CREATE INDEX idx_archive_review_queue_import ON public.archive_review_queue(import_id);
CREATE INDEX idx_archive_review_queue_status ON public.archive_review_queue(status);
CREATE INDEX idx_archive_audit_events_actor ON public.archive_audit_events(actor_user_id);
CREATE INDEX idx_archive_user_roles_user ON public.archive_user_roles(user_id);
CREATE INDEX idx_archive_workspace_perms_user ON public.archive_workspace_permissions(user_id);

-- =============================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================

CREATE OR REPLACE FUNCTION public.update_archive_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_archive_imports_updated_at
  BEFORE UPDATE ON public.archive_imports
  FOR EACH ROW EXECUTE FUNCTION public.update_archive_updated_at();

CREATE TRIGGER update_archive_businesses_updated_at
  BEFORE UPDATE ON public.archive_businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_archive_updated_at();

CREATE TRIGGER update_archive_strategies_updated_at
  BEFORE UPDATE ON public.archive_strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_archive_updated_at();

CREATE TRIGGER update_archive_companies_updated_at
  BEFORE UPDATE ON public.archive_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_archive_updated_at();

CREATE TRIGGER update_archive_contacts_updated_at
  BEFORE UPDATE ON public.archive_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_archive_updated_at();

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Check if user has archive permission
CREATE OR REPLACE FUNCTION public.has_archive_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_scope_type TEXT DEFAULT 'personal',
  p_scope_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check direct permission
    SELECT 1 FROM public.archive_workspace_permissions
    WHERE user_id = p_user_id
      AND permission = p_permission
      AND (organization_id = p_org_id OR (p_org_id IS NULL AND organization_id IS NULL))
      AND scope_type = p_scope_type
      AND (scope_id = p_scope_id OR (p_scope_id IS NULL AND scope_id IS NULL))
  ) OR EXISTS (
    -- Check admin/owner role
    SELECT 1 FROM public.archive_user_roles
    WHERE user_id = p_user_id
      AND role_name IN ('owner', 'admin')
      AND (organization_id = p_org_id OR (p_org_id IS NULL AND organization_id IS NULL))
  )
$$;

-- Check if user can access import
CREATE OR REPLACE FUNCTION public.can_access_import(p_user_id UUID, p_import_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = p_import_id
      AND (
        i.owner_user_id = p_user_id
        OR (i.permission_scope = 'org_admins' AND EXISTS (
          SELECT 1 FROM public.archive_user_roles
          WHERE user_id = p_user_id
            AND organization_id = i.organization_id
            AND role_name IN ('owner', 'admin')
        ))
        OR public.has_archive_permission(p_user_id, 'view_entities', i.target_workspace_type, i.target_business_id, i.organization_id)
      )
  )
$$;

-- Normalize business name for matching
CREATE OR REPLACE FUNCTION public.normalize_business_name(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LOWER(REGEXP_REPLACE(TRIM(p_name), '[^a-zA-Z0-9]', '', 'g'))
$$;

-- Compute relationship score
CREATE OR REPLACE FUNCTION public.compute_relationship_score(
  p_recency NUMERIC,
  p_frequency NUMERIC,
  p_responsiveness NUMERIC,
  p_sentiment NUMERIC,
  p_deal_signal NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_score NUMERIC;
  v_components JSONB;
BEGIN
  -- Normalize all inputs to 0-1 range
  v_score := 100 * (
    0.30 * LEAST(GREATEST(p_recency, 0), 1) +
    0.25 * LEAST(GREATEST(p_frequency, 0), 1) +
    0.15 * LEAST(GREATEST(p_responsiveness, 0), 1) +
    0.15 * LEAST(GREATEST(p_sentiment, 0), 1) +
    0.15 * LEAST(GREATEST(p_deal_signal, 0), 1)
  );
  
  v_components := jsonb_build_object(
    'recency', jsonb_build_object('value', p_recency, 'weight', 0.30),
    'frequency', jsonb_build_object('value', p_frequency, 'weight', 0.25),
    'responsiveness', jsonb_build_object('value', p_responsiveness, 'weight', 0.15),
    'sentiment', jsonb_build_object('value', p_sentiment, 'weight', 0.15),
    'deal_signal', jsonb_build_object('value', p_deal_signal, 'weight', 0.15),
    'total_score', v_score
  );
  
  RETURN v_components;
END;
$$;

-- Log audit event
CREATE OR REPLACE FUNCTION public.log_archive_audit(
  p_actor_user_id UUID,
  p_action TEXT,
  p_object_type TEXT,
  p_object_id UUID,
  p_import_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.archive_audit_events (
    organization_id, actor_user_id, action, object_type, object_id, import_id, metadata_json
  ) VALUES (
    p_org_id, p_actor_user_id, p_action, p_object_type, p_object_id, p_import_id, p_metadata
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- =============================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================

ALTER TABLE public.archive_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_import_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_business_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_business_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_strategy_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_relationship_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_interaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_relationship_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_workspace_permissions ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- RLS POLICIES
-- =============================================================

-- archive_imports policies
CREATE POLICY "Users can view their own imports"
  ON public.archive_imports FOR SELECT
  USING (public.can_access_import(auth.uid(), id));

CREATE POLICY "Users can create their own imports"
  ON public.archive_imports FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their own imports"
  ON public.archive_imports FOR UPDATE
  USING (owner_user_id = auth.uid() OR public.has_archive_permission(auth.uid(), 'commit', target_workspace_type, target_business_id, organization_id));

-- archive_import_files policies (restricted - only view_raw permission)
CREATE POLICY "Users can view import files with view_raw permission"
  ON public.archive_import_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = import_id
      AND (
        i.owner_user_id = auth.uid()
        OR public.has_archive_permission(auth.uid(), 'view_raw', i.target_workspace_type, i.target_business_id, i.organization_id)
      )
  ));

CREATE POLICY "System can insert import files"
  ON public.archive_import_files FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = import_id AND i.owner_user_id = auth.uid()
  ));

-- archive_conversations policies
CREATE POLICY "Users can view conversations they have access to"
  ON public.archive_conversations FOR SELECT
  USING (public.can_access_import(auth.uid(), import_id));

CREATE POLICY "System can insert conversations"
  ON public.archive_conversations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = import_id AND i.owner_user_id = auth.uid()
  ));

-- archive_messages policies
CREATE POLICY "Users can view messages they have access to"
  ON public.archive_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.archive_conversations c
    WHERE c.id = conversation_id AND public.can_access_import(auth.uid(), c.import_id)
  ));

CREATE POLICY "System can insert messages"
  ON public.archive_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_conversations c
    JOIN public.archive_imports i ON i.id = c.import_id
    WHERE c.id = conversation_id AND i.owner_user_id = auth.uid()
  ));

-- archive_message_attachments policies
CREATE POLICY "Users can view attachments with view_raw permission"
  ON public.archive_message_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.archive_messages m
    JOIN public.archive_conversations c ON c.id = m.conversation_id
    JOIN public.archive_imports i ON i.id = c.import_id
    WHERE m.id = message_id
      AND (
        i.owner_user_id = auth.uid()
        OR public.has_archive_permission(auth.uid(), 'view_raw', i.target_workspace_type, i.target_business_id, i.organization_id)
      )
  ));

CREATE POLICY "System can insert attachments"
  ON public.archive_message_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_messages m
    JOIN public.archive_conversations c ON c.id = m.conversation_id
    JOIN public.archive_imports i ON i.id = c.import_id
    WHERE m.id = message_id AND i.owner_user_id = auth.uid()
  ));

-- archive_chunks policies
CREATE POLICY "Users can view chunks they have access to"
  ON public.archive_chunks FOR SELECT
  USING (public.can_access_import(auth.uid(), import_id));

CREATE POLICY "System can insert chunks"
  ON public.archive_chunks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = import_id AND i.owner_user_id = auth.uid()
  ));

-- archive_embeddings policies
CREATE POLICY "Users can view their embeddings"
  ON public.archive_embeddings FOR SELECT
  USING (owner_user_id = auth.uid() OR (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.archive_user_roles
    WHERE user_id = auth.uid() AND organization_id = archive_embeddings.organization_id
  )));

CREATE POLICY "Users can create their embeddings"
  ON public.archive_embeddings FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- archive_businesses policies
CREATE POLICY "Users can view businesses they own or have access to"
  ON public.archive_businesses FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles
      WHERE user_id = auth.uid() AND organization_id = archive_businesses.organization_id
    ))
  );

CREATE POLICY "Users can create their businesses"
  ON public.archive_businesses FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their businesses"
  ON public.archive_businesses FOR UPDATE
  USING (owner_user_id = auth.uid() OR public.has_archive_permission(auth.uid(), 'commit', 'personal', NULL, organization_id));

-- archive_business_aliases policies
CREATE POLICY "Users can view business aliases"
  ON public.archive_business_aliases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.archive_businesses b
    WHERE b.id = business_id AND (b.owner_user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.archive_user_roles
      WHERE user_id = auth.uid() AND organization_id = b.organization_id
    ))
  ));

CREATE POLICY "Users can create business aliases"
  ON public.archive_business_aliases FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_businesses b
    WHERE b.id = business_id AND b.owner_user_id = auth.uid()
  ));

-- archive_business_mentions policies
CREATE POLICY "Users can view business mentions"
  ON public.archive_business_mentions FOR SELECT
  USING (public.can_access_import(auth.uid(), import_id));

CREATE POLICY "System can insert business mentions"
  ON public.archive_business_mentions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = import_id AND i.owner_user_id = auth.uid()
  ));

-- archive_strategies policies
CREATE POLICY "Users can view their strategies"
  ON public.archive_strategies FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles
      WHERE user_id = auth.uid() AND organization_id = archive_strategies.organization_id
    ))
  );

CREATE POLICY "Users can create strategies"
  ON public.archive_strategies FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their strategies"
  ON public.archive_strategies FOR UPDATE
  USING (owner_user_id = auth.uid());

-- archive_strategy_links policies
CREATE POLICY "Users can view strategy links"
  ON public.archive_strategy_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.archive_strategies s
    WHERE s.id = strategy_id AND s.owner_user_id = auth.uid()
  ));

CREATE POLICY "Users can create strategy links"
  ON public.archive_strategy_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_strategies s
    WHERE s.id = strategy_id AND s.owner_user_id = auth.uid()
  ));

-- archive_companies policies
CREATE POLICY "Users can view their companies"
  ON public.archive_companies FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles
      WHERE user_id = auth.uid() AND organization_id = archive_companies.organization_id
    ))
  );

CREATE POLICY "Users can create companies"
  ON public.archive_companies FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their companies"
  ON public.archive_companies FOR UPDATE
  USING (owner_user_id = auth.uid());

-- archive_contacts policies
CREATE POLICY "Users can view their contacts"
  ON public.archive_contacts FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles
      WHERE user_id = auth.uid() AND organization_id = archive_contacts.organization_id
    ))
  );

CREATE POLICY "Users can create contacts"
  ON public.archive_contacts FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their contacts"
  ON public.archive_contacts FOR UPDATE
  USING (owner_user_id = auth.uid());

-- archive_relationship_edges policies
CREATE POLICY "Users can view their relationship edges"
  ON public.archive_relationship_edges FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create relationship edges"
  ON public.archive_relationship_edges FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- archive_interaction_events policies
CREATE POLICY "Users can view interaction events"
  ON public.archive_interaction_events FOR SELECT
  USING (import_id IS NULL OR public.can_access_import(auth.uid(), import_id));

CREATE POLICY "Users can create interaction events"
  ON public.archive_interaction_events FOR INSERT
  WITH CHECK (import_id IS NULL OR EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = import_id AND i.owner_user_id = auth.uid()
  ));

-- archive_relationship_scores policies
CREATE POLICY "Users can view their relationship scores"
  ON public.archive_relationship_scores FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create relationship scores"
  ON public.archive_relationship_scores FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- archive_review_queue policies
CREATE POLICY "Users can view review queue items"
  ON public.archive_review_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.archive_imports i
      WHERE i.id = import_id
        AND (
          i.owner_user_id = auth.uid()
          OR assigned_to_user_id = auth.uid()
          OR public.has_archive_permission(auth.uid(), 'review', i.target_workspace_type, i.target_business_id, i.organization_id)
        )
    )
  );

CREATE POLICY "Users can update review queue items"
  ON public.archive_review_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.archive_imports i
      WHERE i.id = import_id
        AND (
          i.owner_user_id = auth.uid()
          OR assigned_to_user_id = auth.uid()
          OR public.has_archive_permission(auth.uid(), 'review', i.target_workspace_type, i.target_business_id, i.organization_id)
        )
    )
  );

CREATE POLICY "System can insert review queue items"
  ON public.archive_review_queue FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.archive_imports i
    WHERE i.id = import_id AND i.owner_user_id = auth.uid()
  ));

-- archive_audit_events policies
CREATE POLICY "Users can view audit events"
  ON public.archive_audit_events FOR SELECT
  USING (
    actor_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles
      WHERE user_id = auth.uid() AND organization_id = archive_audit_events.organization_id AND role_name IN ('owner', 'admin')
    ))
  );

CREATE POLICY "System can insert audit events"
  ON public.archive_audit_events FOR INSERT
  WITH CHECK (actor_user_id = auth.uid());

-- archive_roles policies
CREATE POLICY "Anyone can view roles"
  ON public.archive_roles FOR SELECT
  USING (true);

-- archive_user_roles policies
CREATE POLICY "Users can view user roles"
  ON public.archive_user_roles FOR SELECT
  USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.organization_id = archive_user_roles.organization_id AND ur.role_name IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Admins can manage user roles"
  ON public.archive_user_roles FOR INSERT
  WITH CHECK (
    (organization_id IS NULL AND user_id = auth.uid())
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.organization_id = archive_user_roles.organization_id AND ur.role_name IN ('owner', 'admin')
    ))
  );

-- archive_workspace_permissions policies
CREATE POLICY "Users can view workspace permissions"
  ON public.archive_workspace_permissions FOR SELECT
  USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.organization_id = archive_workspace_permissions.organization_id AND ur.role_name IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Admins can manage workspace permissions"
  ON public.archive_workspace_permissions FOR INSERT
  WITH CHECK (
    (organization_id IS NULL AND user_id = auth.uid())
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.organization_id = archive_workspace_permissions.organization_id AND ur.role_name IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Admins can delete workspace permissions"
  ON public.archive_workspace_permissions FOR DELETE
  USING (
    (organization_id IS NULL AND user_id = auth.uid())
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.archive_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.organization_id = archive_workspace_permissions.organization_id AND ur.role_name IN ('owner', 'admin')
    ))
  );