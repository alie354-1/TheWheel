-- Add Office 365 Calendar integration functions

-- Function to connect Office 365 Calendar
CREATE OR REPLACE FUNCTION connect_office365_calendar(
  p_expert_id UUID,
  p_credentials JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Update the expert profile with the Office 365 Calendar credentials
  -- and set the integration type to office365_calendar
  UPDATE expert_profiles
  SET 
    office365_calendar_credentials = p_credentials,
    integration_type = 'office365_calendar'
  WHERE user_id = p_expert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disconnect Office 365 Calendar
CREATE OR REPLACE FUNCTION disconnect_office365_calendar(
  p_expert_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update the expert profile to remove the Office 365 Calendar credentials
  -- and set the integration type back to manual
  UPDATE expert_profiles
  SET 
    office365_calendar_credentials = NULL,
    integration_type = 'manual'
  WHERE user_id = p_expert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for the functions
DO $$
BEGIN
  -- Grant execute permission on the functions to authenticated users
  GRANT EXECUTE ON FUNCTION connect_office365_calendar(UUID, JSONB) TO authenticated;
  GRANT EXECUTE ON FUNCTION disconnect_office365_calendar(UUID) TO authenticated;
END
$$;
