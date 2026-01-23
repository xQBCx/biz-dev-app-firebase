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

  -- Check if user came from a deal room invitation
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
      RAISE LOG 'handle_new_user: Auto-accepted % pending invitations for user %', v_linked_count, NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Non-critical error accepting deal room invitations: %', SQLERRM;
  END;

  -- Check for linked proposals (for intelligent onboarding like Josh Ruff)
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