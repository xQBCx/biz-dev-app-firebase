-- =====================================================
-- INSTINCTS LAYER: Behavioral Embedding Infrastructure
-- Implements dense vector embeddings, graph edges, and
-- entity profiles for transferable user intelligence
-- =====================================================

-- 1. User Embedding Vectors (the actual dense representations)
CREATE TABLE public.instincts_user_embedding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  
  -- Dense embedding vector (128 dimensions for core behavior)
  behavior_vector double precision[] NOT NULL DEFAULT array_fill(0::double precision, ARRAY[128]),
  
  -- Module-specific sub-embeddings (for transfer learning)
  module_vectors jsonb NOT NULL DEFAULT '{}', -- {"crm": [...], "driveby": [...]}
  
  -- Aggregated signals
  action_intensity numeric DEFAULT 0, -- How active user is
  diversity_score numeric DEFAULT 0, -- How varied their usage is
  value_generation numeric DEFAULT 0, -- Total value created
  
  -- Behavioral traits (interpretable dimensions)
  traits jsonb NOT NULL DEFAULT '{}', -- {"explorer": 0.8, "executor": 0.6}
  
  -- Processing metadata
  last_computed_at timestamptz,
  event_count_at_computation integer DEFAULT 0,
  embedding_version integer DEFAULT 1,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Entity Graph Edges (for GNN-style relational encoding)
CREATE TABLE public.instincts_graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source node
  source_type text NOT NULL, -- 'user', 'company', 'lead', 'deal', 'task'
  source_id uuid NOT NULL,
  
  -- Target node  
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  
  -- Edge properties
  edge_type text NOT NULL, -- 'owns', 'created', 'viewed', 'contacted', 'assigned_to'
  weight numeric DEFAULT 1.0,
  metadata jsonb DEFAULT '{}',
  
  -- Temporal
  first_interaction timestamptz DEFAULT now(),
  last_interaction timestamptz DEFAULT now(),
  interaction_count integer DEFAULT 1,
  
  UNIQUE(source_type, source_id, target_type, target_id, edge_type)
);

-- 3. Entity Embeddings (for non-user entities like companies, leads)
CREATE TABLE public.instincts_entity_embedding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  
  -- Dense embedding
  embedding_vector double precision[] NOT NULL DEFAULT array_fill(0::double precision, ARRAY[64]),
  
  -- Entity traits
  traits jsonb DEFAULT '{}',
  
  -- Processing
  last_computed_at timestamptz,
  embedding_version integer DEFAULT 1,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(entity_type, entity_id)
);

-- 4. Add embedding vector to user_stats for quick access
ALTER TABLE public.instincts_user_stats
ADD COLUMN IF NOT EXISTS behavior_embedding double precision[] DEFAULT array_fill(0::double precision, ARRAY[32]),
ADD COLUMN IF NOT EXISTS traits jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS action_sequence_signature text; -- compressed recent action pattern

-- 5. Indexes for performance
CREATE INDEX idx_user_embedding_user ON public.instincts_user_embedding(user_id);
CREATE INDEX idx_graph_edges_source ON public.instincts_graph_edges(source_type, source_id);
CREATE INDEX idx_graph_edges_target ON public.instincts_graph_edges(target_type, target_id);
CREATE INDEX idx_entity_embedding_lookup ON public.instincts_entity_embedding(entity_type, entity_id);

-- 6. Function to update graph edge on interaction
CREATE OR REPLACE FUNCTION public.upsert_instincts_graph_edge(
  p_source_type text,
  p_source_id uuid,
  p_target_type text,
  p_target_id uuid,
  p_edge_type text,
  p_weight numeric DEFAULT 1.0,
  p_metadata jsonb DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  edge_id uuid;
BEGIN
  INSERT INTO instincts_graph_edges (source_type, source_id, target_type, target_id, edge_type, weight, metadata)
  VALUES (p_source_type, p_source_id, p_target_type, p_target_id, p_edge_type, p_weight, p_metadata)
  ON CONFLICT (source_type, source_id, target_type, target_id, edge_type)
  DO UPDATE SET
    weight = instincts_graph_edges.weight + EXCLUDED.weight,
    last_interaction = now(),
    interaction_count = instincts_graph_edges.interaction_count + 1,
    metadata = instincts_graph_edges.metadata || EXCLUDED.metadata
  RETURNING id INTO edge_id;
  
  RETURN edge_id;
END;
$$;

-- 7. RLS Policies
ALTER TABLE public.instincts_user_embedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instincts_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instincts_entity_embedding ENABLE ROW LEVEL SECURITY;

-- User embedding: only owner can see their own
CREATE POLICY "Users can view own embedding" ON public.instincts_user_embedding
  FOR SELECT USING (auth.uid() = user_id);

-- Graph edges: users can see edges they're part of
CREATE POLICY "Users can view own graph edges" ON public.instincts_graph_edges
  FOR SELECT USING (
    (source_type = 'user' AND source_id = auth.uid()) OR
    (target_type = 'user' AND target_id = auth.uid())
  );

-- Entity embeddings: readable by authenticated users (for recommendations)
CREATE POLICY "Authenticated users can view entity embeddings" ON public.instincts_entity_embedding
  FOR SELECT USING (auth.uid() IS NOT NULL);