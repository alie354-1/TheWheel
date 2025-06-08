-- Migration: 20250607_enhance_community_features_simple.sql
-- Description: Simplified version of the community features enhancement

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
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  bio TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a simple communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- End of migration
