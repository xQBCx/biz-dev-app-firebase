-- Update foreign key references from tasks to crm_activities
-- First, drop the existing policies that reference tasks table
DROP POLICY IF EXISTS "Users can view task notes they have access to" ON public.task_notes;
DROP POLICY IF EXISTS "Users can create notes on their tasks" ON public.task_notes;
DROP POLICY IF EXISTS "Users can view attachments on their tasks" ON public.task_attachments;
DROP POLICY IF EXISTS "Users can create attachments on their tasks" ON public.task_attachments;
DROP POLICY IF EXISTS "Users can delete attachments they created" ON public.task_attachments;
DROP POLICY IF EXISTS "Users can view subtasks on their tasks" ON public.task_subtasks;
DROP POLICY IF EXISTS "Users can create subtasks on their tasks" ON public.task_subtasks;
DROP POLICY IF EXISTS "Users can update subtasks on their tasks" ON public.task_subtasks;
DROP POLICY IF EXISTS "Users can delete subtasks on their tasks" ON public.task_subtasks;

-- Rename task_id column to activity_id in all tables
ALTER TABLE public.task_notes RENAME COLUMN task_id TO activity_id;
ALTER TABLE public.task_attachments RENAME COLUMN task_id TO activity_id;
ALTER TABLE public.task_subtasks RENAME COLUMN task_id TO activity_id;

-- Recreate policies with correct references to crm_activities
CREATE POLICY "Users can view activity notes they have access to"
ON public.task_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_notes.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create notes on their activities"
ON public.task_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_notes.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view attachments on their activities"
ON public.task_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_attachments.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create attachments on their activities"
ON public.task_attachments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_attachments.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete attachments they created"
ON public.task_attachments
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Users can view subtasks on their activities"
ON public.task_subtasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_subtasks.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create subtasks on their activities"
ON public.task_subtasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_subtasks.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update subtasks on their activities"
ON public.task_subtasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_subtasks.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete subtasks on their activities"
ON public.task_subtasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.crm_activities
    WHERE crm_activities.id = task_subtasks.activity_id
    AND crm_activities.user_id = auth.uid()
  )
);