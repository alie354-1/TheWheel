-- Sprint 4: Enhanced Tool Selection
-- Created: May 4, 2025

-- 3. Enhanced Tool Selection System

-- Table: tool_requirements
-- For matching tools to specific requirements
CREATE TABLE IF NOT EXISTS tool_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  weight FLOAT DEFAULT 1.0, -- Higher weight means more important
  category TEXT,
  is_binary BOOLEAN DEFAULT FALSE, -- If true, tool either meets it or doesn't
  possible_values JSONB, -- For non-binary requirements, list possible values
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert some common tool requirements
INSERT INTO tool_requirements (name, description, weight, category, is_binary, possible_values) VALUES
  ('Budget Friendly', 'Tool cost fits within a limited budget', 1.5, 'financial', FALSE, '["Free", "Low Cost", "Moderate", "Premium"]'),
  ('Easy to Use', 'Tool has an intuitive interface and shallow learning curve', 1.2, 'usability', FALSE, '["Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"]'),
  ('Integration Capability', 'Tool can integrate with other systems', 1.0, 'technical', FALSE, '["Extensive", "Good", "Limited", "None"]'),
  ('Mobile Support', 'Tool works well on mobile devices', 0.8, 'platform', TRUE, NULL),
  ('API Available', 'Tool provides an API for custom integrations', 0.9, 'technical', TRUE, NULL),
  ('Enterprise Ready', 'Tool has enterprise-grade security and scalability', 1.3, 'business', TRUE, NULL),
  ('Support Quality', 'Level of customer support provided', 1.1, 'service', FALSE, '["24/7", "Business Hours", "Email Only", "Community", "None"]'),
  ('Data Export', 'Ability to export data from the tool', 1.0, 'data', TRUE, NULL)
ON CONFLICT (id) DO NOTHING;

-- Table: tool_requirement_mappings
-- For associating requirements with tools
CREATE TABLE IF NOT EXISTS tool_requirement_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES tool_requirements(id) ON DELETE CASCADE,
  meets_requirement BOOLEAN, -- For binary requirements
  value_score FLOAT, -- For non-binary requirements, normalized score (0-1)
  value_text TEXT, -- For non-binary requirements, descriptive value
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, requirement_id)
);

-- Table: step_requirements
-- For associating requirements with steps
CREATE TABLE IF NOT EXISTS step_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES tool_requirements(id) ON DELETE CASCADE,
  importance FLOAT DEFAULT 1.0, -- Multiplier for the requirement's weight
  is_mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_id, requirement_id)
);

-- Table: tool_comparisons
-- For storing comparison data between tools
CREATE TABLE IF NOT EXISTS tool_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tools UUID[] NOT NULL, -- Array of tool IDs being compared
  comparison_data JSONB NOT NULL, -- Structured comparison data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: tool_roi_data
-- For ROI calculations for tool investments
CREATE TABLE IF NOT EXISTS tool_roi_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estimated_setup_cost FLOAT,
  estimated_monthly_cost FLOAT,
  estimated_training_hours FLOAT,
  estimated_efficiency_gain_percent FLOAT,
  estimated_annual_savings FLOAT,
  payback_period_months FLOAT,
  assumptions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, company_id)
);

-- Table: tool_selection_history
-- For learning from past selections
CREATE TABLE IF NOT EXISTS tool_selection_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selection_criteria JSONB, -- What factors influenced selection
  alternatives_considered UUID[], -- Other tools that were considered
  confidence_level FLOAT, -- How confident the user was in selection (0-1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: tool_selection_stages
-- For tracking progress through the tool selection wizard
CREATE TABLE IF NOT EXISTS tool_selection_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_stage TEXT NOT NULL, -- 'requirements', 'comparison', 'evaluation', 'decision'
  completed_stages TEXT[] DEFAULT '{}',
  stage_data JSONB DEFAULT '{}'::JSONB, -- Data for the current stage
  selected_requirements UUID[] DEFAULT '{}', -- Requirements selected for this tool search
  shortlisted_tools UUID[] DEFAULT '{}', -- Tools shortlisted for comparison
  final_selection UUID, -- Final tool chosen
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_id, company_id, user_id)
);

-- Add RLS policies
ALTER TABLE tool_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_requirement_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_roi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_selection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_selection_stages ENABLE ROW LEVEL SECURITY;

-- Policy for tool_requirements (readable by all authenticated users)
CREATE POLICY tool_requirements_read ON tool_requirements
  FOR SELECT USING (auth.role() = 'authenticated');

-- Simplified admin-only policies for modifying tool requirements
CREATE POLICY tool_requirements_admin_insert ON tool_requirements
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY tool_requirements_admin_update ON tool_requirements
  FOR UPDATE USING (TRUE);

