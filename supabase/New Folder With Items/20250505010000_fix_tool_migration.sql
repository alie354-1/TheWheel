-- Fixed Tool Migration SQL
-- This migration fixes the tool_id column reference issue

DO $$
BEGIN
  -- Check if tools table exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tools') THEN
    RAISE NOTICE 'Creating tools table...';
    
    CREATE TABLE tools (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      url TEXT,
      logo_url TEXT,
      type VARCHAR(50) DEFAULT 'external',
      category VARCHAR(100),
      subcategory VARCHAR(100),
      is_premium BOOLEAN DEFAULT FALSE,
      pros TEXT,
      cons TEXT,
      customer_stage VARCHAR(100),
      source VARCHAR(50),
      status VARCHAR(50) DEFAULT 'approved',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    RAISE NOTICE 'Tools table created successfully';
  END IF;
  
  -- Check if step_tools table exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'step_tools') THEN
    RAISE NOTICE 'Creating step_tools table...';
    
    CREATE TABLE step_tools (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
      tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
      relevance_score DECIMAL(3,2) DEFAULT 0.5,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(step_id, tool_id)
    );
    
    RAISE NOTICE 'Step tools table created successfully';
  END IF;
  
  -- Check if journey_step_tools exists to migrate from
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_step_tools') THEN
    RAISE NOTICE 'Found journey_step_tools table, migrating tool data...';
    
    -- First, migrate the tool definitions
    -- We're treating the 'id' column from journey_step_tools as the tool_id
    INSERT INTO tools (
      id, 
      name, 
      description, 
      url, 
      logo_url, 
      type, 
      category, 
      subcategory, 
      is_premium, 
      pros, 
      cons, 
      customer_stage, 
      source, 
      status, 
      created_at, 
      updated_at
    )
    SELECT DISTINCT ON (id)
      id,
      name,
      description,
      url,
      logo_url,
      type,
      category,
      subcategory,
      is_premium,
      pros,
      cons,
      customer_stage,
      source,
      status,
      created_at,
      updated_at
    FROM journey_step_tools
    ON CONFLICT (id) DO NOTHING;
    
    -- Now create the step-tool associations
    -- Here we use the 'id' column as the tool_id reference
    INSERT INTO step_tools (step_id, tool_id, relevance_score, created_at)
    SELECT 
      step_id,
      id, -- This is the journey_step_tools.id being used as the tool_id
      COALESCE(ranking / 5.0, 0.5), -- Convert 0-5 ranking to 0-1 relevance score
      created_at
    FROM journey_step_tools
    ON CONFLICT (step_id, tool_id) DO NOTHING;
    
    -- Record counts for verification
    RAISE NOTICE 'Migration complete: % unique tools migrated', (SELECT COUNT(*) FROM tools);
    RAISE NOTICE 'Migration complete: % step-tool associations created', (SELECT COUNT(*) FROM step_tools);
  ELSE
    RAISE NOTICE 'journey_step_tools table not found, no migration needed';
  END IF;
  
  -- Create indexes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_step_tools_step_id') THEN
    CREATE INDEX idx_step_tools_step_id ON step_tools(step_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_step_tools_tool_id') THEN
    CREATE INDEX idx_step_tools_tool_id ON step_tools(tool_id);
  END IF;
END
$$;
