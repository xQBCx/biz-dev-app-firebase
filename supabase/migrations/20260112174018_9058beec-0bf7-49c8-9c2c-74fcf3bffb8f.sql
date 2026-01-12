-- Prompt Access Entities: Professional "quick reference" list for frequently used entities in @mentions
CREATE TABLE prompt_access_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'company', 'user', 'deal_room', 'business')),
  entity_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  pinned BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- Entity Mentions: Track @mentions across the platform for analytics and linking
CREATE TABLE entity_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentioned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'company', 'user', 'deal_room', 'business')),
  entity_id UUID NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('chat', 'task', 'deal_room', 'note', 'document', 'activity')),
  context_id UUID,
  mention_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE prompt_access_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_mentions ENABLE ROW LEVEL SECURITY;

-- Policies for prompt_access_entities
CREATE POLICY "Users can manage their own prompt access entities"
ON prompt_access_entities FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for entity_mentions
CREATE POLICY "Users can create their own mentions"
ON entity_mentions FOR INSERT
WITH CHECK (auth.uid() = mentioned_by);

CREATE POLICY "Users can view mentions they created or are mentioned in"
ON entity_mentions FOR SELECT
USING (auth.uid() = mentioned_by);

-- Index for fast lookups
CREATE INDEX idx_prompt_access_user_id ON prompt_access_entities(user_id);
CREATE INDEX idx_prompt_access_usage ON prompt_access_entities(user_id, usage_count DESC, pinned DESC);
CREATE INDEX idx_entity_mentions_entity ON entity_mentions(entity_type, entity_id);
CREATE INDEX idx_entity_mentions_context ON entity_mentions(context_type, context_id);