-- Migration: Create database views and functions for Journey Steps UX Improvement
-- This migration creates views and functions to bridge step data with enhanced UI

-- First, ensure necessary columns exist in journey_steps table
DO $$
BEGIN
    -- Add difficulty_level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='difficulty_level'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN difficulty_level INTEGER DEFAULT 3;
    END IF;
    
    -- Add estimated_time_min column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='estimated_time_min'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN estimated_time_min INTEGER DEFAULT 30;
    END IF;
    
    -- Add estimated_time_max column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='estimated_time_max'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN estimated_time_max INTEGER DEFAULT 60;
    END IF;
    
    -- Add key_outcomes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='key_outcomes'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN key_outcomes JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add prerequisite_steps column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='prerequisite_steps'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN prerequisite_steps JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add company_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='company_id'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN company_id UUID DEFAULT NULL;
    END IF;
    
    -- Add is_custom column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='is_custom'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN is_custom BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add order_index column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='journey_steps' AND column_name='order_index'
    ) THEN
        ALTER TABLE journey_steps ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
END
$$;

-- Create enhanced view for journey steps
CREATE OR REPLACE VIEW journey_steps_enhanced AS
SELECT 
  s.id,
  s.name,
  s.description,
  s.phase_id,
  COALESCE(s.difficulty_level, 3) as difficulty_level,
  COALESCE(s.estimated_time_min, 30) as estimated_time_min,
  COALESCE(s.estimated_time_max, 60) as estimated_time_max,
  s.key_outcomes,
  s.prerequisite_steps,
  s.order_index,
  s.created_at,
  s.updated_at,
  s.company_id,
  s.is_custom,
  p.name as phase_name,
  p.color as phase_color
FROM journey_steps s
LEFT JOIN journey_phases p ON s.phase_id = p.id;

-- Create company progress view
CREATE OR REPLACE VIEW company_step_progress AS
SELECT
  p.id,
  p.company_id,
  p.step_id,
  p.status,
  p.notes,
  p.completed_at,
  p.created_at,
  p.updated_at,
  s.name as step_name,
  s.phase_id,
  ph.name as phase_name
FROM company_progress p
LEFT JOIN journey_steps s ON p.step_id = s.id
LEFT JOIN journey_phases ph ON s.phase_id = ph.id;

-- Create function to get enhanced step data with tool associations
CREATE OR REPLACE FUNCTION get_enhanced_step(step_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'id', s.id,
      'name', s.name,
      'description', s.description,
      'phase_id', s.phase_id,
      'phase_name', p.name,
      'difficulty_level', COALESCE(s.difficulty_level, 3),
      'estimated_time_min', COALESCE(s.estimated_time_min, 30),
      'estimated_time_max', COALESCE(s.estimated_time_max, 60),
      'key_outcomes', s.key_outcomes,
      'tools', (
        SELECT json_agg(t.*)
        FROM journey_step_tools jst
        JOIN tools t ON jst.tool_id = t.id
        WHERE jst.step_id = s.id
      ),
      'status', (
        SELECT cp.status
        FROM company_progress cp
        WHERE cp.step_id = s.id
        LIMIT 1
      )
    )
    FROM journey_steps s
    LEFT JOIN journey_phases p ON s.phase_id = p.id
    WHERE s.id = get_enhanced_step.step_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized tool recommendations for a step
CREATE OR REPLACE FUNCTION get_personalized_step_tools(company_id UUID, step_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  url TEXT,
  logo_url TEXT,
  relevance_score FLOAT
) AS $$
BEGIN
  -- This implementation preserves existing tool recommendation logic
  -- but ensures it works with step IDs instead of challenge IDs
  RETURN QUERY
  WITH company_industry AS (
    SELECT industry_id FROM companies WHERE id = company_id LIMIT 1
  ),
  step_info AS (
    SELECT 
      s.id, 
      s.name,
      s.description,
      s.phase_id
    FROM journey_steps s
    WHERE s.id = step_id
  ),
  ranked_tools AS (
    SELECT 
      t.id,
      t.name, 
      t.description,
      t.url,
      t.logo_url,
      -- Calculate relevance based on several factors:
      -- 1. Is the tool already recommended for this step?
      -- 2. Is the tool popular in the company's industry?
      -- 3. Is the tool popular for this phase?
      (CASE WHEN jst.step_id IS NOT NULL THEN 3.0 ELSE 0.0 END) +
      (CASE WHEN t.industry_focus = (SELECT industry_id FROM company_industry) THEN 2.0 ELSE 0.0 END) +
      (CASE WHEN EXISTS (
          SELECT 1 FROM journey_step_tools jst2 
          JOIN journey_steps s2 ON jst2.step_id = s2.id
          WHERE jst2.tool_id = t.id AND s2.phase_id = (SELECT phase_id FROM step_info)
        ) THEN 1.5 ELSE 0.0 END) +
      (random() * 0.5) AS relevance_score
    FROM tools t
    LEFT JOIN journey_step_tools jst ON t.id = jst.tool_id AND jst.step_id = step_id
  )
  SELECT 
    id,
    name, 
    description,
    url,
    logo_url,
    relevance_score
  FROM ranked_tools
  ORDER BY relevance_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Add comment to help identify the purpose of this migration
COMMENT ON VIEW journey_steps_enhanced IS 
  'Enhanced view of journey steps with additional fields for improved UI';
COMMENT ON VIEW company_step_progress IS 
  'Company progress on journey steps with step and phase information';
COMMENT ON FUNCTION get_enhanced_step IS 
  'Get enhanced step data with associated tools';
COMMENT ON FUNCTION get_personalized_step_tools IS 
  'Get personalized tool recommendations for a specific step';
