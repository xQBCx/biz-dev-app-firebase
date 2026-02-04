-- Extend existing app_role enum with grid roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'utility_ops';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'planner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dispatcher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'aggregator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'site_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'regulator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auditor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'read_only';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client_user';