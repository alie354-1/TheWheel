-- Expand Tools Table to Include All Data
-- This migration adds all the original columns from journey_step_tools to the tools table

DO $$
DECLARE
  col_exists boolean;
BEGIN
  RAISE NOTICE 'Starting tools table expansion...';
  
  -- Check which columns exist in journey_step_tools
  -- 1. Check for url column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'url'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding url column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS url TEXT;
  END IF;
  
  -- 2. Check for logo_url column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'logo_url'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding logo_url column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS logo_url TEXT;
  END IF;
  
  -- 3. Check for type column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'type'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding type column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS type VARCHAR(50);
  END IF;
  
  -- 4. Check for category column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'category'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding category column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS category VARCHAR(100);
  END IF;
  
  -- 5. Check for subcategory column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'subcategory'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding subcategory column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
  END IF;
  
  -- 6. Check for is_premium column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'is_premium'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding is_premium column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- 7. Check for pros column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'pros'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding pros column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS pros TEXT;
  END IF;
  
  -- 8. Check for cons column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'cons'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding cons column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS cons TEXT;
  END IF;
  
  -- 9. Check for customer_stage column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'customer_stage'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding customer_stage column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS customer_stage VARCHAR(100);
  END IF;
  
  -- 10. Check for source column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'source'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding source column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS source VARCHAR(50);
  END IF;
  
  -- 11. Check for status column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'status'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding status column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
  END IF;
  
  -- 12. Check for ranking column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journey_step_tools' AND column_name = 'ranking'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'Adding ranking column to tools table...';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS ranking INTEGER;
  END IF;
  
  -- Now update the tools table with all data from journey_step_tools
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_step_tools') THEN
    RAISE NOTICE 'Updating tools with additional data from journey_step_tools...';
    
    -- Start with columns we know exist
    UPDATE tools t
    SET
      description = jst.description
    FROM journey_step_tools jst
    WHERE t.id = jst.id;
    
    -- Update url if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'url'
    ) THEN
      UPDATE tools t
      SET url = jst.url
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update logo_url if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'logo_url'
    ) THEN
      UPDATE tools t
      SET logo_url = jst.logo_url
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update type if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'type'
    ) THEN
      UPDATE tools t
      SET type = jst.type
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update category if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'category'
    ) THEN
      UPDATE tools t
      SET category = jst.category
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update subcategory if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'subcategory'
    ) THEN
      UPDATE tools t
      SET subcategory = jst.subcategory
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update is_premium if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'is_premium'
    ) THEN
      UPDATE tools t
      SET is_premium = jst.is_premium
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update pros if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'pros'
    ) THEN
      UPDATE tools t
      SET pros = jst.pros
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update cons if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'cons'
    ) THEN
      UPDATE tools t
      SET cons = jst.cons
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update customer_stage if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'customer_stage'
    ) THEN
      UPDATE tools t
      SET customer_stage = jst.customer_stage
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update source if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'source'
    ) THEN
      UPDATE tools t
      SET source = jst.source
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update status if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'status'
    ) THEN
      UPDATE tools t
      SET status = jst.status
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
    
    -- Update ranking if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'journey_step_tools' AND column_name = 'ranking'
    ) THEN
      UPDATE tools t
      SET ranking = jst.ranking
      FROM journey_step_tools jst
      WHERE t.id = jst.id;
    END IF;
  END IF;
  
  -- Create a view that makes it easy to query all step-tool relationships with details
  EXECUTE 'CREATE OR REPLACE VIEW journey_step_tools_view AS
  SELECT
    st.id AS relationship_id,
    st.step_id,
    st.tool_id,
    st.relevance_score,
    t.name AS tool_name,
    t.description AS tool_description,
    t.url AS tool_url,
    t.logo_url AS tool_logo_url,
    t.type AS tool_type,
    t.category AS tool_category,
    t.subcategory AS tool_subcategory,
    t.is_premium AS tool_is_premium,
    t.pros AS tool_pros,
    t.cons AS tool_cons,
    t.customer_stage AS tool_customer_stage,
    t.source AS tool_source,
    t.status AS tool_status,
    t.ranking AS tool_ranking,
    js.name AS step_name,
    js.phase_id,
    jp.name AS phase_name
  FROM
    step_tools st
  JOIN
    tools t ON st.tool_id = t.id
  JOIN
    journey_steps js ON st.step_id = js.id
  LEFT JOIN
    journey_phases jp ON js.phase_id = jp.id';
  
  RAISE NOTICE 'Tools table expansion complete. Created journey_step_tools_view for easy access to tool relationships.';
END;
$$;

-- Verify successful expansion
DO $$
DECLARE
  tool_count INTEGER;
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tool_count FROM tools;
  
  SELECT COUNT(*) INTO column_count 
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'tools';
  
  RAISE NOTICE 'Migration complete: % tools with % columns available', tool_count, column_count;
END;
$$;
