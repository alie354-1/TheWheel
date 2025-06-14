-- Migration: Journey Guide & Cross-Domain Considerations
-- Created: 2025-05-17

-- 1. Extend task_dependencies to support new dependency types
-- (If 'type' is already TEXT, just document usage. Otherwise, alter type.)
-- Types: 'blocks', 'relates_to', 'consideration', 'is_sub_task_of'
COMMENT ON COLUMN task_dependencies.type IS
  'Type of dependency: blocks (prerequisite), relates_to (informational), consideration (cross-domain prompt), is_sub_task_of (sub-task relationship)';

-- 2. Add is_activated and is_dismissed fields to domain_steps
ALTER TABLE domain_steps
  ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN domain_steps.is_activated IS
  'Indicates if this step/consideration is active for the company/domain (vs. just suggested)';
COMMENT ON COLUMN domain_steps.is_dismissed IS
  'Indicates if this step/consideration has been dismissed by the company/domain';

-- 3. Add is_activated and is_dismissed to company_journey_steps (if not present)
ALTER TABLE company_journey_steps
  ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN company_journey_steps.is_activated IS
  'Indicates if this company-specific step/consideration is active (vs. just suggested)';
COMMENT ON COLUMN company_journey_steps.is_dismissed IS
  'Indicates if this company-specific step/consideration has been dismissed';

-- 4. Example: Add new dependency types (no schema change, just usage)
-- Example usage:
-- INSERT INTO task_dependencies (task_id, depends_on_task_id, type)
-- VALUES ('step_id_get_domain_name', 'step_id_check_trademark', 'consideration');

-- 5. Example: Seed data for new fields (as comments)
-- UPDATE domain_steps SET is_activated = TRUE WHERE is_activated IS NULL;
-- UPDATE domain_steps SET is_dismissed = FALSE WHERE is_dismissed IS NULL;
-- UPDATE company_journey_steps SET is_activated = TRUE WHERE is_activated IS NULL;
-- UPDATE company_journey_steps SET is_dismissed = FALSE WHERE is_dismissed IS NULL;

-- 6. (Optional) Add indexes for new fields if needed for performance
-- CREATE INDEX IF NOT EXISTS idx_domain_steps_is_activated ON domain_steps(is_activated);
-- CREATE INDEX IF NOT EXISTS idx_domain_steps_is_dismissed ON domain_steps(is_dismissed);
-- CREATE INDEX IF NOT EXISTS idx_company_journey_steps_is_activated ON company_journey_steps(is_activated);
-- CREATE INDEX IF NOT EXISTS idx_company_journey_steps_is_dismissed ON company_journey_steps(is_dismissed);

-- 7. (Optional) Add check constraints for type values if you want to enforce allowed types
-- ALTER TABLE task_dependencies
--   ADD CONSTRAINT task_dependencies_type_check
--   CHECK (type IN ('blocks', 'relates_to', 'consideration', 'is_sub_task_of'));

-- End of migration
