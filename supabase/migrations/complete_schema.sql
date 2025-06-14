-- =====================================================================
-- Complete Journey System Database Schema
-- All tables that have been filled with data
-- =====================================================================

-- =====================================================================
-- 1. CORE FRAMEWORK TABLES (Filled with Canonical Data)
-- =====================================================================

-- 1.1 Journey Phases (5 phases filled)
-- =====================================================================
CREATE TABLE journey_phases_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon VARCHAR(10), -- Emoji icons
  color VARCHAR(7), -- Hex color codes
  
  -- Enhanced metadata from implementation
  typical_duration_weeks INTEGER,
  prerequisite_phases TEXT[] DEFAULT '{}',
  success_criteria TEXT[] DEFAULT '{}',
  common_challenges TEXT[] DEFAULT '{}',
  recommended_resources JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.2 Journey Domains (8 domains filled)
-- =====================================================================
CREATE TABLE journey_domains_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10), -- Emoji icons
  color VARCHAR(7), -- Hex color codes
  
  -- Enhanced metadata from implementation
  usage_percentage INTEGER DEFAULT 0,
  average_completion_days DECIMAL(5,2),
  difficulty_rating DECIMAL(3,2), -- Community-rated difficulty
  recommended_team_size VARCHAR(20),
  best_practices TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.3 Canonical Steps (150 steps filled)
-- =====================================================================
CREATE TABLE journey_canonical_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  primary_phase_id UUID REFERENCES journey_phases_new(id),
  primary_domain_id UUID REFERENCES journey_domains_new(id),
  order_index INTEGER NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('Low', 'Medium', 'High')),
  estimated_days INTEGER DEFAULT 1,
  
  -- Rich content from MRD/PRD (filled for all 150 steps)
  why_this_matters TEXT,
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  success_criteria TEXT[] NOT NULL DEFAULT '{}',
  potential_blockers TEXT[] DEFAULT '{}',
  guidance_notes TEXT,
  no_tool_approach TEXT, -- Bootstrap/manual approach
  
  -- Community insights (filled with usage data)
  usage_percentage INTEGER DEFAULT 0, -- Community adoption rate
  target_company_types TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  follow_up_steps TEXT[] DEFAULT '{}',
  
  -- Framework management
  version VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.4 Tools Catalog (50+ tools filled, expandable to 450+)
-- =====================================================================
CREATE TABLE journey_tools_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  category VARCHAR(100), -- Strategy & Planning, Product Development, etc.
  subcategory VARCHAR(100), -- More specific categorization
  
  -- Ratings and usage from step mappings (filled with real data)
  rating DECIMAL(3,2), -- 1.0 to 5.0 scale (4.0-4.8 range)
  usage_percentage INTEGER, -- Percentage of founders using this tool (28-95%)
  pricing_model VARCHAR(50), -- Free, Freemium, Paid, Enterprise
  typical_cost VARCHAR(100), -- Cost range or description
  
  -- Tool characteristics (filled with metadata)
  difficulty_level VARCHAR(20), -- Easy, Medium, Hard
  setup_time VARCHAR(50), -- Minutes, Hours, Days
  learning_curve VARCHAR(20), -- Low, Medium, High
  integration_options TEXT[] DEFAULT '{}',
  
  -- Metadata
  vendor_name VARCHAR(255),
  last_verified DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.5 Step-Tool Recommendations (100+ mappings filled)
-- =====================================================================
CREATE TABLE journey_step_tool_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_step_id UUID REFERENCES journey_canonical_steps(id),
  tool_id UUID REFERENCES journey_tools_catalog(id),
  
  recommendation_type VARCHAR(20) CHECK (recommendation_type IN ('primary', 'alternative', 'specialized')),
  priority_rank INTEGER, -- 1 = highest priority
  
  -- Context-specific recommendations (filled with logic)
  company_stage TEXT[] DEFAULT '{}', -- Pre-seed, Seed, Series A, etc.
  industry_focus TEXT[] DEFAULT '{}', -- SaaS, FinTech, HealthTech, etc.
  team_size_range VARCHAR(20), -- 1-5, 6-15, 16-50, etc.
  budget_range VARCHAR(50), -- Bootstrap, Funded, Enterprise
  
  -- Recommendation metadata (filled with reasoning)
  recommendation_reason TEXT,
  use_case_description TEXT,
  implementation_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================================
-- 2. COMMUNITY INTELLIGENCE TABLES (Structure ready for data)
-- =====================================================================

