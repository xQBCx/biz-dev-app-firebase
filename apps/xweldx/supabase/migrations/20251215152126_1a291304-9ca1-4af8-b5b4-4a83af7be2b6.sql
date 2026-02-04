-- Create department enum
CREATE TYPE public.department_type AS ENUM (
  'a_cut_shop',
  'b_bechtel',
  'f_fab',
  'n_galvanizing',
  'o_foam_fab',
  'p_constants_variable_spring_line'
);

-- Add missing columns to inspections table
ALTER TABLE public.inspections
ADD COLUMN IF NOT EXISTS duration_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS department department_type,
ADD COLUMN IF NOT EXISTS job text,
ADD COLUMN IF NOT EXISTS item text,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS inspection_type text,
ADD COLUMN IF NOT EXISTS pass_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS weld_stamp text,
ADD COLUMN IF NOT EXISTS weld_stamp_not_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS weld_stamp_none boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS part text,
ADD COLUMN IF NOT EXISTS parts_accepted integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS parts_rejected integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_inspectors text[];

-- Add comments column (alias for notes, but keeping notes for backward compatibility)
COMMENT ON COLUMN public.inspections.notes IS 'Comments/notes for the inspection';