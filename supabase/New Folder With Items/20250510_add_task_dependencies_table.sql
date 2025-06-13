-- Sprint 3: Add task_dependencies table for task dependency/blocker support (BOH-302.1)
-- Created: 2025-05-10

CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES domain_steps(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES domain_steps(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'blocks', -- e.g., 'blocks', 'relates_to', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (task_id, depends_on_task_id, type)
);

COMMENT ON TABLE task_dependencies IS 'Tracks dependencies between tasks (e.g., blockers, related tasks) for the Business Operations Hub.';
COMMENT ON COLUMN task_dependencies.type IS 'Type of dependency: blocks, relates_to, etc.';
