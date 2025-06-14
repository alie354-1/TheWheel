-- Journey Integration System Migration
-- This migration adds the necessary tables for the journey system integration

-- Check if company_step_progress view exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'company_step_progress') THEN
        DROP VIEW company_step_progress;
    END IF;
END $$;

-- Create journey phases table
CREATE TABLE IF NOT EXISTS journey_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journey steps table
CREATE TABLE IF NOT EXISTS journey_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID NOT NULL REFERENCES journey_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  estimated_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company journeys table
CREATE TABLE IF NOT EXISTS company_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create step progress table
CREATE TABLE IF NOT EXISTS step_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(step_id, company_id)
);

-- Create step resources table
CREATE TABLE IF NOT EXISTS step_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('article', 'video', 'tool')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create step expert recommendations table
CREATE TABLE IF NOT EXISTS step_expert_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  relevance_score FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(step_id, expert_id)
);

-- Create step template recommendations table
CREATE TABLE IF NOT EXISTS step_template_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('deck', 'document', 'tool')),
  relevance_score FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(step_id, template_id)
);

-- Create step completion analytics table
CREATE TABLE IF NOT EXISTS step_completion_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  time_spent INTEGER NOT NULL, -- in minutes
  outcome JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(step_id, company_id)
);

-- Create peer insights table
CREATE TABLE IF NOT EXISTS peer_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  avg_time_to_complete INTEGER, -- in days
  common_blockers TEXT[],
  success_strategies TEXT[],
  outcome_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE TRIGGER update_journey_phases_updated_at
BEFORE UPDATE ON journey_phases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_steps_updated_at
BEFORE UPDATE ON journey_steps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_journeys_updated_at
BEFORE UPDATE ON company_journeys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_progress_updated_at
BEFORE UPDATE ON step_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_resources_updated_at
BEFORE UPDATE ON step_resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_expert_recommendations_updated_at
BEFORE UPDATE ON step_expert_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_template_recommendations_updated_at
BEFORE UPDATE ON step_template_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_insights_updated_at
BEFORE UPDATE ON peer_insights
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journey_steps_phase_id ON journey_steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_step_id ON step_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_company_id ON step_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_step_resources_step_id ON step_resources(step_id);
CREATE INDEX IF NOT EXISTS idx_step_expert_recommendations_step_id ON step_expert_recommendations(step_id);
CREATE INDEX IF NOT EXISTS idx_step_expert_recommendations_expert_id ON step_expert_recommendations(expert_id);
CREATE INDEX IF NOT EXISTS idx_step_template_recommendations_step_id ON step_template_recommendations(step_id);
CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_step_id ON step_completion_analytics(step_id);
CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_company_id ON step_completion_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_peer_insights_step_id ON peer_insights(step_id);
