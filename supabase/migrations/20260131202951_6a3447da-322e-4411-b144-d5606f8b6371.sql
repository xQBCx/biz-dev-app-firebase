-- Add requires_wallet_setup column to deal_room_participants
ALTER TABLE public.deal_room_participants 
ADD COLUMN IF NOT EXISTS requires_wallet_setup boolean NOT NULL DEFAULT false;

-- Add requires_wallet_setup column to deal_room_invitations
ALTER TABLE public.deal_room_invitations 
ADD COLUMN IF NOT EXISTS requires_wallet_setup boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.deal_room_participants.requires_wallet_setup IS 'Admin toggle for whether participant needs to set up XDK wallet for payouts';
COMMENT ON COLUMN public.deal_room_invitations.requires_wallet_setup IS 'Pre-configure wallet requirement for invitee during invitation';