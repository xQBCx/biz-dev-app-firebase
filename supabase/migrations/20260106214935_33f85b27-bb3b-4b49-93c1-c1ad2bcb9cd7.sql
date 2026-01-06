-- Add default_permissions column to deal_room_invitations
ALTER TABLE public.deal_room_invitations 
ADD COLUMN IF NOT EXISTS default_permissions text[] DEFAULT ARRAY['deal_rooms']::text[];