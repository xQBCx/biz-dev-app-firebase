-- Fix type casting for platform_module enum in trigger functions

-- 1. Fix apply_deal_room_invitation_platform_permissions with proper type casting
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

        -- Cast m to platform_module enum
        INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
        VALUES (
          NEW.accepted_by_user_id,
          m::platform_module,
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
    -- Cast m to platform_module enum
    INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.accepted_by_user_id, m::platform_module, true, true, true, false)
    ON CONFLICT (user_id, module) DO UPDATE SET
      can_view = true,
      can_create = true,
      can_edit = true,
      can_delete = EXCLUDED.can_delete;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 2. Fix reconcile_my_invitations with proper type casting
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
  
  -- Also ensure deal_rooms permission exists (with proper enum cast)
  INSERT INTO user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
  VALUES (v_user_id, 'deal_rooms'::platform_module, true, true, true, false)
  ON CONFLICT (user_id, module) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'linked_participants', v_linked_participants,
    'linked_invitations', v_linked_invitations
  );
END;
$$;

-- 3. Fix handle_new_user with proper type casting and preserve existing role assignment
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
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    company = COALESCE(NULLIF(EXCLUDED.company, ''), profiles.company);

  RAISE LOG 'handle_new_user: Created/updated profile for user % (%)', NEW.id, NEW.email;

  -- Assign default 'client_user' role (preserve existing behavior)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client_user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Check if user came from a deal room invitation
  v_invite_token := NEW.raw_user_meta_data->>'deal_room_invite_token';
  
  IF v_invite_token IS NOT NULL THEN
    RAISE LOG 'handle_new_user: User has deal_room_invite_token: %', v_invite_token;
    
    -- Grant deal_rooms permission immediately for invited users (with proper enum cast)
    INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.id, 'deal_rooms'::platform_module, true, true, true, false)
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
    
    -- Also grant deal_rooms permission if participants were linked
    INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.id, 'deal_rooms'::platform_module, true, true, true, false)
    ON CONFLICT (user_id, module) DO NOTHING;
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