-- Create storage bucket for data room files
INSERT INTO storage.buckets (id, name, public)
VALUES ('data-room', 'data-room', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for data room files
CREATE POLICY "Authenticated users can view their accessible files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'data-room' AND
  EXISTS (
    SELECT 1 FROM public.files f
    JOIN public.investor_access ia ON ia.deal_id = f.deal_id
    WHERE f.storage_path = storage.objects.name
    AND ia.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'data-room' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'data-room' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);