-- Allow public read access to AI products (this is a product catalog)
CREATE POLICY "Anyone can view active AI products"
ON public.ai_products
FOR SELECT
USING (status = 'active');

-- Allow public read access to AI providers (this is a provider catalog)
CREATE POLICY "Anyone can view approved AI providers"
ON public.ai_providers
FOR SELECT
USING (status = 'approved');