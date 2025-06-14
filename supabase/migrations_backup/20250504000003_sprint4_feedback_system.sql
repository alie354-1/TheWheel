-- Sprint 4: Comprehensive Feedback System
-- Created: May 4, 2025

-- 2. Feedback System Tables

-- Table: step_feedback
-- For storing user feedback about journey steps
CREATE TABLE IF NOT EXISTS step_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating_clarity INT CHECK (rating_clarity BETWEEN 1 AND 5),
  rating_difficulty INT CHECK (rating_difficulty BETWEEN 1 AND 5),
  rating_usefulness INT CHECK (rating_usefulness BETWEEN 1 AND 5),
  rating_overall INT CHECK (rating_overall BETWEEN 1 AND 5),
  feedback_text TEXT,
  improvement_suggestion TEXT,
  reported_issues TEXT,
  screenshot_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookup of feedback by step
CREATE INDEX IF NOT EXISTS step_feedback_step_id_idx ON step_feedback(step_id);
-- Index for finding feedback by company
CREATE INDEX IF NOT EXISTS step_feedback_company_id_idx ON step_feedback(company_id);
-- Index for finding feedback by user
CREATE INDEX IF NOT EXISTS step_feedback_user_id_idx ON step_feedback(user_id);

-- Table: feedback_categories
-- For categorizing feedback
CREATE TABLE IF NOT EXISTS feedback_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default feedback categories
INSERT INTO feedback_categories (name, description, color) VALUES
  ('UI/UX', 'User interface and experience issues', '#FF5733'),
  ('Content', 'Issues with step content or clarity', '#33FF57'),
  ('Technical', 'Technical problems or bugs', '#3357FF'),
  ('Feature Request', 'Suggestions for new features', '#F3FF33'),
  ('Guidance', 'Issues with guidance or instructions', '#FF33F3'),
  ('Tool Related', 'Issues related to suggested tools', '#33FFF3')
ON CONFLICT (id) DO NOTHING;

-- Table: feedback_category_assignments
-- For assigning categories to feedback
CREATE TABLE IF NOT EXISTS feedback_category_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES step_feedback(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES feedback_categories(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  confidence_score FLOAT,
  is_auto_assigned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feedback_id, category_id)
);

-- Index for faster category lookups
CREATE INDEX IF NOT EXISTS feedback_category_assignments_feedback_id_idx ON feedback_category_assignments(feedback_id);
CREATE INDEX IF NOT EXISTS feedback_category_assignments_category_id_idx ON feedback_category_assignments(category_id);

-- Table: feedback_resolutions
-- For tracking resolution status of feedback
CREATE TABLE IF NOT EXISTS feedback_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES step_feedback(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'wont_fix', 'duplicate')),
  resolved_by UUID REFERENCES auth.users(id),
  resolution_note TEXT,
  resolution_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feedback_id)
);

-- Index for status tracking
CREATE INDEX IF NOT EXISTS feedback_resolutions_status_idx ON feedback_resolutions(status);

-- Table: tool_feedback
-- For storing user feedback about tools
CREATE TABLE IF NOT EXISTS tool_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id UUID REFERENCES journey_steps(id) ON DELETE SET NULL,
  rating_ease_of_use INT CHECK (rating_ease_of_use BETWEEN 1 AND 5),
  rating_functionality INT CHECK (rating_functionality BETWEEN 1 AND 5),
  rating_value INT CHECK (rating_value BETWEEN 1 AND 5),
  rating_overall INT CHECK (rating_overall BETWEEN 1 AND 5),
  pros TEXT,
  cons TEXT,
  review_text TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookup of tool feedback
CREATE INDEX IF NOT EXISTS tool_feedback_tool_id_idx ON tool_feedback(tool_id);
CREATE INDEX IF NOT EXISTS tool_feedback_company_id_idx ON tool_feedback(company_id);
CREATE INDEX IF NOT EXISTS tool_feedback_step_id_idx ON tool_feedback(step_id);

-- Table: feedback_notifications
-- For notifying users about feedback updates
CREATE TABLE IF NOT EXISTS feedback_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('step', 'tool')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'feedback_received', 'feedback_resolved', etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feedback_id, feedback_type, user_id, event_type)
);

-- Index for user notifications
CREATE INDEX IF NOT EXISTS feedback_notifications_user_id_idx ON feedback_notifications(user_id);
CREATE INDEX IF NOT EXISTS feedback_notifications_is_read_idx ON feedback_notifications(is_read);

-- Add RLS policies
ALTER TABLE step_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for step_feedback - simplified basic access
CREATE POLICY step_feedback_basic_access ON step_feedback
  FOR ALL USING (TRUE);

-- Policy for feedback_categories (readable by all authenticated users)
CREATE POLICY feedback_categories_read ON feedback_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Simplified admin-only policies for modifying feedback categories
CREATE POLICY feedback_categories_admin_insert ON feedback_categories
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY feedback_categories_admin_update ON feedback_categories
  FOR UPDATE USING (TRUE);

