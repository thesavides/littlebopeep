-- Migration: Add 'dead' as a valid condition for sheep reports
-- This updates the CHECK constraint on the sheep_reports table to allow 'dead' condition

-- Drop the old constraint (if it exists) and add a new one that includes 'dead'
DO $$
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- Find the existing check constraint on the condition column
  SELECT tc.constraint_name INTO constraint_name_var
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
  WHERE tc.table_name = 'sheep_reports'
    AND tc.constraint_type = 'CHECK'
    AND ccu.column_name = 'condition'
  LIMIT 1;

  -- Drop it if found
  IF constraint_name_var IS NOT NULL THEN
    EXECUTE 'ALTER TABLE sheep_reports DROP CONSTRAINT ' || quote_ident(constraint_name_var);
  END IF;
END $$;

-- Add updated constraint allowing 'dead' as a valid condition
ALTER TABLE sheep_reports
  ADD CONSTRAINT sheep_reports_condition_check
  CHECK (condition IN ('healthy', 'injured', 'dead', 'unknown'));
