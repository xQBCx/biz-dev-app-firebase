-- Add task classification columns to crm_activities (task system)
ALTER TABLE public.crm_activities 
ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'human' CHECK (task_type IN ('human', 'agent', 'hybrid')),
ADD COLUMN IF NOT EXISTS value_category text CHECK (value_category IN ('lead', 'meeting', 'ip', 'content', 'outreach', 'deal', 'revenue', 'support', 'other')),
ADD COLUMN IF NOT EXISTS estimated_value_weight numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS assigned_agent_id uuid REFERENCES public.instincts_agents(id),
ADD COLUMN IF NOT EXISTS credit_emitted boolean DEFAULT false;

-- Create function to emit contribution event on task completion
CREATE OR REPLACE FUNCTION public.emit_task_contribution_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  compute_credits integer := 0;
  action_credits integer := 0;
  outcome_credits integer := 0;
  event_desc text;
BEGIN
  -- Only emit on status change to 'completed' and if not already emitted
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.credit_emitted = false THEN
    -- Calculate credits based on value_category
    CASE COALESCE(NEW.value_category, 'other')
      WHEN 'lead' THEN
        action_credits := 5;
        outcome_credits := 2;
      WHEN 'meeting' THEN
        action_credits := 10;
        outcome_credits := 15;
      WHEN 'deal' THEN
        action_credits := 15;
        outcome_credits := 50;
      WHEN 'revenue' THEN
        action_credits := 20;
        outcome_credits := 100;
      WHEN 'outreach' THEN
        action_credits := 3;
      WHEN 'content' THEN
        action_credits := 8;
        outcome_credits := 5;
      WHEN 'ip' THEN
        action_credits := 10;
        outcome_credits := 20;
      WHEN 'support' THEN
        action_credits := 5;
      ELSE
        action_credits := 2;
    END CASE;

    -- Apply value weight multiplier
    action_credits := ROUND(action_credits * COALESCE(NEW.estimated_value_weight, 1.0));
    outcome_credits := ROUND(outcome_credits * COALESCE(NEW.estimated_value_weight, 1.0));

    -- Add compute credits for agent tasks
    IF NEW.task_type IN ('agent', 'hybrid') THEN
      compute_credits := 5;
    END IF;

    event_desc := 'Task completed: ' || COALESCE(NEW.title, 'Untitled') || ' (' || COALESCE(NEW.value_category, 'other') || ')';

    -- Emit the contribution event
    INSERT INTO public.contribution_events (
      actor_id,
      actor_type,
      workspace_id,
      event_type,
      event_source,
      source_entity_type,
      source_entity_id,
      compute_credits,
      action_credits,
      outcome_credits,
      event_description,
      event_metadata
    ) VALUES (
      COALESCE(NEW.assigned_agent_id::text, NEW.user_id::text),
      CASE WHEN NEW.task_type = 'agent' THEN 'agent' ELSE 'human' END,
      NULL,
      'task_completed',
      'crm_activities',
      'task',
      NEW.id::text,
      compute_credits,
      action_credits,
      outcome_credits,
      event_desc,
      jsonb_build_object(
        'task_type', NEW.task_type,
        'value_category', NEW.value_category,
        'activity_type', NEW.activity_type,
        'value_weight', NEW.estimated_value_weight
      )
    );

    -- Mark as emitted
    NEW.credit_emitted := true;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for task completion
DROP TRIGGER IF EXISTS on_task_completed ON public.crm_activities;
CREATE TRIGGER on_task_completed
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.emit_task_contribution_event();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_crm_activities_task_type ON public.crm_activities(task_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_value_category ON public.crm_activities(value_category);