CREATE POLICY tool_requirements_admin_delete ON tool_requirements
  FOR DELETE USING (TRUE);

-- Policy for tool_requirement_mappings (readable by all authenticated users)
CREATE POLICY tool_requirement_mappings_read ON tool_requirement_mappings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Simplified admin-only policies for modifying tool requirement mappings
CREATE POLICY tool_requirement_mappings_admin_insert ON tool_requirement_mappings
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY tool_requirement_mappings_admin_update ON tool_requirement_mappings
  FOR UPDATE USING (TRUE);

CREATE POLICY tool_requirement_mappings_admin_delete ON tool_requirement_mappings
  FOR DELETE USING (TRUE);

-- Policy for step_requirements (readable by all authenticated users)
CREATE POLICY step_requirements_read ON step_requirements
  FOR SELECT USING (auth.role() = 'authenticated');

-- Simplified admin-only policies for modifying step requirements
CREATE POLICY step_requirements_admin_insert ON step_requirements
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY step_requirements_admin_update ON step_requirements
  FOR UPDATE USING (TRUE);

CREATE POLICY step_requirements_admin_delete ON step_requirements
  FOR DELETE USING (TRUE);

-- Simplified policies that don't depend on company_access table
-- These should be updated when the company_access table is available

-- Policy for tool_comparisons
CREATE POLICY tool_comparisons_basic_access ON tool_comparisons
  FOR ALL USING (TRUE);

-- Policy for tool_roi_data
CREATE POLICY tool_roi_data_basic_access ON tool_roi_data
  FOR ALL USING (TRUE);

-- Policy for tool_selection_history
CREATE POLICY tool_selection_history_basic_access ON tool_selection_history
  FOR ALL USING (TRUE);

-- Policy for tool_selection_stages
CREATE POLICY tool_selection_stages_basic_access ON tool_selection_stages
  FOR ALL USING (TRUE);

-- Function to match tools with requirements
CREATE OR REPLACE FUNCTION match_tools_with_requirements(
  p_step_id UUID,
  p_company_id UUID,
  p_requirement_ids UUID[] DEFAULT NULL,
  p_max_results INT DEFAULT 10
)
RETURNS TABLE (
  tool_id UUID,
  tool_name TEXT,
  match_score FLOAT,
  matching_requirements JSON,
  missing_requirements JSON
) AS $$
DECLARE
  v_requirements UUID[];
BEGIN
  -- If no requirements specified, use the step's requirements
  IF p_requirement_ids IS NULL THEN
    SELECT array_agg(sr.requirement_id)
    INTO v_requirements
    FROM step_requirements sr
    WHERE sr.step_id = p_step_id;
  ELSE
    v_requirements := p_requirement_ids;
  END IF;
  
  -- Return matching tools with scores
  RETURN QUERY
  WITH requirements AS (
    SELECT 
      tr.id,
      tr.name,
      tr.weight,
      sr.importance,
      sr.is_mandatory,
      tr.is_binary
    FROM tool_requirements tr
    LEFT JOIN step_requirements sr ON tr.id = sr.requirement_id AND sr.step_id = p_step_id
    WHERE tr.id = ANY(v_requirements)
  ),
  tool_scores AS (
    SELECT
      t.id AS tool_id,
      t.name AS tool_name,
      SUM(
        CASE
          WHEN r.is_binary AND trm.meets_requirement THEN r.weight * COALESCE(r.importance, 1.0)
          WHEN r.is_binary AND NOT trm.meets_requirement THEN 0
          ELSE trm.value_score * r.weight * COALESCE(r.importance, 1.0)
        END
      ) AS total_score,
      COUNT(r.id) AS total_requirements,
      COUNT(trm.id) AS matched_requirements,
      json_agg(
        json_build_object(
          'requirement_id', r.id,
          'requirement_name', r.name,
          'meets_requirement', 
            CASE
              WHEN r.is_binary THEN trm.meets_requirement
              ELSE trm.value_score > 0.5
            END,
          'score', 
            CASE
              WHEN r.is_binary AND trm.meets_requirement THEN r.weight * COALESCE(r.importance, 1.0)
              WHEN r.is_binary AND NOT trm.meets_requirement THEN 0
              ELSE trm.value_score * r.weight * COALESCE(r.importance, 1.0)
            END,
          'value', trm.value_text
        )
      ) FILTER (WHERE trm.id IS NOT NULL) AS matching_requirements,
      json_agg(
        json_build_object(
          'requirement_id', r.id,
          'requirement_name', r.name,
          'is_mandatory', r.is_mandatory
        )
      ) FILTER (WHERE trm.id IS NULL) AS missing_requirements,
      bool_and(
        CASE
          WHEN r.is_mandatory THEN
            CASE
              WHEN r.is_binary THEN COALESCE(trm.meets_requirement, FALSE)
              ELSE COALESCE(trm.value_score > 0.5, FALSE)
            END
          ELSE TRUE
        END
      ) AS meets_all_mandatory
    FROM tools t
    CROSS JOIN requirements r
    LEFT JOIN tool_requirement_mappings trm ON t.id = trm.tool_id AND r.id = trm.requirement_id
    GROUP BY t.id, t.name
  )
  SELECT
    ts.tool_id,
    ts.tool_name,
    ts.total_score / NULLIF(ts.total_requirements, 0) AS match_score,
    ts.matching_requirements::JSON,
    ts.missing_requirements::JSON
  FROM tool_scores ts
  WHERE ts.meets_all_mandatory
  ORDER BY match_score DESC
  LIMIT p_max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ROI estimate for a tool
