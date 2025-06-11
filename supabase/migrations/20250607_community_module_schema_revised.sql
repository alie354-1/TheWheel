-- Community Module Database Migration
-- This file adds all necessary tables and schema for the community module
-- Date: 2025-06-07

-- Start transaction
BEGIN;

-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE startup_stage AS ENUM ('pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus', 'growth', 'exit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE industry_vertical AS ENUM ('saas', 'fintech', 'healthtech', 'climate', 'ai_ml', 'enterprise', 'consumer', 'marketplace', 'hardware', 'biotech', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE company_status AS ENUM ('active', 'acquired', 'ipo', 'shutdown', 'on_hold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE confidentiality_tier AS ENUM ('public', 'group', 'private', 'sensitive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE group_category AS ENUM ('stage_cohort', 'functional_guild', 'industry_chamber', 'geographic_hub', 'special_program');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE access_tier AS ENUM ('core_portfolio', 'alumni_network', 'extended_ecosystem', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE group_role AS ENUM ('admin', 'moderator', 'member', 'observer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'pending', 'rejected', 'banned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discussion_type AS ENUM ('general', 'question', 'showcase', 'announcement', 'hot_seat', 'poll');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_tier AS ENUM ('urgent', 'high', 'normal', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resolution_state AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reply_category AS ENUM ('comment', 'answer', 'follow_up', 'clarification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_entity AS ENUM ('thread', 'reply', 'comment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reaction_category AS ENUM ('like', 'helpful', 'insightful', 'agree', 'disagree', 'question');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_state AS ENUM ('pending', 'verified', 'disputed', 'self_reported');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('forge_session', 'breakthrough_board', 'demo_day', 'think_tank', 'networking', 'workshop');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_format_type AS ENUM ('virtual', 'in_person', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('registered', 'waitlisted', 'confirmed', 'attended', 'no_show', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scoring_period_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE achievement_category AS ENUM ('knowledge_sharing', 'networking', 'mentorship', 'innovation', 'collaboration', 'community_building');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE endorsement_level AS ENUM ('strong', 'moderate', 'basic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create community_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  group_type group_category NOT NULL,
  access_level access_tier NOT NULL,
  auto_join_criteria JSONB,
  max_members INTEGER,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image_url TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create group_memberships table if it doesn't exist
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  join_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status membership_status NOT NULL DEFAULT 'active',
  contribution_score INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(group_id, user_id)
);

-- Create discussion_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS discussion_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thread_type discussion_type NOT NULL DEFAULT 'general',
  priority_level priority_tier NOT NULL DEFAULT 'normal',
  confidentiality_level confidentiality_tier NOT NULL DEFAULT 'group',
  tags TEXT[],
  mentioned_users UUID[],
  attachments JSONB,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  unique_participants INTEGER NOT NULL DEFAULT 1,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_reply_id UUID,
  resolution_status resolution_state NOT NULL DEFAULT 'open',
  resolution_note TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  ai_summary TEXT,
  ai_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create thread_replies table if it doesn't exist
CREATE TABLE IF NOT EXISTS thread_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  parent_reply_id UUID REFERENCES thread_replies(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  reply_type reply_category NOT NULL DEFAULT 'comment',
  mentioned_users UUID[],
  attachments JSONB,
  is_accepted_answer BOOLEAN NOT NULL DEFAULT FALSE,
  is_expert_response BOOLEAN NOT NULL DEFAULT FALSE,
  expert_confidence_score FLOAT,
  reaction_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create content_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS content_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type content_entity NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reaction_type reaction_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(content_type, content_id, user_id, reaction_type)
);

-- Create expert_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS expert_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES thread_replies(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES auth.users(id),
  expertise_area TEXT NOT NULL,
  confidence_score FLOAT NOT NULL,
  verification_status verification_state NOT NULL DEFAULT 'self_reported',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK (thread_id IS NOT NULL OR reply_id IS NOT NULL)
);

-- Create community_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type event_category NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_pattern JSONB,
  max_attendees INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  target_groups UUID[],
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  co_organizers UUID[],
  event_format event_format_type NOT NULL DEFAULT 'virtual',
  location_details JSONB,
  preparation_materials JSONB,
  status event_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK (start_date < end_date)
);

-- Create event_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status registration_status NOT NULL DEFAULT 'registered',
  attended BOOLEAN NOT NULL DEFAULT FALSE,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  UNIQUE(event_id, user_id)
);

