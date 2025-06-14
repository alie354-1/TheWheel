-- ===============================================
-- JOURNEY SYSTEM SCHEMA
-- ===============================================

-- Create enum types
CREATE TYPE startup_stage AS ENUM ('idea', 'prototype', 'mvp', 'launched', 'scaling');
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard', 'Very Hard');
CREATE TYPE task_type AS ENUM ('research', 'analysis', 'creation', 'validation', 'implementation', 'testing', 'review');

-- ===============================================
-- JOURNEY PHASES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS journey_phases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_duration_days INTEGER NOT NULL,
    icon_url TEXT,
    color TEXT,
    completion_criteria JSONB DEFAULT '{}'::JSONB,
    success_metrics JSONB DEFAULT '{}'::JSONB,
    transition_requirements JSONB DEFAULT '{}'::JSONB,
    guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- JOURNEY DOMAINS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS journey_domains (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon_url TEXT,
    category TEXT DEFAULT 'core',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- STARTUP PRINCIPLES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS startup_principles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- JOURNEY STEP TEMPLATES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS journey_step_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    phase_id TEXT REFERENCES journey_phases(id),
    domain_id TEXT REFERENCES journey_domains(id),
    suggested_order_index INTEGER,
    estimated_time_days INTEGER NOT NULL,
    difficulty difficulty_level DEFAULT 'Medium',
    startup_principle_id TEXT REFERENCES startup_principles(id),
    methodology_category TEXT,
    objectives TEXT,
    success_criteria JSONB DEFAULT '{}'::JSONB,
    deliverables JSONB DEFAULT '{}'::JSONB,
    guidance TEXT,
    resources JSONB DEFAULT '[]'::JSONB,
    applicability_criteria JSONB DEFAULT '{}'::JSONB,
    target_company_stages JSONB DEFAULT '[]'::JSONB,
    is_core_step BOOLEAN DEFAULT true,
    usage_frequency FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- JOURNEY STEPS INSTANCES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS journey_steps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    phase_id TEXT REFERENCES journey_phases(id),
    domain_id TEXT REFERENCES journey_domains(id),
    order_index INTEGER,
    estimated_time_days INTEGER NOT NULL,
    difficulty difficulty_level DEFAULT 'Medium',
    startup_principle_id TEXT REFERENCES startup_principles(id),
    methodology_category TEXT,
    objectives TEXT,
    success_criteria JSONB DEFAULT '{}'::JSONB,
    deliverables JSONB DEFAULT '{}'::JSONB,
    guidance TEXT,
    resources JSONB DEFAULT '[]'::JSONB,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- STEP TASK TEMPLATES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS step_task_templates (
    id SERIAL PRIMARY KEY,
    step_template_id TEXT REFERENCES journey_step_templates(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_time_hours INTEGER NOT NULL,
    task_type task_type NOT NULL,
    instructions TEXT NOT NULL,
    success_criteria TEXT NOT NULL,
    deliverable_template TEXT NOT NULL,
    tools_suggested JSONB DEFAULT '[]'::JSONB,
    is_core_task BOOLEAN DEFAULT true,
    applicability_criteria JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- STEP TASK INSTANCES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS step_tasks (
    id TEXT PRIMARY KEY,
    step_id TEXT REFERENCES journey_steps(id) NOT NULL,
    company_id TEXT NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_time_hours INTEGER NOT NULL,
    task_type task_type NOT NULL,
    instructions TEXT NOT NULL,
    success_criteria TEXT NOT NULL,
    deliverable_template TEXT NOT NULL,
    tools_suggested JSONB DEFAULT '[]'::JSONB,
    status TEXT DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    deliverable_url TEXT,
    deliverable_notes TEXT,
    reflection_notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- COMPANY JOURNEY PROGRESS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS company_journey_progress (
    id SERIAL PRIMARY KEY,
    company_id TEXT NOT NULL,
    current_phase_id TEXT REFERENCES journey_phases(id),
    phase_progress_percentage INTEGER DEFAULT 0,
    current_step_id TEXT REFERENCES journey_steps(id),
    step_progress_percentage INTEGER DEFAULT 0,
    completed_steps_count INTEGER DEFAULT 0,
    total_steps_count INTEGER DEFAULT 0,
    journey_start_date TIMESTAMPTZ,
    last_activity_date TIMESTAMPTZ,
    estimated_completion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

-- ===============================================
-- COMPANY JOURNEY NOTES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS company_journey_notes (
    id SERIAL PRIMARY KEY,
    company_id TEXT NOT NULL,
    step_id TEXT REFERENCES journey_steps(id),
    user_id TEXT NOT NULL,
    note_content TEXT NOT NULL,
    note_type TEXT DEFAULT 'general',
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- JOURNEY RECOMMENDATIONS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS journey_recommendations (
    id SERIAL PRIMARY KEY,
    company_id TEXT NOT NULL,
    user_id TEXT,
    step_template_id TEXT REFERENCES journey_step_templates(id),
    recommendation_type TEXT NOT NULL,
    recommendation_reason TEXT NOT NULL,
    priority INTEGER DEFAULT 5,
    is_applied BOOLEAN DEFAULT false,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journey_phases_modtime
BEFORE UPDATE ON journey_phases
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_journey_domains_modtime
BEFORE UPDATE ON journey_domains
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_startup_principles_modtime
BEFORE UPDATE ON startup_principles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_journey_step_templates_modtime
BEFORE UPDATE ON journey_step_templates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_journey_steps_modtime
BEFORE UPDATE ON journey_steps
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_step_task_templates_modtime
BEFORE UPDATE ON step_task_templates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_step_tasks_modtime
BEFORE UPDATE ON step_tasks
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_company_journey_progress_modtime
BEFORE UPDATE ON company_journey_progress
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_company_journey_notes_modtime
BEFORE UPDATE ON company_journey_notes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_journey_recommendations_modtime
BEFORE UPDATE ON journey_recommendations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
