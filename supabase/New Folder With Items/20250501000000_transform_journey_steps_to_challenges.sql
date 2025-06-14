-- 20250501000000_transform_journey_steps_to_challenges.sql
-- Migration to create new schema for the challenge-based journey architecture

-- Create journey_phases table
CREATE TABLE IF NOT EXISTS journey_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create update_timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate it
DROP TRIGGER IF EXISTS update_journey_phases_timestamp ON journey_phases;
CREATE TRIGGER update_journey_phases_timestamp
BEFORE UPDATE ON journey_phases
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create journey_challenges table
CREATE TABLE IF NOT EXISTS journey_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  phase_id UUID REFERENCES journey_phases(id) ON DELETE CASCADE,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time_min INTEGER NOT NULL,
  estimated_time_max INTEGER NOT NULL,
  key_outcomes TEXT[] NOT NULL DEFAULT '{}',
  prerequisite_challenges UUID[] DEFAULT '{}',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop trigger if exists and recreate it for journey_challenges
DROP TRIGGER IF EXISTS update_journey_challenges_timestamp ON journey_challenges;
CREATE TRIGGER update_journey_challenges_timestamp
BEFORE UPDATE ON journey_challenges
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create companies table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create company_challenge_progress table
CREATE TABLE IF NOT EXISTS company_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES journey_challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, challenge_id)
);

-- Drop trigger if exists and recreate it for company_challenge_progress
DROP TRIGGER IF EXISTS update_company_challenge_progress_timestamp ON company_challenge_progress;
CREATE TRIGGER update_company_challenge_progress_timestamp
BEFORE UPDATE ON company_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create tools table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for challenge tool recommendations
CREATE TABLE IF NOT EXISTS challenge_tool_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES journey_challenges(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  relevance_score FLOAT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, tool_id)
);

-- Drop trigger if exists and recreate it for challenge_tool_recommendations
DROP TRIGGER IF EXISTS update_challenge_tool_recommendations_timestamp ON challenge_tool_recommendations;
CREATE TRIGGER update_challenge_tool_recommendations_timestamp
BEFORE UPDATE ON challenge_tool_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create indexes for better query performance if they don't exist yet
CREATE INDEX IF NOT EXISTS idx_journey_challenges_phase_id ON journey_challenges(phase_id);
CREATE INDEX IF NOT EXISTS idx_company_challenge_progress_company_id ON company_challenge_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_company_challenge_progress_challenge_id ON company_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_tool_recommendations_challenge_id ON challenge_tool_recommendations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_tool_recommendations_tool_id ON challenge_tool_recommendations(tool_id);
