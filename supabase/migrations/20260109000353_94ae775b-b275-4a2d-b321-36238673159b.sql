-- ============================================
-- ENTERPRISE-GRADE INVITATION SYSTEM FIX
-- Fixes: Invalid jsonb_object_length(), auth.uid() checks, adds self-healing
-- ============================================

-- 1. Fix the apply_deal_room_invitation_platform_permissions function
-- Replace invalid jsonb_object_length() with valid PostgreSQL
CREATE OR REPLACE FUNCTION public.apply_deal_room_invitation_platform_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  kv record;
  perms jsonb;
  m text;
  p jsonb;
  modules text[];
  perm_count int;
BEGIN
  -- Only process when status changes to 'accepted'
  IF NEW.status <> 'accepted' THEN
    RETURN NEW;
  END IF;

  -- Must have a user ID to apply permissions
  IF NEW.accepted_by_user_id IS NULL THEN
    RAISE LOG 'apply_deal_room_invitation_platform_permissions: No accepted_by_user_id for invitation %', NEW.id;
    RETURN NEW;
  END IF;

  RAISE LOG 'apply_deal_room_invitation_platform_permissions: Processing invitation % for user %', NEW.id, NEW.accepted_by_user_id;

  -- Prefer granular platform permissions if present
  perms := NEW.platform_permissions;
  
  -- Use valid PostgreSQL to check if JSONB object is non-empty
  IF perms IS NOT NULL AND jsonb_typeof(perms) = 'object' THEN
    SELECT count(*) INTO perm_count FROM jsonb_each(perms);
    
    IF perm_count > 0 THEN
      RAISE LOG 'apply_deal_room_invitation_platform_permissions: Applying % granular permissions', perm_count;
      
      FOR kv IN SELECT key, value FROM jsonb_each(perms)
      LOOP
        m := kv.key;
        p := kv.value;

        INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
        VALUES (
          NEW.accepted_by_user_id,
          m,
          COALESCE((p->>'can_view')::boolean, false),
          COALESCE((p->>'can_create')::boolean, false),
          COALESCE((p->>'can_edit')::boolean, false),
          COALESCE((p->>'can_delete')::boolean, false)
        )
        ON CONFLICT (user_id, module) DO UPDATE SET
          can_view = EXCLUDED.can_view,
          can_create = EXCLUDED.can_create,
          can_edit = EXCLUDED.can_edit,
          can_delete = EXCLUDED.can_delete;
      END LOOP;

      RETURN NEW;
    END IF;
  END IF;

  -- Fallback: module list permissions (always include deal_rooms)
  modules := COALESCE(NEW.default_permissions, ARRAY['deal_rooms']::text[]);
  
  -- Ensure deal_rooms is always included
  IF NOT 'deal_rooms' = ANY(modules) THEN
    modules := array_append(modules, 'deal_rooms');
  END IF;

  RAISE LOG 'apply_deal_room_invitation_platform_permissions: Applying fallback permissions for modules: %', modules;

  FOREACH m IN ARRAY modules
  LOOP
    INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.accepted_by_user_id, m, true, true, true, false)
    ON CONFLICT (user_id, module) DO UPDATE SET
      can_view = true,
      can_create = true,
      can_edit = true,
      can_delete = EXCLUDED.can_delete;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 2. Create self-healing reconciliation function
-- This auto-links participants when profile exists but user_id is null
CREATE OR REPLACE FUNCTION public.reconcile_deal_room_participants()
RETURNS TABLE(
  fixed_participants int,
  fixed_invitations int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixed_participants int := 0;
  v_fixed_invitations int := 0;
BEGIN
  -- Auto-link participants where profile exists but user_id is null
  WITH updated_participants AS (
    UPDATE deal_room_participants drp
    SET user_id = p.id,
        invitation_accepted_at = COALESCE(drp.invitation_accepted_at, now())
    FROM profiles p
    WHERE lower(drp.email) = lower(p.email)
      AND drp.user_id IS NULL
    RETURNING drp.id
  )
  SELECT count(*) INTO v_fixed_participants FROM updated_participants;
  
  RAISE LOG 'reconcile_deal_room_participants: Linked % participants to user profiles', v_fixed_participants;

  -- Auto-accept invitations where user has already joined
  WITH updated_invitations AS (
    UPDATE deal_room_invitations dri
    SET status = 'accepted',
        accepted_at = COALESCE(dri.accepted_at, now()),
        accepted_by_user_id = drp.user_id
    FROM deal_room_participants drp
    WHERE dri.deal_room_id = drp.deal_room_id
      AND lower(dri.email) = lower(drp.email)
      AND drp.user_id IS NOT NULL
      AND dri.status = 'pending'
    RETURNING dri.id
  )
  SELECT count(*) INTO v_fixed_invitations FROM updated_invitations;
  
  RAISE LOG 'reconcile_deal_room_participants: Auto-accepted % invitations', v_fixed_invitations;

  fixed_participants := v_fixed_participants;
  fixed_invitations := v_fixed_invitations;
  
  RETURN NEXT;
END;
$$;

-- 3. Update handle_new_user to auto-link pending invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_token text;
  v_linked_count int;
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, full_name, company)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    company = COALESCE(EXCLUDED.company, profiles.company);

  RAISE LOG 'handle_new_user: Created/updated profile for user % (%)', NEW.id, NEW.email;

  -- Check if user came from a deal room invitation
  v_invite_token := NEW.raw_user_meta_data->>'deal_room_invite_token';
  
  IF v_invite_token IS NOT NULL THEN
    RAISE LOG 'handle_new_user: User has deal_room_invite_token: %', v_invite_token;
    
    -- Grant deal_rooms permission immediately for invited users
    INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.id, 'deal_rooms', true, true, true, false)
    ON CONFLICT (user_id, module) DO UPDATE SET
      can_view = true,
      can_create = true,
      can_edit = true;
      
    RAISE LOG 'handle_new_user: Granted deal_rooms permission for invited user %', NEW.id;
  END IF;

  -- Auto-link any pending deal room participants by email
  UPDATE deal_room_participants
  SET user_id = NEW.id,
      invitation_accepted_at = COALESCE(invitation_accepted_at, now())
  WHERE lower(email) = lower(NEW.email)
    AND user_id IS NULL;
  
  GET DIAGNOSTICS v_linked_count = ROW_COUNT;
  
  IF v_linked_count > 0 THEN
    RAISE LOG 'handle_new_user: Auto-linked % pending participant records for user %', v_linked_count, NEW.id;
  END IF;

  -- Auto-accept any pending invitations for this email
  UPDATE deal_room_invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by_user_id = NEW.id
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pending';
    
  GET DIAGNOSTICS v_linked_count = ROW_COUNT;
  
  IF v_linked_count > 0 THEN
    RAISE LOG 'handle_new_user: Auto-accepted % pending invitations for user %', v_linked_count, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Improve the deal_room_invitation_accepted trigger
