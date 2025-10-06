-- Update remaining business_cards policies to require authentication

DROP POLICY IF EXISTS "Users can create their own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update their own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can delete their own business cards" ON public.business_cards;

-- Users can create their own business cards (authenticated only)
CREATE POLICY "Users can create their own business cards"
ON public.business_cards FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own business cards (authenticated only)
CREATE POLICY "Users can update their own business cards"
ON public.business_cards FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own business cards (authenticated only)
CREATE POLICY "Users can delete their own business cards"
ON public.business_cards FOR DELETE
TO authenticated
USING (auth.uid() = user_id);