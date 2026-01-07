-- Add display options to deal_room_participants
ALTER TABLE public.deal_room_participants
ADD COLUMN IF NOT EXISTS display_mode TEXT DEFAULT 'full_name' CHECK (display_mode IN ('full_name', 'first_only', 'company', 'anonymous', 'wallet', 'custom')),
ADD COLUMN IF NOT EXISTS display_name_override TEXT,
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS company_display_name TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.deal_room_participants.display_mode IS 'How this participant appears in the deal room: full_name, first_only, company, anonymous, wallet, custom';
COMMENT ON COLUMN public.deal_room_participants.display_name_override IS 'Custom display name if display_mode is custom';

-- Create admin impersonation log table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_impersonation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  context TEXT,
  ip_address TEXT,
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view impersonation logs
CREATE POLICY "Admins can view impersonation logs"
ON public.admin_impersonation_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only system can insert (via service role)
CREATE POLICY "System inserts impersonation logs"
ON public.admin_impersonation_logs
FOR INSERT
WITH CHECK (false);

-- Add admin bypass policy to deal_rooms for platform admins
CREATE POLICY "Admins can view all deal rooms"
ON public.deal_rooms
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add admin bypass policy to deal_room_participants for platform admins
CREATE POLICY "Admins can view all participants"
ON public.deal_room_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add admin update policy for participants (for editing display names)
CREATE POLICY "Admins can update all participants"
ON public.deal_room_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow deal room creators to update participant display settings
CREATE POLICY "Creators can update participant display settings"
ON public.deal_room_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.deal_rooms
    WHERE deal_rooms.id = deal_room_participants.deal_room_id
    AND deal_rooms.created_by = auth.uid()
  )
);

-- Allow participants to update their own display settings
CREATE POLICY "Participants can update own display settings"
ON public.deal_room_participants
FOR UPDATE
USING (user_id = auth.uid());