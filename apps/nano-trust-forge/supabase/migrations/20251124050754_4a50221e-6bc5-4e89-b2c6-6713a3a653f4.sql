-- Update RLS policy for tlds table to allow public viewing of TLD strategy
DROP POLICY IF EXISTS "TLDs viewable by authenticated users" ON public.tlds;

CREATE POLICY "TLDs viewable by everyone"
ON public.tlds
FOR SELECT
USING (true);

-- Keep domains private (authenticated only) as they're for the data room
-- Narratives are already public, no change needed