-- Migration for Adding Recommendation Engine Functions
-- These functions support the intelligent step recommendation system

/*
 * IMPORTANT: This migration creates the tables, views, and functions in the correct order
 * to avoid dependency issues. The steps are:
 * 1. Create tool_recommendations table first
 * 2. Create initial views without dependencies on the table
 * 3. Create functions that depend on the views
 * 4. Update views with full functionality
 */

-- First, create the tool_recommendations table
DROP TABLE IF EXISTS tool_recommendations CASCADE;
CREATE TABLE tool_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  relevance_score NUMERIC(5,2) NOT NULL DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(step_id, tool_id)
);

COMMENT ON TABLE tool_recommendations IS 'Stores tool recommendations for journey steps with relevance scores';

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_step_id ON tool_recommendations(step_id);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_tool_id ON tool_recommendations(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_relevance ON tool_recommendations(relevance_score DESC);

-- Enable RLS
ALTER TABLE tool_recommendations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - users can see recommendations if they are a member of the company
CREATE POLICY IF NOT EXISTS tool_recommendations_select_policy ON tool_recommendations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM journey_steps js
    JOIN company_members cm ON js.company_id = cm.company_id
    WHERE js.id = tool_recommendations.step_id
    AND cm.user_id = auth.uid()
  )
);

-- RLS policy - admin users can manage recommendations
CREATE POLICY IF NOT EXISTS tool_recommendations_all_policy ON tool_recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to get step popularity by industry
CREATE OR REPLACE FUNCTION get_steps_by_industry_popularity(
  p_industry_id UUID
)
RETURNS TABLE (
  step_id UUID,
  step_name TEXT,
  completion_count INTEGER,
  percentile NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH industry_companies AS (
    SELECT id FROM companies WHERE industry_id = p_industry_id
  ),
  step_completions AS (
    SELECT 
      step_id,
      COUNT(*) as completion_count
    FROM company_progress 
    WHERE 
      company_id IN (SELECT id FROM industry_companies)
      AND status = 'completed'
    GROUP BY step_id
  ),
  step_ranks AS (
    SELECT
      step_id,
      completion_count,
      PERCENT_RANK() OVER (ORDER BY completion_count) * 100 as percentile
    FROM step_completions
  )
  SELECT
    sr.step_id,
    s.name as step_name,
    sr.completion_count,
    sr.percentile
  FROM step_ranks sr
  JOIN journey_steps s ON sr.step_id = s.id
  ORDER BY sr.percentile DESC;
END;
$$;

-- Comment on function
COMMENT ON FUNCTION get_steps_by_industry_popularity IS 
  'Get journey steps ranked by popularity within a specific industry';

-- Function to get common step sequences
CREATE OR REPLACE FUNCTION get_common_step_sequences(
  p_completed_steps UUID[]
)
RETURNS TABLE (
  next_step_id UUID,
  next_step_name TEXT,
  frequency INTEGER,
  avg_time_to_completion INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Find steps that are commonly done after the steps in p_completed_steps
  RETURN QUERY
  WITH target_companies AS (
    -- Companies that have completed the same steps
    SELECT DISTINCT cp.company_id
    FROM company_progress cp
    WHERE 
      cp.step_id = ANY(p_completed_steps)
      AND cp.status = 'completed'
  ),
  next_steps AS (
    -- Steps that these companies did next
    SELECT 
      cp.step_id,
      cp.company_id,
      cp.completed_at,
      cp.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY cp.company_id 
        ORDER BY cp.completed_at
      ) as step_order
    FROM company_progress cp
    JOIN target_companies tc ON cp.company_id = tc.company_id
    WHERE 
      cp.status = 'completed'
      AND NOT (cp.step_id = ANY(p_completed_steps))
  ),
  next_step_frequencies AS (
    -- Count the frequency of each next step
    SELECT
      ns.step_id,
      COUNT(DISTINCT ns.company_id) as frequency,
      AVG(ns.completed_at - ns.created_at) as avg_time_to_completion
    FROM next_steps ns
    WHERE ns.step_order = 1 -- Only the immediate next step
    GROUP BY ns.step_id
  )
  SELECT 
    nsf.step_id as next_step_id,
    js.name as next_step_name,
    nsf.frequency,
    nsf.avg_time_to_completion
  FROM next_step_frequencies nsf
  JOIN journey_steps js ON nsf.step_id = js.id
  ORDER BY nsf.frequency DESC;
END;
$$;

-- Comment on function
COMMENT ON FUNCTION get_common_step_sequences IS 
  'Get steps commonly completed after a given set of steps, ranked by frequency';

-- Create a database view for easy access to step relationships
CREATE OR REPLACE VIEW journey_step_relationships AS
WITH prerequisite_relationships AS (
  -- Extract relationships from prerequisite_steps array
  SELECT
    js.id as step_id,
    js.name as step_name,
    pre.prerequisite_id,
    'prerequisite' as relationship_type
  FROM journey_steps js
  CROSS JOIN LATERAL (
    SELECT jsonb_array_elements_text(js.prerequisite_steps::jsonb)::uuid as prerequisite_id
  ) pre
  WHERE js.prerequisite_steps IS NOT NULL AND js.prerequisite_steps != '{}'::jsonb
),
dependent_steps AS (
  -- Find steps that have this step as a prerequisite
  SELECT
    pr.prerequisite_id as step_id,
    js.id as dependent_id,
    js.name as dependent_name,
    'dependent' as relationship_type
  FROM prerequisite_relationships pr
  JOIN journey_steps js ON js.id = pr.step_id
)
SELECT
  r.step_id,
  s1.name as step_name,
  r.prerequisite_id as related_id,
  s2.name as related_name,
  r.relationship_type
FROM prerequisite_relationships r
JOIN journey_steps s1 ON r.step_id = s1.id
JOIN journey_steps s2 ON r.prerequisite_id = s2.id

UNION ALL

SELECT
  d.step_id,
  s1.name as step_name,
  d.dependent_id as related_id,
  d.dependent_name as related_name,
  d.relationship_type
FROM dependent_steps d
JOIN journey_steps s1 ON d.step_id = s1.id;

-- Comment on view
COMMENT ON VIEW journey_step_relationships IS 
  'View showing prerequisite and dependent relationships between journey steps';

-- Create an initial version of the view without the dependency on tool_recommendations
DROP VIEW IF EXISTS journey_step_recommendations CASCADE;
CREATE VIEW journey_step_recommendations AS
SELECT 
  js.id,
  js.name,
  js.description,
  js.phase_id,
  jp.name as phase_name,
  js.difficulty_level,
  js.estimated_time_min,
  js.estimated_time_max,
  js.key_outcomes,
  js.prerequisite_steps,
  js.order_index,
  NULL::jsonb as recommended_tools, -- Initially set to NULL, will be updated later
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', r.related_id,
        'name', r.related_name,
        'relationship_type', r.relationship_type
      )
    )
    FROM journey_step_relationships r
    WHERE r.step_id = js.id
  ) as related_steps
