CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_token text;
  v_linked_count int;
  v_asset_summary text := '';
  v_access_request record;
  v_deal_room_invite record;
  v_partner_member record;
  v_user_invite record;
  v_module_key text;
  v_perm_obj jsonb;
  v_permissions_applied boolean := false;
BEGIN
  -- CRITICAL: Create profile for new user
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name);

  RAISE LOG 'handle_new_user: Created/updated profile for user % (%)', NEW.id, NEW.email;

  -- Assign default 'client_user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client_user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- =====================================================
  -- PATH 1: Check for approved access request with pre-set permissions
  -- =====================================================
  BEGIN
    SELECT * INTO v_access_request
    FROM public.access_requests
    WHERE lower(email) = lower(NEW.email)
      AND status = 'approved'
      AND default_permissions IS NOT NULL
    ORDER BY updated_at DESC
    LIMIT 1;

    IF v_access_request.id IS NOT NULL AND v_access_request.default_permissions IS NOT NULL THEN
      RAISE LOG 'handle_new_user: Found access request with default_permissions for user %', NEW.email;
      
      FOR v_module_key, v_perm_obj IN SELECT * FROM jsonb_each(v_access_request.default_permissions::jsonb)
      LOOP
        BEGIN
          INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
          VALUES (
            NEW.id,
            v_module_key::platform_module,
            COALESCE((v_perm_obj->>'can_view')::boolean, false),
            COALESCE((v_perm_obj->>'can_create')::boolean, false),
            COALESCE((v_perm_obj->>'can_edit')::boolean, false),
            COALESCE((v_perm_obj->>'can_delete')::boolean, false)
          )
          ON CONFLICT (user_id, module) DO UPDATE SET
            can_view = COALESCE((v_perm_obj->>'can_view')::boolean, user_permissions.can_view),
            can_create = COALESCE((v_perm_obj->>'can_create')::boolean, user_permissions.can_create),
            can_edit = COALESCE((v_perm_obj->>'can_edit')::boolean, user_permissions.can_edit),
            can_delete = COALESCE((v_perm_obj->>'can_delete')::boolean, user_permissions.can_delete);
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG 'handle_new_user: Skipped invalid module % for user %: %', v_module_key, NEW.id, SQLERRM;
        END;
      END LOOP;
      
      v_permissions_applied := true;
      RAISE LOG 'handle_new_user: Applied permissions from access_requests for user %', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error applying access request permissions: %', SQLERRM;
  END;

  -- =====================================================
  -- PATH 2: Check for deal room invitations with platform_permissions
  -- =====================================================
  BEGIN
    SELECT * INTO v_deal_room_invite
    FROM public.deal_room_invitations
    WHERE lower(email) = lower(NEW.email)
      AND platform_permissions IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_deal_room_invite.id IS NOT NULL AND v_deal_room_invite.platform_permissions IS NOT NULL THEN
      RAISE LOG 'handle_new_user: Found deal_room_invitation with platform_permissions for user %', NEW.email;
      
      FOR v_module_key, v_perm_obj IN SELECT * FROM jsonb_each(v_deal_room_invite.platform_permissions::jsonb)
      LOOP
        BEGIN
          INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
          VALUES (
            NEW.id,
            v_module_key::platform_module,
            COALESCE((v_perm_obj->>'can_view')::boolean, false),
            COALESCE((v_perm_obj->>'can_create')::boolean, false),
            COALESCE((v_perm_obj->>'can_edit')::boolean, false),
            COALESCE((v_perm_obj->>'can_delete')::boolean, false)
          )
          ON CONFLICT (user_id, module) DO UPDATE SET
            can_view = GREATEST(user_permissions.can_view, COALESCE((v_perm_obj->>'can_view')::boolean, false)),
            can_create = GREATEST(user_permissions.can_create, COALESCE((v_perm_obj->>'can_create')::boolean, false)),
            can_edit = GREATEST(user_permissions.can_edit, COALESCE((v_perm_obj->>'can_edit')::boolean, false)),
            can_delete = GREATEST(user_permissions.can_delete, COALESCE((v_perm_obj->>'can_delete')::boolean, false));
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG 'handle_new_user: Skipped invalid module % from deal_room_invitation: %', v_module_key, SQLERRM;
        END;
      END LOOP;
      
      v_permissions_applied := true;
      RAISE LOG 'handle_new_user: Applied permissions from deal_room_invitations for user %', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error applying deal room invitation permissions: %', SQLERRM;
  END;

  -- =====================================================
  -- PATH 3: Check for partner team member invitations with permissions
  -- =====================================================
  BEGIN
    SELECT * INTO v_partner_member
    FROM public.partner_team_members
    WHERE lower(email) = lower(NEW.email)
      AND user_id IS NULL
      AND permissions IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_partner_member.id IS NOT NULL AND v_partner_member.permissions IS NOT NULL THEN
      RAISE LOG 'handle_new_user: Found partner_team_member with permissions for user %', NEW.email;
      
      -- Link the partner team member to the new user
      UPDATE public.partner_team_members
      SET user_id = NEW.id, joined_at = now()
      WHERE id = v_partner_member.id;
      
      -- Apply partner permissions (if they include platform module permissions)
      FOR v_module_key, v_perm_obj IN SELECT * FROM jsonb_each(v_partner_member.permissions::jsonb)
      LOOP
        BEGIN
          -- Only process if it looks like a module permission object
          IF v_perm_obj ? 'can_view' OR v_perm_obj ? 'can_create' THEN
            INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
            VALUES (
              NEW.id,
              v_module_key::platform_module,
              COALESCE((v_perm_obj->>'can_view')::boolean, false),
              COALESCE((v_perm_obj->>'can_create')::boolean, false),
              COALESCE((v_perm_obj->>'can_edit')::boolean, false),
              COALESCE((v_perm_obj->>'can_delete')::boolean, false)
            )
            ON CONFLICT (user_id, module) DO UPDATE SET
              can_view = GREATEST(user_permissions.can_view, COALESCE((v_perm_obj->>'can_view')::boolean, false)),
              can_create = GREATEST(user_permissions.can_create, COALESCE((v_perm_obj->>'can_create')::boolean, false)),
              can_edit = GREATEST(user_permissions.can_edit, COALESCE((v_perm_obj->>'can_edit')::boolean, false)),
              can_delete = GREATEST(user_permissions.can_delete, COALESCE((v_perm_obj->>'can_delete')::boolean, false));
          END IF;
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG 'handle_new_user: Skipped partner permission %: %', v_module_key, SQLERRM;
        END;
      END LOOP;
      
      v_permissions_applied := true;
      v_asset_summary := v_asset_summary || 'partner team access, ';
      RAISE LOG 'handle_new_user: Applied permissions from partner_team_members for user %', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error applying partner team permissions: %', SQLERRM;
  END;

  -- =====================================================
  -- PATH 4: Check for user_invitations (general platform invites)
  -- =====================================================
  BEGIN
    SELECT * INTO v_user_invite
    FROM public.user_invitations
    WHERE lower(invitee_email) = lower(NEW.email)
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_user_invite.id IS NOT NULL THEN
      RAISE LOG 'handle_new_user: Found user_invitation for user %', NEW.email;
      
      -- Mark the invitation as accepted
      UPDATE public.user_invitations
      SET status = 'accepted',
          accepted_at = now(),
          invited_user_id = NEW.id
      WHERE id = v_user_invite.id;
      
      -- Assign role from invitation if specified
      IF v_user_invite.role IS NOT NULL AND v_user_invite.role != 'user' THEN
        BEGIN
          INSERT INTO public.user_roles (user_id, role)
          VALUES (NEW.id, v_user_invite.role::app_role)
          ON CONFLICT (user_id, role) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG 'handle_new_user: Could not assign role % from invitation: %', v_user_invite.role, SQLERRM;
        END;
      END IF;
      
      RAISE LOG 'handle_new_user: Processed user_invitation for user %', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error processing user invitation: %', SQLERRM;
  END;

  -- =====================================================
  -- Deal room participant and invitation processing (existing logic)
  -- =====================================================
  
  -- Check if user came from a deal room invitation token
  v_invite_token := NEW.raw_user_meta_data->>'deal_room_invite_token';
  
  IF v_invite_token IS NOT NULL THEN
    RAISE LOG 'handle_new_user: User has deal_room_invite_token: %', v_invite_token;
    
    INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.id, 'deal_rooms'::platform_module, true, true, true, false)
    ON CONFLICT (user_id, module) DO UPDATE SET
      can_view = true,
      can_create = true,
      can_edit = true;
  END IF;

  -- Auto-link any pending deal room participants by email
  BEGIN
    UPDATE public.deal_room_participants
    SET user_id = NEW.id,
        invitation_accepted_at = COALESCE(invitation_accepted_at, now())
    WHERE lower(email) = lower(NEW.email)
      AND user_id IS NULL;
    
    GET DIAGNOSTICS v_linked_count = ROW_COUNT;
    
    IF v_linked_count > 0 THEN
      RAISE LOG 'handle_new_user: Auto-linked % pending participant records for user %', v_linked_count, NEW.id;
      v_asset_summary := v_asset_summary || v_linked_count || ' deal room(s), ';
      
      INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
      VALUES (NEW.id, 'deal_rooms'::platform_module, true, true, true, false)
      ON CONFLICT (user_id, module) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error linking deal room participants: %', SQLERRM;
  END;

  -- Auto-accept any pending deal room invitations for this email
  BEGIN
    UPDATE public.deal_room_invitations
    SET status = 'accepted',
        accepted_at = now(),
        accepted_by_user_id = NEW.id
    WHERE lower(email) = lower(NEW.email)
      AND status = 'pending';
      
    GET DIAGNOSTICS v_linked_count = ROW_COUNT;
    
    IF v_linked_count > 0 THEN
      RAISE LOG 'handle_new_user: Auto-accepted % pending deal room invitations for user %', v_linked_count, NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error accepting deal room invitations: %', SQLERRM;
  END;

  -- Check for linked proposals
  BEGIN
    SELECT COUNT(*) INTO v_linked_count
    FROM public.proposal_shared_access
    WHERE lower(email) = lower(NEW.email) AND user_id IS NULL;
    
    IF v_linked_count > 0 THEN
      UPDATE public.proposal_shared_access
      SET user_id = NEW.id, accepted_at = now()
      WHERE lower(email) = lower(NEW.email) AND user_id IS NULL;
      
      v_asset_summary := v_asset_summary || v_linked_count || ' proposal(s), ';
      RAISE LOG 'handle_new_user: Linked % proposals for user %', v_linked_count, NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error linking proposals: %', SQLERRM;
  END;

  -- Create welcome notification if user has linked assets
  IF length(v_asset_summary) > 0 THEN
    BEGIN
      INSERT INTO public.ai_proactive_notifications (
        user_id,
        notification_type,
        title,
        message,
        priority,
        action_type,
        action_payload
      ) VALUES (
        NEW.id,
        'onboarding',
        'Welcome! You have assets waiting',
        'You have been granted access to: ' || rtrim(v_asset_summary, ', ') || '. Check your dashboard to explore.',
        'high',
        'navigate',
        '{"path": "/dashboard"}'::jsonb
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'handle_new_user: Non-critical error creating welcome notification: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;