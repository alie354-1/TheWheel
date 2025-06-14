-- Migration: Create New Journey System Schema
-- Description: This creates a parallel journey system implementation
-- with framework tables and company-specific tables.

-- Journey Framework Tables (Platform-Managed)
CREATE TABLE IF NOT EXISTS journey_new_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journey_new_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Framework steps (canonical 150 steps)
CREATE TABLE IF NOT EXISTS journey_new_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  primary_phase_id UUID REFERENCES journey_new_phases(id),
  primary_domain_id UUID REFERENCES journey_new_domains(id),
  order_index INTEGER NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('Low', 'Medium', 'High')),
  estimated_days INTEGER DEFAULT 1,
  
  -- Rich content
  why_this_matters TEXT,
  deliverables TEXT[],
  success_criteria TEXT[],
  potential_blockers TEXT[],
  guidance_notes TEXT,
  target_company_types TEXT[],
  recommended_tools JSONB,
  dependencies TEXT[], -- References to other step names/IDs
  follow_up_steps TEXT[], -- Suggested next steps
  
  -- Framework management
  version VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Company-specific implementation tables
CREATE TABLE IF NOT EXISTS company_new_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(200) DEFAULT 'Company Journey',
  status VARCHAR(50) DEFAULT 'active',
  
  -- Customization tracking
  customization_level VARCHAR(50) DEFAULT 'standard',
  custom_phases JSONB DEFAULT '[]',
  custom_domains JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Company-specific steps (customizable)
CREATE TABLE IF NOT EXISTS company_new_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES company_new_journeys(id),
  framework_step_id UUID REFERENCES journey_new_steps(id), -- NULL for custom steps
  
  -- Core step data (customizable)
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phase_id UUID REFERENCES journey_new_phases(id),
  domain_id UUID REFERENCES journey_new_domains(id),
  
  -- Company-specific customization
  custom_deliverables TEXT[],
  custom_success_criteria TEXT[],
  custom_guidance TEXT,
  estimated_days INTEGER,
  difficulty VARCHAR(20),
  
  -- Progress tracking
  status VARCHAR(50) DEFAULT 'not_started',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  skipped_at TIMESTAMP,
  due_date DATE,
  
  -- Customization metadata
  is_custom_step BOOLEAN DEFAULT false,
  customized_fields TEXT[], -- Track which fields were customized
  order_index INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step tasks (sub-items within steps)
CREATE TABLE IF NOT EXISTS new_journey_step_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES company_new_journey_steps(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  result_data JSONB, -- Store task results/notes
  completed_at TIMESTAMP,
  order_index INTEGER DEFAULT 0
);

-- Step outcomes with detailed tracking
CREATE TABLE IF NOT EXISTS new_journey_step_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_step_id UUID NOT NULL REFERENCES company_new_journey_steps(id),
  
  -- Task-level results
  task_results JSONB NOT NULL DEFAULT '{}',
  
  -- Overall metrics
  time_taken INTEGER, -- days
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  
  -- Qualitative feedback
  notes TEXT,
  key_learnings TEXT[],
  blockers_encountered TEXT[],
  tools_used TEXT[],
  
  -- Sharing preferences
  share_anonymously BOOLEAN DEFAULT false,
  community_contribution_id UUID,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adaptive suggestions tracking
CREATE TABLE IF NOT EXISTS new_journey_adaptive_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id UUID NOT NULL REFERENCES new_journey_step_outcomes(id),
  
  -- Suggestion content
  suggestion_text TEXT NOT NULL,
  suggestion_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  reasoning TEXT,
  
  -- User interaction
  shown_to_user BOOLEAN DEFAULT false,
  accepted BOOLEAN,
  acted_upon BOOLEAN,
  user_feedback TEXT,
  
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Anonymized outcomes for community learning
CREATE TABLE IF NOT EXISTS new_journey_anonymized_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_step_id UUID NOT NULL REFERENCES journey_new_steps(id),
  
  -- Anonymized metrics
  industry_category VARCHAR(100),
  company_stage VARCHAR(50),
  team_size_range VARCHAR(20),
  
  -- Outcome data (anonymized)
  success_level INTEGER,
  time_taken_days INTEGER,
  confidence_level INTEGER,
  tools_used TEXT[],
  common_blockers TEXT[],
  key_insights TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Standup bot sessions and analysis
CREATE TABLE IF NOT EXISTS new_journey_standup_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  step_id UUID REFERENCES company_new_journey_steps(id),
  
  -- Session data
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  messages JSONB DEFAULT '[]',
  
  -- Analysis results
  extracted_progress JSONB,
  suggested_actions JSONB,
  confidence_scores JSONB,
  
  -- Follow-up
  actions_taken JSONB DEFAULT '[]',
  followup_needed BOOLEAN DEFAULT false,
  followup_questions TEXT[]
);

-- AI question generation for contextual follow-ups
CREATE TABLE IF NOT EXISTS new_journey_ai_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  step_id UUID REFERENCES company_new_journey_steps(id),
  
  question_type VARCHAR(50),
  priority VARCHAR(20),
  question_text TEXT NOT NULL,
  context_data JSONB,
  followup_questions TEXT[],
  
  -- Scheduling
  schedule_for DATE,
  asked_at TIMESTAMP,
  answered_at TIMESTAMP,
  skipped_at TIMESTAMP,
  
  -- Response tracking
  answer_text TEXT,
  answer_structured_data JSONB,
  processing_result JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_new_journey_steps_journey_id ON company_new_journey_steps(journey_id);
CREATE INDEX IF NOT EXISTS idx_company_new_journey_steps_status ON company_new_journey_steps(status);
CREATE INDEX IF NOT EXISTS idx_new_journey_step_tasks_step_id ON new_journey_step_tasks(step_id);
CREATE INDEX IF NOT EXISTS idx_new_journey_step_outcomes_company_step_id ON new_journey_step_outcomes(company_step_id);
CREATE INDEX IF NOT EXISTS idx_new_journey_standup_sessions_company_id ON new_journey_standup_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_new_journey_standup_sessions_step_id ON new_journey_standup_sessions(step_id);

-- Create functions for real-time features
CREATE OR REPLACE FUNCTION update_journey_new_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_journey_new_phases_updated_at
BEFORE UPDATE ON journey_new_phases
FOR EACH ROW
EXECUTE FUNCTION update_journey_new_updated_at();

CREATE TRIGGER set_journey_new_domains_updated_at
BEFORE UPDATE ON journey_new_domains
FOR EACH ROW
EXECUTE FUNCTION update_journey_new_updated_at();

CREATE TRIGGER set_journey_new_steps_updated_at
BEFORE UPDATE ON journey_new_steps
FOR EACH ROW
EXECUTE FUNCTION update_journey_new_updated_at();

CREATE TRIGGER set_company_new_journeys_updated_at
BEFORE UPDATE ON company_new_journeys
FOR EACH ROW
EXECUTE FUNCTION update_journey_new_updated_at();

CREATE TRIGGER set_company_new_journey_steps_updated_at
BEFORE UPDATE ON company_new_journey_steps
FOR EACH ROW
EXECUTE FUNCTION update_journey_new_updated_at();
