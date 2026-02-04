-- Add white_paper and module_white_papers to the platform_module enum
ALTER TYPE platform_module ADD VALUE IF NOT EXISTS 'white_paper';
ALTER TYPE platform_module ADD VALUE IF NOT EXISTS 'module_white_papers';