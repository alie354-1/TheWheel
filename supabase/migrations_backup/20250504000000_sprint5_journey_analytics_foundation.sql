-- Migration for Sprint 5: Journey Analytics and Collaboration Foundation
-- Creates the necessary tables and schema updates for advanced journey analytics,
-- personalization, and collaboration features.

-- ===========================================
-- 1. JOURNEY ANALYTICS TABLES
-- ===========================================

-- Table to store analytics data for journey steps and phases
CREATE TABLE IF NOT EXISTS journey_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('step', 'phase', 'journey')),
  entity_id UUID NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metric_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS journey_analytics_company_id_idx ON journey_analytics(company_id);
CREATE INDEX IF NOT EXISTS journey_analytics_entity_idx ON journey_analytics(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS journey_analytics_metric_type_idx ON journey_analytics(metric_type);

COMMENT ON TABLE journey_analytics IS 'Stores analytics data for journey steps, phases, and overall journeys';

-- Table to store pre-calculated aggregations for performance
CREATE TABLE IF NOT EXISTS journey_analytics_aggregations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  aggregation_key VARCHAR(100) NOT NULL,
  aggregation_type VARCHAR(50) NOT NULL,
  aggregation_period VARCHAR(20) CHECK (aggregation_period IN ('day', 'week', 'month', 'quarter', 'year', 'all')),
  aggregation_data JSONB NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS journey_analytics_aggregations_unique_idx ON 
  journey_analytics_aggregations(company_id, aggregation_key, aggregation_type, 
  COALESCE(aggregation_period, 'all'), COALESCE(start_date, '1970-01-01'::DATE), COALESCE(end_date, '2999-12-31'::DATE));

COMMENT ON TABLE journey_analytics_aggregations IS 'Stores pre-calculated aggregations for journey analytics to improve performance';

-- ===========================================
-- 2. USER PREFERENCES TABLES
-- ===========================================

-- Table to store user preferences for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_unique_idx ON user_preferences(user_id, preference_key);
CREATE INDEX IF NOT EXISTS user_preferences_key_idx ON user_preferences(preference_key);

COMMENT ON TABLE user_preferences IS 'Stores user preferences for UI personalization and feature customization';

-- Company-specific preferences table
CREATE TABLE IF NOT EXISTS company_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS company_preferences_unique_idx ON company_preferences(company_id, preference_key);

COMMENT ON TABLE company_preferences IS 'Stores company-level preferences for journey customization';

-- ===========================================
-- 3. COLLABORATION TABLES
-- ===========================================

-- Table to store team assignments
CREATE TABLE IF NOT EXISTS team_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('step', 'phase', 'task')),
  entity_id UUID NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  due_date TIMESTAMPTZ,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS team_assignments_company_id_idx ON team_assignments(company_id);
CREATE INDEX IF NOT EXISTS team_assignments_entity_idx ON team_assignments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS team_assignments_assigned_to_idx ON team_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS team_assignments_status_idx ON team_assignments(status);

COMMENT ON TABLE team_assignments IS 'Tracks assignment of journey steps and tasks to team members';

-- Table to store collaborative notes and comments
CREATE TABLE IF NOT EXISTS collaborative_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('step', 'phase', 'journey', 'tool')),
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  parent_note_id UUID REFERENCES collaborative_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS collaborative_notes_company_id_idx ON collaborative_notes(company_id);
CREATE INDEX IF NOT EXISTS collaborative_notes_entity_idx ON collaborative_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS collaborative_notes_user_id_idx ON collaborative_notes(user_id);
CREATE INDEX IF NOT EXISTS collaborative_notes_parent_idx ON collaborative_notes(parent_note_id);

COMMENT ON TABLE collaborative_notes IS 'Stores collaborative notes and comments for journey entities';

-- Table to track activities for the activity feed
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_logs_company_id_idx ON activity_logs(company_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_activity_type_idx ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS activity_logs_entity_idx ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at);

COMMENT ON TABLE activity_logs IS 'Tracks user activities for the activity feed and notifications';

-- ===========================================
-- 4. SCHEMA UPDATES TO EXISTING TABLES
-- ===========================================

-- Add collaboration fields to journey_steps
ALTER TABLE journey_steps
ADD COLUMN IF NOT EXISTS collaboration_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Add personalization fields to companies
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS personalization_settings JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS journey_customizations JSONB DEFAULT '{}'::JSONB;