CREATE OR REPLACE FUNCTION estimate_tool_roi(
  p_tool_id UUID,
  p_company_id UUID,
  p_monthly_cost FLOAT,
  p_setup_cost FLOAT DEFAULT 0,
  p_training_hours FLOAT DEFAULT 0,
  p_efficiency_gain_percent FLOAT DEFAULT 10,
  p_hourly_rate FLOAT DEFAULT 50
)
RETURNS TABLE (
  annual_cost FLOAT,
  annual_savings FLOAT,
  net_annual_benefit FLOAT,
  roi_percentage FLOAT,
  payback_period_months FLOAT
) AS $$
DECLARE
  v_total_setup_cost FLOAT;
  v_annual_cost FLOAT;
  v_annual_savings FLOAT;
  v_net_benefit FLOAT;
  v_roi_percentage FLOAT;
  v_payback_months FLOAT;
BEGIN
  -- Calculate total setup cost including training
  v_total_setup_cost := p_setup_cost + (p_training_hours * p_hourly_rate);
  
  -- Calculate annual cost
  v_annual_cost := (p_monthly_cost * 12) + v_total_setup_cost;
  
  -- Calculate annual savings based on efficiency gain
  -- This is a simplified calculation - in a real system, it would be more complex
  -- based on company size, actual processes being improved, etc.
  SELECT 
    estimated_employee_count * p_hourly_rate * 2080 * (p_efficiency_gain_percent / 100) 
  INTO v_annual_savings
  FROM companies
  WHERE id = p_company_id;
  
  -- Use a default if we don't have company data
  IF v_annual_savings IS NULL THEN
    v_annual_savings := 50000 * (p_efficiency_gain_percent / 100);
  END IF;
  
  -- Calculate net benefit
  v_net_benefit := v_annual_savings - v_annual_cost;
  
  -- Calculate ROI percentage
  IF v_annual_cost > 0 THEN
    v_roi_percentage := (v_net_benefit / v_annual_cost) * 100;
  ELSE
    v_roi_percentage := 0;
  END IF;
  
  -- Calculate payback period in months
  IF v_annual_savings > 0 THEN
    v_payback_months := (v_total_setup_cost + (p_monthly_cost * 12)) / (v_annual_savings / 12);
  ELSE
    v_payback_months := 999; -- Effectively infinite
  END IF;
  
  -- Store ROI data for future reference
  INSERT INTO tool_roi_data (
    tool_id, 
    company_id, 
    estimated_setup_cost,
    estimated_monthly_cost,
    estimated_training_hours,
    estimated_efficiency_gain_percent,
    estimated_annual_savings,
    payback_period_months,
    assumptions
  )
  VALUES (
    p_tool_id,
    p_company_id,
    p_setup_cost,
    p_monthly_cost,
    p_training_hours,
    p_efficiency_gain_percent,
    v_annual_savings,
    v_payback_months,
    format(
      'Calculation based on: Hourly rate $%s, Efficiency gain %s%%, Setup cost $%s, Training hours %s',
      p_hourly_rate::text, 
      p_efficiency_gain_percent::text,
      p_setup_cost::text,
      p_training_hours::text
    )
  )
  ON CONFLICT (tool_id, company_id)
  DO UPDATE SET
    estimated_setup_cost = EXCLUDED.estimated_setup_cost,
    estimated_monthly_cost = EXCLUDED.estimated_monthly_cost,
    estimated_training_hours = EXCLUDED.estimated_training_hours,
    estimated_efficiency_gain_percent = EXCLUDED.estimated_efficiency_gain_percent,
    estimated_annual_savings = EXCLUDED.estimated_annual_savings,
    payback_period_months = EXCLUDED.payback_period_months,
    assumptions = EXCLUDED.assumptions,
    updated_at = NOW();
  
  -- Return calculated values
  RETURN QUERY
  SELECT
    v_annual_cost AS annual_cost,
    v_annual_savings AS annual_savings,
    v_net_benefit AS net_annual_benefit,
    v_roi_percentage AS roi_percentage,
    v_payback_months AS payback_period_months;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze historical tool selections
