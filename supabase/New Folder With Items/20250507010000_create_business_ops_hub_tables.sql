-- Migration for Business Operations Hub tables
-- Created: May 7, 2025

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business domains taxonomy table
CREATE TABLE IF NOT EXISTS business_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to business_domains
DROP TRIGGER IF EXISTS set_business_domains_updated_at ON business_domains;
CREATE TRIGGER set_business_domains_updated_at
BEFORE UPDATE ON business_domains
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Domain-journey mapping table
CREATE TABLE IF NOT EXISTS domain_journey_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES business_domains(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL, -- References journey_steps in the existing schema
    relevance_score FLOAT DEFAULT 0.5,
    primary_domain BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, journey_id)
);

-- Add updated_at trigger to domain_journey_mapping
DROP TRIGGER IF EXISTS set_domain_journey_mapping_updated_at ON domain_journey_mapping;
CREATE TRIGGER set_domain_journey_mapping_updated_at
BEFORE UPDATE ON domain_journey_mapping
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Decision events tracking table
CREATE TABLE IF NOT EXISTS decision_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID, -- References companies table
    user_id UUID, -- References auth.users
    event_type TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace configurations table
CREATE TABLE IF NOT EXISTS workspace_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID, -- References companies table
    user_id UUID, -- References auth.users
    domain_id UUID REFERENCES business_domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    configuration JSONB DEFAULT '{}'::jsonb,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at trigger to workspace_configurations
DROP TRIGGER IF EXISTS set_workspace_configurations_updated_at ON workspace_configurations;
CREATE TRIGGER set_workspace_configurations_updated_at
BEFORE UPDATE ON workspace_configurations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_business_domains_order_index ON business_domains(order_index);
CREATE INDEX IF NOT EXISTS idx_domain_journey_mapping_domain_id ON domain_journey_mapping(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_journey_mapping_journey_id ON domain_journey_mapping(journey_id);
CREATE INDEX IF NOT EXISTS idx_domain_journey_mapping_relevance ON domain_journey_mapping(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_decision_events_company_id ON decision_events(company_id);
CREATE INDEX IF NOT EXISTS idx_decision_events_user_id ON decision_events(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_events_event_type ON decision_events(event_type);
CREATE INDEX IF NOT EXISTS idx_workspace_configurations_domain_id ON workspace_configurations(domain_id);
CREATE INDEX IF NOT EXISTS idx_workspace_configurations_company_id ON workspace_configurations(company_id);
CREATE INDEX IF NOT EXISTS idx_workspace_configurations_user_id ON workspace_configurations(user_id);

-- Define RLS policies for security

-- Enable Row Level Security
ALTER TABLE business_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_journey_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_configurations ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_role BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = is_admin.user_id AND role = 'admin'
  ) INTO admin_role;
  
  RETURN admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is in same company
CREATE OR REPLACE FUNCTION is_in_same_company(company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_company_id UUID;
BEGIN
  SELECT c.id INTO user_company_id
  FROM companies c
  INNER JOIN company_members cm ON c.id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active';
  
  RETURN user_company_id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business Domains Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'business_domains_select_policy' AND tablename = 'business_domains'
  ) THEN
    EXECUTE 'CREATE POLICY business_domains_select_policy ON business_domains FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'business_domains_insert_policy' AND tablename = 'business_domains'
  ) THEN
    EXECUTE 'CREATE POLICY business_domains_insert_policy ON business_domains FOR INSERT WITH CHECK (is_admin(auth.uid()))';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'business_domains_update_policy' AND tablename = 'business_domains'
  ) THEN
    EXECUTE 'CREATE POLICY business_domains_update_policy ON business_domains FOR UPDATE USING (is_admin(auth.uid()))';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'business_domains_delete_policy' AND tablename = 'business_domains'
  ) THEN
    EXECUTE 'CREATE POLICY business_domains_delete_policy ON business_domains FOR DELETE USING (is_admin(auth.uid()))';
  END IF;
END $$;


