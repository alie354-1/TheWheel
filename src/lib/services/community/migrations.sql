-- Community Module Database Migrations
-- This file contains SQL statements to create the necessary tables for the community module.

-- Create enum types
CREATE TYPE startup_stage AS ENUM ('pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus', 'growth', 'exit');
CREATE TYPE industry_vertical AS ENUM ('saas', 'fintech', 'healthtech', 'climate', 'ai_ml', 'enterprise', 'consumer', 'marketplace', 'hardware', 'biotech', 'other');
CREATE TYPE company_status AS ENUM ('active', 'acquired', 'ipo', 'shutdown', 'on_hold');
CREATE TYPE confidentiality_tier AS ENUM ('public', 'group', 'private', 'sensitive');
CREATE TYPE group_category AS ENUM ('stage_cohort', 'functional_guild', 'industry_chamber', 'geographic_hub', 'special_program');
CREATE TYPE access_tier AS ENUM ('core_portfolio', 'alumni_network', 'extended_ecosystem', 'public');
CREATE TYPE group_role AS ENUM ('admin', 'moderator', 'member', 'observer');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'pending', 'rejected', 'banned');
CREATE TYPE discussion_type AS ENUM ('general', 'question', 'showcase', 'announcement', 'hot_seat', 'poll');
CREATE TYPE priority_tier AS ENUM ('urgent', 'high', 'normal', 'low');
CREATE TYPE resolution_state AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE reply_category AS ENUM ('comment', 'answer', 'follow_up', 'clarification');
CREATE TYPE content_entity AS ENUM ('thread', 'reply', 'comment');
CREATE TYPE reaction_category AS ENUM ('like', 'helpful', 'insightful', 'agree', 'disagree', 'question');
CREATE TYPE verification_state AS ENUM ('pending', 'verified', 'disputed', 'self_reported');
CREATE TYPE event_category AS ENUM ('forge_session', 'breakthrough_board', 'demo_day', 'think_tank', 'networking', 'workshop');
CREATE TYPE event_format_type AS ENUM ('virtual', 'in_person', 'hybrid');
CREATE TYPE event_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('registered', 'waitlisted', 'confirmed', 'attended', 'no_show', 'cancelled');
CREATE TYPE scoring_period_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time');
CREATE TYPE achievement_category AS ENUM ('knowledge_sharing', 'networking', 'mentorship', 'innovation', 'collaboration', 'community_building');
CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE endorsement_level AS ENUM ('strong', 'moderate', 'basic');

