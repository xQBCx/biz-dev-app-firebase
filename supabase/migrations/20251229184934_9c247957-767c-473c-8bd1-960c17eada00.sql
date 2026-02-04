-- Add client_id to spawned_businesses to link them to workspaces
ALTER TABLE public.spawned_businesses 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_spawned_businesses_client_id ON public.spawned_businesses(client_id);