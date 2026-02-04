-- Enhanced Business Cards Security: Protect sensitive contact information

-- Drop all existing SELECT policies to start fresh
DROP POLICY IF EXISTS "Users can view their own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Authenticated users can view public business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Admins can view all business cards" ON public.business_cards;

-- Policy 1: Users can view their own cards with full details
CREATE POLICY "Users can view their own business cards"
ON public.business_cards FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins can view all cards
CREATE POLICY "Admins can view all business cards"
ON public.business_cards FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Important Security Note:
-- We've removed the policy that allowed all authenticated users to view other users' cards.
-- If you need to share business cards, implement one of these solutions in your application:
-- 1. Create a public_business_cards view with only non-sensitive fields (card_name, company_name, title)
-- 2. Implement a card_sharing table where users explicitly grant access
-- 3. Create a temporary share link feature with expiring tokens
-- 
-- For now, business cards are private by default, which is the most secure approach.