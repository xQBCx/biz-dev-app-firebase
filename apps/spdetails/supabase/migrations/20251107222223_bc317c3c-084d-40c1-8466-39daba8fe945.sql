-- First migration: Add new enum values
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'partner';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'staff';