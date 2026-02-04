-- Add platform feature columns to spawned_businesses
ALTER TABLE public.spawned_businesses 
ADD COLUMN IF NOT EXISTS is_platform_feature boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS feature_route text;

-- Add comment for documentation
COMMENT ON COLUMN public.spawned_businesses.is_platform_feature IS 'Indicates if this business is a built-in platform feature registered as a business';
COMMENT ON COLUMN public.spawned_businesses.feature_route IS 'The existing route path for platform features (e.g., /xcommodity)';

-- Create index for platform feature queries
CREATE INDEX IF NOT EXISTS idx_spawned_businesses_platform_feature 
ON public.spawned_businesses(is_platform_feature) 
WHERE is_platform_feature = true;