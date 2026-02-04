-- Add permission column for participants to add others to their CRM
ALTER TABLE public.deal_room_participants
ADD COLUMN IF NOT EXISTS can_add_to_crm boolean DEFAULT false;