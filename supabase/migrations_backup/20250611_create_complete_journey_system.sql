-- Migration: Create Complete Journey System Schema
-- This script defines all new journey_* tables for the redesigned journey system.
-- It is non-destructive and does not alter or drop any existing tables.

-- CORE JOURNEY STRUCTURE

CREATE TABLE journey_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE journey_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE journey_step_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  domain_id UUID REFERENCES journey_domains(id),
  phase_id UUID REFERENCES journey_phases(id),
  order_index INTEGER NOT NULL,
  estimated_days INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES journey_step_templates(id),
  user_id UUID NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- TOOL MARKETPLACE

CREATE TABLE journey_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  logo_url TEXT,
  category TEXT,
  subcategory TEXT,
  metadata JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE journey_tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES journey_tools(id),
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  pros TEXT,
  cons TEXT,
  review_text TEXT,
  use_case_context TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE journey_tool_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES journey_tools(id),
  target_company_stage TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE journey_tool_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES journey_tools(id),
  feature_name TEXT,
  feature_value TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- STEP-TOOL RELATIONSHIPS

CREATE TABLE journey_step_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_template_id UUID REFERENCES journey_step_templates(id),
  tool_id UUID REFERENCES journey_tools(id),
  relevance_score NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);

-- ADMIN & VERSIONING

CREATE TABLE journey_step_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES journey_step_templates(id),
  version_number INTEGER NOT NULL,
  content JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- USER FEEDBACK & ANALYTICS

CREATE TABLE journey_step_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES journey_steps(id),
  user_id UUID NOT NULL,
  feedback_text TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE journey_step_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES journey_steps(id),
  user_id UUID NOT NULL,
  time_spent_seconds INTEGER,
  interactions JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- VIEWS FOR BACKWARD COMPATIBILITY (OPTIONAL)

-- CREATE OR REPLACE VIEW legacy_journey_steps_view AS
-- SELECT js.id, jst.name, jst.description, jp.id AS phase_id, jp.name AS phase_name
-- FROM journey_steps js
-- JOIN journey_step_templates jst ON js.template_id = jst.id
-- JOIN journey_phases jp ON jst.phase_id = jp.id;

-- END OF MIGRATION
