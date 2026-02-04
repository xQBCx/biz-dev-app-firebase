
-- Trigger to auto-reconcile deal room participants when a user signs up or signs in
-- This catches cases where users sign up separately from the invitation flow

-- Create or replace the function that reconciles participants by email
CREATE OR REPLACE FUNCTION public.auto_reconcile_deal_room_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_linked_participants int := 0;
  v_linked_invitations int := 0;
BEGIN
  -- Link any unlinked participant records to this user
  UPDATE deal_room_participants
  SET user_id = NEW.id,
      invitation_accepted_at = COALESCE(invitation_accepted_at, now())
  WHERE lower(email) = lower(NEW.email)
    AND user_id IS NULL;
    
  GET DIAGNOSTICS v_linked_participants = ROW_COUNT;
  
  -- Auto-accept any pending invitations for this email
  UPDATE deal_room_invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by_user_id = NEW.id
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pending';
    
  GET DIAGNOSTICS v_linked_invitations = ROW_COUNT;
  
  -- If we linked any participants/invitations, ensure they have deal_rooms permission
  IF v_linked_participants > 0 OR v_linked_invitations > 0 THEN
    INSERT INTO user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.id, 'deal_rooms'::platform_module, true, true, true, false)
    ON CONFLICT (user_id, module) DO NOTHING;
    
    RAISE LOG 'auto_reconcile_deal_room_participants: Linked % participants, % invitations for user %', 
      v_linked_participants, v_linked_invitations, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table (fires when a new profile is created, which happens on signup)
DROP TRIGGER IF EXISTS trigger_auto_reconcile_deal_room_participants ON profiles;
CREATE TRIGGER trigger_auto_reconcile_deal_room_participants
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_reconcile_deal_room_participants();

-- Also create a trigger on deal_room_invitations to auto-grant permissions when invitation is created
CREATE OR REPLACE FUNCTION public.grant_deal_rooms_permission_on_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if there's already a user with this email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(NEW.email);
  
  -- If user exists, grant deal_rooms permission immediately
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (v_user_id, 'deal_rooms'::platform_module, true, true, true, false)
    ON CONFLICT (user_id, module) DO NOTHING;
    
    -- Also auto-link the participant if not already linked
    UPDATE deal_room_participants
    SET user_id = v_user_id,
        invitation_accepted_at = COALESCE(invitation_accepted_at, now())
    WHERE lower(email) = lower(NEW.email)
      AND deal_room_id = NEW.deal_room_id
      AND user_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_grant_deal_rooms_permission_on_invite ON deal_room_invitations;
CREATE TRIGGER trigger_grant_deal_rooms_permission_on_invite
  AFTER INSERT ON deal_room_invitations
  FOR EACH ROW
  EXECUTE FUNCTION grant_deal_rooms_permission_on_invite();

-- Grant existing invitees deal_rooms permission if they already have accounts
DO $$
DECLARE
  inv RECORD;
  v_user_id uuid;
BEGIN
  FOR inv IN 
    SELECT DISTINCT dri.email
    FROM deal_room_invitations dri
    WHERE dri.status IN ('pending', 'accepted')
  LOOP
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(inv.email);
    
    IF v_user_id IS NOT NULL THEN
      INSERT INTO user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
      VALUES (v_user_id, 'deal_rooms'::platform_module, true, true, true, false)
      ON CONFLICT (user_id, module) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;
