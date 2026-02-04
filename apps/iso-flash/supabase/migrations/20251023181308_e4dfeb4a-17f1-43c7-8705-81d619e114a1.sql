-- Enable realtime for sessions table so photographers get instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;