-- Migration: Journey System Unification
-- Description: Consolidates steps and challenges into a unified data model & handles important tool mappings
-- Date: 2025-05-05

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Display found tables for diagnostics
DO $$
DECLARE
  tables_found text;
  cols_found text;
BEGIN
  SELECT string_agg(tablename, ', ') INTO tables_found 
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'Found tables: %', tables_found;
  
  -- Check specifically for the journey_step_tools table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_step_tools') THEN
    RAISE NOTICE 'journey_step_tools exists, checking columns...';
    
    SELECT string_agg(column_name, ', ') INTO cols_found
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'journey_step_tools';
    
    RAISE NOTICE 'journey_step_tools columns: %', cols_found;
  END IF;
END
$$;

-- Create the core table structure
CREATE TABLE IF NOT EXISTS journey_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  color VARCHAR(20) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journey_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phase_id UUID NOT NULL REFERENCES journey_phases(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 3,
  estimated_time_min INTEGER NOT NULL DEFAULT 30,
  estimated_time_max INTEGER NOT NULL DEFAULT 60,
  key_outcomes TEXT[] NULL DEFAULT '{}',
  prerequisite_steps UUID[] NULL DEFAULT '{}',
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Check if companies table exists, and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies') THEN
    -- Create a minimal companies table if it doesn't exist
    CREATE TABLE companies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END
$$;

-- Check if tools table exists, and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tools') THEN
    -- Create a minimal tools table if it doesn't exist
    CREATE TABLE tools (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50),
      is_premium BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END
$$;

-- Create important tool mapping tables
-- Tool mappings are critical for the journey system
CREATE TABLE IF NOT EXISTS step_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_id, tool_id)
);

-- Create company-specific tool selections
CREATE TABLE IF NOT EXISTS company_step_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  rating INTEGER NULL CHECK (rating BETWEEN 1 AND 5),
  notes TEXT NULL,
  selected_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, step_id, tool_id)
);

-- Create company_journey_steps table for tracking company progress
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_steps') THEN
    CREATE TABLE company_journey_steps (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
      notes TEXT NULL,
      custom_difficulty INTEGER NULL CHECK (custom_difficulty BETWEEN 1 AND 5),
      custom_time_estimate INTEGER NULL,
      completion_percentage INTEGER NULL CHECK (completion_percentage BETWEEN 0 AND 100),
      order_index INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ NULL,
      UNIQUE(company_id, step_id)
    );
  END IF;
END
$$;

-- Create views for backward compatibility
DROP VIEW IF EXISTS journey_challenges_view;
CREATE VIEW journey_challenges_view AS
SELECT
  id,
  name,
  description,
  phase_id,
  difficulty_level,
  estimated_time_min,
  estimated_time_max,
  key_outcomes,
  prerequisite_steps AS prerequisite_challenges,
  order_index,
  created_at,
  updated_at,
  is_custom
FROM
  journey_steps;

-- IMPORTANT: Migrate tool associations from journey_step_tools if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_step_tools') THEN
    RAISE NOTICE 'Found journey_step_tools table, migrating tool associations...';
    
    -- Migrate data from journey_step_tools to step_tools
    INSERT INTO step_tools (step_id, tool_id, relevance_score, created_at)
    SELECT 
      step_id, 
      tool_id, 
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='journey_step_tools' AND column_name='relevance_score')
        THEN (SELECT relevance_score FROM journey_step_tools WHERE id=jst.id)
        ELSE NULL
      END,
      COALESCE(jst.created_at, NOW())
    FROM journey_step_tools jst
    ON CONFLICT (step_id, tool_id) DO NOTHING;
    
    RAISE NOTICE 'Tool associations migration complete';
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journey_steps_phase_id ON journey_steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_step_tools_step_id ON step_tools(step_id);
CREATE INDEX IF NOT EXISTS idx_step_tools_tool_id ON step_tools(tool_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_step_tools_timestamp ON step_tools;
CREATE TRIGGER update_step_tools_timestamp
BEFORE UPDATE ON step_tools
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_company_step_tools_timestamp ON company_step_tools;
CREATE TRIGGER update_company_step_tools_timestamp
BEFORE UPDATE ON company_step_tools
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add company_step_tools indexes
CREATE INDEX IF NOT EXISTS idx_company_step_tools_company_id ON company_step_tools(company_id);
CREATE INDEX IF NOT EXISTS idx_company_step_tools_step_id ON company_step_tools(step_id);
CREATE INDEX IF NOT EXISTS idx_company_step_tools_tool_id ON company_step_tools(tool_id);
