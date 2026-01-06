-- Add 'cancelled' status to the deal_room_invite_status enum
ALTER TYPE deal_room_invite_status ADD VALUE IF NOT EXISTS 'cancelled';