-- Sprint 3: Add parent_task_id to domain_steps for subtask hierarchy (BOH-301.1)
-- Created: 2025-05-10

ALTER TABLE domain_steps
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES domain_steps(id) ON DELETE SET NULL;

COMMENT ON COLUMN domain_steps.parent_task_id IS 'Self-referencing FK for subtask hierarchy. Null = top-level task.';

CREATE INDEX IF NOT EXISTS idx_domain_steps_parent_task_id ON domain_steps(parent_task_id);
