-- Migration: Add Compatibility Layer for Challenge to Step
-- Description: Adds views and functions for backward compatibility with challenge system
-- Date: 2025-05-05

-- Create view for company challenge progress
DROP VIEW IF EXISTS company_challenge_progress_view;

-- Check the structure of company_journey_steps and adapt our view accordingly
DO $$
DECLARE
  columns_found text;
  create_view_sql text;
BEGIN
  -- Get all column names for company_journey_steps
  SELECT string_agg(column_name, ', ') INTO columns_found
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'company_journey_steps';
  
  RAISE NOTICE 'Found columns in company_journey_steps: %', columns_found;
  
  -- Start building the view SQL dynamically based on found columns
  create_view_sql := 'CREATE VIEW company_challenge_progress_view AS SELECT id';
  
  -- Add other columns only if they exist
  IF columns_found LIKE '%company_id%' THEN
    create_view_sql := create_view_sql || ', company_id';
  ELSE 
    -- If company_id doesn't exist but user_id does, use that as a fallback
    IF columns_found LIKE '%user_id%' THEN
      create_view_sql := create_view_sql || ', user_id AS company_id';
    -- Otherwise add NULL for compatibility
    ELSE
      create_view_sql := create_view_sql || ', NULL::uuid AS company_id';
    END IF;
  END IF;
  
  -- Add step_id as challenge_id for mapping
  IF columns_found LIKE '%step_id%' THEN
    create_view_sql := create_view_sql || ', step_id AS challenge_id';
  ELSE
    create_view_sql := create_view_sql || ', NULL::uuid AS challenge_id';
  END IF;
  
  -- Add other common fields
  IF columns_found LIKE '%status%' THEN 
    create_view_sql := create_view_sql || ', status'; 
  ELSE
    create_view_sql := create_view_sql || ', ''not_started''::text AS status';
  END IF;
  
  IF columns_found LIKE '%notes%' THEN 
    create_view_sql := create_view_sql || ', notes'; 
  ELSE
    create_view_sql := create_view_sql || ', NULL::text AS notes';
  END IF;
  
  IF columns_found LIKE '%completion_percentage%' THEN 
    create_view_sql := create_view_sql || ', completion_percentage'; 
  ELSE
    create_view_sql := create_view_sql || ', 0 AS completion_percentage';
  END IF;
  
  IF columns_found LIKE '%order_index%' THEN 
    create_view_sql := create_view_sql || ', order_index'; 
  ELSE
    create_view_sql := create_view_sql || ', 0 AS order_index';
  END IF;
  
  -- Add timestamp fields
  IF columns_found LIKE '%created_at%' THEN 
    create_view_sql := create_view_sql || ', created_at'; 
  ELSE
    create_view_sql := create_view_sql || ', NOW() AS created_at';
  END IF;
  
  IF columns_found LIKE '%updated_at%' THEN 
    create_view_sql := create_view_sql || ', updated_at'; 
  ELSE
    create_view_sql := create_view_sql || ', NOW() AS updated_at';
  END IF;
  
  IF columns_found LIKE '%completed_at%' THEN 
    create_view_sql := create_view_sql || ', completed_at'; 
  ELSE
    create_view_sql := create_view_sql || ', NULL::timestamptz AS completed_at';
  END IF;
  
  -- Complete the SQL with FROM clause
  create_view_sql := create_view_sql || ' FROM company_journey_steps';
  
  -- Execute the dynamically built SQL
  EXECUTE create_view_sql;
  RAISE NOTICE 'Created view with: %', create_view_sql;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating view: %', SQLERRM;
    -- Create a minimal fallback view if we hit errors
    EXECUTE '
      CREATE VIEW company_challenge_progress_view AS
      SELECT 
        id,
        NULL::uuid AS company_id,
        NULL::uuid AS challenge_id,
        ''not_started''::text AS status,
        NULL::text AS notes,
        0 AS completion_percentage,
        0 AS order_index,
        NOW() AS created_at,
        NOW() AS updated_at,
        NULL::timestamptz AS completed_at
      FROM 
        company_journey_steps
      LIMIT 0';
    RAISE NOTICE 'Created fallback view instead.';
END
$$;

-- Create view for tool recommendations
DROP VIEW IF EXISTS challenge_tool_recommendations_view;
CREATE VIEW challenge_tool_recommendations_view AS
SELECT
  st.id,
  st.step_id AS challenge_id,
  st.tool_id,
  st.relevance_score,
  st.created_at
FROM
  step_tools st;

-- Create RPC function to get tool evaluations for a specific step
CREATE OR REPLACE FUNCTION get_tool_evaluations_for_step(
  p_company_id UUID,
  p_step_id UUID
)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  step_id UUID,
  tool_id UUID,
  tool_name TEXT,
  tool_description TEXT,
  tool_url TEXT,
  tool_logo_url TEXT,
  is_custom BOOLEAN,
  rating INTEGER,
  notes TEXT,
  selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cst.id,
    cst.company_id,
    cst.step_id,
    cst.tool_id,
    t.name AS tool_name,
    t.description AS tool_description,
    t.url AS tool_url,
    t.logo_url AS tool_logo_url,
    cst.is_custom,
    cst.rating,
    cst.notes,
    cst.selected_at,
    cst.created_at,
    cst.updated_at
  FROM
    company_step_tools cst
  JOIN
    tools t ON cst.tool_id = t.id
  WHERE
    cst.company_id = p_company_id
    AND cst.step_id = p_step_id
  ORDER BY
    cst.selected_at DESC NULLS LAST,
    cst.rating DESC NULLS LAST,
    cst.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to get tool comparison data for multiple tools
CREATE OR REPLACE FUNCTION get_tool_comparison_data(
  p_tool_ids UUID[]
)
RETURNS TABLE (
  tool_id UUID,
  name TEXT,
  description TEXT,
  url TEXT,
  logo_url TEXT,
  type TEXT,
  category TEXT,
  subcategory TEXT,
  is_premium BOOLEAN,
  pricing_model TEXT,
  pros TEXT,
  cons TEXT,
  source TEXT,
  status TEXT,
  rating_avg FLOAT,
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS tool_id,
    t.name,
    t.description,
    t.url,
    t.logo_url,
    t.type,
    t.category,
    t.subcategory,
    t.is_premium,
    t.pricing_model,
    t.pros,
    t.cons,
    t.source,
    t.status,
    (SELECT AVG(cst.rating)::FLOAT FROM company_step_tools cst WHERE cst.tool_id = t.id AND cst.rating IS NOT NULL) AS rating_avg,
    (SELECT COUNT(DISTINCT cst.company_id) FROM company_step_tools cst WHERE cst.tool_id = t.id) AS usage_count
  FROM
    tools t
  WHERE
    t.id = ANY(p_tool_ids)
  ORDER BY
    rating_avg DESC NULLS LAST,
    usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for better documentation
COMMENT ON VIEW company_challenge_progress_view IS 
  'Compatibility view mapping company_journey_steps to the previous company_challenge_progress model';
COMMENT ON VIEW challenge_tool_recommendations_view IS 
  'Compatibility view mapping step_tools to the previous challenge_tool_recommendations model';
COMMENT ON FUNCTION get_tool_evaluations_for_step IS
  'Get tool evaluations for a specific step with tool details';
COMMENT ON FUNCTION get_tool_comparison_data IS
  'Get detailed information for tool comparison, including average ratings and usage';
