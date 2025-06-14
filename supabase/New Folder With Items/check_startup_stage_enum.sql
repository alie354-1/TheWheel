-- Check the existing startup_stage enum values
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM 
  pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
WHERE 
  t.typname = 'startup_stage'
ORDER BY 
  e.enumsortorder;
