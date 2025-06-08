-- Migration: 20250607_enhance_community_features_part4.sql
-- Description: Fourth part of the community features enhancement

-- Create recommendation_interactions table
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

-- Create forge_sessions table
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

-- Create breakthrough_boards table
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

-- End of part 4