-- Domain Journey Mapping Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'domain_journey_mapping_select_policy' AND tablename = 'domain_journey_mapping'
  ) THEN
    EXECUTE 'CREATE POLICY domain_journey_mapping_select_policy ON domain_journey_mapping FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'domain_journey_mapping_insert_policy' AND tablename = 'domain_journey_mapping'
  ) THEN
    EXECUTE 'CREATE POLICY domain_journey_mapping_insert_policy ON domain_journey_mapping FOR INSERT WITH CHECK (is_admin(auth.uid()))';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'domain_journey_mapping_update_policy' AND tablename = 'domain_journey_mapping'
  ) THEN
    EXECUTE 'CREATE POLICY domain_journey_mapping_update_policy ON domain_journey_mapping FOR UPDATE USING (is_admin(auth.uid()))';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'domain_journey_mapping_delete_policy' AND tablename = 'domain_journey_mapping'
  ) THEN
    EXECUTE 'CREATE POLICY domain_journey_mapping_delete_policy ON domain_journey_mapping FOR DELETE USING (is_admin(auth.uid()))';
  END IF;
END $$;

-- Decision Events Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'decision_events_select_policy' AND tablename = 'decision_events'
  ) THEN
    EXECUTE 'CREATE POLICY decision_events_select_policy ON decision_events FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()) OR (company_id IS NOT NULL AND is_in_same_company(company_id)))';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'decision_events_insert_policy' AND tablename = 'decision_events'
  ) THEN
    EXECUTE 'CREATE POLICY decision_events_insert_policy ON decision_events FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- No update/delete policies for decision_events (append-only log)

-- Workspace Configurations Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'workspace_configurations_select_policy' AND tablename = 'workspace_configurations'
  ) THEN
    EXECUTE 'CREATE POLICY workspace_configurations_select_policy ON workspace_configurations FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()) OR (is_shared = true AND company_id IS NOT NULL AND is_in_same_company(company_id)))';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'workspace_configurations_insert_policy' AND tablename = 'workspace_configurations'
  ) THEN
    EXECUTE 'CREATE POLICY workspace_configurations_insert_policy ON workspace_configurations FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'workspace_configurations_update_policy' AND tablename = 'workspace_configurations'
  ) THEN
    EXECUTE 'CREATE POLICY workspace_configurations_update_policy ON workspace_configurations FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()))';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'workspace_configurations_delete_policy' AND tablename = 'workspace_configurations'
  ) THEN
    EXECUTE 'CREATE POLICY workspace_configurations_delete_policy ON workspace_configurations FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()))';
  END IF;
END $$;

-- Create view for domain statistics
CREATE OR REPLACE VIEW domain_statistics AS
SELECT 
  bd.id AS domain_id,
  bd.name AS domain_name,
  COUNT(DISTINCT djm.journey_id) AS total_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'completed' THEN djm.journey_id END) AS completed_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'in_progress' THEN djm.journey_id END) AS in_progress_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'not_started' THEN djm.journey_id END) AS upcoming_steps,
  CASE 
    WHEN COUNT(DISTINCT djm.journey_id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN cjs.status = 'completed' THEN djm.journey_id END)::float / 
         COUNT(DISTINCT djm.journey_id)::float) * 100)
    ELSE 0
  END AS completion_percentage
FROM 
  business_domains bd
LEFT JOIN 
  domain_journey_mapping djm ON bd.id = djm.domain_id
LEFT JOIN 
  journey_steps js ON djm.journey_id = js.id
LEFT JOIN
  company_journey_steps cjs ON js.id = cjs.global_step_id
GROUP BY 
  bd.id, bd.name;

-- Seed default domains (idempotent: only insert if not exists)
INSERT INTO business_domains (name, description, icon, color, order_index)
SELECT * FROM (
  VALUES
    ('Finance', 'Financial operations, budgeting and accounting', '💰', '#2563eb', 1),
    ('Marketing', 'Brand development, marketing campaigns and content', '📣', '#10b981', 2),
    ('Operations', 'Business processes, logistics and efficiency', '⚙️', '#f59e0b', 3),
    ('Sales', 'Customer acquisition, sales process and CRM', '📈', '#ef4444', 4),
    ('Human Resources', 'Recruitment, employee development and culture', '👥', '#8b5cf6', 5),
    ('Technology', 'IT infrastructure, software development and tools', '💻', '#06b6d4', 6),
    ('Legal', 'Compliance, contracts and intellectual property', '⚖️', '#6366f1', 7),
    ('Product', 'Product development, roadmaps and features', '📦', '#f97316', 8)
) AS v(name, description, icon, color, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM business_domains bd WHERE bd.name = v.name
);
