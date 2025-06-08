-- Migration: 20250607_enhance_community_features.sql
-- Description: Enhances the existing community features with advanced functionality

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

CREATE TYPE community_tier AS ENUM (
  'core_portfolio', 
  'alumni_network', 
  'extended_ecosystem'
);

CREATE TYPE group_category AS ENUM (
  'stage_cohort', 
  'functional_guild', 
  'industry_chamber', 
  'geographic_hub', 
  'special_program'
);

CREATE TYPE event_type AS ENUM (
  'forge_session', 
  'breakthrough_board', 
  'demo_day', 
  'think_tank', 
  'success_story'
);

CREATE TYPE achievement_category AS ENUM (
  'knowledge_sharing', 
  'networking', 
  'mentorship', 
  'innovation', 
  'collaboration'
);

CREATE TYPE achievement_tier AS ENUM (
  'bronze', 
  'silver', 
  'gold', 
  'platinum'
);

-- Create extended profiles table if it doesn't exist
-- This table extends the users table with community-specific profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL, -- Will add foreign key constraint to users.id later
  bio TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  social_links JSONB,
  community_preferences JSONB,
  community_visibility VARCHAR(50) DEFAULT 'public',
  mentor_status BOOLEAN DEFAULT false,
  mentor_areas TEXT[] DEFAULT '{}',
  achievements_count INTEGER DEFAULT 0,
  endorsements_count INTEGER DEFAULT 0,
  contribution_score INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table if it doesn't exist (for reference only - should already exist)
