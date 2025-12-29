-- Create a function to auto-create a client workspace when a business is spawned
CREATE OR REPLACE FUNCTION public.create_workspace_for_business()
RETURNS TRIGGER AS $$
DECLARE
  new_client_id UUID;
BEGIN
  -- Create a new client (workspace) for this business
  INSERT INTO public.clients (
    name,
    domain,
    industry,
    user_id,
    is_active
  ) VALUES (
    NEW.business_name,
    LOWER(REPLACE(NEW.business_name, ' ', '-')),
    NEW.industry,
    NEW.user_id,
    true
  )
  RETURNING id INTO new_client_id;
  
  -- Link the business to the new client workspace
  NEW.client_id := new_client_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create workspace on business spawn
DROP TRIGGER IF EXISTS trigger_create_workspace_for_business ON public.spawned_businesses;
CREATE TRIGGER trigger_create_workspace_for_business
  BEFORE INSERT ON public.spawned_businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_workspace_for_business();