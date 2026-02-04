-- AI Conversation Memory System
-- Stores conversations so the AI maintains context across messages

-- Conversations table
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  active BOOLEAN DEFAULT true,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages within conversations
CREATE TABLE public.ai_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  images TEXT[],
  tool_calls JSONB,
  tool_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Learning / Feedback System
-- Tracks patterns, successful tool executions, and evolving behaviors
CREATE TABLE public.ai_learnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  learning_type TEXT NOT NULL CHECK (learning_type IN ('pattern', 'correction', 'preference', 'successful_execution', 'failed_execution')),
  category TEXT, -- e.g., 'crm', 'navigation', 'analytics'
  pattern TEXT, -- What user asked
  resolution TEXT, -- What worked
  confidence NUMERIC DEFAULT 0.5,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Preferences learned over time
CREATE TABLE public.ai_user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_agent TEXT DEFAULT 'both' CHECK (preferred_agent IN ('biz', 'dev', 'both')),
  communication_style TEXT DEFAULT 'professional',
  auto_execute_tools BOOLEAN DEFAULT true,
  favorite_modules TEXT[] DEFAULT '{}',
  learned_shortcuts JSONB DEFAULT '{}',
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
ON public.ai_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.ai_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.ai_conversations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_messages
CREATE POLICY "Users can view their own messages"
ON public.ai_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.ai_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_learnings
CREATE POLICY "Users can view their own learnings"
ON public.ai_learnings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learnings"
ON public.ai_learnings FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for ai_user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.ai_user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
ON public.ai_user_preferences FOR ALL
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_ai_conversations_user_active ON public.ai_conversations(user_id, active);
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id, created_at);
CREATE INDEX idx_ai_learnings_user_type ON public.ai_learnings(user_id, learning_type);
CREATE INDEX idx_ai_learnings_pattern ON public.ai_learnings USING gin(to_tsvector('english', pattern));

-- Trigger for updated_at
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_user_preferences_updated_at
BEFORE UPDATE ON public.ai_user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();