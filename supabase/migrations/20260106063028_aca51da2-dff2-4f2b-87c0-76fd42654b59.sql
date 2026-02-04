-- Fix infinite recursion in RLS policies
-- First, create a security definer function that can check participation without RLS

CREATE OR REPLACE FUNCTION public.is_deal_room_participant(room_id uuid, check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM deal_room_participants
    WHERE deal_room_id = room_id AND user_id = check_user_id
  );
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Participants can view their deal rooms" ON deal_rooms;
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON deal_room_participants;

-- Recreate deal_rooms SELECT policy using the function
CREATE POLICY "Participants can view their deal rooms"
ON deal_rooms FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR is_deal_room_participant(id, auth.uid())
);

-- Recreate deal_room_participants SELECT policy using the function
CREATE POLICY "Users can view participants in their rooms"
ON deal_room_participants FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_participant(deal_room_id, auth.uid())
);