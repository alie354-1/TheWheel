-- Migration: Add Journey System Redesign Tables
-- This script creates all tables for the redesigned journey system and tool marketplace.
-- To remove deprecated tables, use the DROP TABLE statements at the end.

-- === JOURNEY SYSTEM TABLES ===

-- Phases
CREATE TABLE IF NOT EXISTS journey_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon_url TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Domains
CREATE TABLE IF NOT EXISTS journey_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Step Templates
CREATE TABLE IF NOT EXISTS journey_step_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Low', 'Medium', 'High')),
  category TEXT,
  tags TEXT[],
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN DEFAULT true,
  previous_version_id UUID REFERENCES journey_step_templates(id),
  content_markdown TEXT,
  expected_outcomes TEXT[],
  prerequisites TEXT[],
  checklist JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  applicable_stages UUID[],
  applicable_industries UUID[],
  is_active BOOLEAN DEFAULT true,
  is_community_created BOOLEAN DEFAULT false,
  creator_id UUID,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Steps
CREATE TABLE IF NOT EXISTS journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES journey_step_templates(id),
  phase_id UUID REFERENCES journey_phases(id),
  domain_id UUID REFERENCES journey_domains(id),
  name TEXT NOT NULL,
  description TEXT,
  estimated_time TEXT,
  difficulty TEXT CHECK (difficulty IN ('Low', 'Medium', 'High')),
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  dependencies UUID[],
  release_conditions JSONB DEFAULT '{}'::jsonb,
  applicable_startup_stages UUID[],
  content_override_markdown TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE(phase_id, domain_id, order_index)
);

-- Company Paths
CREATE TABLE IF NOT EXISTS journey_company_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Company Steps
CREATE TABLE IF NOT EXISTS journey_company_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES journey_company_paths(id) ON DELETE CASCADE,
  step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE,
  is_customized BOOLEAN DEFAULT false,
  custom_name TEXT,
  custom_description TEXT,
  custom_content_markdown TEXT,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE(path_id, step_id)
);

-- Progress
CREATE TABLE IF NOT EXISTS journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_step_id UUID REFERENCES journey_company_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped', 'blocked')),
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER,
  notes TEXT,
  blockers TEXT[],
  artifacts JSONB DEFAULT '[]'::jsonb,
  feedback JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID
);

-- Step Comments
CREATE TABLE IF NOT EXISTS journey_step_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID REFERENCES journey_progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES journey_step_comments(id),
  is_expert_response BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step History
CREATE TABLE IF NOT EXISTS journey_step_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  changed_by UUID NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step Experts
CREATE TABLE IF NOT EXISTS journey_step_experts (
  step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL,
  relevance_score FLOAT,
  contribution_type TEXT[],
  notes TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (step_id, expert_id)
);

-- Community Submissions
CREATE TABLE IF NOT EXISTS journey_community_step_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES journey_step_templates(id),
  submitter_id UUID NOT NULL,
  company_id UUID,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  reviewer_id UUID,
  review_notes TEXT,
  review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- === CLEANUP: DROP DEPRECATED TABLES ===
-- Uncomment the lines below to remove old tables once migration is complete

-- DROP TABLE IF EXISTS steps CASCADE;
-- DROP TABLE IF EXISTS step_templates CASCADE;
-- DROP TABLE IF EXISTS step_instances CASCADE;
-- DROP TABLE IF EXISTS step_tools CASCADE;
-- DROP TABLE IF EXISTS step_progress CASCADE;
-- DROP TABLE IF EXISTS company_journey_steps CASCADE;
-- DROP TABLE IF EXISTS journey_steps CASCADE;
