-- 1) Allow the invited user (authenticated) to accept their own invitation
-- Security: only pending invitations for the current user's email can be accepted,
-- and the row must end up linked to auth.uid().
DROP POLICY IF EXISTS "Invitees can accept their invitation" ON public.deal_room_invitations;
CREATE POLICY "Invitees can accept their invitation"
ON public.deal_room_invitations
FOR UPDATE
TO authenticated
USING (
  (status::text = 'pending')
  AND lower(email) = lower((auth.jwt() ->> 'email'))
)
WITH CHECK (
  (status::text = 'accepted')
  AND accepted_by_user_id = auth.uid()
);

-- 2) Create/repair the participant row server-side when an invitation is accepted
-- This avoids requiring INSERT permissions for invitees on deal_room_participants.
CREATE OR REPLACE FUNCTION public.create_deal_room_participant_on_invitation_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.status::text = 'accepted') AND (NEW.accepted_by_user_id IS NOT NULL) THEN
    -- If a placeholder participant exists (common when invited ahead of signup), attach user_id
    UPDATE public.deal_room_participants
      SET user_id = NEW.accepted_by_user_id,
          invitation_accepted_at = COALESCE(NEW.accepted_at, now())
    WHERE deal_room_id = NEW.deal_room_id
      AND lower(email) = lower(NEW.email)
      AND (user_id IS NULL OR user_id = NEW.accepted_by_user_id);

    -- Ensure a participant row exists
    INSERT INTO public.deal_room_participants (
      deal_room_id,
      user_id,
      email,
      name,
      is_company,
      invitation_sent_at,
      invitation_accepted_at
    )
    VALUES (
      NEW.deal_room_id,
      NEW.accepted_by_user_id,
      NEW.email,
      COALESCE(NULLIF(NEW.name, ''), NEW.email),
      false,
      NEW.created_at,
      COALESCE(NEW.accepted_at, now())
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_participant_on_invite_accept ON public.deal_room_invitations;
CREATE TRIGGER trg_create_participant_on_invite_accept
AFTER UPDATE OF status, accepted_by_user_id
ON public.deal_room_invitations
FOR EACH ROW
EXECUTE FUNCTION public.create_deal_room_participant_on_invitation_accept();