-- Create expert_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS expert_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  primary_expertise_areas TEXT[] NOT NULL,
  secondary_expertise_areas TEXT[],
  industry_experience JSONB,
  functional_experience JSONB,
  company_stages_experienced startup_stage[],
  mentorship_capacity INTEGER NOT NULL DEFAULT 0,
  success_stories TEXT[],
  languages_spoken TEXT[],
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create expert_endorsements table if it doesn't exist
CREATE TABLE IF NOT EXISTS expert_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id),
  endorser_id UUID NOT NULL REFERENCES auth.users(id),
  expertise_area TEXT NOT NULL,
  level endorsement_level NOT NULL DEFAULT 'moderate',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(expert_id, endorser_id, expertise_area),
  CHECK (expert_id != endorser_id)
);

-- Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_type achievement_category NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  tier achievement_tier NOT NULL DEFAULT 'bronze',
  earned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  badge_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_name)
);

-- Create contribution_scores table if it doesn't exist
CREATE TABLE IF NOT EXISTS contribution_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  scoring_period scoring_period_type NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  knowledge_sharing_points INTEGER NOT NULL DEFAULT 0,
  introduction_credits INTEGER NOT NULL DEFAULT 0,
  mentorship_impact_score INTEGER NOT NULL DEFAULT 0,
  community_building_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  percentile_rank FLOAT,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scoring_period, period_start)
);

