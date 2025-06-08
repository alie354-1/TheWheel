-- Migration: Add Calendar Integration System
-- Description: This migration adds support for integrating with external calendar systems like Google Calendar

-- Create integration type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_type_enum') THEN
        CREATE TYPE integration_type_enum AS ENUM ('manual', 'google_calendar');
    END IF;
END$$;

-- Add integration_type and google_calendar_credentials to expert_profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expert_profiles' AND column_name = 'integration_type') THEN
        ALTER TABLE expert_profiles ADD COLUMN integration_type integration_type_enum DEFAULT 'manual';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expert_profiles' AND column_name = 'google_calendar_credentials') THEN
        ALTER TABLE expert_profiles ADD COLUMN google_calendar_credentials JSONB;
    END IF;
END$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS expert_profiles_integration_type_idx ON expert_profiles(integration_type);

-- Create function to connect Google Calendar
CREATE OR REPLACE FUNCTION connect_google_calendar(
  p_expert_id UUID,
  p_credentials JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the expert exists
  IF NOT EXISTS (SELECT 1 FROM expert_profiles WHERE user_id = p_expert_id) THEN
    RAISE EXCEPTION 'Expert with ID % does not exist', p_expert_id;
  END IF;
  
  -- Update the expert profile with Google Calendar credentials
  UPDATE expert_profiles
  SET 
    integration_type = 'google_calendar',
    google_calendar_credentials = p_credentials,
    updated_at = NOW()
  WHERE user_id = p_expert_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to disconnect Google Calendar
CREATE OR REPLACE FUNCTION disconnect_google_calendar(
  p_expert_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the expert exists
  IF NOT EXISTS (SELECT 1 FROM expert_profiles WHERE user_id = p_expert_id) THEN
    RAISE EXCEPTION 'Expert with ID % does not exist', p_expert_id;
  END IF;
  
  -- Update the expert profile to remove Google Calendar credentials
  UPDATE expert_profiles
  SET 
    integration_type = 'manual',
    google_calendar_credentials = NULL,
    updated_at = NOW()
  WHERE user_id = p_expert_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get expert's calendar integration type
CREATE OR REPLACE FUNCTION get_expert_integration_type(
  p_expert_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_integration_type TEXT;
BEGIN
  SELECT integration_type::TEXT INTO v_integration_type
  FROM expert_profiles
  WHERE user_id = p_expert_id;
  
  RETURN v_integration_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for the new columns
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS expert_profiles_update_google_calendar_policy ON expert_profiles;
  
  -- Create new policies
  CREATE POLICY expert_profiles_update_google_calendar_policy ON expert_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END$$;

COMMENT ON COLUMN expert_profiles.integration_type IS 'Type of calendar integration (manual, google_calendar)';
COMMENT ON COLUMN expert_profiles.google_calendar_credentials IS 'Encrypted Google Calendar OAuth credentials';
