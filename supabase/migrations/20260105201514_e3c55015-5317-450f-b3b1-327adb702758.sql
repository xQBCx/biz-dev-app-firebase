-- Trigger function to emit contribution event when a task is completed
CREATE OR REPLACE FUNCTION public.emit_task_contribution_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id UUID;
  v_compute_credits NUMERIC := 0;
  v_action_credits NUMERIC := 1;
  v_outcome_credits NUMERIC := 0;
  v_actor_type actor_type;
  v_actor_id UUID;
  v_event_type contribution_event_type;
BEGIN
  -- Only trigger on completion (status changed to 'completed' or completed_at set)
  IF (NEW.status = 'completed' OR NEW.completed_at IS NOT NULL) 
     AND (OLD.status != 'completed' AND OLD.completed_at IS NULL)
     AND NEW.contribution_emitted IS NOT TRUE THEN
    
    -- Determine actor type and ID
    IF NEW.linked_agent_id IS NOT NULL THEN
      v_actor_type := 'agent';
      v_actor_id := NEW.linked_agent_id;
      v_compute_credits := 1; -- Agent tasks get compute credits
    ELSE
      v_actor_type := 'human';
      v_actor_id := NEW.user_id;
    END IF;
    
    -- Determine event type based on task type
    CASE NEW.task_type
      WHEN 'human' THEN v_event_type := 'task_completed';
      WHEN 'agent' THEN v_event_type := 'agent_executed';
      WHEN 'hybrid' THEN v_event_type := 'task_completed';
      ELSE v_event_type := 'task_completed';
    END CASE;
    
    -- Calculate credits based on value category
    CASE NEW.value_category
      WHEN 'lead' THEN v_action_credits := 1; v_outcome_credits := 0.5;
      WHEN 'meeting' THEN v_action_credits := 2; v_outcome_credits := 1;
      WHEN 'proposal' THEN v_action_credits := 3; v_outcome_credits := 2;
      WHEN 'close' THEN v_action_credits := 5; v_outcome_credits := 10;
      WHEN 'ip_creation' THEN v_action_credits := 2; v_outcome_credits := 5;
      WHEN 'research' THEN v_action_credits := 1; v_outcome_credits := 0.25;
      WHEN 'outreach' THEN v_action_credits := 1; v_outcome_credits := 0.1;
      WHEN 'automation' THEN v_action_credits := 1; v_compute_credits := v_compute_credits + 0.5;
      ELSE v_action_credits := 1; v_outcome_credits := 0;
    END CASE;
    
    -- Apply estimated value weight multiplier
    IF NEW.estimated_value_weight IS NOT NULL AND NEW.estimated_value_weight > 0 THEN
      v_action_credits := v_action_credits * NEW.estimated_value_weight;
      v_outcome_credits := v_outcome_credits * NEW.estimated_value_weight;
    END IF;
    
    -- Emit the contribution event
    v_event_id := emit_contribution_event(
      p_actor_type := v_actor_type,
      p_actor_id := v_actor_id,
      p_event_type := v_event_type,
      p_event_description := 'Task completed: ' || COALESCE(NEW.subject, 'Untitled'),
      p_payload := jsonb_build_object(
        'task_id', NEW.id,
        'task_type', NEW.task_type,
        'activity_type', NEW.activity_type,
        'value_category', NEW.value_category,
        'subject', NEW.subject,
        'outcome', NEW.outcome
      ),
      p_workspace_id := NEW.client_id,
      p_opportunity_id := NEW.linked_opportunity_id,
      p_task_id := NEW.id,
      p_deal_room_id := NULL,
      p_compute_credits := v_compute_credits,
      p_action_credits := v_action_credits,
      p_outcome_credits := v_outcome_credits,
      p_attribution_tags := ARRAY[COALESCE(NEW.task_type::TEXT, 'human'), COALESCE(NEW.value_category::TEXT, 'general')],
      p_value_category := NEW.value_category
    );
    
    -- Mark as emitted
    NEW.contribution_emitted := TRUE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on crm_activities for task completion
DROP TRIGGER IF EXISTS trigger_emit_task_contribution ON crm_activities;
CREATE TRIGGER trigger_emit_task_contribution
  BEFORE UPDATE ON crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION emit_task_contribution_event();

-- Add index for querying contribution events efficiently
CREATE INDEX IF NOT EXISTS idx_contribution_events_actor 
  ON contribution_events(actor_type, actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_events_workspace 
  ON contribution_events(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_events_deal_room 
  ON contribution_events(deal_room_id, created_at DESC);

-- Add RLS policies for contribution_events if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contribution_events' AND policyname = 'Users can view their own events'
  ) THEN
    CREATE POLICY "Users can view their own events"
      ON contribution_events FOR SELECT
      USING (actor_id = auth.uid() OR actor_type = 'system');
  END IF;
END $$;