-- Create deal room invitation statuses
CREATE TYPE public.deal_room_invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE public.deal_room_access_level AS ENUM ('deal_room_only', 'full_profile');

-- Deal room invitations table
CREATE TABLE public.deal_room_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  role_in_deal TEXT,
  access_level public.deal_room_access_level DEFAULT 'deal_room_only',
  allow_full_profile_setup BOOLEAN DEFAULT false,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status public.deal_room_invite_status DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES auth.users(id),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal room message types for multi-channel messaging
CREATE TYPE public.deal_room_message_channel AS ENUM ('deal_room', 'biz_dev_messages', 'external_email');

-- Deal room outbound messages (sent from deal rooms)
CREATE TABLE public.deal_room_outbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_participant_id UUID REFERENCES public.deal_room_participants(id),
  recipient_email TEXT,
  recipient_user_id UUID REFERENCES auth.users(id),
  subject TEXT,
  content TEXT NOT NULL,
  channels deal_room_message_channel[] NOT NULL DEFAULT '{deal_room}',
  sent_via_deal_room BOOLEAN DEFAULT false,
  sent_via_biz_dev BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false,
  email_message_id TEXT,
  reply_to_address TEXT,
  thread_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inbound email tracking for deal rooms
CREATE TABLE public.deal_room_inbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_address TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  in_reply_to TEXT,
  message_id TEXT UNIQUE,
  matched_outbound_id UUID REFERENCES public.deal_room_outbound_messages(id),
  matched_participant_id UUID REFERENCES public.deal_room_participants(id),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_room_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_outbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_inbound_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_room_invitations
-- Anyone can read invitation by token (for accepting)
CREATE POLICY "Anyone can read invitation by token"
  ON public.deal_room_invitations FOR SELECT
  USING (true);

-- Deal room admins can manage invitations
CREATE POLICY "Admins can insert invitations"
  ON public.deal_room_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = deal_room_invitations.deal_room_id
      AND drp.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update invitations"
  ON public.deal_room_invitations FOR UPDATE
  USING (
    invited_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS for outbound messages
CREATE POLICY "Participants can view their deal room messages"
  ON public.deal_room_outbound_messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    recipient_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = deal_room_outbound_messages.deal_room_id
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.deal_room_outbound_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = deal_room_outbound_messages.deal_room_id
      AND drp.user_id = auth.uid()
    )
  );

-- RLS for inbound emails
CREATE POLICY "Participants can view inbound emails"
  ON public.deal_room_inbound_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deal_room_participants drp
      WHERE drp.deal_room_id = deal_room_inbound_emails.deal_room_id
      AND drp.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Add index for invitation token lookups
CREATE INDEX idx_deal_room_invitations_token ON public.deal_room_invitations(token);
CREATE INDEX idx_deal_room_invitations_email ON public.deal_room_invitations(email);
CREATE INDEX idx_deal_room_outbound_messages_deal_room ON public.deal_room_outbound_messages(deal_room_id);
CREATE INDEX idx_deal_room_inbound_emails_message_id ON public.deal_room_inbound_emails(message_id);