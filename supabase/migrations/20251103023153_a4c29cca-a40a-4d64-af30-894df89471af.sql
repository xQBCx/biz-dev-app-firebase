-- Calls table (WebRTC + PSTN)
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  direction TEXT CHECK (direction IN ('inbound','outbound')) NOT NULL,
  modality TEXT CHECK (modality IN ('webrtc','pstn','hybrid')) NOT NULL,
  from_addr TEXT,
  to_addr TEXT,
  sfu_room_id TEXT,
  pbx_call_id TEXT,
  status TEXT CHECK (status IN ('init','ringing','active','completed','failed','canceled')) DEFAULT 'init',
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Participants in calls
CREATE TABLE public.call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('caller','callee','bridge','monitor')) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone_number TEXT,
  display_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- Call recordings
CREATE TABLE public.call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  duration_sec INT,
  channels INT DEFAULT 2,
  codec TEXT CHECK (codec IN ('flac','mp3','opus','wav')) NOT NULL,
  sample_rate INT DEFAULT 48000,
  file_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'call-recordings',
  size_bytes BIGINT,
  checksum TEXT,
  is_archive BOOLEAN DEFAULT false,
  is_preview BOOLEAN DEFAULT false
);

-- Consent events (legal compliance)
CREATE TABLE public.consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT CHECK (event_type IN ('ivr_announcement','periodic_beep','verbal_yes','dtmf_1','verbal_no','stop_recording')) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb
);

-- SMS conversations
CREATE TABLE public.sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  peer_number TEXT NOT NULL,
  our_number TEXT NOT NULL,
  last_message_at TIMESTAMPTZ,
  contact_name TEXT,
  UNIQUE(owner_user_id, peer_number, our_number)
);

-- SMS messages
CREATE TABLE public.sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.sms_conversations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  direction TEXT CHECK (direction IN ('outbound','inbound')) NOT NULL,
  status TEXT CHECK (status IN ('queued','sent','delivered','failed','undeliverable','received')) DEFAULT 'queued',
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  carrier_msg_id TEXT,
  dlr_code TEXT,
  error_detail TEXT
);

-- SMS opt-outs (STOP compliance)
CREATE TABLE public.sms_optouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  reason TEXT CHECK (reason IN ('STOP','manual','carrier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  opted_in_at TIMESTAMPTZ
);

-- Call transcripts (optional AI feature)
CREATE TABLE public.call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE NOT NULL,
  provider TEXT,
  language TEXT DEFAULT 'en-US',
  text_full TEXT,
  words JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_optouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calls
CREATE POLICY "Users can view their own calls"
ON public.calls FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own calls"
ON public.calls FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own calls"
ON public.calls FOR UPDATE
USING (auth.uid() = owner_user_id);

-- RLS Policies for call_participants
CREATE POLICY "Users can view participants in their calls"
ON public.call_participants FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.calls
  WHERE calls.id = call_participants.call_id
  AND calls.owner_user_id = auth.uid()
));

CREATE POLICY "Users can manage participants in their calls"
ON public.call_participants FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.calls
  WHERE calls.id = call_participants.call_id
  AND calls.owner_user_id = auth.uid()
));

-- RLS Policies for call_recordings
CREATE POLICY "Users can view recordings of their calls"
ON public.call_recordings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.calls
  WHERE calls.id = call_recordings.call_id
  AND calls.owner_user_id = auth.uid()
));

CREATE POLICY "System can create recordings"
ON public.call_recordings FOR INSERT
WITH CHECK (true);

-- RLS Policies for consent_events
CREATE POLICY "Users can view consent events for their calls"
ON public.consent_events FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.calls
  WHERE calls.id = consent_events.call_id
  AND calls.owner_user_id = auth.uid()
));

CREATE POLICY "System can create consent events"
ON public.consent_events FOR INSERT
WITH CHECK (true);

-- RLS Policies for SMS conversations
CREATE POLICY "Users can view their SMS conversations"
ON public.sms_conversations FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can manage their SMS conversations"
ON public.sms_conversations FOR ALL
USING (auth.uid() = owner_user_id);

-- RLS Policies for SMS messages
CREATE POLICY "Users can view messages in their conversations"
ON public.sms_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.sms_conversations
  WHERE sms_conversations.id = sms_messages.conversation_id
  AND sms_conversations.owner_user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations"
ON public.sms_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.sms_conversations
  WHERE sms_conversations.id = sms_messages.conversation_id
  AND sms_conversations.owner_user_id = auth.uid()
));

-- RLS Policies for SMS opt-outs
CREATE POLICY "Anyone can view opt-outs"
ON public.sms_optouts FOR SELECT
USING (true);

CREATE POLICY "System can manage opt-outs"
ON public.sms_optouts FOR ALL
USING (true);

-- RLS Policies for call transcripts
CREATE POLICY "Users can view transcripts of their calls"
ON public.call_transcripts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.calls
  WHERE calls.id = call_transcripts.call_id
  AND calls.owner_user_id = auth.uid()
));

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('call-recordings', 'call-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for recordings
CREATE POLICY "Users can view their own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'call-recordings' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.calls WHERE owner_user_id = auth.uid()
  )
);

CREATE POLICY "System can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'call-recordings');

-- Create storage bucket for SMS media
INSERT INTO storage.buckets (id, name, public)
VALUES ('sms-media', 'sms-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for SMS media
CREATE POLICY "Users can view their SMS media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'sms-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.sms_conversations WHERE owner_user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload SMS media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sms-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.sms_conversations WHERE owner_user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_calls_owner ON public.calls(owner_user_id);
CREATE INDEX idx_calls_status ON public.calls(status);
CREATE INDEX idx_call_participants_call ON public.call_participants(call_id);
CREATE INDEX idx_call_recordings_call ON public.call_recordings(call_id);
CREATE INDEX idx_sms_conversations_owner ON public.sms_conversations(owner_user_id);
CREATE INDEX idx_sms_messages_conversation ON public.sms_messages(conversation_id);
CREATE INDEX idx_sms_messages_status ON public.sms_messages(status);
CREATE INDEX idx_sms_optouts_phone ON public.sms_optouts(phone_number);