-- Useful Recommendation System Queries
-- These queries can be run directly in the Supabase SQL Editor

-- Query 1: Get top recommended tools for a specific step
CREATE OR REPLACE FUNCTION get_recommended_tools_for_step(p_step_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  tool_id UUID,
  tool_name TEXT,
  tool_description TEXT,
  tool_url TEXT,
  tool_logo_url TEXT,
  relevance_score NUMERIC(5,2),
  category TEXT
)
LANGUAGE sql
AS $$
  SELECT 
    t.id AS tool_id,
    t.name AS tool_name,
    t.description AS tool_description,
    t.url AS tool_url,
    NULL AS tool_logo_url, -- Use NULL since logo_url doesn't exist
    tr.relevance_score,
    t.category
  FROM tool_recommendations tr
  JOIN tools t ON tr.tool_id = t.id
  WHERE tr.step_id = p_step_id
  ORDER BY tr.relevance_score DESC
  LIMIT p_limit;
$$;

-- Query 2: Get personalized step recommendations for a company
CREATE OR REPLACE FUNCTION get_personalized_step_recommendations(
  p_company_id UUID,
  p_limit INTEGER DEFAULT 5,
  p_exclude_completed BOOLEAN DEFAULT true
)
RETURNS TABLE (
  step_id UUID,
  step_name TEXT,
  step_description TEXT,
  phase_name TEXT,
  estimated_min_minutes INTEGER,
  estimated_max_minutes INTEGER,
  difficulty_level INTEGER,
  relevance_score NUMERIC(5,2),
  reasoning TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_steps UUID[];
  company_industry_id UUID;
BEGIN
  -- Get completed steps for this company if excluding completed
  IF p_exclude_completed THEN
    SELECT array_agg(company_progress.step_id) INTO completed_steps 
    FROM company_progress 
    WHERE company_id = p_company_id AND status = 'completed';
    
    IF completed_steps IS NULL THEN
      completed_steps := ARRAY[]::UUID[];
    END IF;
  ELSE
    completed_steps := ARRAY[]::UUID[];
  END IF;
  
  -- Get company's industry
  SELECT industry_id INTO company_industry_id 
  FROM companies
  WHERE id = p_company_id;
  
  RETURN QUERY
  WITH step_scores AS (
    SELECT
      js.id,
      js.name,
      js.description,
      jp.name AS phase_name,
      js.estimated_time_min,
      js.estimated_time_max,
      js.difficulty_level,
      
      -- Base score - all steps start with score of 5
      5.0 AS base_score,
      
      -- Prerequisite completion score
      CASE
        WHEN js.prerequisite_steps IS NULL OR js.prerequisite_steps = '{}' THEN 2.0 -- No prerequisites
        WHEN (SELECT COUNT(*) FROM jsonb_array_elements_text(js.prerequisite_steps::jsonb) AS prereq_id
              WHERE prereq_id::UUID NOT IN (SELECT unnest(completed_steps))) = 0 THEN 2.0 -- All prerequisites completed
        ELSE -5.0 -- Missing prerequisites, significantly lower score
      END AS prereq_score,
      
      -- Industry relevance score (0-2 points)
      COALESCE((
        SELECT (ip.percentile / 50) * 2 -- Convert percentile to 0-2 scale
        FROM get_steps_by_industry_popularity(company_industry_id) ip
        WHERE ip.step_id = js.id
        LIMIT 1
      ), 0) AS industry_score,
      
      -- Common sequence score (0-1 points)
      COALESCE((
        SELECT (cs.frequency / 10) -- Convert frequency to 0-1 scale, capped at 1
        FROM get_common_step_sequences(completed_steps) cs
        WHERE cs.next_step_id = js.id
        LIMIT 1
      ), 0) AS sequence_score,
      
      -- Generate reasoning texts
      ARRAY[
        CASE WHEN js.prerequisite_steps IS NULL OR js.prerequisite_steps = '{}' 
             THEN 'No prerequisites required'
             WHEN (SELECT COUNT(*) FROM jsonb_array_elements_text(js.prerequisite_steps::jsonb) AS prereq_id
                  WHERE prereq_id::UUID NOT IN (SELECT unnest(completed_steps))) = 0 
             THEN 'All prerequisites are completed'
             ELSE 'Some prerequisites are not yet completed'
        END,
        
        COALESCE((
          SELECT 'Popular choice in your industry (' || ROUND(ip.percentile) || '% percentile)'
          FROM get_steps_by_industry_popularity(company_industry_id) ip
          WHERE ip.step_id = js.id
          LIMIT 1
        ), 'New option for your industry'),
        
        COALESCE((
          SELECT cs.frequency || ' companies completed this step next'
          FROM get_common_step_sequences(completed_steps) cs
          WHERE cs.next_step_id = js.id
          LIMIT 1
        ), 'Builds on your current progress')
      ] AS reasoning
      
    FROM journey_steps js
    LEFT JOIN journey_phases jp ON js.phase_id = jp.id
    WHERE (NOT p_exclude_completed OR js.id <> ALL(completed_steps))
  ),
  scored_steps AS (
    SELECT
      id,
      name,
      description,
      phase_name,
      estimated_time_min,
      estimated_time_max,
      difficulty_level,
      
      -- Calculate final score (clamped between 1-10)
      GREATEST(1.0, LEAST(10.0, (
        base_score + 
        prereq_score + 
        industry_score + 
        sequence_score
      ))) AS relevance_score,
      
      reasoning
    FROM step_scores
  )
  SELECT * FROM scored_steps
  ORDER BY relevance_score DESC, name
  LIMIT p_limit;
END;
$$;

-- Query 3: Get step relationships for visualization
CREATE OR REPLACE FUNCTION get_step_relationships(p_step_id UUID, p_depth INTEGER DEFAULT 1)
RETURNS TABLE (
  source_id UUID,
  source_name TEXT,
  target_id UUID,
  target_name TEXT,
  relationship_type TEXT,
  relationship_strength INTEGER
)
LANGUAGE sql
AS $$
WITH RECURSIVE relationship_tree AS (
  -- Base case: direct relationships
  SELECT 
    r.step_id AS source_id,
    s1.name AS source_name,
    r.related_id AS target_id,
    r.related_name AS target_name,
    r.relationship_type,
    1 AS depth,
    CASE 
      WHEN r.relationship_type = 'prerequisite' THEN 3
      WHEN r.relationship_type = 'dependent' THEN 2
      ELSE 1
    END AS relationship_strength
  FROM journey_step_relationships r
  JOIN journey_steps s1 ON r.step_id = s1.id
  WHERE r.step_id = p_step_id OR r.related_id = p_step_id
  
  UNION ALL
  
  -- Recursive case: relationships of relationships up to p_depth
  SELECT 
    r.step_id AS source_id,
    s1.name AS source_name,
    r.related_id AS target_id,
    r.related_name AS target_name,
    r.relationship_type,
    rt.depth + 1,
    CASE 
      WHEN r.relationship_type = 'prerequisite' THEN 3
      WHEN r.relationship_type = 'dependent' THEN 2
      ELSE 1
    END AS relationship_strength
  FROM journey_step_relationships r
  JOIN journey_steps s1 ON r.step_id = s1.id
  JOIN relationship_tree rt ON r.step_id = rt.target_id
  WHERE rt.depth < p_depth
)
SELECT DISTINCT
  source_id,
  source_name,
  target_id,
  target_name,
  relationship_type,
  relationship_strength
FROM relationship_tree
ORDER BY relationship_strength DESC, source_name, target_name;
$$;

-- Example usage
COMMENT ON FUNCTION get_recommended_tools_for_step IS 
  'Get top recommended tools for a specific journey step with relevance scores';

COMMENT ON FUNCTION get_personalized_step_recommendations IS 
  'Get personalized step recommendations for a company based on their progress and industry';

COMMENT ON FUNCTION get_step_relationships IS 
  'Get relationships between steps for visualization with configurable depth';

-- Sample calls to test functions
SELECT * FROM get_recommended_tools_for_step(
  (SELECT id FROM journey_steps LIMIT 1), -- Replace with actual step ID in production
  5
);

SELECT * FROM get_personalized_step_recommendations(
  (SELECT id FROM companies LIMIT 1), -- Replace with actual company ID in production
  5,
  true -- Exclude already completed steps
);

SELECT * FROM get_step_relationships(
  (SELECT id FROM journey_steps LIMIT 1), -- Replace with actual step ID in production
  1 -- Depth of 1 means only direct relationships
);
