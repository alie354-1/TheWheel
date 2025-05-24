-- Sprint 4: Collaborative Journey Features
-- Created: May 4, 2025

-- Note: pgvector extension is temporarily commented out as it requires installation on the PostgreSQL server
-- CREATE EXTENSION IF NOT EXISTS "pgvector";

-- 1. Collaboration Database Tables

-- Table: step_comments
-- For storing comment threads on journey steps
CREATE TABLE IF NOT EXISTS step_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES step_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB,
  mentioned_users UUID[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookup of comments by step
CREATE INDEX IF NOT EXISTS step_comments_step_id_idx ON step_comments(step_id);
-- Index for finding comments by company
CREATE INDEX IF NOT EXISTS step_comments_company_id_idx ON step_comments(company_id);
-- Index for finding replies to a comment
CREATE INDEX IF NOT EXISTS step_comments_parent_comment_id_idx ON step_comments(parent_comment_id);

-- Table: user_presence
-- For tracking active users on steps
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'step', 'phase', etc.
  resource_id UUID NOT NULL,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_metadata JSONB DEFAULT '{}'::JSONB,
  UNIQUE(user_id, resource_type, resource_id)
);

-- Index for faster presence lookup
CREATE INDEX IF NOT EXISTS user_presence_resource_idx ON user_presence(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS user_presence_company_id_idx ON user_presence(company_id);

-- Table: activity_events
-- For logging journey activities
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'comment_added', 'step_updated', 'step_completed', etc.
  resource_type TEXT NOT NULL, -- 'step', 'phase', 'comment', etc.
  resource_id UUID NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster activity lookup by company
CREATE INDEX IF NOT EXISTS activity_events_company_id_idx ON activity_events(company_id);
-- Index for time-based queries
CREATE INDEX IF NOT EXISTS activity_events_created_at_idx ON activity_events(created_at DESC);
-- Index for resource-specific activities
CREATE INDEX IF NOT EXISTS activity_events_resource_idx ON activity_events(resource_type, resource_id);

-- Table: team_progress
-- For aggregating team metrics
CREATE TABLE IF NOT EXISTS team_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES journey_phases(id) ON DELETE CASCADE,
  step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE,
  total_users INT NOT NULL DEFAULT 0,
  completed_users INT NOT NULL DEFAULT 0,
  in_progress_users INT NOT NULL DEFAULT 0,
  not_started_users INT NOT NULL DEFAULT 0,
  skipped_users INT NOT NULL DEFAULT 0,
  average_time_spent_seconds INT,
  completion_rate FLOAT,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, step_id)
);

-- Index for faster progress lookup
CREATE INDEX IF NOT EXISTS team_progress_company_id_idx ON team_progress(company_id);
CREATE INDEX IF NOT EXISTS team_progress_phase_id_idx ON team_progress(phase_id);

-- NOTE: The following function and trigger have been commented out due to schema discrepancies
-- We need to first inspect the actual columns in company_journey_steps table
/*
-- Function to update team progress statistics
CREATE OR REPLACE FUNCTION update_team_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: This needs to be customized based on your actual schema
  INSERT INTO team_progress (
    company_id, step_id, phase_id,
    total_users, completed_users, in_progress_users, not_started_users, skipped_users,
    last_calculated_at
  )
  SELECT 
    c.company_id, c.step_id, s.phase_id,
    COUNT(c.*) AS total_users,
    COUNT(c.*) FILTER (WHERE c.status_column = 'completed') AS completed_users,
    COUNT(c.*) FILTER (WHERE c.status_column = 'in_progress') AS in_progress_users,
    COUNT(c.*) FILTER (WHERE c.status_column = 'not_started') AS not_started_users,
    COUNT(c.*) FILTER (WHERE c.status_column = 'skipped') AS skipped_users,
    NOW() AS last_calculated_at
  FROM company_journey_steps c
  JOIN journey_steps s ON c.step_id = s.id
  WHERE c.company_id = NEW.company_id AND c.step_id = NEW.step_id
  GROUP BY c.company_id, c.step_id, s.phase_id
  ON CONFLICT (company_id, step_id) 
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    completed_users = EXCLUDED.completed_users,
    in_progress_users = EXCLUDED.in_progress_users,
    not_started_users = EXCLUDED.not_started_users,
    skipped_users = EXCLUDED.skipped_users,
    completion_rate = CASE 
      WHEN EXCLUDED.total_users > 0 THEN EXCLUDED.completed_users::FLOAT / EXCLUDED.total_users 
      ELSE 0 
    END,
    last_calculated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger definition would go here once we confirm the correct column name
-- CREATE TRIGGER update_team_progress_trigger
-- AFTER INSERT OR UPDATE OF status_column ON company_journey_steps
-- FOR EACH ROW
-- EXECUTE FUNCTION update_team_progress();
*/

-- Placeholder function to prevent reference errors
CREATE OR REPLACE FUNCTION update_team_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple placeholder that just returns NEW without changes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE step_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress ENABLE ROW LEVEL SECURITY;

-- Simplified policies that don't depend on company_access table
-- These should be updated later once the company_access table is confirmed

-- Policy for step_comments
CREATE POLICY step_comments_basic_access ON step_comments
  FOR ALL USING (TRUE);

-- Policy for user_presence
CREATE POLICY user_presence_basic_access ON user_presence
  FOR ALL USING (TRUE);

-- Policy for activity_events
CREATE POLICY activity_events_basic_access ON activity_events
  FOR ALL USING (TRUE);

-- Policy for team_progress
CREATE POLICY team_progress_basic_access ON team_progress
  FOR ALL USING (TRUE);

-- Create a function to record activity events
CREATE OR REPLACE FUNCTION record_activity_event(
  p_company_id UUID,
  p_user_id UUID,
  p_event_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_event_data JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_events(
    company_id, user_id, event_type, resource_type, resource_id, event_data
  ) VALUES (
    p_company_id, p_user_id, p_event_type, p_resource_type, p_resource_id, p_event_data
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_company_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_client_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_presence(
    user_id, company_id, resource_type, resource_id, last_active_at, client_metadata
  ) VALUES (
    p_user_id, p_company_id, p_resource_type, p_resource_id, NOW(), p_client_metadata
  )
  ON CONFLICT (user_id, resource_type, resource_id)
  DO UPDATE SET
    last_active_at = NOW(),
    client_metadata = p_client_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to clean up stale presence data
CREATE OR REPLACE FUNCTION cleanup_stale_presence(p_minutes_threshold INT DEFAULT 10)
RETURNS INT AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM user_presence
  WHERE last_active_at < NOW() - (p_minutes_threshold * INTERVAL '1 minute')
  RETURNING COUNT(*) INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