-- 2.1 Step Outcomes (Company-specific outcomes)
-- =====================================================================
CREATE TABLE journey_step_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID, -- Will reference companies table
  company_step_id UUID, -- Will reference company_journey_steps_new
  canonical_step_id UUID REFERENCES journey_canonical_steps(id),
  
  -- Outcome data
  completion_status VARCHAR(20) CHECK (completion_status IN ('completed', 'skipped', 'blocked', 'in_progress')),
  time_taken_days INTEGER,
  difficulty_experienced VARCHAR(20),
  success_level INTEGER CHECK (success_level BETWEEN 1 AND 5),
  
  -- Tools and approach
  tools_used JSONB DEFAULT '{}',
  approach_taken TEXT,
  
  -- Insights
  what_worked TEXT,
  challenges_faced TEXT,
  lessons_learned TEXT,
  would_do_differently TEXT,
  
  -- Metadata
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2.2 Anonymized Community Insights (Aggregated data)
-- =====================================================================
CREATE TABLE journey_anonymized_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_step_id UUID REFERENCES journey_canonical_steps(id),
  
  -- Anonymization categories
  company_stage VARCHAR(50), -- Startup size/stage
  industry_category VARCHAR(100), -- Industry vertical
  team_size_range VARCHAR(20), -- Team size bracket
  geography_region VARCHAR(50), -- Geographic region
  
  -- Aggregated outcomes (from community data)
  success_level INTEGER,
  time_taken_days INTEGER,
  confidence_level INTEGER,
  
  -- Insights (sanitized community wisdom)
  tools_used TEXT[] DEFAULT '{}',
  common_blockers TEXT[] DEFAULT '{}',
  key_insights TEXT[] DEFAULT '{}',
  effective_approaches TEXT[] DEFAULT '{}',
  
  -- Meta
  contribution_count INTEGER DEFAULT 1, -- Number of outcomes aggregated
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================================
-- 3. AI & PERSONALIZATION TABLES (Structure ready)
-- =====================================================================

-- 3.1 AI Recommendations (AI-generated suggestions)
-- =====================================================================
CREATE TABLE journey_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID, -- Will reference companies table
  
  recommendation_type VARCHAR(50), -- next_step, tool_suggestion, process_improvement
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.0 to 1.0
  
  -- Relationships
  related_step_id UUID, -- Will reference company_journey_steps_new
  related_canonical_step_id UUID REFERENCES journey_canonical_steps(id),
  related_tool_id UUID REFERENCES journey_tools_catalog(id),
  
  -- AI reasoning
  reasoning TEXT,
  based_on_data JSONB DEFAULT '{}', -- What data drove this recommendation
  expected_impact TEXT,
  
  -- User interaction
  status VARCHAR(20) DEFAULT 'pending', -- pending, viewed, accepted, dismissed
  viewed_at TIMESTAMP,
  acted_on_at TIMESTAMP,
  user_feedback TEXT,
  
  -- Lifecycle
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.2 Contextual Questions (AI-generated follow-ups)
-- =====================================================================
CREATE TABLE journey_contextual_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID, -- Will reference companies table
  related_step_id UUID, -- Will reference company_journey_steps_new
  
  question_type VARCHAR(50), -- progress_check, outcome_capture, blocker_resolution
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  question_text TEXT NOT NULL,
  
  context_data JSONB DEFAULT '{}', -- Step progress, recent activity, etc.
  followup_questions TEXT[] DEFAULT '{}',
  expected_answer_type VARCHAR(50) DEFAULT 'text', -- text, number, choice, outcome
  
  -- Scheduling
  schedule_for DATE,
  asked_at TIMESTAMP,
  answered_at TIMESTAMP,
  skipped_at TIMESTAMP,
  
  -- Response tracking
  answer_text TEXT,
  answer_structured_data JSONB DEFAULT '{}',
  processing_result JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================================
-- 4. COMPANY IMPLEMENTATION TABLES (Structure ready for company data)
-- =====================================================================

