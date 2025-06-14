-- Migration to fix AI tables schema
-- Date: 2025-06-18

-- Update ai_generated_recommendations table to use company_journey_id instead of company_id
ALTER TABLE ai_generated_recommendations 
  ADD COLUMN company_journey_id UUID REFERENCES company_new_journeys(id) ON DELETE CASCADE;

-- Update existing records to set company_journey_id based on company_id
UPDATE ai_generated_recommendations r
SET company_journey_id = j.id
FROM company_new_journeys j
WHERE r.company_id = j.company_id;

-- Update ai_generated_insights table to use company_journey_id instead of company_id
ALTER TABLE ai_generated_insights 
  ADD COLUMN company_journey_id UUID REFERENCES company_new_journeys(id) ON DELETE CASCADE;

-- Update existing records to set company_journey_id based on company_id
UPDATE ai_generated_insights i
SET company_journey_id = j.id
FROM company_new_journeys j
WHERE i.company_id = j.company_id;

-- Update ai_business_health_summaries table to use company_journey_id instead of company_id
ALTER TABLE ai_business_health_summaries 
  ADD COLUMN company_journey_id UUID REFERENCES company_new_journeys(id) ON DELETE CASCADE;

-- Update existing records to set company_journey_id based on company_id
UPDATE ai_business_health_summaries h
SET company_journey_id = j.id
FROM company_new_journeys j
WHERE h.company_id = j.company_id;

-- Create indexes for the new columns
CREATE INDEX ON ai_generated_recommendations(company_journey_id, status);
CREATE INDEX ON ai_generated_insights(company_journey_id, domain_id);
CREATE INDEX ON ai_business_health_summaries(company_journey_id);

-- Update functions to use company_journey_id
-- First drop the existing function
DROP FUNCTION IF EXISTS generate_company_context_hash(UUID);

-- Then recreate it with the new parameter name
CREATE OR REPLACE FUNCTION generate_company_context_hash(
  p_company_journey_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_completed_steps TEXT;
  v_in_progress_steps TEXT;
  v_domain_levels TEXT;
  v_last_activity TIMESTAMPTZ;
  v_context_data JSONB;
  v_hash TEXT;
BEGIN
  -- Get completed steps
  SELECT string_agg(id::text, ',') INTO v_completed_steps
  FROM company_new_journey_steps
  WHERE company_journey_id = p_company_journey_id AND status = 'completed'
  ORDER BY id;
  
  -- Get in-progress steps
  SELECT string_agg(id::text, ',') INTO v_in_progress_steps
  FROM company_new_journey_steps
  WHERE company_journey_id = p_company_journey_id AND status = 'in_progress'
  ORDER BY id;
  
  -- Get domain maturity levels
  SELECT string_agg(domain_id::text || ':' || maturity_level, ',') INTO v_domain_levels
  FROM company_new_journey_steps
  WHERE company_journey_id = p_company_journey_id AND domain_id IS NOT NULL
  ORDER BY domain_id;
  
  -- Get last activity timestamp
  SELECT MAX(created_at) INTO v_last_activity
  FROM new_journey_step_outcomes
  WHERE company_journey_id = p_company_journey_id;
  
  -- Construct context data
  v_context_data := jsonb_build_object(
    'completed_steps', v_completed_steps,
    'in_progress_steps', v_in_progress_steps,
    'domain_levels', v_domain_levels,
    'last_activity', v_last_activity
  );
  
  -- Generate hash
  v_hash := encode(sha256(v_context_data::text::bytea), 'hex');
  
  -- Get company_id from company_journey_id
  DECLARE
    v_company_id UUID;
  BEGIN
    SELECT company_id INTO v_company_id
    FROM company_new_journeys
    WHERE id = p_company_journey_id;
    
    -- Store context snapshot
    INSERT INTO ai_context_snapshots (company_id, context_hash, context_data)
    VALUES (v_company_id, v_hash, v_context_data)
    ON CONFLICT (company_id, context_hash) DO NOTHING;
  END;
  
  RETURN v_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommendations with fallback
-- First drop the existing function
DROP FUNCTION IF EXISTS get_recommendations_with_fallback(UUID, INTEGER);

-- Then recreate it with the new parameter name
CREATE OR REPLACE FUNCTION get_recommendations_with_fallback(
  p_company_journey_id UUID,
  p_limit INTEGER DEFAULT 3
) RETURNS SETOF ai_generated_recommendations AS $$
DECLARE
  v_context_hash TEXT;
  v_found_count INTEGER;
BEGIN
  -- Get current context hash
  v_context_hash := generate_company_context_hash(p_company_journey_id);
  
  -- Try to get recommendations for current context
  RETURN QUERY
  SELECT * FROM ai_generated_recommendations
  WHERE company_journey_id = p_company_journey_id
    AND context_hash = v_context_hash
    AND status IN ('fresh', 'active')
  ORDER BY generated_at DESC
  LIMIT p_limit;
  
  GET DIAGNOSTICS v_found_count = ROW_COUNT;
  
  -- If not enough found, fall back to any non-stale recommendations
  IF v_found_count < p_limit THEN
    RETURN QUERY
    SELECT * FROM ai_generated_recommendations
    WHERE company_journey_id = p_company_journey_id
      AND status IN ('fresh', 'active')
      AND id NOT IN (
        SELECT id FROM ai_generated_recommendations
        WHERE company_journey_id = p_company_journey_id
          AND context_hash = v_context_hash
          AND status IN ('fresh', 'active')
      )
    ORDER BY generated_at DESC
    LIMIT (p_limit - v_found_count);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add a sample company journey for testing
INSERT INTO company_new_journeys (id, company_id, name, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 
   (SELECT id FROM companies LIMIT 1), 
   'Test Journey', 
   NOW())
ON CONFLICT (id) DO NOTHING;
