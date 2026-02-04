-- Drop conflicting/redundant policies on deal_room_participants
DROP POLICY IF EXISTS "Admins can manage all participants" ON public.deal_room_participants;
DROP POLICY IF EXISTS "Admins can update all participants" ON public.deal_room_participants;
DROP POLICY IF EXISTS "Admins can view all participants" ON public.deal_room_participants;
DROP POLICY IF EXISTS "Creators can update participant display settings" ON public.deal_room_participants;
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.deal_room_participants;

-- Create clean, comprehensive policies
-- SELECT: Admins and creators can view all participants in their deal rooms
CREATE POLICY "select_deal_room_participants"
ON public.deal_room_participants
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM deal_rooms dr 
    WHERE dr.id = deal_room_participants.deal_room_id 
    AND dr.created_by = auth.uid()
  )
  OR is_deal_room_participant(deal_room_id, auth.uid())
);

-- UPDATE: Admins and creators can update any participant settings
CREATE POLICY "update_deal_room_participants"
ON public.deal_room_participants
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM deal_rooms dr 
    WHERE dr.id = deal_room_participants.deal_room_id 
    AND dr.created_by = auth.uid()
  )
  OR user_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM deal_rooms dr 
    WHERE dr.id = deal_room_participants.deal_room_id 
    AND dr.created_by = auth.uid()
  )
  OR user_id = auth.uid()
);

-- INSERT: Admins and creators can add participants
CREATE POLICY "insert_deal_room_participants"
ON public.deal_room_participants
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM deal_rooms dr 
    WHERE dr.id = deal_room_participants.deal_room_id 
    AND dr.created_by = auth.uid()
  )
);

-- DELETE: Admins and creators can remove participants
CREATE POLICY "delete_deal_room_participants"
ON public.deal_room_participants
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM deal_rooms dr 
    WHERE dr.id = deal_room_participants.deal_room_id 
    AND dr.created_by = auth.uid()
  )
);

-- Also drop the remaining old policies that might conflict
DROP POLICY IF EXISTS "Participants can update own display settings" ON public.deal_room_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.deal_room_participants;