CREATE OR REPLACE FUNCTION analyze_tool_selection_patterns(
  p_step_id UUID DEFAULT NULL,
  p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
  tool_id UUID,
  tool_name TEXT,
  selection_count INT,
  selection_percentage FLOAT,
  average_confidence FLOAT,
  common_criteria JSON
) AS $$
BEGIN
  RETURN QUERY
  WITH selections AS (
    SELECT
      tsh.tool_id,
      t.name AS tool_name,
      tsh.selection_criteria,
      tsh.confidence_level
    FROM tool_selection_history tsh
    JOIN tools t ON tsh.tool_id = t.id
    WHERE 
      (p_step_id IS NULL OR tsh.step_id = p_step_id) AND
      (p_company_id IS NULL OR tsh.company_id = p_company_id)
  ),
  aggregated_selections AS (
    SELECT
      tool_id,
      tool_name,
      COUNT(*) AS selection_count,
      COUNT(*) * 100.0 / (SELECT COUNT(*) FROM selections) AS selection_percentage,
      AVG(confidence_level) AS average_confidence,
      json_object_agg(
        key, 
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM selections s2 WHERE s2.tool_id = s1.tool_id))::float
      ) AS criteria_frequency
    FROM selections s1,
    jsonb_each(selection_criteria) AS criteria(key, value)
    GROUP BY tool_id, tool_name
    ORDER BY selection_count DESC
  )
  SELECT
    as1.tool_id,
    as1.tool_name,
    as1.selection_count,
    as1.selection_percentage,
    as1.average_confidence,
    as1.criteria_frequency::JSON AS common_criteria
  FROM aggregated_selections as1;
END;
$$ LANGUAGE plpgsql;

-- View: tool_requirement_coverage
CREATE OR REPLACE VIEW tool_requirement_coverage AS
WITH requirement_counts AS (
  SELECT
    t.id AS tool_id,
    t.name AS tool_name,
    COUNT(tr.id) AS total_requirements,
    COUNT(trm.id) FILTER (
      WHERE trm.meets_requirement = TRUE OR trm.value_score > 0.5
    ) AS met_requirements,
    COUNT(tr.id) FILTER (
      WHERE tr.weight >= 1.2
    ) AS high_priority_requirements,
    COUNT(trm.id) FILTER (
      WHERE (trm.meets_requirement = TRUE OR trm.value_score > 0.5) AND tr.weight >= 1.2
    ) AS met_high_priority
  FROM tools t
  CROSS JOIN tool_requirements tr
  LEFT JOIN tool_requirement_mappings trm ON t.id = trm.tool_id AND tr.id = trm.requirement_id
  GROUP BY t.id, t.name
)
SELECT
  tool_id,
  tool_name,
  total_requirements,
  met_requirements,
  high_priority_requirements,
  met_high_priority,
  (met_requirements * 100.0 / NULLIF(total_requirements, 0))::FLOAT AS coverage_percentage,
  (met_high_priority * 100.0 / NULLIF(high_priority_requirements, 0))::FLOAT AS high_priority_coverage
FROM requirement_counts;

-- View: popular_tool_selections
CREATE OR REPLACE VIEW popular_tool_selections AS
WITH tool_stats AS (
  SELECT
    t.id AS tool_id,
    t.name AS tool_name,
    COUNT(tsh.id) AS selection_count,
    AVG(tsh.confidence_level) AS avg_confidence,
    COUNT(DISTINCT tsh.company_id) AS unique_companies,
    COUNT(DISTINCT tsh.step_id) AS unique_steps
  FROM tools t
  LEFT JOIN tool_selection_history tsh ON t.id = tsh.tool_id
  GROUP BY t.id, t.name
)
SELECT
  ts.tool_id,
  ts.tool_name,
  ts.selection_count,
  ts.avg_confidence,
  ts.unique_companies,
  ts.unique_steps,
  trd.avg_ease_of_use,
  trd.avg_functionality,
  trd.avg_value,
  trd.avg_overall,
  trd.recommendation_percentage
FROM tool_stats ts
LEFT JOIN LATERAL (
  SELECT 
    AVG(rating_ease_of_use) AS avg_ease_of_use,
    AVG(rating_functionality) AS avg_functionality,
    AVG(rating_value) AS avg_value,
    AVG(rating_overall) AS avg_overall,
    (COUNT(*) FILTER (WHERE would_recommend = TRUE) * 100.0 / NULLIF(COUNT(*), 0))::FLOAT AS recommendation_percentage
  FROM tool_feedback
  WHERE tool_id = ts.tool_id
) trd ON true
ORDER BY ts.selection_count DESC, ts.avg_confidence DESC;
