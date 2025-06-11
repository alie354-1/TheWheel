-- Migration: 001_create_community_tables.sql
-- Description: Creates the core tables for the community module

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for various categorizations
CREATE TYPE startup_stage AS ENUM (
  'pre_seed', 
  'seed', 
  'series_a', 
  'series_b', 
  'series_c_plus', 
  'growth', 
  'exit'
);

CREATE TYPE industry_vertical AS ENUM (
  'saas', 
  'fintech', 
  'healthtech', 
  'climate', 
  'ai_ml', 
  'enterprise', 
  'consumer', 
  'marketplace', 
  'hardware', 
  'biotech', 
  'other'
);

CREATE TYPE company_status AS ENUM (
  'active', 
  'acquired', 
  'ipo', 
  'shutdown', 
  'on_hold'
);

CREATE TYPE confidentiality_tier AS ENUM (
  'public', 
  'group', 
  'private', 
  'sensitive'
);

CREATE TYPE group_category AS ENUM (
  'stage_cohort', 
  'functional_guild', 
  'industry_chamber', 
  'geographic_hub', 
  'special_program'
);

CREATE TYPE access_tier AS ENUM (
  'core_portfolio', 
  'alumni_network', 
  'extended_ecosystem', 
  'public'
);

CREATE TYPE group_role AS ENUM (
  'admin', 
  'moderator', 
  'member', 
  'observer'
);

CREATE TYPE membership_status AS ENUM (
  'active', 
  'inactive', 
  'pending', 
  'rejected', 
  'banned'
);

CREATE TYPE discussion_type AS ENUM (
  'general', 
  'question', 
  'showcase', 
  'announcement', 
  'hot_seat', 
  'poll'
);

CREATE TYPE priority_tier AS ENUM (
  'urgent', 
  'high', 
  'normal', 
  'low'
);

CREATE TYPE resolution_state AS ENUM (
  'open', 
  'in_progress', 
  'resolved', 
  'closed'
);

CREATE TYPE reply_category AS ENUM (
  'comment', 
  'answer', 
  'follow_up', 
  'clarification'
);

CREATE TYPE content_entity AS ENUM (
  'thread', 
  'reply', 
  'comment'
);

CREATE TYPE reaction_category AS ENUM (
  'like', 
  'helpful', 
  'insightful', 
  'agree', 
  'disagree', 
  'question'
);

CREATE TYPE verification_state AS ENUM (
  'pending', 
  'verified', 
  'disputed', 
  'self_reported'
);

CREATE TYPE event_category AS ENUM (
  'forge_session', 
  'breakthrough_board', 
  'demo_day', 
  'think_tank', 
  'networking', 
  'workshop'
);

CREATE TYPE event_format_type AS ENUM (
  'virtual', 
  'in_person', 
  'hybrid'
);

CREATE TYPE event_status AS ENUM (
  'scheduled', 
  'ongoing', 
  'completed', 
  'cancelled'
);

CREATE TYPE registration_status AS ENUM (
  'registered', 
  'waitlisted', 
  'confirmed', 
  'attended', 
  'no_show', 
  'cancelled'
);

CREATE TYPE scoring_period_type AS ENUM (
  'daily', 
  'weekly', 
  'monthly', 
  'quarterly', 
  'yearly', 
  'all_time'
);

CREATE TYPE achievement_category AS ENUM (
  'knowledge_sharing', 
  'networking', 
  'mentorship', 
  'innovation', 
  'collaboration', 
  'community_building'
);

CREATE TYPE achievement_tier AS ENUM (
  'bronze', 
  'silver', 
  'gold', 
  'platinum'
);

CREATE TYPE endorsement_level AS ENUM (
  'strong', 
  'moderate', 
  'basic'
);

-- Create tables

-- 1. Portfolio Companies
CREATE TABLE portfolio_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stage startup_stage NOT NULL,
  vertical industry_vertical NOT NULL,
  founded_date DATE,
  team_size INTEGER,
  headquarters_location VARCHAR(255),
  website_url VARCHAR(255),
  logo_url VARCHAR(255),
  status company_status DEFAULT 'active',
  confidentiality_level confidentiality_tier DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Community Groups
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  group_type group_category NOT NULL,
  access_level access_tier NOT NULL,
  auto_join_criteria JSONB,
  max_members INTEGER,
  requires_approval BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  cover_image_url VARCHAR(255),
  icon_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- 3. Group Memberships
