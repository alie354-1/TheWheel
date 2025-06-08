-- Expert Response System Migration
-- This migration adds tables and functions for the expert response system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create expert_profiles table
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
  UNIQUE (user_id)
);

-- Create expert_endorsements table
CREATE TABLE IF NOT EXISTS expert_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_area TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('strong', 'moderate', 'basic')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (expert_id, endorser_id, expertise_area)
);

-- Create expert_responses table
CREATE TABLE IF NOT EXISTS expert_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES thread_replies(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_area TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 50 AND 100),
  verification_status TEXT NOT NULL DEFAULT 'self_reported' CHECK (verification_status IN ('pending', 'verified', 'disputed', 'self_reported')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (reply_id)
);

-- Add expert response fields to thread_replies table
ALTER TABLE thread_replies
ADD COLUMN IF NOT EXISTS is_expert_response BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expert_confidence_score INTEGER CHECK (expert_confidence_score BETWEEN 50 AND 100);

-- Create function to get expert endorsement counts
CREATE OR REPLACE FUNCTION get_expert_endorsement_counts()
RETURNS TABLE (
  expert_id UUID,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.expert_id, COUNT(e.id) as count
  FROM expert_endorsements e
  GROUP BY e.expert_id
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get expertise area counts
CREATE OR REPLACE FUNCTION get_expertise_area_counts()
RETURNS TABLE (
  expertise_area TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.expertise_area, COUNT(e.id) as count
  FROM expert_endorsements e
  GROUP BY e.expertise_area
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get expert responses for a thread
CREATE OR REPLACE FUNCTION get_expert_responses_for_thread(thread_id_param UUID)
RETURNS TABLE (
  id UUID,
  thread_id UUID,
  reply_id UUID,
  expert_id UUID,
  expertise_area TEXT,
  confidence_score INTEGER,
  verification_status TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT er.*
  FROM expert_responses er
  WHERE er.thread_id = thread_id_param;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) policies

-- Enable RLS on expert_profiles
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

-- Expert profiles can be read by anyone
CREATE POLICY expert_profiles_select_policy ON expert_profiles
  FOR SELECT USING (true);

-- Expert profiles can only be created/updated/deleted by the user themselves or admins
CREATE POLICY expert_profiles_insert_policy ON expert_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY expert_profiles_update_policy ON expert_profiles
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY expert_profiles_delete_policy ON expert_profiles
  FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Enable RLS on expert_endorsements
ALTER TABLE expert_endorsements ENABLE ROW LEVEL SECURITY;

-- Expert endorsements can be read by anyone
CREATE POLICY expert_endorsements_select_policy ON expert_endorsements
  FOR SELECT USING (true);

-- Expert endorsements can only be created by the endorser
CREATE POLICY expert_endorsements_insert_policy ON expert_endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id);

-- Expert endorsements can only be updated/deleted by the endorser or admins
CREATE POLICY expert_endorsements_update_policy ON expert_endorsements
  FOR UPDATE USING (auth.uid() = endorser_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY expert_endorsements_delete_policy ON expert_endorsements
  FOR DELETE USING (auth.uid() = endorser_id OR auth.jwt() ->> 'role' = 'admin');

-- Enable RLS on expert_responses
ALTER TABLE expert_responses ENABLE ROW LEVEL SECURITY;

-- Expert responses can be read by anyone
CREATE POLICY expert_responses_select_policy ON expert_responses
  FOR SELECT USING (true);

-- Expert responses can only be created by the expert
CREATE POLICY expert_responses_insert_policy ON expert_responses
  FOR INSERT WITH CHECK (auth.uid() = expert_id);

-- Expert responses can be updated by the expert or moderators/admins
CREATE POLICY expert_responses_update_policy ON expert_responses
  FOR UPDATE USING (
    auth.uid() = expert_id OR 
    auth.jwt() ->> 'role' IN ('admin', 'moderator')
  );

-- Expert responses can be deleted by the expert or moderators/admins
CREATE POLICY expert_responses_delete_policy ON expert_responses
  FOR DELETE USING (
    auth.uid() = expert_id OR 
    auth.jwt() ->> 'role' IN ('admin', 'moderator')
  );

-- Create triggers to update thread_replies when expert_responses are created/deleted

-- Function to update thread_replies when an expert response is created
CREATE OR REPLACE FUNCTION update_thread_reply_on_expert_response_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE thread_replies
  SET 
    is_expert_response = TRUE,
    expert_confidence_score = NEW.confidence_score
  WHERE id = NEW.reply_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update thread_replies when an expert response is deleted
CREATE OR REPLACE FUNCTION update_thread_reply_on_expert_response_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE thread_replies
  SET 
    is_expert_response = FALSE,
    expert_confidence_score = NULL
  WHERE id = OLD.reply_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER expert_response_insert_trigger
AFTER INSERT ON expert_responses
FOR EACH ROW
EXECUTE FUNCTION update_thread_reply_on_expert_response_insert();

CREATE TRIGGER expert_response_delete_trigger
AFTER DELETE ON expert_responses
FOR EACH ROW
EXECUTE FUNCTION update_thread_reply_on_expert_response_delete();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS expert_profiles_user_id_idx ON expert_profiles(user_id);
CREATE INDEX IF NOT EXISTS expert_endorsements_expert_id_idx ON expert_endorsements(expert_id);
CREATE INDEX IF NOT EXISTS expert_endorsements_endorser_id_idx ON expert_endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS expert_endorsements_expertise_area_idx ON expert_endorsements(expertise_area);
CREATE INDEX IF NOT EXISTS expert_responses_thread_id_idx ON expert_responses(thread_id);
CREATE INDEX IF NOT EXISTS expert_responses_reply_id_idx ON expert_responses(reply_id);
CREATE INDEX IF NOT EXISTS expert_responses_expert_id_idx ON expert_responses(expert_id);
CREATE INDEX IF NOT EXISTS expert_responses_expertise_area_idx ON expert_responses(expertise_area);
CREATE INDEX IF NOT EXISTS thread_replies_is_expert_response_idx ON thread_replies(is_expert_response);
