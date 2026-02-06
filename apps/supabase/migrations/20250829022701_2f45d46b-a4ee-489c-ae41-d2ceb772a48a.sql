-- Create COMS communication tables for SmartLink OS

-- Channels table for organizing conversations
CREATE TABLE public.coms_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('direct', 'team', 'custom')),
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Messages table for all communications
CREATE TABLE public.coms_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.coms_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'voice', 'video', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  voice_duration INTEGER, -- for voice messages in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  thread_id UUID REFERENCES public.coms_messages(id) -- for threaded replies
);

-- Meetings table for video/voice calls
CREATE TABLE public.coms_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.coms_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_url TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled'))
);

-- Channel members table for permissions and access control
CREATE TABLE public.coms_channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.coms_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- Message reactions table for emoji reactions
CREATE TABLE public.coms_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.coms_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable Row Level Security
ALTER TABLE public.coms_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coms_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coms_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coms_message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels
CREATE POLICY "Users can view channels for their property" 
ON public.coms_channels 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = coms_channels.property_id
));

CREATE POLICY "Managers can manage channels" 
ON public.coms_channels 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = coms_channels.property_id 
  AND profiles.role IN ('manager', 'owner', 'regional')
));

-- RLS Policies for messages
CREATE POLICY "Users can view messages in accessible channels" 
ON public.coms_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM coms_channel_members 
  WHERE coms_channel_members.channel_id = coms_messages.channel_id 
  AND coms_channel_members.user_id = auth.uid()
));

CREATE POLICY "Users can send messages to accessible channels" 
ON public.coms_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM coms_channel_members 
    WHERE coms_channel_members.channel_id = coms_messages.channel_id 
    AND coms_channel_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.coms_messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- RLS Policies for meetings
CREATE POLICY "Users can view meetings in accessible channels" 
ON public.coms_meetings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM coms_channel_members 
  WHERE coms_channel_members.channel_id = coms_meetings.channel_id 
  AND coms_channel_members.user_id = auth.uid()
));

CREATE POLICY "Users can create meetings in accessible channels" 
ON public.coms_meetings 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND EXISTS (
    SELECT 1 FROM coms_channel_members 
    WHERE coms_channel_members.channel_id = coms_meetings.channel_id 
    AND coms_channel_members.user_id = auth.uid()
  )
);

-- RLS Policies for channel members
CREATE POLICY "Users can view channel members" 
ON public.coms_channel_members 
FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM coms_channel_members cm 
  WHERE cm.channel_id = coms_channel_members.channel_id 
  AND cm.user_id = auth.uid()
));

CREATE POLICY "Channel admins can manage members" 
ON public.coms_channel_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM coms_channel_members 
  WHERE coms_channel_members.channel_id = coms_channel_members.channel_id 
  AND coms_channel_members.user_id = auth.uid() 
  AND coms_channel_members.role = 'admin'
));

-- RLS Policies for reactions
CREATE POLICY "Users can view reactions on accessible messages" 
ON public.coms_message_reactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM coms_messages m 
  JOIN coms_channel_members cm ON cm.channel_id = m.channel_id 
  WHERE m.id = coms_message_reactions.message_id 
  AND cm.user_id = auth.uid()
));

CREATE POLICY "Users can manage their own reactions" 
ON public.coms_message_reactions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_coms_channels_property_id ON public.coms_channels(property_id);
CREATE INDEX idx_coms_messages_channel_id ON public.coms_messages(channel_id);
CREATE INDEX idx_coms_messages_created_at ON public.coms_messages(created_at DESC);
CREATE INDEX idx_coms_channel_members_user_id ON public.coms_channel_members(user_id);
CREATE INDEX idx_coms_channel_members_channel_id ON public.coms_channel_members(channel_id);

-- Add update triggers
CREATE TRIGGER update_coms_channels_updated_at
  BEFORE UPDATE ON public.coms_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coms_messages_updated_at
  BEFORE UPDATE ON public.coms_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();