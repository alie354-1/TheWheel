-- Fix for Sprint 5 Journey Analytics Foundation
-- This migration corrects references to journey_steps which has been replaced by journey_challenges

-- ===========================================
-- 1. CREATE TEMPORARY COMPATIBLE VIEWS
-- ===========================================

-- Create a view that maps journey_challenges to the expected structure of journey_steps
CREATE OR REPLACE VIEW journey_steps_compatibility_view AS
SELECT
  jc.id,
  jc.name,
  jc.description,
  jc.phase_id,
  jc.difficulty_level,
  jc.estimated_time_min,
  jc.estimated_time_max,
  jc.key_outcomes,
  jc.prerequisite_challenges AS prerequisite_steps,
  jc.order_index,
  jc.created_at,
  jc.updated_at,
  companies.id AS company_id,
  false AS is_custom,
  'not_started' AS status
FROM journey_challenges jc
CROSS JOIN companies
WHERE companies.id IS NOT NULL
LIMIT 1;

-- Create a compatibility view for journey_phases
CREATE OR REPLACE VIEW journey_phases_compatibility_view AS
SELECT * FROM journey_phases;

-- ===========================================
-- 2. UPDATE SCHEMA MODIFICATIONS
-- ===========================================

-- Instead of modifying journey_steps, we'll add any necessary columns to journey_challenges
ALTER TABLE journey_challenges
ADD COLUMN IF NOT EXISTS collaboration_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- ===========================================
-- 3. REVISE FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to update last_activity_at when a challenge is modified
CREATE OR REPLACE FUNCTION update_challenge_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity_at
DROP TRIGGER IF EXISTS journey_challenges_activity_trigger ON journey_challenges;
CREATE TRIGGER journey_challenges_activity_trigger
BEFORE UPDATE ON journey_challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenge_last_activity();

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
    WHEN 'journey_challenges' THEN
      entity_type := 'challenge';
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
      WHEN TG_TABLE_NAME = 'journey_challenges' OR TG_TABLE_NAME = 'journey_phases' THEN
        CASE 
          WHEN TG_OP = 'DELETE' THEN 
            (SELECT company_id FROM company_challenge_progress WHERE challenge_id = OLD.id LIMIT 1)
          ELSE 
            (SELECT company_id FROM company_challenge_progress WHERE challenge_id = NEW.id LIMIT 1)
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

-- Create triggers for journey_challenges
DROP TRIGGER IF EXISTS journey_challenges_activity_log_trigger ON journey_challenges;
CREATE TRIGGER journey_challenges_activity_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON journey_challenges
FOR EACH ROW EXECUTE FUNCTION record_journey_activity();

-- Create triggers for journey_phases
DROP TRIGGER IF EXISTS journey_phases_activity_log_trigger ON journey_phases;
CREATE TRIGGER journey_phases_activity_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON journey_phases
FOR EACH ROW EXECUTE FUNCTION record_journey_activity();

-- ===========================================
-- 4. UPDATE ANALYTICS FUNCTIONS
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
      'total_steps', COUNT(jc.id),
      'completed_steps', COUNT(jc.id) FILTER (WHERE ccp.status = 'completed'),
      'in_progress_steps', COUNT(jc.id) FILTER (WHERE ccp.status = 'in_progress'),
      'not_started_steps', COUNT(jc.id) FILTER (WHERE ccp.status = 'not_started'),
      'blocked_steps', COUNT(jc.id) FILTER (WHERE ccp.status = 'skipped'),
      'completion_percentage', 
        CASE 
          WHEN COUNT(jc.id) > 0 THEN 
            ROUND((COUNT(jc.id) FILTER (WHERE ccp.status = 'completed')::NUMERIC / COUNT(jc.id)) * 100, 2)
          ELSE 0
        END,
      'phases', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'phase_id', jp.id,
            'phase_name', jp.name,
            'total_steps', COUNT(jc_inner.id),
            'completed_steps', COUNT(jc_inner.id) FILTER (WHERE ccp_inner.status = 'completed'),
            'completion_percentage', 
              CASE 
                WHEN COUNT(jc_inner.id) > 0 THEN 
                  ROUND((COUNT(jc_inner.id) FILTER (WHERE ccp_inner.status = 'completed')::NUMERIC / COUNT(jc_inner.id)) * 100, 2)
                ELSE 0
              END
          )
        )
        FROM journey_phases jp
        LEFT JOIN journey_challenges jc_inner ON jc_inner.phase_id = jp.id
        LEFT JOIN company_challenge_progress ccp_inner ON ccp_inner.challenge_id = jc_inner.id AND ccp_inner.company_id = p_company_id
        GROUP BY jp.id, jp.name, jp.order_index
        ORDER BY jp.order_index
      )
    ) INTO result
  FROM journey_challenges jc
  LEFT JOIN company_challenge_progress ccp ON ccp.challenge_id = jc.id AND ccp.company_id = p_company_id
  WHERE (p_journey_id IS NULL OR true) -- Journey filtering would go here if implemented
  AND (p_start_date IS NULL OR jc.updated_at >= p_start_date)
  AND (p_end_date IS NULL OR jc.updated_at <= p_end_date);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 5. UPDATE THE TABLES FROM ORIGINAL MIGRATION IF NEEDED
-- ===========================================

-- Continue with rest of tables as they were, since they don't directly reference journey_steps

-- Enable RLS on tables that still need it
ALTER TABLE journey_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_analytics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for journey_analytics
CREATE POLICY journey_analytics_company_access ON journey_analytics
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM company_members WHERE company_id = journey_analytics.company_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.is_admin = true
    )
  );

-- Add other policies from the original migration that don't directly reference journey_steps
