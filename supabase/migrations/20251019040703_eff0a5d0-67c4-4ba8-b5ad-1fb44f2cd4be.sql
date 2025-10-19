
-- Create a function to notify about new access requests
CREATE OR REPLACE FUNCTION public.notify_access_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function via pg_net (handled by Supabase)
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-access-request',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'access_requests',
      'record', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger to call the function on new access requests
DROP TRIGGER IF EXISTS on_access_request_created ON public.access_requests;
CREATE TRIGGER on_access_request_created
  AFTER INSERT ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_access_request();
