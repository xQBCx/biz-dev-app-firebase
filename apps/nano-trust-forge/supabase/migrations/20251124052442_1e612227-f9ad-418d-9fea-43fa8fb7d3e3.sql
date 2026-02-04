-- Update RLS policies for folders to allow admins to manage them
DROP POLICY IF EXISTS "Folders viewable by users with access to deal" ON public.folders;

CREATE POLICY "Folders viewable by users with access to deal"
ON public.folders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.investor_access
    WHERE investor_access.deal_id = folders.deal_id
    AND investor_access.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert folders"
ON public.folders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update folders"
ON public.folders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete folders"
ON public.folders
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update RLS policies for files to allow admins to manage them
DROP POLICY IF EXISTS "Files viewable by users with access and signed NDA" ON public.files;

CREATE POLICY "Files viewable by users with access and signed NDA"
ON public.files
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.investor_access ia
    JOIN public.nda_signatures ns ON ns.user_id = ia.user_id AND ns.deal_id = ia.deal_id
    WHERE ia.deal_id = files.deal_id
    AND ia.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert files"
ON public.files
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update files"
ON public.files
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete files"
ON public.files
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);