-- ===========================================
-- 5. FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to update last_activity_at when a step is modified
CREATE OR REPLACE FUNCTION update_step_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity_at
DROP TRIGGER IF EXISTS journey_steps_activity_trigger ON journey_steps;
CREATE TRIGGER journey_steps_activity_trigger
BEFORE UPDATE ON journey_steps
FOR EACH ROW
EXECUTE FUNCTION update_step_last_activity();

-- Function to record activities in activity_logs
CREATE OR REPLACE FUNCTION record_journey_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_type VARCHAR;
  entity_type VARCHAR;
  metadata_json JSONB;
BEGIN
  -- Determine activity type
  IF TG_OP = 'INSERT' THEN
    activity_type := 'create_' || TG_TABLE_NAME;
  ELSIF TG_OP = 'UPDATE' THEN
    activity_type := 'update_' || TG_TABLE_NAME;
  ELSIF TG_OP = 'DELETE' THEN
    activity_type := 'delete_' || TG_TABLE_NAME;
  END IF;
  
  -- Determine entity type based on table
  CASE TG_TABLE_NAME
    WHEN 'journey_steps' THEN
      entity_type := 'step';
    WHEN 'journey_phases' THEN
      entity_type := 'phase';
    WHEN 'team_assignments' THEN
      entity_type := 'assignment';
    WHEN 'collaborative_notes' THEN
      entity_type := 'note';
    ELSE
      entity_type := TG_TABLE_NAME;
  END CASE;
  
  -- Create metadata JSON based on operation
  IF TG_OP = 'INSERT' THEN
    metadata_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    metadata_json := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key <> to_jsonb(OLD) -> key
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    metadata_json := to_jsonb(OLD);
  END IF;
  
  -- Insert activity log
  INSERT INTO activity_logs (
    company_id,
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    CASE 
      WHEN TG_TABLE_NAME = 'journey_steps' OR TG_TABLE_NAME = 'journey_phases' THEN
        CASE 
          WHEN TG_OP = 'DELETE' THEN OLD.company_id
          ELSE NEW.company_id
        END
      ELSE
        CASE 
          WHEN TG_OP = 'DELETE' THEN OLD.company_id
          ELSE NEW.company_id
        END
    END,
    current_setting('request.jwt.claims', true)::jsonb->>'sub'::text,
    activity_type,
    entity_type,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    metadata_json
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for journey_steps
DROP TRIGGER IF EXISTS journey_steps_activity_log_trigger ON journey_steps;
CREATE TRIGGER journey_steps_activity_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON journey_steps
FOR EACH ROW EXECUTE FUNCTION record_journey_activity();

-- Create triggers for journey_phases
DROP TRIGGER IF EXISTS journey_phases_activity_log_trigger ON journey_phases;
CREATE TRIGGER journey_phases_activity_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON journey_phases
FOR EACH ROW EXECUTE FUNCTION record_journey_activity();

-- Create triggers for team_assignments
DROP TRIGGER IF EXISTS team_assignments_activity_log_trigger ON team_assignments;
CREATE TRIGGER team_assignments_activity_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON team_assignments
FOR EACH ROW EXECUTE FUNCTION record_journey_activity();

-- Create triggers for collaborative_notes
DROP TRIGGER IF EXISTS collaborative_notes_activity_log_trigger ON collaborative_notes;
CREATE TRIGGER collaborative_notes_activity_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON collaborative_notes
FOR EACH ROW EXECUTE FUNCTION record_journey_activity();

-- ===========================================
-- 6. RLS POLICIES
-- ===========================================

-- Enable RLS on new tables
ALTER TABLE journey_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_analytics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for journey_analytics
CREATE POLICY journey_analytics_company_access ON journey_analytics
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM company_members WHERE company_id = journey_analytics.company_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- Create policies for journey_analytics_aggregations
CREATE POLICY journey_analytics_aggregations_company_access ON journey_analytics_aggregations
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM company_members WHERE company_id = journey_analytics_aggregations.company_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- Create policies for user_preferences
CREATE POLICY user_preferences_owner_access ON user_preferences
  FOR ALL USING (
    auth.uid() = user_preferences.user_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- Create policies for company_preferences
CREATE POLICY company_preferences_company_access ON company_preferences
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM company_members WHERE company_id = company_preferences.company_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- Create policies for team_assignments
CREATE POLICY team_assignments_company_access ON team_assignments
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM company_members WHERE company_id = team_assignments.company_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- Create policies for collaborative_notes
CREATE POLICY collaborative_notes_company_access ON collaborative_notes
  FOR ALL USING (
    (NOT is_private AND auth.uid() IN (
      SELECT user_id FROM company_members WHERE company_id = collaborative_notes.company_id
    )) OR
    (is_private AND auth.uid() = collaborative_notes.user_id) OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- Create policies for activity_logs
CREATE POLICY activity_logs_company_access ON activity_logs
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM company_members WHERE company_id = activity_logs.company_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- ===========================================
-- 7. FUNCTIONS FOR ANALYTICS
-- ===========================================

-- Function to get journey progress statistics
CREATE OR REPLACE FUNCTION get_journey_progress_stats(
  p_company_id UUID,
  p_journey_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'total_steps', COUNT(js.id),
      'completed_steps', COUNT(js.id) FILTER (WHERE js.status = 'completed'),
      'in_progress_steps', COUNT(js.id) FILTER (WHERE js.status = 'in_progress'),
      'not_started_steps', COUNT(js.id) FILTER (WHERE js.status = 'not_started'),
      'blocked_steps', COUNT(js.id) FILTER (WHERE js.status = 'blocked'),
      'completion_percentage', 
        CASE 
          WHEN COUNT(js.id) > 0 THEN 
            ROUND((COUNT(js.id) FILTER (WHERE js.status = 'completed')::NUMERIC / COUNT(js.id)) * 100, 2)
          ELSE 0
        END,
      'phases', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'phase_id', jp.id,
            'phase_name', jp.name,
            'total_steps', COUNT(js_inner.id),
            'completed_steps', COUNT(js_inner.id) FILTER (WHERE js_inner.status = 'completed'),
            'completion_percentage', 
              CASE 
                WHEN COUNT(js_inner.id) > 0 THEN 
                  ROUND((COUNT(js_inner.id) FILTER (WHERE js_inner.status = 'completed')::NUMERIC / COUNT(js_inner.id)) * 100, 2)
                ELSE 0
              END
          )
        )
        FROM journey_phases jp
        LEFT JOIN journey_steps js_inner ON js_inner.phase_id = jp.id
        WHERE jp.company_id = p_company_id
        GROUP BY jp.id, jp.name, jp.order
        ORDER BY jp.order
      )
    ) INTO result
  FROM journey_steps js
  WHERE js.company_id = p_company_id
  AND (p_journey_id IS NULL OR js.journey_id = p_journey_id)
  AND (p_start_date IS NULL OR js.updated_at >= p_start_date)
  AND (p_end_date IS NULL OR js.updated_at <= p_end_date);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team assignments statistics
