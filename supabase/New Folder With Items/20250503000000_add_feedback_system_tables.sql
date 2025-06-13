-- Feedback System Tables for Sprint 4 (User Feedback Collection System)
-- Migration created: May 3, 2025

-- Create feedback table for storing user ratings and comments
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company_id UUID REFERENCES companies,
  entity_type VARCHAR(50) NOT NULL, -- 'step', 'tool', 'resource', etc.
  entity_id UUID NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient lookup of feedback by entity
CREATE INDEX IF NOT EXISTS feedback_entity_idx ON feedback(entity_type, entity_id);

-- Create index for efficient lookup of user's feedback
CREATE INDEX IF NOT EXISTS feedback_user_idx ON feedback(user_id);

-- Create improvement suggestions table for storing user suggestions
CREATE TABLE IF NOT EXISTS improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company_id UUID REFERENCES companies,
  entity_type VARCHAR(50) NOT NULL, -- 'step', 'tool', 'resource', etc.
  entity_id UUID NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  impact_description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient lookup of suggestions by entity
CREATE INDEX IF NOT EXISTS improvement_suggestions_entity_idx ON improvement_suggestions(entity_type, entity_id);

-- Create index for efficient lookup of user's suggestions
CREATE INDEX IF NOT EXISTS improvement_suggestions_user_idx ON improvement_suggestions(user_id);

-- Create index for looking up suggestions by status
CREATE INDEX IF NOT EXISTS improvement_suggestions_status_idx ON improvement_suggestions(status);

-- Create votes on suggestions table for tracking user votes
CREATE TABLE IF NOT EXISTS suggestion_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID REFERENCES improvement_suggestions NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  vote_type VARCHAR(10) NOT NULL, -- 'up' or 'down'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- Create index for efficient lookup of votes by suggestion
CREATE INDEX IF NOT EXISTS suggestion_votes_suggestion_idx ON suggestion_votes(suggestion_id);

-- Create index for efficient lookup of votes by user
CREATE INDEX IF NOT EXISTS suggestion_votes_user_idx ON suggestion_votes(user_id);

-- Create trigger function to update vote count when votes change
CREATE OR REPLACE FUNCTION update_suggestion_votes()
RETURNS TRIGGER AS $$
DECLARE
  vote_diff INTEGER := 0;
BEGIN
  -- Calculate the vote differential based on the operation
  IF TG_OP = 'INSERT' THEN
    -- For a new vote, add 1 for 'up', subtract 1 for 'down'
    vote_diff := CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END;
  ELSIF TG_OP = 'UPDATE' THEN
    -- For an updated vote, calculate the differential
    -- If changing from 'up' to 'down', that's -2
    -- If changing from 'down' to 'up', that's +2
    vote_diff := CASE 
      WHEN OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN -2
      WHEN OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN 2
      ELSE 0
    END;
  ELSIF TG_OP = 'DELETE' THEN
    -- For a deleted vote, subtract 1 for 'up', add 1 for 'down'
    vote_diff := CASE WHEN OLD.vote_type = 'up' THEN -1 ELSE 1 END;
  END IF;
  
  -- Update the suggestion's vote count
  IF TG_OP = 'DELETE' THEN
    UPDATE improvement_suggestions 
    SET votes = votes + vote_diff,
        updated_at = NOW()
    WHERE id = OLD.suggestion_id;
  ELSE
    UPDATE improvement_suggestions 
    SET votes = votes + vote_diff,
        updated_at = NOW()
    WHERE id = NEW.suggestion_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for vote count updates
CREATE TRIGGER suggestion_vote_insert
AFTER INSERT ON suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION update_suggestion_votes();

CREATE TRIGGER suggestion_vote_update
AFTER UPDATE ON suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION update_suggestion_votes();

CREATE TRIGGER suggestion_vote_delete
AFTER DELETE ON suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION update_suggestion_votes();

-- Create function to handle voting on a suggestion with transaction safety
CREATE OR REPLACE FUNCTION vote_on_suggestion(
  p_suggestion_id UUID,
  p_user_id UUID,
  p_vote_type VARCHAR,
  p_previous_vote_type VARCHAR
)
RETURNS VOID AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- If user already voted
    IF p_previous_vote_type IS NOT NULL THEN
      -- If same vote type, remove the vote (toggle off)
      IF p_previous_vote_type = p_vote_type THEN
        DELETE FROM suggestion_votes
        WHERE suggestion_id = p_suggestion_id AND user_id = p_user_id;
      -- If different vote type, update the vote
      ELSE
        UPDATE suggestion_votes
        SET vote_type = p_vote_type
        WHERE suggestion_id = p_suggestion_id AND user_id = p_user_id;
      END IF;
    -- If no previous vote, insert new vote
    ELSE
      INSERT INTO suggestion_votes (suggestion_id, user_id, vote_type)
      VALUES (p_suggestion_id, p_user_id, p_vote_type);
    END IF;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to get feedback statistics for an entity
CREATE OR REPLACE FUNCTION get_feedback_stats(
  p_entity_id UUID,
  p_entity_type VARCHAR
)
RETURNS TABLE (
  entity_id UUID,
  average_rating DECIMAL,
  rating_count INTEGER,
  rating_1_count INTEGER,
  rating_2_count INTEGER,
  rating_3_count INTEGER,
  rating_4_count INTEGER,
  rating_5_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_entity_id,
    COALESCE(AVG(rating), 0)::DECIMAL AS average_rating,
    COUNT(rating) AS rating_count,
    COUNT(*) FILTER (WHERE rating = 1) AS rating_1_count,
    COUNT(*) FILTER (WHERE rating = 2) AS rating_2_count,
    COUNT(*) FILTER (WHERE rating = 3) AS rating_3_count,
    COUNT(*) FILTER (WHERE rating = 4) AS rating_4_count,
    COUNT(*) FILTER (WHERE rating = 5) AS rating_5_count
  FROM feedback
  WHERE entity_id = p_entity_id AND entity_type = p_entity_type;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for feedback tables
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all feedback
CREATE POLICY feedback_read_policy ON feedback
  FOR SELECT USING (true);

-- Create policy to allow users to submit feedback only for themselves
CREATE POLICY feedback_insert_policy ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own feedback
CREATE POLICY feedback_update_policy ON feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to read all suggestions
CREATE POLICY improvement_suggestions_read_policy ON improvement_suggestions
  FOR SELECT USING (true);

-- Create policy to allow users to submit suggestions only for themselves
CREATE POLICY improvement_suggestions_insert_policy ON improvement_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own suggestions
CREATE POLICY improvement_suggestions_update_policy ON improvement_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to read all votes
CREATE POLICY suggestion_votes_read_policy ON suggestion_votes
  FOR SELECT USING (true);

-- Create policy to allow users to submit votes only for themselves
CREATE POLICY suggestion_votes_insert_policy ON suggestion_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own votes
CREATE POLICY suggestion_votes_update_policy ON suggestion_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own votes
CREATE POLICY suggestion_votes_delete_policy ON suggestion_votes
  FOR DELETE USING (auth.uid() = user_id);
