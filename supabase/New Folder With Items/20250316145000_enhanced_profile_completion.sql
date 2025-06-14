-- Migration: Enhanced Profile System with Completion Tracking (Compatible)
-- Created: 2025-03-16
-- Description: Adds comprehensive profile support while maintaining compatibility with existing services

-- Step 1: Create Comprehensive Profile Tables (Without Modifying Existing Schema)

-- Profile sections table to track completion status for different profile areas
CREATE TABLE IF NOT EXISTS profile_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completion_percentage INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  required_fields JSONB DEFAULT '[]'::JSONB,
  optional_fields JSONB DEFAULT '[]'::JSONB,
  is_role_specific BOOLEAN DEFAULT false,
  applicable_roles TEXT[] DEFAULT '{}'::TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, section_key)
);

-- Create work experience table
CREATE TABLE IF NOT EXISTS user_work_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  location TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create education table
CREATE TABLE IF NOT EXISTS user_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create professional services table
CREATE TABLE IF NOT EXISTS professional_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  rate_type TEXT CHECK (rate_type IN ('hourly', 'project', 'retainer')),
  rate_range JSONB,
  availability TEXT CHECK (availability IN ('part_time', 'full_time', 'contract')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile notifications table
CREATE TABLE IF NOT EXISTS profile_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('milestone', 'section', 'inactivity', 'quality', 'recommendation')),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'important', 'standard', 'informational')),
  title TEXT NOT NULL,
  description TEXT,
  action_url TEXT,
  action_label TEXT,
  icon TEXT,
  is_read BOOLEAN DEFAULT false,
  dismissible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  triggered_by TEXT
);

-- Create company invitations table
CREATE TABLE IF NOT EXISTS company_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL, -- references companies table
  code TEXT NOT NULL UNIQUE,
  email TEXT,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  role TEXT,
  department TEXT,
  message TEXT,
  is_accepted BOOLEAN DEFAULT false,
  accepted_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Add Compatible Enhancement to Existing Profile Table

-- Add profile completion tracking to existing profiles table
-- This is safe and won't affect existing services
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completion_last_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS additional_roles TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- But don't alter the structure of existing fields that services rely on

-- Step 3: Setup Indexes for Optimal Performance

CREATE INDEX IF NOT EXISTS idx_profile_sections_user ON profile_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_sections_completion ON profile_sections(user_id, completion_percentage);
CREATE INDEX IF NOT EXISTS idx_profile_sections_required ON profile_sections(user_id) WHERE is_required = true;

CREATE INDEX IF NOT EXISTS idx_work_experience_user ON user_work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_current ON user_work_experience(user_id) WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_education_user ON user_education(user_id);