CREATE OR REPLACE FUNCTION get_team_assignments_stats(
  p_company_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'total_assignments', COUNT(ta.id),
      'pending_assignments', COUNT(ta.id) FILTER (WHERE ta.status = 'pending'),
      'in_progress_assignments', COUNT(ta.id) FILTER (WHERE ta.status = 'in_progress'),
      'completed_assignments', COUNT(ta.id) FILTER (WHERE ta.status = 'completed'),
      'blocked_assignments', COUNT(ta.id) FILTER (WHERE ta.status = 'blocked'),
      'users', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'user_id', u.id,
            'user_name', u.raw_user_meta_data->>'full_name',
            'total_assignments', COUNT(ta_inner.id),
            'completed_assignments', COUNT(ta_inner.id) FILTER (WHERE ta_inner.status = 'completed'),
            'completion_percentage', 
              CASE 
                WHEN COUNT(ta_inner.id) > 0 THEN 
                  ROUND((COUNT(ta_inner.id) FILTER (WHERE ta_inner.status = 'completed')::NUMERIC / COUNT(ta_inner.id)) * 100, 2)
                ELSE 0
              END
          )
        )
        FROM auth.users u
        LEFT JOIN team_assignments ta_inner ON ta_inner.assigned_to = u.id AND ta_inner.company_id = p_company_id
        JOIN company_members cm ON cm.user_id = u.id AND cm.company_id = p_company_id
        GROUP BY u.id, u.raw_user_meta_data->>'full_name'
      )
    ) INTO result
  FROM team_assignments ta
  WHERE ta.company_id = p_company_id
  AND (p_user_id IS NULL OR ta.assigned_to = p_user_id);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