FROM journey_steps js
LEFT JOIN journey_phases jp ON js.phase_id = jp.id;

-- Create the query functions that depend on the views and tables
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
SECURITY DEFINER
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

COMMENT ON FUNCTION get_recommended_tools_for_step IS 
  'Get top recommended tools for a specific journey step with relevance scores';

-- Function to get personalized step recommendations for a company
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

COMMENT ON FUNCTION get_personalized_step_recommendations IS 
  'Get personalized step recommendations for a company based on their progress and industry';

-- Function to get step relationships for visualization
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
SECURITY DEFINER
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

COMMENT ON FUNCTION get_step_relationships IS 
  'Get relationships between steps for visualization with configurable depth';

-- Now update the journey_step_recommendations view with the tool_recommendations data
DROP VIEW IF EXISTS journey_step_recommendations CASCADE;
CREATE VIEW journey_step_recommendations AS
SELECT 
  js.id,
  js.name,
  js.description,
  js.phase_id,
  jp.name as phase_name,
  js.difficulty_level,
  js.estimated_time_min,
  js.estimated_time_max,
  js.key_outcomes,
  js.prerequisite_steps,
  js.order_index,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'description', t.description,
        'url', t.url,
        'logo_url', NULL, -- Use NULL since logo_url doesn't exist
        'relevance_score', tr.relevance_score
      )
    )
    FROM tools t
    JOIN tool_recommendations tr ON t.id = tr.tool_id
    WHERE tr.step_id = js.id
  ) as recommended_tools,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', r.related_id,
        'name', r.related_name,
        'relationship_type', r.relationship_type
      )
    )
    FROM journey_step_relationships r
    WHERE r.step_id = js.id
  ) as related_steps
FROM journey_steps js
LEFT JOIN journey_phases jp ON js.phase_id = jp.id;

-- Comment on view
COMMENT ON VIEW journey_step_recommendations IS 
  'View providing step recommendations with related tools and step relationships';
