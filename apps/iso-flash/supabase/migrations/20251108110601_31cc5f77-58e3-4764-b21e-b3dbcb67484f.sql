-- Create session_photos table to track photos and their editing workflow
CREATE TABLE public.session_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL,
  original_url TEXT NOT NULL,
  edited_url TEXT,
  editing_status TEXT NOT NULL DEFAULT 'pending_edit',
  client_approved BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_photos ENABLE ROW LEVEL SECURITY;

-- Allow session participants to view photos
CREATE POLICY "Session participants can view photos"
ON public.session_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_photos.session_id
    AND (sessions.client_id = auth.uid() OR sessions.photographer_id = auth.uid())
  )
);

-- Allow uploaders to insert photos
CREATE POLICY "Users can upload photos to their sessions"
ON public.session_photos
FOR INSERT
WITH CHECK (
  auth.uid() = uploader_id AND
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_photos.session_id
    AND (sessions.client_id = auth.uid() OR sessions.photographer_id = auth.uid())
  )
);

-- Allow photographers to update photos (add edited versions)
CREATE POLICY "Photographers can update session photos"
ON public.session_photos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_photos.session_id
    AND sessions.photographer_id = auth.uid()
  )
);

-- Allow clients to approve photos
CREATE POLICY "Clients can approve edited photos"
ON public.session_photos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_photos.session_id
    AND sessions.client_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_session_photos_session_id ON public.session_photos(session_id);
CREATE INDEX idx_session_photos_editing_status ON public.session_photos(editing_status);