-- Make it more robust and idempotent
CREATE OR REPLACE FUNCTION public.handle_deal_room_invitation_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_exists boolean;
BEGIN
  -- Only process when status changes to 'accepted'
  IF NEW.status <> 'accepted' THEN
    RETURN NEW;
  END IF;
  
  -- Only process if OLD status was different (avoid re-processing)
  IF OLD.status = 'accepted' THEN
    RETURN NEW;
  END IF;

  RAISE LOG 'handle_deal_room_invitation_accepted: Processing invitation % for deal room %', NEW.id, NEW.deal_room_id;

  -- Check if participant already exists
  SELECT EXISTS(
    SELECT 1 FROM deal_room_participants
    WHERE deal_room_id = NEW.deal_room_id
      AND (email = NEW.email OR user_id = NEW.accepted_by_user_id)
  ) INTO v_participant_exists;

  IF v_participant_exists THEN
    -- Update existing participant with user_id if not set
    UPDATE deal_room_participants
    SET user_id = COALESCE(user_id, NEW.accepted_by_user_id),
        invitation_accepted_at = COALESCE(invitation_accepted_at, now())
    WHERE deal_room_id = NEW.deal_room_id
      AND (email = NEW.email OR user_id = NEW.accepted_by_user_id);
      
    RAISE LOG 'handle_deal_room_invitation_accepted: Updated existing participant for invitation %', NEW.id;
  ELSE
    -- Create new participant
    INSERT INTO deal_room_participants (
      deal_room_id,
      user_id,
      email,
      name,
      company,
      role_in_deal,
      access_level,
      invited_by,
      invited_at,
      invitation_accepted_at
    ) VALUES (
      NEW.deal_room_id,
      NEW.accepted_by_user_id,
      NEW.email,
      NEW.name,
      NEW.company,
      NEW.role_in_deal,
      NEW.access_level,
      NEW.invited_by,
      NEW.created_at,
      now()
    )
    ON CONFLICT (deal_room_id, email) DO UPDATE SET
      user_id = COALESCE(EXCLUDED.user_id, deal_room_participants.user_id),
      invitation_accepted_at = COALESCE(deal_room_participants.invitation_accepted_at, now());
      
    RAISE LOG 'handle_deal_room_invitation_accepted: Created new participant for invitation %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Add RPC function for frontend to call reconciliation
CREATE OR REPLACE FUNCTION public.reconcile_my_invitations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_linked_participants int := 0;
  v_linked_invitations int := 0;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  
  -- Link any participant records
  UPDATE deal_room_participants
  SET user_id = v_user_id,
      invitation_accepted_at = COALESCE(invitation_accepted_at, now())
  WHERE lower(email) = lower(v_user_email)
    AND user_id IS NULL;
    
  GET DIAGNOSTICS v_linked_participants = ROW_COUNT;
  
  -- Accept any pending invitations
  UPDATE deal_room_invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by_user_id = v_user_id
  WHERE lower(email) = lower(v_user_email)
    AND status = 'pending';
    
  GET DIAGNOSTICS v_linked_invitations = ROW_COUNT;
  
  -- Also ensure deal_rooms permission exists
  INSERT INTO user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
  VALUES (v_user_id, 'deal_rooms', true, true, true, false)
  ON CONFLICT (user_id, module) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'linked_participants', v_linked_participants,
    'linked_invitations', v_linked_invitations
  );
END;
$$;