-- DO NOT EXECUTE THIS SECTION IF USERS TABLE ALREADY EXISTS
/*
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  company_id UUID,
  job_title VARCHAR(255),
  location VARCHAR(255),
  website VARCHAR(255),
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  industry industry_vertical,
  stage startup_stage,
  founded_date DATE,
  headquarters VARCHAR(255),
  employee_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table if it doesn't exist
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID, -- Will add foreign key constraint after profiles table is created
  is_private BOOLEAN DEFAULT false,
  banner_url TEXT,
  avatar_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID, -- Will add foreign key constraint after profiles table is created
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  author_id UUID, -- Will add foreign key constraint after profiles table is created
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  group_id UUID,
  organizer_id UUID, -- Will add foreign key constraint after profiles table is created
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  virtual_meeting_link TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'confirmed',
  attendance_status VARCHAR(50),
  feedback TEXT,
  UNIQUE(event_id, user_id)
);


-- Enhance existing communities table with tiered structure
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS community_tier community_tier DEFAULT 'core_portfolio',
ADD COLUMN IF NOT EXISTS group_category group_category,
ADD COLUMN IF NOT EXISTS auto_join_criteria JSONB,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order INTEGER,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS join_requirements TEXT,
ADD COLUMN IF NOT EXISTS community_guidelines TEXT;

-- Create community_groups table for the dynamic group ecosystem
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  group_type group_category NOT NULL,
  parent_group_id UUID REFERENCES community_groups(id),
  is_private BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  auto_join_criteria JSONB,
  max_members INTEGER,
  cover_image_url TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(community_id, slug)
);

-- Create group_memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  contribution_score INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(group_id, user_id)
);

-- Enhance community_events table with event types and additional fields
ALTER TABLE community_events
ADD COLUMN IF NOT EXISTS event_type event_type,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
ADD COLUMN IF NOT EXISTS max_attendees INTEGER,
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS target_groups UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS co_organizers UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preparation_materials JSONB,
ADD COLUMN IF NOT EXISTS follow_up_actions JSONB;

-- Create expert_profiles table
CREATE TABLE IF NOT EXISTS expert_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) UNIQUE,
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

-- Create expert_responses table
CREATE TABLE IF NOT EXISTS expert_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id),
  comment_id UUID REFERENCES community_comments(id),
  expert_id UUID NOT NULL REFERENCES profiles(id),
  expertise_area VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  verification_status VARCHAR(50) DEFAULT 'pending',
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contribution_scores table for gamification
CREATE TABLE IF NOT EXISTS contribution_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  scoring_period VARCHAR(50) NOT NULL,
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

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  achievement_type achievement_category NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT,
  tier achievement_tier DEFAULT 'bronze',
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  badge_image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendation_interactions table for ML training
CREATE TABLE IF NOT EXISTS recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  recommendation_type VARCHAR(50) NOT NULL,
  recommended_item_id UUID NOT NULL,
  recommended_item_type VARCHAR(50) NOT NULL,
  user_action VARCHAR(50),
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  outcome_success BOOLEAN,
  context_factors JSONB,
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forge_sessions table for hot seat problem-solving
CREATE TABLE IF NOT EXISTS forge_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  presenter_id UUID NOT NULL REFERENCES profiles(id),
  challenge_title VARCHAR(255) NOT NULL,
  challenge_description TEXT NOT NULL,
  desired_outcomes TEXT,
  session_notes TEXT,
  action_items JSONB,
  follow_up_date DATE,
  success_metrics JSONB,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create breakthrough_boards table for virtual board meetings
CREATE TABLE IF NOT EXISTS breakthrough_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  presenter_id UUID NOT NULL REFERENCES profiles(id),
  board_packet JSONB,
  meeting_agenda TEXT[],
  key_metrics JSONB,
  strategic_questions TEXT[],
  observer_feedback JSONB,
  action_items JSONB,
  follow_up_date DATE,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create peer_endorsements table
CREATE TABLE IF NOT EXISTS peer_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id),
  to_user_id UUID NOT NULL REFERENCES profiles(id),
  skill_area VARCHAR(100) NOT NULL,
  endorsement_strength VARCHAR(50) NOT NULL,
  specific_skill VARCHAR(255),
  context_description TEXT,
  evidence_examples TEXT[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id, skill_area, specific_skill)
);

-- Create community_analytics table
CREATE TABLE IF NOT EXISTS community_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type VARCHAR(100) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  time_period VARCHAR(50) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  community_id UUID REFERENCES communities(id),
  group_id UUID REFERENCES community_groups(id),
  user_segment VARCHAR(100),
  metric_value DECIMAL(15,4) NOT NULL,
  metric_metadata JSONB,
  comparative_metrics JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_type, metric_name, time_period, period_start, community_id, group_id, user_segment)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_tier ON communities(community_tier);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(group_category);
CREATE INDEX IF NOT EXISTS idx_community_groups_type ON community_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_community_groups_community ON community_groups(community_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_events_type ON community_events(event_type);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_expertise ON expert_profiles USING GIN (primary_expertise_areas);
CREATE INDEX IF NOT EXISTS idx_contribution_scores_user ON contribution_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_interactions_user ON recommendation_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forge_sessions_presenter ON forge_sessions(presenter_id);
CREATE INDEX IF NOT EXISTS idx_breakthrough_boards_company ON breakthrough_boards(company_id);
CREATE INDEX IF NOT EXISTS idx_peer_endorsements_to_user ON peer_endorsements(to_user_id);

-- Add foreign key constraints now that profiles table exists
ALTER TABLE communities
ADD CONSTRAINT fk_communities_owner_id FOREIGN KEY (owner_id) REFERENCES profiles(id);

ALTER TABLE community_posts
ADD CONSTRAINT fk_community_posts_author_id FOREIGN KEY (author_id) REFERENCES profiles(id);

ALTER TABLE community_comments
ADD CONSTRAINT fk_community_comments_author_id FOREIGN KEY (author_id) REFERENCES profiles(id);

ALTER TABLE community_events
ADD CONSTRAINT fk_community_events_organizer_id FOREIGN KEY (organizer_id) REFERENCES profiles(id);

-- Add foreign key constraint for profiles.user_id to reference users.id
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id);

-- End of migration