CREATE TABLE group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role group_role DEFAULT 'member',
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status membership_status DEFAULT 'active',
  contribution_score INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(group_id, user_id)
);

-- 4. Discussion Threads
CREATE TABLE discussion_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id),
  author_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  thread_type discussion_type DEFAULT 'general',
  priority_level priority_tier DEFAULT 'normal',
  confidentiality_level confidentiality_tier DEFAULT 'group',
  tags TEXT[] DEFAULT '{}',
  mentioned_users UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  unique_participants INTEGER DEFAULT 1,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reply_id UUID,
  resolution_status resolution_state DEFAULT 'open',
  resolution_note TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  ai_summary TEXT,
  ai_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Thread Replies
CREATE TABLE thread_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_reply_id UUID REFERENCES thread_replies(id),
  content TEXT NOT NULL,
  reply_type reply_category DEFAULT 'comment',
  mentioned_users UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_accepted_answer BOOLEAN DEFAULT false,
  is_expert_response BOOLEAN DEFAULT false,
  expert_confidence_score DECIMAL(3,2),
  reaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Content Reactions
CREATE TABLE content_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type content_entity NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type reaction_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id, user_id, reaction_type)
);

-- 7. Expert Responses
CREATE TABLE expert_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES discussion_threads(id),
  reply_id UUID REFERENCES thread_replies(id),
  expert_id UUID NOT NULL,
  expertise_area VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  verification_status verification_state DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Community Events
CREATE TABLE community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_type event_category NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  max_attendees INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  requires_approval BOOLEAN DEFAULT false,
  target_groups UUID[] DEFAULT '{}',
  organizer_id UUID NOT NULL,
  co_organizers UUID[] DEFAULT '{}',
  event_format event_format_type DEFAULT 'virtual',
  location_details JSONB,
  preparation_materials JSONB,
  status event_status DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Event Registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status registration_status DEFAULT 'registered',
  attended BOOLEAN DEFAULT false,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  UNIQUE(event_id, user_id)
);

-- 10. Contribution Scores
CREATE TABLE contribution_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  scoring_period scoring_period_type NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  knowledge_sharing_points INTEGER DEFAULT 0,
  introduction_credits INTEGER DEFAULT 0,
  mentorship_impact_score DECIMAL(8,2) DEFAULT 0,
  community_building_score DECIMAL(8,2) DEFAULT 0,
  total_score DECIMAL(10,2) DEFAULT 0,
  percentile_rank DECIMAL(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scoring_period, period_start)
);

-- 11. Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  achievement_type achievement_category NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT,
  tier achievement_tier DEFAULT 'bronze',
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  badge_image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Expert Profiles
CREATE TABLE expert_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  primary_expertise_areas TEXT[] NOT NULL DEFAULT '{}',
  secondary_expertise_areas TEXT[] DEFAULT '{}',
  industry_experience JSONB,
  functional_experience JSONB,
  company_stages_experienced startup_stage[] DEFAULT '{}',
  mentorship_capacity INTEGER DEFAULT 0,
  success_stories TEXT[],
  languages_spoken VARCHAR(50)[] DEFAULT '{}',
  timezone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Recommendation Interactions
CREATE TABLE recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  recommendation_type VARCHAR(50) NOT NULL,
  recommended_item_id UUID NOT NULL,
  recommended_item_type VARCHAR(50) NOT NULL,
  user_action VARCHAR(50),
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  outcome_success BOOLEAN,
  context_factors JSONB,
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_portfolio_companies_stage ON portfolio_companies(stage);
CREATE INDEX idx_portfolio_companies_vertical ON portfolio_companies(vertical);
CREATE INDEX idx_community_groups_type ON community_groups(group_type);
CREATE INDEX idx_community_groups_access ON community_groups(access_level);
CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX idx_discussion_threads_group ON discussion_threads(group_id);
CREATE INDEX idx_discussion_threads_author ON discussion_threads(author_id);
CREATE INDEX idx_thread_replies_thread ON thread_replies(thread_id);
CREATE INDEX idx_thread_replies_author ON thread_replies(author_id);
CREATE INDEX idx_content_reactions_content ON content_reactions(content_type, content_id);
CREATE INDEX idx_community_events_type ON community_events(event_type);
CREATE INDEX idx_community_events_date ON community_events(start_date);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_contribution_scores_user ON contribution_scores(user_id);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_expert_profiles_expertise ON expert_profiles USING GIN (primary_expertise_areas);
CREATE INDEX idx_recommendation_interactions_user ON recommendation_interactions(user_id);