-- Create recommendation_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recommendation_type TEXT NOT NULL,
  recommended_item_id UUID NOT NULL,
  recommended_item_type TEXT NOT NULL,
  user_action TEXT,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  outcome_success BOOLEAN,
  context_factors JSONB,
  interaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_memberships_group_id') THEN
        CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_memberships_user_id') THEN
        CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_discussion_threads_group_id') THEN
        CREATE INDEX idx_discussion_threads_group_id ON discussion_threads(group_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_discussion_threads_author_id') THEN
        CREATE INDEX idx_discussion_threads_author_id ON discussion_threads(author_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_thread_replies_thread_id') THEN
        CREATE INDEX idx_thread_replies_thread_id ON thread_replies(thread_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_thread_replies_author_id') THEN
        CREATE INDEX idx_thread_replies_author_id ON thread_replies(author_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_reactions_content') THEN
        CREATE INDEX idx_content_reactions_content ON content_reactions(content_type, content_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_reactions_user_id') THEN
        CREATE INDEX idx_content_reactions_user_id ON content_reactions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_community_events_organizer_id') THEN
        CREATE INDEX idx_community_events_organizer_id ON community_events(organizer_id);
    END IF;
    
    -- Check if the start_date column exists before creating the index
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'community_events' 
        AND column_name = 'start_date'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_community_events_start_date'
    ) THEN
        CREATE INDEX idx_community_events_start_date ON community_events(start_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_event_registrations_event_id') THEN
        CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_event_registrations_user_id') THEN
        CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expert_endorsements_expert_id') THEN
        CREATE INDEX idx_expert_endorsements_expert_id ON expert_endorsements(expert_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_achievements_user_id') THEN
        CREATE INDEX idx_achievements_user_id ON achievements(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contribution_scores_user_id') THEN
        CREATE INDEX idx_contribution_scores_user_id ON contribution_scores(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contribution_scores_period') THEN
        CREATE INDEX idx_contribution_scores_period ON contribution_scores(scoring_period, period_start);
    END IF;
END $$;

-- Create functions for thread statistics if they don't exist
CREATE OR REPLACE FUNCTION increment_reply_count(thread_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE discussion_threads
  SET reply_count = reply_count + 1
  WHERE id = thread_id
  RETURNING reply_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_reply_count(thread_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE discussion_threads
  SET reply_count = GREATEST(0, reply_count - 1)
  WHERE id = thread_id
  RETURNING reply_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_unique_participants(thread_id UUID, new_participant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  is_new BOOLEAN;
  new_count INTEGER;
BEGIN
  -- Check if this user has already participated
  SELECT COUNT(*) = 0 INTO is_new
  FROM thread_replies
  WHERE thread_id = update_unique_participants.thread_id
    AND author_id = new_participant_id;
  
  -- If new participant, increment the count
  IF is_new THEN
    UPDATE discussion_threads
    SET unique_participants = unique_participants + 1
    WHERE id = thread_id
    RETURNING unique_participants INTO new_count;
  ELSE
    SELECT unique_participants INTO new_count
    FROM discussion_threads
    WHERE id = thread_id;
  END IF;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Create functions for reaction counts if they don't exist
CREATE OR REPLACE FUNCTION increment_reaction_count(reply_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE thread_replies
  SET reaction_count = reaction_count + 1
  WHERE id = reply_id
  RETURNING reaction_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_reaction_count(reply_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE thread_replies
  SET reaction_count = GREATEST(0, reaction_count - 1)
  WHERE id = reply_id
  RETURNING reaction_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Create functions for expert endorsement counts if they don't exist
CREATE OR REPLACE FUNCTION get_expert_endorsement_counts()
RETURNS TABLE(expert_id UUID, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT e.expert_id, COUNT(*) as count
  FROM expert_endorsements e
  GROUP BY e.expert_id
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function for expertise area counts if it doesn't exist
CREATE OR REPLACE FUNCTION get_expertise_area_counts()
RETURNS TABLE(area TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH expertise_areas AS (
    SELECT unnest(primary_expertise_areas) as area
    FROM expert_profiles
    UNION ALL
    SELECT unnest(secondary_expertise_areas) as area
    FROM expert_profiles
    WHERE secondary_expertise_areas IS NOT NULL
  )
  SELECT ea.area, COUNT(*) as count
  FROM expertise_areas ea
  WHERE ea.area IS NOT NULL
  GROUP BY ea.area
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on tables
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for community_groups
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON community_groups;
CREATE POLICY "Public groups are viewable by everyone" 
ON community_groups FOR SELECT 
USING ((community_groups.access_level)::text = 'public' AND NOT community_groups.is_archived);

DROP POLICY IF EXISTS "Extended ecosystem groups are viewable by authenticated users" ON community_groups;
CREATE POLICY "Extended ecosystem groups are viewable by authenticated users" 
ON community_groups FOR SELECT 
USING ((community_groups.access_level)::text IN ('public', 'extended_ecosystem') AND NOT community_groups.is_archived);

DROP POLICY IF EXISTS "All groups are viewable by admins" ON community_groups;
CREATE POLICY "All groups are viewable by admins" 
ON community_groups FOR SELECT 
USING (auth.uid() IN (SELECT group_memberships.user_id FROM group_memberships WHERE group_memberships.role = 'admin'::group_role));

DROP POLICY IF EXISTS "Group members can view their groups" ON community_groups;
CREATE POLICY "Group members can view their groups" 
ON community_groups FOR SELECT 
USING (community_groups.id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.status = 'active'::membership_status));

DROP POLICY IF EXISTS "Admins can create groups" ON community_groups;
CREATE POLICY "Admins can create groups" 
ON community_groups FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT group_memberships.user_id FROM group_memberships WHERE group_memberships.role = 'admin'::group_role));

DROP POLICY IF EXISTS "Group admins can update their groups" ON community_groups;
CREATE POLICY "Group admins can update their groups" 
ON community_groups FOR UPDATE 
USING (auth.uid() IN (SELECT group_memberships.user_id FROM group_memberships WHERE group_memberships.group_id = community_groups.id AND group_memberships.role = 'admin'::group_role));

-- Create RLS policies for group_memberships
DROP POLICY IF EXISTS "Users can view memberships of their groups" ON group_memberships;
CREATE POLICY "Users can view memberships of their groups" 
ON group_memberships FOR SELECT 
USING (group_memberships.group_id IN (SELECT community_groups.id FROM community_groups WHERE community_groups.id IN (SELECT group_memberships_1.group_id FROM group_memberships group_memberships_1 WHERE group_memberships_1.user_id = auth.uid() AND group_memberships_1.status = 'active'::membership_status)));

DROP POLICY IF EXISTS "Users can view their own memberships" ON group_memberships;
CREATE POLICY "Users can view their own memberships" 
ON group_memberships FOR SELECT 
USING (group_memberships.user_id = auth.uid());

DROP POLICY IF EXISTS "Users can join groups" ON group_memberships;
CREATE POLICY "Users can join groups" 
ON group_memberships FOR INSERT 
WITH CHECK (group_memberships.user_id = auth.uid());

DROP POLICY IF EXISTS "Group admins can manage memberships" ON group_memberships;
CREATE POLICY "Group admins can manage memberships" 
ON group_memberships FOR UPDATE 
USING (group_memberships.group_id IN (SELECT group_memberships_1.group_id FROM group_memberships group_memberships_1 WHERE group_memberships_1.user_id = auth.uid() AND group_memberships_1.role = 'admin'::group_role));

-- Create RLS policies for discussion_threads
DROP POLICY IF EXISTS "Users can view threads in their groups" ON discussion_threads;
CREATE POLICY "Users can view threads in their groups" 
ON discussion_threads FOR SELECT 
USING (discussion_threads.group_id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.status = 'active'::membership_status));

DROP POLICY IF EXISTS "Users can create threads in their groups" ON discussion_threads;
CREATE POLICY "Users can create threads in their groups" 
ON discussion_threads FOR INSERT 
WITH CHECK (discussion_threads.group_id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.status = 'active'::membership_status) AND discussion_threads.author_id = auth.uid());

DROP POLICY IF EXISTS "Thread authors can update their threads" ON discussion_threads;
CREATE POLICY "Thread authors can update their threads" 
ON discussion_threads FOR UPDATE 
USING (discussion_threads.author_id = auth.uid());

DROP POLICY IF EXISTS "Group admins can update any thread in their groups" ON discussion_threads;
CREATE POLICY "Group admins can update any thread in their groups" 
ON discussion_threads FOR UPDATE 
USING (discussion_threads.group_id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.role IN ('admin'::group_role, 'moderator'::group_role)));

-- Create RLS policies for thread_replies
DROP POLICY IF EXISTS "Users can view replies to threads they can see" ON thread_replies;
CREATE POLICY "Users can view replies to threads they can see" 
ON thread_replies FOR SELECT 
USING (thread_replies.thread_id IN (SELECT discussion_threads.id FROM discussion_threads WHERE discussion_threads.group_id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.status = 'active'::membership_status)));

DROP POLICY IF EXISTS "Users can create replies to threads they can see" ON thread_replies;
CREATE POLICY "Users can create replies to threads they can see" 
ON thread_replies FOR INSERT 
WITH CHECK (thread_replies.thread_id IN (SELECT discussion_threads.id FROM discussion_threads WHERE discussion_threads.group_id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.status = 'active'::membership_status)) AND thread_replies.author_id = auth.uid());

DROP POLICY IF EXISTS "Reply authors can update their replies" ON thread_replies;
CREATE POLICY "Reply authors can update their replies" 
ON thread_replies FOR UPDATE 
USING (thread_replies.author_id = auth.uid());

DROP POLICY IF EXISTS "Group admins can update any reply in their groups" ON thread_replies;
CREATE POLICY "Group admins can update any reply in their groups" 
ON thread_replies FOR UPDATE 
USING (thread_replies.thread_id IN (SELECT discussion_threads.id FROM discussion_threads WHERE discussion_threads.group_id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.role IN ('admin'::group_role, 'moderator'::group_role))));

-- Create RLS policies for content_reactions
DROP POLICY IF EXISTS "Users can view reactions to content they can see" ON content_reactions;
CREATE POLICY "Users can view reactions to content they can see" 
ON content_reactions FOR SELECT 
USING (
  (content_reactions.content_type = 'thread'::content_entity AND content_reactions.content_id IN (SELECT discussion_threads.id FROM discussion_threads WHERE discussion_threads.group_id IN (SELECT group_memberships.group_id FROM group_memberships WHERE group_memberships.user_id = auth.uid() AND group_memberships.status = 'active'::membership_status))) OR
  (content_reactions.content_type = 'reply'::content_entity AND content_reactions.content_id IN (SELECT thread_replies.id FROM thread_replies WHERE thread_replies.thread_id IN (SELECT discussion_threads.id FROM discussion_threads WHERE discussion_threads.group_id IN (SELECT group_memberships.group_