CREATE INDEX IF NOT EXISTS idx_services_user ON professional_services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON professional_services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON professional_services(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_profile_notifications_user ON profile_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_notifications_unread ON profile_notifications(user_id) WHERE is_read = false;

-- Step 4: Create Functions for Profile Completion Calculation

-- Function to calculate section completion
CREATE OR REPLACE FUNCTION calculate_section_completion(
  p_section_id UUID,
  p_field_data JSONB
) RETURNS INTEGER AS $$
DECLARE
  v_required_fields JSONB;
  v_optional_fields JSONB;
  v_required_count INTEGER := 0;
  v_optional_count INTEGER := 0;
  v_completed_required INTEGER := 0;
  v_completed_optional INTEGER := 0;
  v_field TEXT;
  v_percentage INTEGER;
BEGIN
  -- Get section metadata
  SELECT required_fields, optional_fields
  INTO v_required_fields, v_optional_fields
  FROM profile_sections
  WHERE id = p_section_id;
  
  -- Count fields
  v_required_count := jsonb_array_length(v_required_fields);
  v_optional_count := jsonb_array_length(v_optional_fields);
  
  -- Check required fields
  FOR i IN 0..v_required_count-1 LOOP
    v_field := v_required_fields->i->>'field';
    IF p_field_data ? v_field AND p_field_data->>v_field IS NOT NULL AND p_field_data->>v_field != '' THEN
      v_completed_required := v_completed_required + 1;
    END IF;
  END LOOP;
  
  -- Check optional fields
  FOR i IN 0..v_optional_count-1 LOOP
    v_field := v_optional_fields->i->>'field';
    IF p_field_data ? v_field AND p_field_data->>v_field IS NOT NULL AND p_field_data->>v_field != '' THEN
      v_completed_optional := v_completed_optional + 1;
    END IF;
  END LOOP;
  
  -- Calculate percentage
  IF v_required_count > 0 THEN
    v_percentage := (v_completed_required::FLOAT / v_required_count::FLOAT * 80)::INTEGER;
  ELSE
    v_percentage := 80; -- If no required fields, assume 80% base completion
  END IF;
  
  -- Add optional fields contribution
  IF v_optional_count > 0 THEN
    v_percentage := v_percentage + (v_completed_optional::FLOAT / v_optional_count::FLOAT * 20)::INTEGER;
  END IF;
  
  RETURN v_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to update overall profile completion
CREATE OR REPLACE FUNCTION update_profile_completion(p_user_id UUID) 
RETURNS void AS $$
DECLARE
  v_total_weight INTEGER := 0;
  v_weighted_sum INTEGER := 0;
  v_section RECORD;
  v_new_percentage INTEGER;
BEGIN
  -- Sum up section completions with their weights
  FOR v_section IN 
    SELECT 
      id, 
      completion_percentage, 
      CASE WHEN is_required THEN 2 ELSE 1 END AS weight
    FROM 
      profile_sections 
    WHERE 
      user_id = p_user_id
  LOOP
    v_weighted_sum := v_weighted_sum + (v_section.completion_percentage * v_section.weight);
    v_total_weight := v_total_weight + v_section.weight;
  END LOOP;
  
  -- Calculate new overall percentage
  IF v_total_weight > 0 THEN
    v_new_percentage := (v_weighted_sum / v_total_weight);
  ELSE
    v_new_percentage := 0;
  END IF;
  
  -- Update the profile in BOTH tables to maintain compatibility
  -- Update new system
  UPDATE profiles
  SET 
    completion_percentage = v_new_percentage,
    completion_last_updated = NOW()
  WHERE 
    id = p_user_id;
    
  -- Create milestone notification if needed
  PERFORM create_milestone_notification(p_user_id, v_new_percentage);
END;
$$ LANGUAGE plpgsql;

-- Function for milestone notifications
CREATE OR REPLACE FUNCTION create_milestone_notification(
  p_user_id UUID,
  p_percentage INTEGER
) RETURNS void AS $$
DECLARE
  v_last_milestone INTEGER;
  v_milestone INTEGER;
  v_milestones INTEGER[] := ARRAY[25, 50, 75, 100];
  v_title TEXT;
  v_description TEXT;
  v_icon TEXT;
BEGIN
  -- Find the highest milestone achieved
  SELECT MAX(milestone)
  INTO v_last_milestone
  FROM (
    SELECT 
      (regexp_matches(title, 'Profile (\d+)% Complete'))[1]::INTEGER AS milestone
    FROM 
      profile_notifications
    WHERE 
      user_id = p_user_id AND
      type = 'milestone'
  ) AS milestones;
  
  -- Default to 0 if no previous milestone
  v_last_milestone := COALESCE(v_last_milestone, 0);
  
  -- Find the current milestone (if any)
  SELECT milestone
  INTO v_milestone
  FROM (
    SELECT unnest(v_milestones) AS milestone
  ) AS m
  WHERE 
    milestone <= p_percentage AND
    milestone > v_last_milestone
  ORDER BY milestone DESC
  LIMIT 1;
  
  -- If we have a new milestone, create a notification
  IF v_milestone IS NOT NULL THEN
    -- Set notification content based on milestone
    CASE v_milestone
      WHEN 25 THEN
        v_title := 'Profile 25% Complete';
        v_description := 'You''ve made a great start on your profile! Keep going to unlock more features.';
        v_icon := 'milestone_25';
      WHEN 50 THEN
        v_title := 'Profile 50% Complete';
        v_description := 'Halfway there! Your profile is starting to look good.';
        v_icon := 'milestone_50';
      WHEN 75 THEN
        v_title := 'Profile 75% Complete';
        v_description := 'Your profile is looking great! Just a few more sections to complete.';
        v_icon := 'milestone_75';
      WHEN 100 THEN
        v_title := 'Profile 100% Complete';
        v_description := 'Congratulations! Your profile is now complete. You''ll get the most out of the platform now.';
        v_icon := 'milestone_100';
    END CASE;
    
    -- Insert the notification
    INSERT INTO profile_notifications (
      user_id,
      type,
      priority,
      title,
      description,
      action_url,
      action_label,
      icon,
      triggered_by
    ) VALUES (
      p_user_id,
      'milestone',
      CASE WHEN v_milestone = 100 THEN 'important' ELSE 'standard' END,
      v_title,
      v_description,
      '/profile',
      'View Profile',
      v_icon,
      'system'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create Triggers for Section Updates

-- Trigger for profile completion updates
CREATE OR REPLACE FUNCTION trigger_profile_completion_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_profile_completion(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_on_section_change
AFTER INSERT OR UPDATE OF completion_percentage ON profile_sections
FOR EACH ROW
EXECUTE FUNCTION trigger_profile_completion_update();

-- Step 6: Create Initialization Function for Default Sections

CREATE OR REPLACE FUNCTION initialize_profile_sections(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Get the user's role
  DECLARE
    v_primary_role TEXT;
  BEGIN
    SELECT primary_role INTO v_primary_role FROM profiles WHERE id = p_user_id;
    
    -- Insert common sections for all users
    INSERT INTO profile_sections (
      user_id, 
      section_key, 
      title, 
      description, 
      is_required, 
      display_order,
      required_fields,
      optional_fields
    ) VALUES
    (p_user_id, 'basic_info', 'Basic Information', 'Your name and profile photo', 
     true, 1, 
     '[{"field": "full_name"}, {"field": "avatar_url"}]'::jsonb,
     '[{"field": "headline"}, {"field": "location"}]'::jsonb),
     
    (p_user_id, 'bio', 'About You', 'Tell others about yourself', 
     true, 2, 
     '[{"field": "bio"}]'::jsonb,
     '[]'::jsonb),
     
    (p_user_id, 'skills', 'Skills & Expertise', 'List your professional skills', 
     false, 3, 
     '[]'::jsonb,
     '[{"field": "skills"}]'::jsonb);

    -- Add role-specific sections based on primary role
    IF v_primary_role = 'founder' THEN
      INSERT INTO profile_sections (
        user_id, 
        section_key, 
        title, 
        description, 
        is_required, 
        display_order,
        is_role_specific,
        applicable_roles,
        required_fields,
        optional_fields
      ) VALUES
      (p_user_id, 'founder_info', 'Founder Information', 'Details about your founder journey', 
       true, 4, 
       true, 
       '{founder}',
       '[{"field": "company_stage"}]'::jsonb,
       '[]'::jsonb);
    END IF;
    
    IF v_primary_role = 'service_provider' THEN
      INSERT INTO profile_sections (
        user_id, 
        section_key, 
        title, 
        description, 
        is_required, 
        display_order,
        is_role_specific,
        applicable_roles,
        required_fields,
        optional_fields
      ) VALUES
      (p_user_id, 'services_offered', 'Services Offered', 'Professional services you provide', 
       true, 4, 
       true, 
       '{service_provider}',
       '[{"field": "service_categories"}]'::jsonb,
       '[]'::jsonb);
    END IF;
    
    IF v_primary_role = 'company_member' THEN
      INSERT INTO profile_sections (
        user_id, 
        section_key, 
        title, 
        description, 
        is_required, 
        display_order,
        is_role_specific,
        applicable_roles,
        required_fields,
        optional_fields
      ) VALUES
      (p_user_id, 'company_role', 'Company Role', 'Your role and responsibilities', 
       true, 4, 
       true, 
       '{company_member}',
       '[{"field": "company_id"}, {"field": "company_role"}]'::jsonb,
       '[]'::jsonb);
    END IF;
  END;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize sections for new and updated profiles
CREATE OR REPLACE FUNCTION trigger_initialize_profile_sections()
RETURNS TRIGGER AS $$
BEGIN
  -- Only initialize if primary_role has changed or is newly set
  IF NEW.primary_role IS NOT NULL AND (OLD.primary_role IS NULL OR NEW.primary_role != OLD.primary_role) THEN
    PERFORM initialize_profile_sections(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_sections_for_profile
AFTER INSERT OR UPDATE OF primary_role ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_initialize_profile_sections();

-- Step 7: RLS Policies for New Tables

-- Profile sections security
ALTER TABLE profile_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_sections_select ON profile_sections
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY profile_sections_update ON profile_sections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Work experience security
ALTER TABLE user_work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY work_experience_select ON user_work_experience
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY work_experience_insert ON user_work_experience
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY work_experience_update ON user_work_experience
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY work_experience_delete ON user_work_experience
  FOR DELETE
  USING (auth.uid() = user_id);

-- Education security
ALTER TABLE user_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY education_select ON user_education
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY education_insert ON user_education
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY education_update ON user_education
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY education_delete ON user_education
  FOR DELETE
  USING (auth.uid() = user_id);

-- Professional services security
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_select ON professional_services
  FOR SELECT
  USING (true); -- Allow public viewing of services

CREATE POLICY services_insert ON professional_services
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY services_update ON professional_services
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY services_delete ON professional_services
  FOR DELETE
  USING (auth.uid() = user_id);

-- Profile notifications security
ALTER TABLE profile_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON profile_notifications
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM service_roles WHERE role = 'admin'));

CREATE POLICY notifications_update ON profile_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notifications_delete ON profile_notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Create Compatibility View 

-- View that combines old and new profile data for maximal compatibility
CREATE OR REPLACE VIEW enhanced_profiles AS
SELECT 
  p.*,
  COALESCE(p.completion_percentage, 0) AS profile_completion,
  (
    SELECT COUNT(*) 
    FROM profile_notifications 
    WHERE user_id = p.id AND is_read = false
  ) AS unread_notifications,
  (
    SELECT json_agg(s) 
    FROM profile_sections s 
    WHERE s.user_id = p.id
  ) AS profile_sections,
  (
    SELECT json_agg(w) 
    FROM user_work_experience w 
    WHERE w.user_id = p.id
  ) AS work_experience,
  (
    SELECT json_agg(e) 
    FROM user_education e 
    WHERE e.user_id = p.id
  ) AS education,
  (
    SELECT json_agg(s) 
    FROM professional_services s 
    WHERE s.user_id = p.id
  ) AS services
FROM profiles p;

-- Step 9: Create Additional Utility Views

-- View for service providers directory
CREATE OR REPLACE VIEW service_provider_directory AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.company_id,
  p.is_public,
  p.primary_role,
  p.completion_percentage,
  array_agg(DISTINCT ps.category) AS service_categories,
  array_agg(DISTINCT ps.title) AS service_titles
FROM
  profiles p
JOIN
  professional_services ps ON ps.user_id = p.id
WHERE
  p.primary_role = 'service_provider'
  AND p.is_public = true
  AND ps.is_active = true
GROUP BY
  p.id;

-- View for company members
CREATE OR REPLACE VIEW company_members_directory AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.company_id,
  p.company_role,
  p.primary_role,
  c.name AS company_name
FROM
  profiles p
LEFT JOIN
  companies c ON c.id = p.company_id
WHERE
  p.company_id IS NOT NULL
  AND p.is_public = true;
