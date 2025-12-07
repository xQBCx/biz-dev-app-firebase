-- Unity Meridian: Instincts Layer - Event Instrumentation Schema

-- Create event category enum for high-level grouping
CREATE TYPE public.event_category AS ENUM (
  'navigation',      -- Page views, route changes
  'interaction',     -- Clicks, form submissions, UI actions
  'transaction',     -- Financial: payments, invoices, deals
  'communication',   -- Emails, calls, messages, meetings
  'content',         -- Documents, media, content creation
  'workflow',        -- Task completion, workflow steps
  'search',          -- Searches, filters, queries
  'integration',     -- External tool usage, API calls
  'system'           -- Auth events, errors, performance
);

-- Add missing modules to the existing enum
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'core';
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'marketplace';
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'grid_os';
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'social';
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'website_builder';
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'ecosystem';
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'admin';

-- Main events table for Instincts Layer
CREATE TABLE public.instincts_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Who & When
  user_id UUID NOT NULL,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Classification
  category event_category NOT NULL,
  module platform_module NOT NULL,
  action TEXT NOT NULL,  -- e.g., 'deal_created', 'task_completed', 'page_viewed'
  
  -- Context
  entity_type TEXT,      -- e.g., 'contact', 'deal', 'task', 'document'
  entity_id UUID,        -- ID of the entity being acted upon
  entity_name TEXT,      -- Human-readable name for display
  
  -- Value signals (for economic impact tracking)
  value_amount NUMERIC,  -- Dollar amount if applicable
  value_currency TEXT DEFAULT 'USD',
  
  -- Behavioral signals
  duration_ms INTEGER,   -- Time spent on action
  sequence_position INTEGER,  -- Position in a workflow
  
  -- Rich context (flexible JSONB for module-specific data)
  context JSONB DEFAULT '{}',
  
  -- Source tracking
  source_url TEXT,
  referrer_url TEXT,
  device_type TEXT,
  
  -- Graph preparation (for future GNN)
  related_user_ids UUID[],  -- Other users involved
  related_entity_ids UUID[], -- Other entities involved
  
  -- Embedding preparation
  embedding_processed BOOLEAN DEFAULT false,
  embedding_version INTEGER
);

-- Indexes for efficient querying
CREATE INDEX idx_instincts_events_user_id ON public.instincts_events(user_id);
CREATE INDEX idx_instincts_events_created_at ON public.instincts_events(created_at DESC);
CREATE INDEX idx_instincts_events_category ON public.instincts_events(category);
CREATE INDEX idx_instincts_events_module ON public.instincts_events(module);
CREATE INDEX idx_instincts_events_action ON public.instincts_events(action);
CREATE INDEX idx_instincts_events_entity ON public.instincts_events(entity_type, entity_id);
CREATE INDEX idx_instincts_events_unprocessed ON public.instincts_events(embedding_processed) WHERE embedding_processed = false;

-- GIN index for JSONB context searches
CREATE INDEX idx_instincts_events_context ON public.instincts_events USING GIN(context);

-- Enable Row Level Security
ALTER TABLE public.instincts_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own events"
ON public.instincts_events
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert their own events"
ON public.instincts_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User event aggregates for quick stats (materialized view pattern)
CREATE TABLE public.instincts_user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Counts by category
  navigation_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  communication_count INTEGER DEFAULT 0,
  content_count INTEGER DEFAULT 0,
  workflow_count INTEGER DEFAULT 0,
  search_count INTEGER DEFAULT 0,
  
  -- Value metrics
  total_transaction_value NUMERIC DEFAULT 0,
  avg_session_duration_ms INTEGER,
  
  -- Module engagement (JSONB for flexibility)
  module_engagement JSONB DEFAULT '{}',
  
  -- Behavioral patterns (for embedding input)
  peak_hours INTEGER[],  -- Most active hours
  preferred_modules TEXT[],
  completion_rate NUMERIC,
  
  -- Timestamps
  first_event_at TIMESTAMP WITH TIME ZONE,
  last_event_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on stats
ALTER TABLE public.instincts_user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats"
ON public.instincts_user_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.instincts_user_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.instincts_user_stats
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to update user stats after event insert
CREATE OR REPLACE FUNCTION public.update_instincts_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.instincts_user_stats (user_id, first_event_at, last_event_at)
  VALUES (NEW.user_id, NEW.created_at, NEW.created_at)
  ON CONFLICT (user_id) DO UPDATE SET
    navigation_count = CASE WHEN NEW.category = 'navigation' 
      THEN instincts_user_stats.navigation_count + 1 
      ELSE instincts_user_stats.navigation_count END,
    interaction_count = CASE WHEN NEW.category = 'interaction' 
      THEN instincts_user_stats.interaction_count + 1 
      ELSE instincts_user_stats.interaction_count END,
    transaction_count = CASE WHEN NEW.category = 'transaction' 
      THEN instincts_user_stats.transaction_count + 1 
      ELSE instincts_user_stats.transaction_count END,
    communication_count = CASE WHEN NEW.category = 'communication' 
      THEN instincts_user_stats.communication_count + 1 
      ELSE instincts_user_stats.communication_count END,
    content_count = CASE WHEN NEW.category = 'content' 
      THEN instincts_user_stats.content_count + 1 
      ELSE instincts_user_stats.content_count END,
    workflow_count = CASE WHEN NEW.category = 'workflow' 
      THEN instincts_user_stats.workflow_count + 1 
      ELSE instincts_user_stats.workflow_count END,
    search_count = CASE WHEN NEW.category = 'search' 
      THEN instincts_user_stats.search_count + 1 
      ELSE instincts_user_stats.search_count END,
    total_transaction_value = CASE WHEN NEW.value_amount IS NOT NULL 
      THEN instincts_user_stats.total_transaction_value + COALESCE(NEW.value_amount, 0) 
      ELSE instincts_user_stats.total_transaction_value END,
    last_event_at = NEW.created_at,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update stats
CREATE TRIGGER trigger_update_instincts_user_stats
AFTER INSERT ON public.instincts_events
FOR EACH ROW
EXECUTE FUNCTION public.update_instincts_user_stats();

-- Enable realtime for live dashboards
ALTER PUBLICATION supabase_realtime ADD TABLE public.instincts_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.instincts_user_stats;