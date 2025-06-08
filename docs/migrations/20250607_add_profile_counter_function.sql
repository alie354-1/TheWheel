-- Migration: 20250607_add_profile_counter_function.sql
-- Description: Adds a function to safely increment profile counters

-- Create a function to increment profile counters safely
CREATE OR REPLACE FUNCTION increment_profile_counter(
  p_user_id UUID,
  p_counter_field TEXT,
  p_increment_by INTEGER DEFAULT 1
) RETURNS VOID AS $$
DECLARE
  valid_fields TEXT[] := ARRAY['achievements_count', 'endorsements_count', 'contribution_score'];
  query_text TEXT;
BEGIN
  -- Validate the counter field is one we allow
  IF NOT p_counter_field = ANY(valid_fields) THEN
    RAISE EXCEPTION 'Invalid counter field: %', p_counter_field;
  END IF;

  -- Build and execute dynamic query to update the counter
  query_text := format('
    UPDATE profiles 
    SET %I = COALESCE(%I, 0) + $1,
        updated_at = NOW()
    WHERE user_id = $2
  ', p_counter_field, p_counter_field);
  
  EXECUTE query_text USING p_increment_by, p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- End of migration
