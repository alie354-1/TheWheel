-- Migration: Multi-Persona Profile System
-- Created: 2025-03-16
-- Description: Implements a comprehensive multi-persona profile system with separated app settings

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create new tables for the multi-persona system

-- Core user profiles table (shared identity across personas)
CREATE TABLE IF NOT EXISTS user_core_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  pronouns TEXT,
  locale TEXT DEFAULT 'en-US',
  timezone TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  account_status TEXT DEFAULT 'active',
  system_metadata JSONB DEFAULT '{}'::JSONB,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Separate application settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES user_core_profiles(id),
  theme TEXT DEFAULT 'system',
  notifications JSONB DEFAULT '{"email": true, "push": true, "inApp": true, "digest": false}'::JSONB,
  display JSONB DEFAULT '{"compactView": false, "showTips": true, "cardSize": "medium"}'::JSONB,
  features JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User personas (multiple per user)
CREATE TABLE IF NOT EXISTS user_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_core_profiles(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('founder', 'service_provider', 'company_member', 'investor', 'advisor', 'community', 'custom')),
  icon TEXT,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  
  -- Persona modules (using JSONB for maximum flexibility)
  professional JSONB DEFAULT '{}'::JSONB,          -- Professional identity
  network JSONB DEFAULT '{}'::JSONB,               -- Network & social info
  company_affiliations JSONB DEFAULT '{}'::JSONB,  -- Company relationships
  project_context JSONB DEFAULT '{}'::JSONB,       -- Current projects/focus
  personalization JSONB DEFAULT '{}'::JSONB,       -- AI & personalization
  billing JSONB DEFAULT '{}'::JSONB,               -- Billing & compliance
  
  -- Persona controls
  visibility_settings JSONB DEFAULT '{
    "discoverable_as": ["founder"], 
    "visible_to": ["public"], 
    "hidden_fields": []
  }'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, name)
);

-- Persona switching rules
CREATE TABLE IF NOT EXISTS persona_context_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_core_profiles(id),
  persona_id UUID NOT NULL REFERENCES user_personas(id),
  context TEXT NOT NULL,
  condition TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, context, condition)
);

-- Persona switching history (for ML recommendations)
CREATE TABLE IF NOT EXISTS persona_switch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_core_profiles(id),
  from_persona_id UUID REFERENCES user_personas(id),
  to_persona_id UUID NOT NULL REFERENCES user_personas(id),
  trigger TEXT NOT NULL CHECK (trigger IN ('manual', 'auto', 'rule')),
  context TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persona-specific onboarding state
CREATE TABLE IF NOT EXISTS onboarding_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_core_profiles(id),
  persona_id UUID NOT NULL REFERENCES user_personas(id),
  current_step TEXT,
  completed_steps JSONB DEFAULT '[]'::JSONB,
  form_data JSONB DEFAULT '{}'::JSONB,
  is_complete BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics JSONB DEFAULT '{}'::JSONB,
  
  UNIQUE(user_id, persona_id)
);

-- Step 2: Create optimized indexes

-- Core identity lookup optimizations
CREATE INDEX IF NOT EXISTS idx_user_core_profiles_email ON user_core_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_core_profiles_status ON user_core_profiles(account_status);

