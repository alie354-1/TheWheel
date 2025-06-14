-- Sprint 3: Add step_status_history table for status analytics (BOH-303.3)
-- Created: 2025-05-10

CREATE TABLE IF NOT EXISTS step_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES domain_steps(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID, -- user id, nullable
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_step_status_history_step_id ON step_status_history(step_id);

COMMENT ON TABLE step_status_history IS 'Tracks status transitions for each step, including timestamps and user.';
