-- Sprint 3: Add assigned_to and assigned_team to domain_steps for task assignment (BOH-305)
-- Created: 2025-05-10

ALTER TABLE domain_steps
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_team UUID; -- FK to teams table if teams are supported

COMMENT ON COLUMN domain_steps.assigned_to IS 'User ID assigned to this task';
COMMENT ON COLUMN domain_steps.assigned_team IS 'Team ID assigned to this task (optional)';
