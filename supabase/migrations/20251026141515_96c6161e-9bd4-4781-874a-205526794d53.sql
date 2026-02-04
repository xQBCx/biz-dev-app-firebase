-- Create task notes table
CREATE TABLE IF NOT EXISTS public.task_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for task notes
CREATE POLICY "Users can view task notes they have access to"
ON public.task_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_notes.task_id
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create notes on their tasks"
ON public.task_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_notes.task_id
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own notes"
ON public.task_notes
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes"
ON public.task_notes
FOR DELETE
USING (user_id = auth.uid());

-- Create task attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for task attachments
CREATE POLICY "Users can view attachments on their tasks"
ON public.task_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_attachments.task_id
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create attachments on their tasks"
ON public.task_attachments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_attachments.task_id
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete attachments they created"
ON public.task_attachments
FOR DELETE
USING (user_id = auth.uid());

-- Create task subtasks table
CREATE TABLE IF NOT EXISTS public.task_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for task subtasks
CREATE POLICY "Users can view subtasks on their tasks"
ON public.task_subtasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_subtasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create subtasks on their tasks"
ON public.task_subtasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_subtasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update subtasks on their tasks"
ON public.task_subtasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_subtasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete subtasks on their tasks"
ON public.task_subtasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_subtasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Add trigger for task_notes updated_at
CREATE TRIGGER update_task_notes_updated_at
BEFORE UPDATE ON public.task_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();