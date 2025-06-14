-- =====================================================
-- NEW JOURNEY SYSTEM - COMPLETE SCHEMA
-- Based on MRD/PRD 150-Step Framework
-- =====================================================

-- Enums (reuse existing ones)
-- step_status, difficulty_level already exist

-- Core Framework Tables (Canonical 150-Step Framework)
CREATE TABLE journey_phases_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE journey_domains_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 150 Canonical Framework Steps
CREATE TABLE journey_steps_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  phase_id UUID REFERENCES journey_phases_new(id),
  domain_id UUID REFERENCES journey_domains_new(id),
  order_index INTEGER NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('Low', 'Medium', 'High')),
  estimated_time_days INTEGER DEFAULT 1,
  
  -- MRD-Specific Rich Content
  deliverables TEXT[],
  success_criteria TEXT[],
  potential_blockers TEXT[],
  guidance_notes TEXT,
  target_company_types TEXT[],
  recommended_tools TEXT[],
  dependencies TEXT[], -- References to other step names/IDs
  follow_up_steps TEXT[], -- Suggested next steps
  
  -- Framework Management
  version VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  usage_percentage INTEGER DEFAULT 0, -- For "Usage %" in browse table
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sub-tasks within steps
CREATE TABLE journey_step_tasks_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES journey_steps_new(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Implementation Tables
CREATE TABLE company_journeys_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(200) DEFAULT 'New Journey',
  status VARCHAR(50) DEFAULT 'active',
  customization_level VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company-specific steps (customizable from framework)
CREATE TABLE company_journey_steps_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES company_journeys_new(id),
  canonical_step_id UUID REFERENCES journey_steps_new(id),
  
  -- Core step data (customizable)
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phase_id UUID REFERENCES journey_phases_new(id),
  domain_id UUID REFERENCES journey_domains_new(id),
  
  -- Company-specific customization
  custom_deliverables TEXT[],
  custom_success_criteria TEXT[],
  custom_guidance TEXT,
  estimated_days INTEGER,
  custom_difficulty VARCHAR(20) CHECK (custom_difficulty IN ('Low', 'Medium', 'High')),
  
  -- Progress tracking
  status VARCHAR(50) DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  
  -- Metadata
  is_custom_step BOOLEAN DEFAULT false,
  customized_fields TEXT[],
  order_index INTEGER,
  is_urgent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task-level tracking within company steps
CREATE TABLE company_step_tasks_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_step_id UUID NOT NULL REFERENCES company_journey_steps_new(id) ON DELETE CASCADE,
  canonical_task_id UUID REFERENCES journey_step_tasks_new(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  result_data JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0
);

-- MRD Feature: Detailed Outcome Capture
CREATE TABLE step_outcomes_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_step_id UUID NOT NULL REFERENCES company_journey_steps_new(id),
  
  -- Task-level results
  task_results JSONB NOT NULL DEFAULT '{}',
  
  -- Overall metrics (from MRD wireframes)
  time_taken_days INTEGER,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  
  -- Qualitative feedback
  notes TEXT,
  key_learnings TEXT[],
  blockers_encountered TEXT[],
  tools_used TEXT[],
  
  -- Community sharing
  share_anonymously BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MRD Feature: Adaptive Suggestions Engine
CREATE TABLE adaptive_suggestions_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_step_id UUID REFERENCES company_journey_steps_new(id),
  outcome_id UUID REFERENCES step_outcomes_new(id),
  
  -- Suggestion content
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  suggestion_type VARCHAR(50) NOT NULL, -- 'next_step', 'improvement', 'tool_recommendation'
  priority VARCHAR(20) NOT NULL, -- 'urgent', 'high', 'medium', 'low'
  reasoning TEXT,
  estimated_impact TEXT,
  action_items TEXT[],
  
  -- AI metadata
  ai_provider VARCHAR(50) DEFAULT 'openai', -- Easy to switch later
  ai_model VARCHAR(50) DEFAULT 'gpt-4',
  confidence_score DECIMAL(3,2),
  
  -- User interaction
  shown_to_user BOOLEAN DEFAULT false,
  accepted BOOLEAN,
  acted_upon BOOLEAN,
  user_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- MRD Feature: Standup Bot Integration
CREATE TABLE standup_sessions_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  company_step_id UUID REFERENCES company_journey_steps_new(id),
  
  -- Session data
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  messages JSONB DEFAULT '[]',
  
  -- AI analysis results
  extracted_progress JSONB DEFAULT '{}',
  suggested_actions JSONB DEFAULT '[]',
  confidence_scores JSONB DEFAULT '{}',
  
  -- Follow-up
  actions_taken JSONB DEFAULT '[]',
  followup_needed BOOLEAN DEFAULT false,
  followup_questions TEXT[],
  
  -- AI metadata
  ai_provider VARCHAR(50) DEFAULT 'openai',
  ai_model VARCHAR(50) DEFAULT 'gpt-4'
);

-- MRD Feature: Community Intelligence (Anonymized)
CREATE TABLE anonymized_outcomes_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_step_id UUID NOT NULL REFERENCES journey_steps_new(id),
  
  -- Anonymized company data
  industry_category VARCHAR(100),
  company_stage VARCHAR(50),
  team_size_range VARCHAR(20),
  
  -- Anonymized outcome data
  success_level INTEGER CHECK (success_level BETWEEN 1 AND 5),
  time_taken_days INTEGER,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  tools_used TEXT[],
  common_blockers TEXT[],
  key_insights TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MRD Feature: VC Portfolio Management
CREATE TABLE vc_portfolios_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vc_firm_id UUID NOT NULL,
  company_id UUID REFERENCES companies(id),
  investment_stage VARCHAR(50),
  investment_date DATE,
  
  -- Privacy controls
  can_view_progress BOOLEAN DEFAULT false,
  can_view_detailed_metrics BOOLEAN DEFAULT false,
  data_sharing_level VARCHAR(20) DEFAULT 'basic',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_journey_steps_new_phase_domain ON journey_steps_new(phase_id, domain_id);
CREATE INDEX idx_company_journey_steps_new_journey ON company_journey_steps_new(journey_id);
CREATE INDEX idx_company_journey_steps_new_status ON company_journey_steps_new(status);
CREATE INDEX idx_step_outcomes_new_company_step ON step_outcomes_new(company_step_id);
CREATE INDEX idx_adaptive_suggestions_new_step ON adaptive_suggestions_new(company_step_id);
CREATE INDEX idx_standup_sessions_new_company ON standup_sessions_new(company_id);

-- Row Level Security (copy from existing patterns)
ALTER TABLE journey_phases_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_domains_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_steps_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_journeys_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_journey_steps_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_outcomes_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_suggestions_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE standup_sessions_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be enhanced later)
CREATE POLICY "Public read access for framework tables" ON journey_phases_new FOR SELECT USING (true);
CREATE POLICY "Public read access for domains" ON journey_domains_new FOR SELECT USING (true);
CREATE POLICY "Public read access for steps" ON journey_steps_new FOR SELECT USING (true);

CREATE POLICY "Company members can access their journey" ON company_journeys_new 
  FOR ALL USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can access their steps" ON company_journey_steps_new 
  FOR ALL USING (journey_id IN (SELECT id FROM company_journeys_new WHERE company_id IN 
    (SELECT company_id FROM company_members WHERE user_id = auth.uid())));
