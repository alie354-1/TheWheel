-- Migration: Multi-Tenant Terminology System
-- Created: 2025-04-29
-- Description: Implements a comprehensive multi-tenant terminology system with hierarchical inheritance

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create reference tables if they don't exist

-- Partners table (for white-labeling)
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table (parent orgs, VCs, etc)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure companies table exists
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure teams table exists
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure relationship tables exist
CREATE TABLE IF NOT EXISTS partner_members (
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL,
  PRIMARY KEY (partner_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_members (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS company_members (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL,
  PRIMARY KEY (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL,
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS service_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  admin_role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create base tables for the terminology system

-- System-wide default terminology
CREATE TABLE IF NOT EXISTS terminology_defaults (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT
);

-- Partner-level terminology (for white labeling)
CREATE TABLE IF NOT EXISTS partner_terminology (
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace', -- 'replace', 'merge', 'suggest'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (partner_id, key)
);

-- Organization-level terminology (for VCs, Studios, etc.)
CREATE TABLE IF NOT EXISTS organization_terminology (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (organization_id, key)
);

-- Company-level terminology
CREATE TABLE IF NOT EXISTS company_terminology (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (company_id, key)
);

-- Team-level terminology
CREATE TABLE IF NOT EXISTS team_terminology (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, key)
);

-- User-level terminology preferences
CREATE TABLE IF NOT EXISTS user_terminology_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

-- White label configuration
CREATE TABLE IF NOT EXISTS white_label_configuration (
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE PRIMARY KEY,
  terminology_settings JSONB DEFAULT '{}'::JSONB,
  branding_settings JSONB DEFAULT '{}'::JSONB,
  domain_settings JSONB DEFAULT '{}'::JSONB,
  feature_toggles JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Terminology A/B testing
CREATE TABLE IF NOT EXISTS terminology_ab_test (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  variants JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Terminology A/B test assignments
CREATE TABLE IF NOT EXISTS terminology_ab_test_assignments (
  test_id UUID REFERENCES terminology_ab_test(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'company', 'team', 'user'
  entity_id UUID NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (test_id, entity_type, entity_id)
);

-- Terminology effectiveness feedback
CREATE TABLE IF NOT EXISTS terminology_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'company', 'team', 'user'
  entity_id UUID NOT NULL,
  terminology_key TEXT NOT NULL,
  feedback_type TEXT NOT NULL, -- 'positive', 'negative', 'suggestion', 'confusion'
  details TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Step 2: Create optimized indexes for performance

-- Partner terminology lookup optimizations
CREATE INDEX IF NOT EXISTS idx_partner_terminology_partner ON partner_terminology(partner_id);

-- Organization terminology lookup optimizations
CREATE INDEX IF NOT EXISTS idx_organization_terminology_org ON organization_terminology(organization_id);

-- Company terminology lookup optimizations
CREATE INDEX IF NOT EXISTS idx_company_terminology_company ON company_terminology(company_id);

-- Team terminology lookup optimizations
CREATE INDEX IF NOT EXISTS idx_team_terminology_team ON team_terminology(team_id);

-- User terminology lookup optimizations
CREATE INDEX IF NOT EXISTS idx_user_terminology_user ON user_terminology_preferences(user_id);

-- A/B testing optimizations
CREATE INDEX IF NOT EXISTS idx_terminology_ab_test_status ON terminology_ab_test(status);
CREATE INDEX IF NOT EXISTS idx_terminology_ab_test_dates ON terminology_ab_test(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_terminology_ab_test_assignments_entity ON terminology_ab_test_assignments(entity_type, entity_id);

-- Terminology feedback optimizations
CREATE INDEX IF NOT EXISTS idx_terminology_feedback_entity ON terminology_feedback(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_terminology_feedback_key ON terminology_feedback(terminology_key);
CREATE INDEX IF NOT EXISTS idx_terminology_feedback_type ON terminology_feedback(feedback_type);

-- Step 3: Create update triggers for timestamps

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to each table
CREATE TRIGGER update_partner_terminology_timestamp
BEFORE UPDATE ON partner_terminology
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_organization_terminology_timestamp
BEFORE UPDATE ON organization_terminology
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_company_terminology_timestamp
BEFORE UPDATE ON company_terminology
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_team_terminology_timestamp
BEFORE UPDATE ON team_terminology
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_user_terminology_timestamp
BEFORE UPDATE ON user_terminology_preferences
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_white_label_config_timestamp
BEFORE UPDATE ON white_label_configuration
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_terminology_ab_test_timestamp
BEFORE UPDATE ON terminology_ab_test
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Step 5: Create utility functions for terminology resolution

-- Function to get terminology for a specific entity with inheritance
CREATE OR REPLACE FUNCTION resolve_terminology(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_keys TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  system_defaults JSONB;
  partner_terms JSONB := '{}'::JSONB;
  org_terms JSONB := '{}'::JSONB;
  company_terms JSONB := '{}'::JSONB;
  team_terms JSONB := '{}'::JSONB;
  user_terms JSONB := '{}'::JSONB;
  
  partner_id UUID;
  org_id UUID;
  company_id UUID;
  team_id UUID;
  user_id UUID;
  
  term_record RECORD;
  key_filter TEXT := '';
BEGIN
  -- Prepare key filter if specific keys requested
  IF p_keys IS NOT NULL THEN
    key_filter := ' AND key = ANY($3)';
  END IF;

  -- Get system defaults
  EXECUTE 'SELECT 
    COALESCE(jsonb_object_agg(key, value), ''{}''::JSONB)
    FROM terminology_defaults
    WHERE 1=1' || key_filter
  USING p_entity_type, p_entity_id, p_keys
  INTO system_defaults;
  
  result := result || system_defaults;
  
  -- Determine the inheritance chain based on entity type
  CASE p_entity_type
    WHEN 'user' THEN
      user_id := p_entity_id;
      
      -- Get team_id if user belongs to a team
      EXECUTE 'SELECT team_id FROM team_members WHERE user_id = $1 LIMIT 1'
      USING user_id
      INTO team_id;
      
      -- Get company_id if user belongs to a company
      EXECUTE 'SELECT company_id FROM company_members WHERE user_id = $1 LIMIT 1'
      USING user_id
      INTO company_id;
      
      -- Get org_id if company belongs to an organization
      IF company_id IS NOT NULL THEN
        EXECUTE 'SELECT organization_id FROM companies WHERE id = $1'
        USING company_id
        INTO org_id;
      END IF;
      
      -- Get partner_id if organization belongs to a partner
      IF org_id IS NOT NULL THEN
        EXECUTE 'SELECT partner_id FROM organizations WHERE id = $1'
        USING org_id
        INTO partner_id;
      END IF;
    
    WHEN 'team' THEN
      team_id := p_entity_id;
      
      -- Get company_id for the team
      EXECUTE 'SELECT company_id FROM teams WHERE id = $1'
      USING team_id
      INTO company_id;
      
      -- Get org_id if company belongs to an organization
      IF company_id IS NOT NULL THEN
        EXECUTE 'SELECT organization_id FROM companies WHERE id = $1'
        USING company_id
        INTO org_id;
      END IF;
      
      -- Get partner_id if organization belongs to a partner
      IF org_id IS NOT NULL THEN
        EXECUTE 'SELECT partner_id FROM organizations WHERE id = $1'
        USING org_id
        INTO partner_id;
      END IF;
      
    WHEN 'company' THEN
      company_id := p_entity_id;
      
      -- Get org_id if company belongs to an organization
      EXECUTE 'SELECT organization_id FROM companies WHERE id = $1'
      USING company_id
      INTO org_id;
      
      -- Get partner_id if organization belongs to a partner
      IF org_id IS NOT NULL THEN
        EXECUTE 'SELECT partner_id FROM organizations WHERE id = $1'
        USING org_id
        INTO partner_id;
      END IF;
      
    WHEN 'organization' THEN
      org_id := p_entity_id;
      
      -- Get partner_id if organization belongs to a partner
      EXECUTE 'SELECT partner_id FROM organizations WHERE id = $1'
      USING org_id
      INTO partner_id;
      
    WHEN 'partner' THEN
      partner_id := p_entity_id;
      
  END CASE;
  
  -- Apply partner terms if available
  IF partner_id IS NOT NULL THEN
    FOR term_record IN EXECUTE 'SELECT key, value, override_behavior FROM partner_terminology WHERE partner_id = $1' || key_filter
    USING partner_id, p_entity_type, p_keys
    LOOP
      IF term_record.override_behavior = 'merge' AND jsonb_typeof(result->term_record.key) = 'object' THEN
        result := jsonb_set(result, ARRAY[term_record.key], result->term_record.key || term_record.value);
      ELSE
        result := jsonb_set(result, ARRAY[term_record.key], term_record.value);
      END IF;
    END LOOP;
  END IF;
  
  -- Apply organization terms if available
  IF org_id IS NOT NULL THEN
    FOR term_record IN EXECUTE 'SELECT key, value, override_behavior FROM organization_terminology WHERE organization_id = $1' || key_filter
    USING org_id, p_entity_type, p_keys
    LOOP
      IF term_record.override_behavior = 'merge' AND jsonb_typeof(result->term_record.key) = 'object' THEN
        result := jsonb_set(result, ARRAY[term_record.key], result->term_record.key || term_record.value);
      ELSE
        result := jsonb_set(result, ARRAY[term_record.key], term_record.value);
      END IF;
    END LOOP;
  END IF;
  
  -- Apply company terms if available
  IF company_id IS NOT NULL THEN
    FOR term_record IN EXECUTE 'SELECT key, value, override_behavior FROM company_terminology WHERE company_id = $1' || key_filter
    USING company_id, p_entity_type, p_keys
    LOOP
      IF term_record.override_behavior = 'merge' AND jsonb_typeof(result->term_record.key) = 'object' THEN
        result := jsonb_set(result, ARRAY[term_record.key], result->term_record.key || term_record.value);
      ELSE
        result := jsonb_set(result, ARRAY[term_record.key], term_record.value);
      END IF;
    END LOOP;
  END IF;
  
  -- Apply team terms if available
  IF team_id IS NOT NULL THEN
    FOR term_record IN EXECUTE 'SELECT key, value, override_behavior FROM team_terminology WHERE team_id = $1' || key_filter
    USING team_id, p_entity_type, p_keys
    LOOP
      IF term_record.override_behavior = 'merge' AND jsonb_typeof(result->term_record.key) = 'object' THEN
        result := jsonb_set(result, ARRAY[term_record.key], result->term_record.key || term_record.value);
      ELSE
        result := jsonb_set(result, ARRAY[term_record.key], term_record.value);
      END IF;
    END LOOP;
  END IF;
  
  -- Apply user terms if available
  IF user_id IS NOT NULL THEN
    EXECUTE 'SELECT 
      COALESCE(jsonb_object_agg(key, value), ''{}''::JSONB)
      FROM user_terminology_preferences
      WHERE user_id = $1' || key_filter
    USING user_id, p_entity_type, p_keys
    INTO user_terms;
    
    result := result || user_terms;
  END IF;
  
  RETURN result;
END;
$$;

-- Function to check if terminology is defined at a specific level
CREATE OR REPLACE FUNCTION has_custom_terminology(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  term_count INTEGER;
  table_name TEXT;
  id_column TEXT;
BEGIN
  -- Set table and column names based on entity type
  CASE p_entity_type
    WHEN 'partner' THEN
      table_name := 'partner_terminology';
      id_column := 'partner_id';
    WHEN 'organization' THEN
      table_name := 'organization_terminology';
      id_column := 'organization_id';
    WHEN 'company' THEN
      table_name := 'company_terminology';
      id_column := 'company_id';
    WHEN 'team' THEN
      table_name := 'team_terminology';
      id_column := 'team_id';
    WHEN 'user' THEN
      table_name := 'user_terminology_preferences';
      id_column := 'user_id';
    ELSE
      RETURN FALSE;
  END CASE;

  -- Check if any custom terminology exists
  EXECUTE format('SELECT COUNT(*) FROM %I WHERE %I = $1', table_name, id_column)
  USING p_entity_id
  INTO term_count;
  
  RETURN term_count > 0;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE terminology_defaults IS 'System-wide default terminology';
COMMENT ON TABLE partner_terminology IS 'Partner-level terminology customizations for white labeling';
COMMENT ON TABLE organization_terminology IS 'Organization-level terminology (for parent orgs like VCs/Studios)';
COMMENT ON TABLE company_terminology IS 'Company-specific terminology customizations';
COMMENT ON TABLE team_terminology IS 'Team-specific terminology customizations';
COMMENT ON TABLE user_terminology_preferences IS 'Individual user terminology preferences';
COMMENT ON TABLE white_label_configuration IS 'Configuration for white label partners';
COMMENT ON TABLE terminology_ab_test IS 'A/B tests for terminology optimization';
COMMENT ON TABLE terminology_ab_test_assignments IS 'Entity assignments for terminology A/B tests';
COMMENT ON TABLE terminology_feedback IS 'User feedback on terminology effectiveness';

COMMENT ON FUNCTION resolve_terminology IS 'Resolves terminology for a specific entity with proper inheritance';
COMMENT ON FUNCTION has_custom_terminology IS 'Checks if an entity has custom terminology defined';