-- 4.1 Company Journeys (Individual company instances)
-- =====================================================================
CREATE TABLE company_journeys_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  name VARCHAR(255) DEFAULT 'Company Journey',
  status VARCHAR(50) DEFAULT 'active',
  
  -- Customization tracking
  customization_level VARCHAR(50) DEFAULT 'standard',
  custom_phases JSONB DEFAULT '[]',
  custom_domains JSONB DEFAULT '[]',
  
  -- Progress tracking
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4.2 Company Journey Steps (Company-specific step instances)
-- =====================================================================
CREATE TABLE company_journey_steps_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES company_journeys_new(id),
  canonical_step_id UUID REFERENCES journey_canonical_steps(id), -- NULL for custom steps
  
  -- Core step data (customizable by company)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phase_id UUID REFERENCES journey_phases_new(id),
  domain_id UUID REFERENCES journey_domains_new(id),
  
  -- Company-specific customization
  custom_deliverables TEXT[] DEFAULT '{}',
  custom_success_criteria TEXT[] DEFAULT '{}',
  custom_guidance TEXT,
  estimated_days INTEGER,
  difficulty VARCHAR(20),
  
  -- Progress tracking
  status VARCHAR(50) DEFAULT 'not_started',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  skipped_at TIMESTAMP,
  due_date DATE,
  
  -- Assignment and collaboration
  assigned_to UUID, -- References company_members
  
  -- Customization metadata
  is_customized BOOLEAN DEFAULT false,
  customized_fields TEXT[] DEFAULT '{}',
  
  -- Source tracking
  source VARCHAR(50) CHECK (source IN ('canonical', 'custom', 'community')),
  source_version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================================
-- 5. SUPPORTING TABLES (Structure ready)
-- =====================================================================

-- 5.1 Company Members (Team management)
-- =====================================================================
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  user_id UUID, -- References users/auth table
  
  role VARCHAR(50) DEFAULT 'member',
  permissions TEXT[] DEFAULT '{}',
  
  -- Member details
  name VARCHAR(255),
  email VARCHAR(255),
  position VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5.2 Messages (Communication system)
-- =====================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  
  -- Message content
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'general', -- general, step_update, milestone, etc.
  
  -- Context
  related_step_id UUID, -- References company_journey_steps_new
  related_phase_id UUID REFERENCES journey_phases_new(id),
  
  -- Author
  author_id UUID, -- References company_members
  author_name VARCHAR(255),
  
  -- Threading
  parent_message_id UUID REFERENCES messages(id),
  thread_id UUID,
  
  -- Metadata
  is_system_message BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5.3 Domain Notifications (Notification system)
-- =====================================================================
CREATE TABLE domain_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  
  -- Notification content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50), -- info, warning, success, reminder
  
  -- Context
  related_domain_id UUID REFERENCES journey_domains_new(id),
  related_step_id UUID, -- References company_journey_steps_new
  
  -- Targeting
  target_user_id UUID, -- References company_members
  target_role VARCHAR(50), -- If targeting by role
  
  -- Status
  status VARCHAR(20) DEFAULT 'unread', -- unread, read, dismissed
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  
  -- Scheduling
  scheduled_for TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5.4 Journey Recommendations (System recommendations)
-- =====================================================================
CREATE TABLE journey_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  
  recommendation_type VARCHAR(50), -- step_suggestion, tool_recommendation, process_improvement
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  
  -- Context
  related_step_id UUID, -- References company_journey_steps_new
  related_canonical_step_id UUID REFERENCES journey_canonical_steps(id),
  related_tool_id UUID REFERENCES journey_tools_catalog(id),
  
  -- Recommendation logic
  reasoning TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  
  -- User interaction
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, dismissed, implemented
  viewed_at TIMESTAMP,
  responded_at TIMESTAMP,
  response_type VARCHAR(20), -- accepted, dismissed, deferred
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5.5 Company Journey Analytics (Performance tracking)
-- =====================================================================
CREATE TABLE company_journey_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  
  -- Time period
  period_type VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Progress metrics
  steps_completed INTEGER DEFAULT 0,
  steps_started INTEGER DEFAULT 0,
  steps_skipped INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_time_per_step DECIMAL(5,2),
  completion_rate DECIMAL(5,4),
  velocity_steps_per_week DECIMAL(5,2),
  
  -- Domain breakdown
  domain_progress JSONB DEFAULT '{}', -- Progress by domain
  phase_progress JSONB DEFAULT '{}', -- Progress by phase
  
  -- Team metrics
  active_members INTEGER DEFAULT 0,
  member_participation JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5.6 Company KPI Measurements (Business metrics)
-- =====================================================================
CREATE TABLE company_kpi_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  
  -- KPI definition
  kpi_name VARCHAR(255) NOT NULL,
  kpi_category VARCHAR(100), -- revenue, growth, product, team
  measurement_unit VARCHAR(50), -- dollars, percentage, count, etc.
  
  -- Measurement data
  measured_value DECIMAL(15,4),
  target_value DECIMAL(15,4),
  previous_value DECIMAL(15,4),
  
  -- Time context
  measurement_date DATE NOT NULL,
  measurement_period VARCHAR(20), -- daily, weekly, monthly, quarterly
  
  -- Metadata
  notes TEXT,
  data_source VARCHAR(100),
  confidence_level VARCHAR(20) DEFAULT 'high',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5.7 Company Custom Tools (Custom tool tracking)