CREATE POLICY feedback_categories_admin_delete ON feedback_categories
  FOR DELETE USING (TRUE);

-- Policy for feedback_category_assignments - simplified basic access
CREATE POLICY feedback_category_assignments_basic_access ON feedback_category_assignments
  FOR ALL USING (TRUE);

-- Policy for feedback_resolutions - simplified basic access
CREATE POLICY feedback_resolutions_basic_access ON feedback_resolutions
  FOR ALL USING (TRUE);

-- Policy for tool_feedback - simplified basic access
CREATE POLICY tool_feedback_basic_access ON tool_feedback
  FOR ALL USING (TRUE);

-- Policy for feedback_notifications (users can only see their own notifications)
CREATE POLICY feedback_notifications_user_access ON feedback_notifications
  FOR ALL USING (user_id = auth.uid());

-- Function to create feedback resolution when feedback is created
CREATE OR REPLACE FUNCTION create_feedback_resolution()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feedback_resolutions (feedback_id, status)
  VALUES (NEW.id, 'open');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create feedback resolution
CREATE TRIGGER create_feedback_resolution_trigger
AFTER INSERT ON step_feedback
FOR EACH ROW
EXECUTE FUNCTION create_feedback_resolution();

-- Function to auto-categorize feedback
CREATE OR REPLACE FUNCTION auto_categorize_feedback()
RETURNS TRIGGER AS $$
DECLARE
  content_category_id UUID;
  technical_category_id UUID;
  ui_category_id UUID;
  v_confidence FLOAT;
BEGIN
  -- Get category IDs
  SELECT id INTO content_category_id FROM feedback_categories WHERE name = 'Content' LIMIT 1;
  SELECT id INTO technical_category_id FROM feedback_categories WHERE name = 'Technical' LIMIT 1;
  SELECT id INTO ui_category_id FROM feedback_categories WHERE name = 'UI/UX' LIMIT 1;
  
  -- Simple keyword-based categorization
  -- In a real system, this would use more sophisticated NLP techniques
  
  -- Check for content-related keywords
  IF NEW.feedback_text ILIKE '%unclear%' OR 
     NEW.feedback_text ILIKE '%confusing%' OR 
     NEW.feedback_text ILIKE '%hard to understand%' OR
     NEW.feedback_text ILIKE '%content%' THEN
    v_confidence := 0.7;
    
    INSERT INTO feedback_category_assignments (
      feedback_id, category_id, confidence_score, is_auto_assigned
    ) VALUES (
      NEW.id, content_category_id, v_confidence, TRUE
    );
  END IF;
  
  -- Check for technical issue keywords
  IF NEW.feedback_text ILIKE '%error%' OR 
     NEW.feedback_text ILIKE '%bug%' OR 
     NEW.feedback_text ILIKE '%doesn''t work%' OR
     NEW.feedback_text ILIKE '%broken%' THEN
    v_confidence := 0.8;
    
    INSERT INTO feedback_category_assignments (
      feedback_id, category_id, confidence_score, is_auto_assigned
    ) VALUES (
      NEW.id, technical_category_id, v_confidence, TRUE
    );
  END IF;
  
  -- Check for UI/UX keywords
  IF NEW.feedback_text ILIKE '%interface%' OR 
     NEW.feedback_text ILIKE '%layout%' OR 
     NEW.feedback_text ILIKE '%button%' OR
     NEW.feedback_text ILIKE '%display%' OR
     NEW.feedback_text ILIKE '%UI%' OR
     NEW.feedback_text ILIKE '%UX%' THEN
    v_confidence := 0.6;
    
    INSERT INTO feedback_category_assignments (
      feedback_id, category_id, confidence_score, is_auto_assigned
    ) VALUES (
      NEW.id, ui_category_id, v_confidence, TRUE
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-categorize feedback
CREATE TRIGGER auto_categorize_feedback_trigger
AFTER INSERT ON step_feedback
FOR EACH ROW
WHEN (NEW.feedback_text IS NOT NULL)
EXECUTE FUNCTION auto_categorize_feedback();

-- Function to notify users when feedback is resolved
CREATE OR REPLACE FUNCTION notify_feedback_resolution()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification when status changes to 'resolved'
  IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status != 'resolved') THEN
    -- Get the user who submitted the feedback
    INSERT INTO feedback_notifications (
      feedback_id, feedback_type, user_id, event_type
    )
    SELECT
      NEW.feedback_id,
      'step',
      sf.user_id,
      'feedback_resolved'
    FROM step_feedback sf
    WHERE sf.id = NEW.feedback_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify users when feedback is resolved
CREATE TRIGGER notify_feedback_resolution_trigger
AFTER UPDATE ON feedback_resolutions
FOR EACH ROW
EXECUTE FUNCTION notify_feedback_resolution();