-- Create community_groups table
CREATE TABLE community_groups (
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

-- Create group_memberships table
CREATE TABLE group_memberships (
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

-- Create discussion_threads table
CREATE TABLE discussion_threads (
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

-- Create thread_replies table
CREATE TABLE thread_replies (
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

-- Create content_reactions table
CREATE TABLE content_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type content_entity NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reaction_type reaction_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(content_type, content_id, user_id, reaction_type)
);

-- Create expert_responses table
CREATE TABLE expert_responses (
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

-- Create community_events table
CREATE TABLE community_events (
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

-- Create event_registrations table
CREATE TABLE event_registrations (
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

-- Create expert_profiles table
CREATE TABLE expert_profiles (
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

-- Create expert_endorsements table
CREATE TABLE expert_endorsements (
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

-- Create achievements table
CREATE TABLE achievements (
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

-- Create contribution_scores table
CREATE TABLE contribution_scores (
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

-- Create recommendation_interactions table
CREATE TABLE recommendation_interactions (
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

-- Create indexes for performance
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX idx_discussion_threads_group_id ON discussion_threads(group_id);
CREATE INDEX idx_discussion_threads_author_id ON discussion_threads(author_id);
CREATE INDEX idx_thread_replies_thread_id ON thread_replies(thread_id);
CREATE INDEX idx_thread_replies_author_id ON thread_replies(author_id);
CREATE INDEX idx_content_reactions_content ON content_reactions(content_type, content_id);
CREATE INDEX idx_content_reactions_user_id ON content_reactions(user_id);
CREATE INDEX idx_community_events_organizer_id ON community_events(organizer_id);
CREATE INDEX idx_community_events_start_date ON community_events(start_date);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_expert_endorsements_expert_id ON expert_endorsements(expert_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_contribution_scores_user_id ON contribution_scores(user_id);
CREATE INDEX idx_contribution_scores_period ON contribution_scores(scoring_period, period_start);

-- Create functions for thread statistics
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

-- Create functions for reaction counts
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

-- Create functions for expert endorsement counts
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

-- Create function for expertise area counts
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

-- Create RLS policies
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

-- Create policy for community_groups
CREATE POLICY "Public groups are viewable by everyone" 
ON community_groups FOR SELECT 
USING (access_level = 'public' AND NOT is_archived);

CREATE POLICY "Extended ecosystem groups are viewable by authenticated users" 
ON community_groups FOR SELECT 
USING (access_level IN ('public', 'extended_ecosystem') AND NOT is_archived);

CREATE POLICY "All groups are viewable by admins" 
ON community_groups FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM group_memberships WHERE role = 'admin'));

CREATE POLICY "Group members can view their groups" 
ON community_groups FOR SELECT 
USING (id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Admins can create groups" 
ON community_groups FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM group_memberships WHERE role = 'admin'));

CREATE POLICY "Group admins can update their groups" 
ON community_groups FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM group_memberships WHERE group_id = id AND role = 'admin'));

-- Create policy for group_memberships
CREATE POLICY "Users can view memberships of their groups" 
ON group_memberships FOR SELECT 
USING (group_id IN (SELECT id FROM community_groups WHERE id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active')));

CREATE POLICY "Users can view their own memberships" 
ON group_memberships FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can join groups" 
ON group_memberships FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Group admins can manage memberships" 
ON group_memberships FOR UPDATE 
USING (group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND role = 'admin'));

-- Create policy for discussion_threads
CREATE POLICY "Users can view threads in their groups" 
ON discussion_threads FOR SELECT 
USING (group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Users can create threads in their groups" 
ON discussion_threads FOR INSERT 
WITH CHECK (group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active') AND author_id = auth.uid());

CREATE POLICY "Thread authors can update their threads" 
ON discussion_threads FOR UPDATE 
USING (author_id = auth.uid());

CREATE POLICY "Group admins can update any thread in their groups" 
ON discussion_threads FOR UPDATE 
USING (group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')));

-- Create policy for thread_replies
CREATE POLICY "Users can view replies to threads they can see" 
ON thread_replies FOR SELECT 
USING (thread_id IN (SELECT id FROM discussion_threads WHERE group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active')));

CREATE POLICY "Users can create replies to threads they can see" 
ON thread_replies FOR INSERT 
WITH CHECK (thread_id IN (SELECT id FROM discussion_threads WHERE group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active')) AND author_id = auth.uid());

CREATE POLICY "Reply authors can update their replies" 
ON thread_replies FOR UPDATE 
USING (author_id = auth.uid());

CREATE POLICY "Group admins can update any reply in their groups" 
ON thread_replies FOR UPDATE 
USING (thread_id IN (SELECT id FROM discussion_threads WHERE group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))));

-- Create policy for content_reactions
CREATE POLICY "Users can view reactions to content they can see" 
ON content_reactions FOR SELECT 
USING (
  (content_type = 'thread' AND content_id IN (SELECT id FROM discussion_threads WHERE group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active'))) OR
  (content_type = 'reply' AND content_id IN (SELECT id FROM thread_replies WHERE thread_id IN (SELECT id FROM discussion_threads WHERE group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active'))))
);

CREATE POLICY "Users can create reactions to content they can see" 
ON content_reactions FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  (
    (content_type = 'thread' AND content_id IN (SELECT id FROM discussion_threads WHERE group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active'))) OR
    (content_type = 'reply' AND content_id IN (SELECT id FROM thread_replies WHERE thread_id IN (SELECT id FROM discussion_threads WHERE group_id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active'))))
  )
);

CREATE POLICY "Users can delete their own reactions" 
ON content_reactions FOR DELETE 
USING (user_id = auth.uid());

-- Create policy for community_events
CREATE POLICY "Public events are viewable by everyone" 
ON community_events FOR SELECT 
USING (
  status != 'cancelled' AND
  (
    target_groups IS NULL OR
    array_length(target_groups, 1) IS NULL OR
    EXISTS (SELECT 1 FROM community_groups WHERE id = ANY(target_groups) AND access_level = 'public')
  )
);

CREATE POLICY "Users can view events for their groups" 
ON community_events FOR SELECT 
USING (
  target_groups IS NULL OR
  array_length(target_groups, 1) IS NULL OR
  EXISTS (SELECT 1 FROM community_groups WHERE id = ANY(target_groups) AND id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active'))
);

CREATE POLICY "Users can create events" 
ON community_events FOR INSERT 
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Event organizers can update their events" 
ON community_events FOR UPDATE 
USING (organizer_id = auth.uid() OR auth.uid() = ANY(co_organizers));

-- Create policy for event_registrations
CREATE POLICY "Users can view registrations for events they can see" 
ON event_registrations FOR SELECT 
USING (
  event_id IN (
    SELECT id FROM community_events WHERE 
    organizer_id = auth.uid() OR 
    auth.uid() = ANY(co_organizers) OR
    (
      target_groups IS NULL OR
      array_length(target_groups, 1) IS NULL OR
      EXISTS (SELECT 1 FROM community_groups WHERE id = ANY(target_groups) AND (access_level = 'public' OR id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active')))
    )
  )
);

CREATE POLICY "Users can view their own registrations" 
ON event_registrations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can register for events" 
ON event_registrations FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations" 
ON event_registrations FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Event organizers can update registrations" 
ON event_registrations FOR UPDATE 
USING (event_id IN (SELECT id FROM community_events WHERE organizer_id = auth.uid() OR auth.uid() = ANY(co_organizers)));

-- Create policy for expert_profiles
CREATE POLICY "Expert profiles are viewable by everyone" 
ON expert_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own expert profile" 
ON expert_profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expert profile" 
ON expert_profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Create policy for expert_endorsements
CREATE POLICY "Expert endorsements are viewable by everyone" 
ON expert_endorsements FOR SELECT 
USING (true);

CREATE POLICY "Users can create endorsements" 
ON expert_endorsements FOR INSERT 
WITH CHECK (endorser_id = auth.uid());

CREATE POLICY "Users can update their own endorsements" 
ON expert_endorsements FOR UPDATE 
USING (endorser_id = auth.uid());

CREATE POLICY "Users can delete their own endorsements" 
ON expert_endorsements FOR DELETE 
USING (endorser_id = auth.uid());

-- Create policy for achievements
CREATE POLICY "Public achievements are viewable by everyone" 
ON achievements FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own achievements" 
ON achievements FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update visibility of their achievements" 
ON achievements FOR UPDATE 
USING (user_id = auth.uid());

-- Create policy for contribution_scores
CREATE POLICY "Users can view their own contribution scores" 
ON contribution_scores FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all contribution scores" 
ON contribution_scores FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM group_memberships WHERE role = 'admin'));

-- Create policy for recommendation_interactions
CREATE POLICY "Users can view their own recommendation interactions" 
ON recommendation_interactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own recommendation interactions" 
ON recommendation_interactions FOR INSERT 
WITH CHECK (user_id = auth.uid());
