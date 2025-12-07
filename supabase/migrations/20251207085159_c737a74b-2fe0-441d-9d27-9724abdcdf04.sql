-- Enable required extensions for cron and HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a queue table for embedding computation jobs
CREATE TABLE IF NOT EXISTS public.instincts_embedding_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  queued_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  error_message text
);

-- Create index for efficient queue processing
CREATE INDEX idx_instincts_embedding_queue_status ON public.instincts_embedding_queue(status, queued_at);
CREATE INDEX idx_instincts_embedding_queue_user ON public.instincts_embedding_queue(user_id);

-- Enable RLS
ALTER TABLE public.instincts_embedding_queue ENABLE ROW LEVEL SECURITY;

-- Only system can access queue (via service role)
CREATE POLICY "Service role only" ON public.instincts_embedding_queue
  FOR ALL USING (false);

-- Create function to queue embedding computation after events
CREATE OR REPLACE FUNCTION public.queue_embedding_computation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only queue if user doesn't already have a pending job in the last 5 minutes
  -- This prevents queue flooding from rapid events
  INSERT INTO instincts_embedding_queue (user_id)
  SELECT NEW.user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM instincts_embedding_queue
    WHERE user_id = NEW.user_id
    AND status = 'pending'
    AND queued_at > now() - interval '5 minutes'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to queue embedding computation after new events
DROP TRIGGER IF EXISTS trigger_queue_embedding ON public.instincts_events;
CREATE TRIGGER trigger_queue_embedding
  AFTER INSERT ON public.instincts_events
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_embedding_computation();

-- Create function to mark queue items as processing
CREATE OR REPLACE FUNCTION public.claim_embedding_jobs(batch_size integer DEFAULT 10)
RETURNS SETOF instincts_embedding_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE instincts_embedding_queue
  SET status = 'processing', processed_at = now()
  WHERE id IN (
    SELECT id FROM instincts_embedding_queue
    WHERE status = 'pending'
    ORDER BY queued_at
    LIMIT batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

-- Create function to complete a job
CREATE OR REPLACE FUNCTION public.complete_embedding_job(job_id uuid, success boolean, error text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE instincts_embedding_queue
  SET 
    status = CASE WHEN success THEN 'completed' ELSE 'failed' END,
    error_message = error,
    processed_at = now()
  WHERE id = job_id;
END;
$$;