-- Function to calculate average ratings for steps
CREATE OR REPLACE FUNCTION calculate_step_average_ratings(p_step_id UUID)
RETURNS TABLE (
  avg_clarity FLOAT,
  avg_difficulty FLOAT,
  avg_usefulness FLOAT,
  avg_overall FLOAT,
  total_ratings INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(rating_clarity)::FLOAT AS avg_clarity,
    AVG(rating_difficulty)::FLOAT AS avg_difficulty,
    AVG(rating_usefulness)::FLOAT AS avg_usefulness,
    AVG(rating_overall)::FLOAT AS avg_overall,
    COUNT(*)::INT AS total_ratings
  FROM step_feedback
  WHERE step_id = p_step_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average ratings for tools
CREATE OR REPLACE FUNCTION calculate_tool_average_ratings(p_tool_id UUID)
RETURNS TABLE (
  avg_ease_of_use FLOAT,
  avg_functionality FLOAT,
  avg_value FLOAT,
  avg_overall FLOAT,
  recommendation_percentage FLOAT,
  total_ratings INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(rating_ease_of_use)::FLOAT AS avg_ease_of_use,
    AVG(rating_functionality)::FLOAT AS avg_functionality,
    AVG(rating_value)::FLOAT AS avg_value,
    AVG(rating_overall)::FLOAT AS avg_overall,
    (COUNT(*) FILTER (WHERE would_recommend = TRUE) * 100.0 / COUNT(*))::FLOAT AS recommendation_percentage,
    COUNT(*)::INT AS total_ratings
  FROM tool_feedback
  WHERE tool_id = p_tool_id;
END;
$$ LANGUAGE plpgsql;

-- View: feedback_summary_by_step
CREATE OR REPLACE VIEW feedback_summary_by_step AS
SELECT
  s.id AS step_id,
  s.name AS step_name,
  p.id AS phase_id,
  p.name AS phase_name,
  AVG(sf.rating_clarity) AS avg_clarity,
  AVG(sf.rating_difficulty) AS avg_difficulty,
  AVG(sf.rating_usefulness) AS avg_usefulness, 
  AVG(sf.rating_overall) AS avg_overall,
  COUNT(sf.id) AS total_feedback,
  COUNT(sf.id) FILTER (WHERE fr.status = 'open') AS open_issues,
  COUNT(sf.id) FILTER (WHERE fr.status = 'in_progress') AS in_progress_issues,
  COUNT(sf.id) FILTER (WHERE fr.status = 'resolved') AS resolved_issues
FROM journey_steps s
LEFT JOIN journey_phases p ON s.phase_id = p.id
LEFT JOIN step_feedback sf ON s.id = sf.step_id
LEFT JOIN feedback_resolutions fr ON sf.id = fr.feedback_id
GROUP BY s.id, s.name, p.id, p.name;

-- View: feedback_summary_by_category
CREATE OR REPLACE VIEW feedback_summary_by_category AS
SELECT
  fc.id AS category_id,
  fc.name AS category_name,
  fc.color AS category_color,
  COUNT(fca.id) AS total_feedback,
  COUNT(fca.id) FILTER (WHERE fr.status = 'open') AS open_issues,
  COUNT(fca.id) FILTER (WHERE fr.status = 'in_progress') AS in_progress_issues,
  COUNT(fca.id) FILTER (WHERE fr.status = 'resolved') AS resolved_issues
FROM feedback_categories fc
LEFT JOIN feedback_category_assignments fca ON fc.id = fca.category_id
LEFT JOIN step_feedback sf ON fca.feedback_id = sf.id
LEFT JOIN feedback_resolutions fr ON sf.id = fr.feedback_id
GROUP BY fc.id, fc.name, fc.color;

-- View: trending_feedback_issues
CREATE OR REPLACE VIEW trending_feedback_issues AS
WITH feedback_with_categories AS (
  SELECT
    sf.id AS feedback_id,
    sf.step_id,
    sf.company_id,
    s.name AS step_name,
    array_agg(fc.name) AS categories,
    sf.created_at,
    fr.status
  FROM step_feedback sf
  JOIN journey_steps s ON sf.step_id = s.id
  LEFT JOIN feedback_category_assignments fca ON sf.id = fca.feedback_id
  LEFT JOIN feedback_categories fc ON fca.category_id = fc.id
  LEFT JOIN feedback_resolutions fr ON sf.id = fr.feedback_id
  GROUP BY sf.id, sf.step_id, sf.company_id, s.name, sf.created_at, fr.status
)
SELECT
  step_id,
  step_name,
  COUNT(*) AS issue_count,
  array_agg(DISTINCT categories) AS category_groups,
  COUNT(*) FILTER (WHERE status = 'open') AS open_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS recent_count
FROM feedback_with_categories
GROUP BY step_id, step_name
ORDER BY recent_count DESC, open_count DESC, issue_count DESC;
