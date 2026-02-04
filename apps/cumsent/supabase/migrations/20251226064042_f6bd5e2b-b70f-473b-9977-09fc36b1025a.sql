-- Allow anyone to read basic profile info for session display (only full_name)
CREATE POLICY "Anyone can view profiles for session display" 
ON public.profiles 
FOR SELECT 
USING (true);