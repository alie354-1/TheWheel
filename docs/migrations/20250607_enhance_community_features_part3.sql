-- Migration: 20250607_enhance_community_features_part3.sql
-- Description: Third part of the community features enhancement

-- Create community_groups table
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

-- Create contribution_scores table
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

-- End of part 3