-- Persona lookup optimizations
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON user_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_user_active ON user_personas(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_personas_type ON user_personas(user_id, type);
CREATE INDEX IF NOT EXISTS idx_personas_public ON user_personas(is_public) WHERE is_public = true;

-- Onboarding optimizations
CREATE INDEX IF NOT EXISTS idx_onboarding_user_persona ON onboarding_state(user_id, persona_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_incomplete ON onboarding_state(user_id) WHERE is_complete = false;

-- Context switching optimizations
CREATE INDEX IF NOT EXISTS idx_context_rules_context ON persona_context_rules(user_id, context);
CREATE INDEX IF NOT EXISTS idx_context_rules_priority ON persona_context_rules(user_id, priority DESC);

-- Step 3: Triggering functions for automatic management

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_timestamp
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Auto-deactivate other personas when one is activated
CREATE OR REPLACE FUNCTION manage_active_personas()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE user_personas 
    SET is_active = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_persona
BEFORE UPDATE OF is_active ON user_personas
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION manage_active_personas();

-- Step 4: Migration function for existing data
CREATE OR REPLACE FUNCTION migrate_existing_profiles()
RETURNS void AS $$
DECLARE
  profile_record RECORD;
  persona_id UUID;
BEGIN
  -- For each existing profile
  FOR profile_record IN SELECT * FROM profiles LOOP
    -- 1. Create core profile
    INSERT INTO user_core_profiles (
      id, email, full_name, avatar_url, verified, created_at, last_active_at
    ) VALUES (
      profile_record.id,
      profile_record.email,
      profile_record.full_name,
      profile_record.avatar_url,
      true,
      profile_record.created_at,
      NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Create application settings
    INSERT INTO user_settings (
      user_id,
      theme,
      notifications,
      features
    ) VALUES (
      profile_record.id,
      COALESCE((profile_record.settings->>'theme'), 'system'),
      COALESCE(profile_record.settings->'notifications', '{"email": true, "push": true, "inApp": true, "digest": false}'::jsonb),
      COALESCE(profile_record.settings->'features', '{}'::jsonb)
    ) ON CONFLICT (user_id) DO NOTHING;

    -- 3. Determine persona type from existing data
    INSERT INTO user_personas (
      user_id,
      name,
      type,
      is_public,
      is_active,
      professional,
      company_affiliations
    ) VALUES (
      profile_record.id,
      CASE 
        WHEN profile_record.company_role = 'founder' THEN 'Founder Profile'
        WHEN profile_record.company_role IS NOT NULL THEN 'Company Member Profile'
        ELSE 'Primary Profile'
      END,
      CASE
        WHEN profile_record.company_role = 'founder' THEN 'founder'
        WHEN profile_record.company_role IS NOT NULL THEN 'company_member'
        ELSE 'custom'
      END,
      COALESCE(profile_record.is_public, false),
      true,
      jsonb_build_object(
        'title', profile_record.company_role,
        'industry', profile_record.company_industry,
        'role_category', CASE
          WHEN profile_record.company_role = 'founder' THEN 'FOUNDER'
          WHEN profile_record.company_role IS NOT NULL THEN 'COMPANY_MEMBER'
          ELSE 'CUSTOM'
        END
      ),
      jsonb_build_object(
        'primary_company_id', profile_record.company_id,
        'primary_company_role', profile_record.company_role,
        'primary_company_title', profile_record.company_role
      )
    )
    RETURNING id INTO persona_id;

    -- 4. Migrate onboarding state if it exists
    IF profile_record.setup_progress IS NOT NULL THEN
      INSERT INTO onboarding_state (
        user_id,
        persona_id,
        current_step,
        completed_steps,
        form_data,
        is_complete,
        last_updated
      ) VALUES (
        profile_record.id,
        persona_id,
        COALESCE(profile_record.setup_progress->>'current_step', 'welcome'),
        COALESCE(profile_record.setup_progress->'completed_steps', '[]'::jsonb),
        COALESCE(profile_record.setup_progress->'form_data', '{}'::jsonb),
        CASE
          WHEN profile_record.setup_progress->>'current_step' = 'complete' THEN true
          ELSE false
        END,
        COALESCE(profile_record.setup_progress->>'last_updated', NOW()::text)::timestamp with time zone
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Row-Level Security Policies

-- Core profiles security
ALTER TABLE user_core_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_core_profiles_select ON user_core_profiles
  FOR SELECT
  USING (auth.uid() = id OR auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY user_core_profiles_update ON user_core_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Personas security
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_personas_select ON user_personas
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true OR 
         auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY user_personas_insert ON user_personas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_personas_update ON user_personas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_personas_delete ON user_personas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Settings security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_select ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY user_settings_update ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Onboarding security
ALTER TABLE onboarding_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY onboarding_state_select ON onboarding_state
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY onboarding_state_update ON onboarding_state
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Run migration (commented out by default, enable manually after review)
-- SELECT migrate_existing_profiles();

-- Step 7: Add foreign key to track active persona in core profile (after migration)
ALTER TABLE user_core_profiles ADD COLUMN IF NOT EXISTS active_persona_id UUID REFERENCES user_personas(id);
CREATE INDEX IF NOT EXISTS idx_core_active_persona ON user_core_profiles(active_persona_id);

-- Step 8: Create views for simplified access

-- View for getting current active persona for a user
CREATE OR REPLACE VIEW active_personas AS
SELECT 
  c.id AS user_id,
  c.email,
  c.full_name,
  p.id AS persona_id,
  p.name AS persona_name,
  p.type AS persona_type,
  p.is_public,
  p.professional,
  p.company_affiliations,
  p.visibility_settings
FROM 
  user_core_profiles c
JOIN 
  user_personas p ON p.id = c.active_persona_id OR (c.active_persona_id IS NULL AND p.is_active = true AND p.user_id = c.id);

-- View for onboarding status across personas
CREATE OR REPLACE VIEW user_onboarding_status AS
SELECT 
  c.id AS user_id,
  c.email,
  p.id AS persona_id,
  p.name AS persona_name,
  p.type AS persona_type,
  o.is_complete,
  o.current_step,
  o.completed_steps,
  o.last_updated
FROM 
  user_core_profiles c
JOIN 
  user_personas p ON p.user_id = c.id
LEFT JOIN 
  onboarding_state o ON o.persona_id = p.id AND o.user_id = c.id;

-- Final confirmation comment
COMMENT ON TABLE user_core_profiles IS 'Core user identity information shared across all personas';
COMMENT ON TABLE user_personas IS 'User personas representing different professional identities';
COMMENT ON TABLE user_settings IS 'Application settings separated from profile data';
COMMENT ON TABLE onboarding_state IS 'Onboarding progress tracked per persona';
COMMENT ON TABLE persona_context_rules IS 'Rules for automatic context-based persona switching';
