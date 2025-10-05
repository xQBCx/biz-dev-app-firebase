-- Add NAICS code and SOP content to franchises table
ALTER TABLE public.franchises
ADD COLUMN IF NOT EXISTS sop_content TEXT,
ADD COLUMN IF NOT EXISTS future_ready BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS predicted_year INTEGER;