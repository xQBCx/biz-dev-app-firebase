-- Add missing platform modules used by the frontend permission system
-- (Required so admins can grant Deal Rooms and XCommodity access without enum errors)

ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'deal_rooms';
ALTER TYPE public.platform_module ADD VALUE IF NOT EXISTS 'xcommodity';