-- =====================================================================
CREATE TABLE company_custom_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, -- References companies table
  
  -- Tool details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  category VARCHAR(100),
  
  -- Usage context
  used_for_steps TEXT[] DEFAULT '{}', -- Step IDs where this tool is used
  team_members_using TEXT[] DEFAULT '{}', -- Member IDs using this tool
  
  -- Assessment
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  cost_rating VARCHAR(20), -- free, low, medium, high
  ease_of_use_rating INTEGER CHECK (ease_of_use_rating BETWEEN 1 AND 5),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, discontinued, evaluating
  added_by UUID, -- References company_members
  
  -- Notes
  implementation_notes TEXT,
  pros_cons TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================================

-- Core framework indexes
CREATE INDEX IF NOT EXISTS idx_canonical_steps_phase ON journey_canonical_steps(primary_phase_id);
CREATE INDEX IF NOT EXISTS idx_canonical_steps_domain ON journey_canonical_steps(primary_domain_id);
CREATE INDEX IF NOT EXISTS idx_canonical_steps_active ON journey_canonical_steps(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_canonical_steps_order ON journey_canonical_steps(order_index);

CREATE INDEX IF NOT EXISTS idx_tools_catalog_active ON journey_tools_catalog(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tools_catalog_category ON journey_tools_catalog(category);
CREATE INDEX IF NOT EXISTS idx_tools_catalog_rating ON journey_tools_catalog(rating DESC);

CREATE INDEX IF NOT EXISTS idx_step_tool_recs_step ON journey_step_tool_recommendations(canonical_step_id);
CREATE INDEX IF NOT EXISTS idx_step_tool_recs_tool ON journey_step_tool_recommendations(tool_id);
CREATE INDEX IF NOT EXISTS idx_step_tool_recs_type ON journey_step_tool_recommendations(recommendation_type);

-- Company implementation indexes
CREATE INDEX IF NOT EXISTS idx_company_steps_journey ON company_journey_steps_new(journey_id);
CREATE INDEX IF NOT EXISTS idx_company_steps_canonical ON company_journey_steps_new(canonical_step_id);
CREATE INDEX IF NOT EXISTS idx_company_steps_phase ON company_journey_steps_new(phase_id);
CREATE INDEX IF NOT EXISTS idx_company_steps_domain ON company_journey_steps_new(domain_id);
CREATE INDEX IF NOT EXISTS idx_company_steps_status ON company_journey_steps_new(status);

-- Analytics and insights indexes
CREATE INDEX IF NOT EXISTS idx_step_outcomes_company ON journey_step_outcomes(company_id);
CREATE INDEX IF NOT EXISTS idx_step_outcomes_canonical ON journey_step_outcomes(canonical_step_id);
CREATE INDEX IF NOT EXISTS idx_step_outcomes_status ON journey_step_outcomes(completion_status);

CREATE INDEX IF NOT EXISTS idx_anonymized_insights_step ON journey_anonymized_insights(canonical_step_id);
CREATE INDEX IF NOT EXISTS idx_anonymized_insights_stage ON journey_anonymized_insights(company_stage);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_company ON journey_ai_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON journey_ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON journey_ai_recommendations(recommendation_type);

-- =====================================================================
-- DATA POPULATION STATUS
-- =====================================================================

-- Tables FILLED with canonical framework data:
-- ✅ journey_phases_new (5 phases)
-- ✅ journey_domains_new (8 domains)  
-- ✅ journey_canonical_steps (150 steps with full metadata)
-- ✅ journey_tools_catalog (50+ tools, expandable to 450+)
-- ✅ journey_step_tool_recommendations (100+ mappings)

-- Tables with STRUCTURE READY for company data:
-- 🏗️ journey_step_outcomes (outcome capture)
-- 🏗️ journey_anonymized_insights (community intelligence)
-- 🏗️ journey_ai_recommendations (AI suggestions)
-- 🏗️ journey_contextual_questions (AI follow-ups)
-- 🏗️ company_journeys_new (company instances)
-- 🏗️ company_journey_steps_new (company step tracking)
-- 🏗️ company_members (team management)
-- 🏗️ messages (communication)
-- 🏗️ domain_notifications (notifications)
-- 🏗️ journey_recommendations (system recommendations)
-- 🏗️ company_journey_analytics (performance tracking)
-- 🏗️ company_kpi_measurements (business metrics)
-- 🏗️ company_custom_tools (custom tool tracking)