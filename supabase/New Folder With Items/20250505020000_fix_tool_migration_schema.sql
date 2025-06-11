-- Tool Migration Schema Fix
-- This migration fixes mismatched columns between tools and journey_step_tools

DO $$
BEGIN
  -- First check if tools table exists, if not create it with the correct schema
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tools') THEN
    RAISE NOTICE 'Creating tools table with basic schema...';
    
    CREATE TABLE tools (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
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
  
  -- Check if we have any journey_step_tools to migrate
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_step_tools') THEN
    RAISE NOTICE 'Found journey_step_tools table, migrating data...';
    
    -- First check which columns exist in tools table
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tools' AND column_name = 'name'
    ) THEN
      RAISE NOTICE 'Migrating core tool data...';
      
      -- Insert only the core columns that are guaranteed to exist
      INSERT INTO tools (
        id, 
        name, 
        description, 
        created_at, 
        updated_at
      )
      SELECT DISTINCT ON (id)
        id,
        name,
        description,
        created_at,
        updated_at
      FROM journey_step_tools
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Core tool data migrated';
    END IF;
    
    -- Now create the step-tool associations
    IF EXISTS (
      SELECT 1 FROM pg_tables WHERE tablename = 'step_tools'
    ) THEN
      RAISE NOTICE 'Creating step-tool associations...';
      
      INSERT INTO step_tools (step_id, tool_id, relevance_score, created_at)
      SELECT 
        step_id,
        id, -- Use the tool ID (journey_step_tools.id)
        CASE 
          WHEN ranking IS NOT NULL THEN ranking / 5.0
          ELSE 0.5
        END,
        created_at
      FROM journey_step_tools
      ON CONFLICT (step_id, tool_id) DO NOTHING;
      
      RAISE NOTICE 'Step-tool associations created';
    END IF;
    
    -- Count records for verification
    DECLARE
      tool_count INTEGER;
      mapping_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO tool_count FROM tools;
      SELECT COUNT(*) INTO mapping_count FROM step_tools;
      
      RAISE NOTICE 'Migration complete: % unique tools migrated', tool_count;
      RAISE NOTICE 'Migration complete: % step-tool associations created', mapping_count;
    END;
  ELSE
    RAISE NOTICE 'journey_step_tools table not found, no migration needed';
  END IF;
  
  -- Create indexes if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_step_tools_step_id'
  ) THEN
    CREATE INDEX idx_step_tools_step_id ON step_tools(step_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_step_tools_tool_id'
  ) THEN
    CREATE INDEX idx_step_tools_tool_id ON step_tools(tool_id);
  END IF;
END
$$;
