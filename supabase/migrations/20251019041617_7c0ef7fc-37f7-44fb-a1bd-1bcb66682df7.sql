-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS on_access_request_created ON public.access_requests;
DROP FUNCTION IF EXISTS public.notify_access_request();

-- Create updated function to notify about new access requests
CREATE OR REPLACE FUNCTION public.notify_access_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID from profiles
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'bill@bdsrvs.com'
  LIMIT 1;

  -- Insert notification into communications table
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.communications (
      user_id,
      communication_type,
      subject,
      body,
      status
    ) VALUES (
      admin_user_id,
      'notification',
      'New Access Request from ' || NEW.full_name,
      'A new access request has been submitted:

Name: ' || NEW.full_name || '
Email: ' || NEW.email || '
Company: ' || COALESCE(NEW.company, 'N/A') || '
Reason: ' || COALESCE(NEW.reason, 'N/A') || '

Please review this request in the Admin Panel.',
      'completed'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_access_request_created
  AFTER INSERT ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_access_request();