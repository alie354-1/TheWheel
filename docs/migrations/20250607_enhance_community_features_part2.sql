-- Migration: 20250607_enhance_community_features_part2.sql
-- Description: Second part of the community features enhancement

-- Note: Enum types are already created in the simple migration

-- Enhance profiles table with additional fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS social_links JSONB,
ADD COLUMN IF NOT EXISTS community_preferences JSONB,
ADD COLUMN IF NOT EXISTS community_visibility VARCHAR(50) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS mentor_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mentor_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS endorsements_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS contribution_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

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

-- Enhance communities table with additional fields
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS community_tier community_tier DEFAULT 'core_portfolio',
ADD COLUMN IF NOT EXISTS group_category group_category,
ADD COLUMN IF NOT EXISTS auto_join_criteria JSONB,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order INTEGER,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS join_requirements TEXT,
ADD COLUMN IF NOT EXISTS community_guidelines TEXT;

-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_comments table
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  author_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_events table
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  group_id UUID,
  organizer_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  virtual_meeting_link TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  event_type event_type,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  max_attendees INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  requires_approval BOOLEAN DEFAULT false,
  target_groups UUID[] DEFAULT '{}',
  co_organizers UUID[] DEFAULT '{}',
  preparation_materials JSONB,
  follow_up_actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table
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

-- End of part 2
