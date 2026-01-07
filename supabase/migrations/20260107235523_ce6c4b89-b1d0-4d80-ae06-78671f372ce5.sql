-- 1) Team invitations: track accepted user id so backend can apply permissions
ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS accepted_by_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_team_invitations_accepted_by_user_id
ON public.team_invitations (accepted_by_user_id);

-- 2) Deal room invitations: allow storing full platform permissions (same shape as team_invitations.default_permissions)
ALTER TABLE public.deal_room_invitations
ADD COLUMN IF NOT EXISTS platform_permissions jsonb;

-- 3) Apply platform permissions from team_invitations.default_permissions when invite is accepted
CREATE OR REPLACE FUNCTION public.apply_team_invitation_permissions()
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
BEGIN
  IF NEW.status <> 'accepted' THEN
    RETURN NEW;
  END IF;

  IF NEW.accepted_by_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only run when the invited user is the one accepting (prevents misuse via overly-broad update policies)
  IF auth.uid() IS NULL OR auth.uid() <> NEW.accepted_by_user_id THEN
    RETURN NEW;
  END IF;

  perms := NEW.default_permissions;
  IF perms IS NULL OR jsonb_typeof(perms) <> 'object' THEN
    RETURN NEW;
  END IF;

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
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_team_invitation_permissions ON public.team_invitations;
CREATE TRIGGER trg_apply_team_invitation_permissions
AFTER UPDATE OF status, accepted_by_user_id, default_permissions
ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.apply_team_invitation_permissions();

-- 4) Apply platform permissions from deal_room_invitations when accepted
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
BEGIN
  IF NEW.status <> 'accepted' THEN
    RETURN NEW;
  END IF;

  IF NEW.accepted_by_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only run when the invited user is the one accepting
  IF auth.uid() IS NULL OR auth.uid() <> NEW.accepted_by_user_id THEN
    RETURN NEW;
  END IF;

  -- Prefer granular platform permissions if present
  perms := NEW.platform_permissions;
  IF perms IS NOT NULL AND jsonb_typeof(perms) = 'object' AND jsonb_object_length(perms) > 0 THEN
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

  -- Fallback: module list permissions
  modules := COALESCE(NEW.default_permissions, ARRAY['deal_rooms']::text[]);

  FOREACH m IN ARRAY modules
  LOOP
    INSERT INTO public.user_permissions (user_id, module, can_view, can_create, can_edit, can_delete)
    VALUES (NEW.accepted_by_user_id, m, true, true, true, false)
    ON CONFLICT (user_id, module) DO UPDATE SET
      can_view = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_deal_room_invitation_platform_permissions ON public.deal_room_invitations;
CREATE TRIGGER trg_apply_deal_room_invitation_platform_permissions
AFTER UPDATE OF status, accepted_by_user_id, platform_permissions, default_permissions
ON public.deal_room_invitations
FOR EACH ROW
EXECUTE FUNCTION public.apply_deal_room_invitation_platform_permissions();
