-- Storage bucket for inspection media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-media', 
  'inspection-media', 
  false, 
  104857600, -- 100MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
);

-- Storage policies
CREATE POLICY "Users can upload their own inspection media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own inspection media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Executives can view all inspection media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-media' 
  AND has_role(auth.uid(), 'executive'::app_role)
);

CREATE POLICY "Users can delete their own inspection media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspection-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Subscription tiers enum
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  storage_limit_mb INTEGER NOT NULL DEFAULT 500, -- Free tier: 500MB
  storage_used_mb NUMERIC NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Storage usage log for tracking
CREATE TABLE public.storage_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  action TEXT NOT NULL, -- 'upload' or 'delete'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage_log ENABLE ROW LEVEL SECURITY;

-- Subscription policies
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions"
ON public.user_subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage log policies
CREATE POLICY "Users can view own storage log"
ON public.storage_usage_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert storage logs"
ON public.storage_usage_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create subscription for new users
CREATE OR REPLACE FUNCTION public.create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier, storage_limit_mb)
  VALUES (NEW.id, 'free', 500);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_subscription();

-- Update timestamp trigger
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();