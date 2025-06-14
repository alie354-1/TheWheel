-- Sprint 3: Add task_comments table for real-time comments and mentions (BOH-304)
-- Created: 2025-05-10

CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES domain_steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  mentions TEXT[], -- array of user IDs or usernames
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

COMMENT ON TABLE task_comments IS 'Stores comments for tasks, including @mentions and timestamps.';
