-- Create expert_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS expert_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_expertise_areas TEXT[] NOT NULL,
  secondary_expertise_areas TEXT[],
  industry_experience JSONB,
  functional_experience JSONB,
  company_stages_experienced TEXT[],
  mentorship_capacity INTEGER NOT NULL DEFAULT 0,
  success_stories TEXT[],
  languages_spoken TEXT[],
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create RLS policies for expert_profiles
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for selecting expert profiles (anyone can view)
CREATE POLICY "Anyone can view expert profiles"
  ON expert_profiles FOR SELECT
  USING (true);

-- Policy for inserting expert profiles (authenticated users can insert their own)
CREATE POLICY "Users can create their own expert profile"
  ON expert_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating expert profiles (users can update their own)
CREATE POLICY "Users can update their own expert profile"
  ON expert_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting expert profiles (users can delete their own)
CREATE POLICY "Users can delete their own expert profile"
  ON expert_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Drop and recreate function to get expert endorsement counts
DROP FUNCTION IF EXISTS get_expert_endorsement_counts();

CREATE OR REPLACE FUNCTION get_expert_endorsement_counts()
RETURNS TABLE (expert_id UUID, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT ee.expert_id, COUNT(ee.id)::BIGINT
  FROM expert_endorsements ee
  GROUP BY ee.expert_id;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate function to get expertise area counts
DROP FUNCTION IF EXISTS get_expertise_area_counts();

CREATE OR REPLACE FUNCTION get_expertise_area_counts()
RETURNS TABLE (expertise_area TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT unnest(primary_expertise_areas) as area, COUNT(*)::BIGINT
  FROM expert_profiles
  GROUP BY area
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;
