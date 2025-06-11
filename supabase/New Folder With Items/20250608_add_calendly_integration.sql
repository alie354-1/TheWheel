-- Migration: Add Calendly Integration
-- Description: This migration adds the necessary database changes to support Calendly integration
-- for expert availability management.

-- Update the expert_profiles table to support Calendly integration
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS calendly_config JSONB;

-- Add a comment to the calendly_config column
COMMENT ON COLUMN expert_profiles.calendly_config IS 'JSON configuration for Calendly integration, including event link and connected email';

-- Ensure the integration_type enum includes 'calendly'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'integration_type' 
        AND pg_enum.enumlabel = 'calendly'
    ) THEN
        ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'calendly';
    END IF;
END$$;

-- Create a function to connect Calendly
CREATE OR REPLACE FUNCTION connect_calendly(
    p_expert_id UUID,
    p_config JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the expert's profile with the Calendly configuration
    UPDATE expert_profiles
    SET 
        integration_type = 'calendly',
        calendly_config = p_config,
        updated_at = NOW()
    WHERE user_id = p_expert_id;
END;
$$;

-- Create a function to disconnect Calendly
CREATE OR REPLACE FUNCTION disconnect_calendly(
    p_expert_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the expert's profile to remove the Calendly configuration
    UPDATE expert_profiles
    SET 
        integration_type = 'manual',
        calendly_config = NULL,
        updated_at = NOW()
    WHERE user_id = p_expert_id;
END;
$$;

-- Add a new calendar_type value for Calendly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'calendar_type' 
        AND pg_enum.enumlabel = 'calendly'
    ) THEN
        ALTER TYPE calendar_type ADD VALUE IF NOT EXISTS 'calendly';
    END IF;
END$$;

-- Create a function to get available slots from Calendly
-- This is a placeholder function that would be replaced with actual API integration
CREATE OR REPLACE FUNCTION get_calendly_available_slots(
    p_expert_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    slot_date DATE,
    slot_start_time TIME,
    slot_end_time TIME,
    is_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- In a real implementation, this would call the Calendly API
    -- For now, return a placeholder result
    RETURN QUERY
    WITH expert_config AS (
        SELECT calendly_config
        FROM expert_profiles
        WHERE user_id = p_expert_id
    ),
    date_range AS (
        SELECT generate_series(
            date_trunc('day', p_start_date),
            date_trunc('day', p_end_date),
            '1 day'::interval
        )::date AS day
    ),
    time_slots AS (
        SELECT 
            '09:00'::time AS start_time,
            '10:00'::time AS end_time
        UNION ALL
        SELECT 
            '10:00'::time AS start_time,
            '11:00'::time AS end_time
        UNION ALL
        SELECT 
            '11:00'::time AS start_time,
            '12:00'::time AS end_time
        UNION ALL
        SELECT 
            '13:00'::time AS start_time,
            '14:00'::time AS end_time
        UNION ALL
        SELECT 
            '14:00'::time AS start_time,
            '15:00'::time AS end_time
        UNION ALL
        SELECT 
            '15:00'::time AS start_time,
            '16:00'::time AS end_time
        UNION ALL
        SELECT 
            '16:00'::time AS start_time,
            '17:00'::time AS end_time
    )
    SELECT 
        dr.day AS slot_date,
        ts.start_time AS slot_start_time,
        ts.end_time AS slot_end_time,
        TRUE AS is_available
    FROM date_range dr
    CROSS JOIN time_slots ts
    CROSS JOIN expert_config ec
    WHERE 
        -- Skip weekends in this mock implementation
        EXTRACT(DOW FROM dr.day) NOT IN (0, 6)
        -- Only return slots if the expert has a Calendly configuration
        AND ec.calendly_config IS NOT NULL;
END;
$$;

-- Create a function to create an appointment in Calendly
-- This is a placeholder function that would be replaced with actual API integration
CREATE OR REPLACE FUNCTION create_calendly_appointment(
    p_expert_id UUID,
    p_client_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_title TEXT,
    p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appointment_id UUID;
    v_mock_calendly_event_id TEXT;
BEGIN
    -- In a real implementation, this would call the Calendly API
    -- For now, create a mock Calendly event ID
    v_mock_calendly_event_id := 'calendly-event-' || floor(random() * 1000000)::text;
    
    -- Insert the appointment into the appointments table
    INSERT INTO appointments (
        expert_id,
        client_id,
        start_time,
        end_time,
        title,
        description,
        status,
        external_calendar_event_id,
        calendar_type
    ) VALUES (
        p_expert_id,
        p_client_id,
        p_start_time,
        p_end_time,
        p_title,
        p_description,
        'confirmed',
        v_mock_calendly_event_id,
        'calendly'
    )
    RETURNING id INTO v_appointment_id;
    
    RETURN v_appointment_id;
END;
$$;

-- Create a function to update an appointment in Calendly
-- This is a placeholder function that would be replaced with actual API integration
CREATE OR REPLACE FUNCTION update_calendly_appointment(
    p_appointment_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_expert_id UUID;
    v_external_event_id TEXT;
BEGIN
    -- Get the appointment details
    SELECT expert_id, external_calendar_event_id
    INTO v_expert_id, v_external_event_id
    FROM appointments
    WHERE id = p_appointment_id
    AND calendar_type = 'calendly';
    
    -- If the appointment doesn't exist or isn't a Calendly appointment, return false
    IF v_expert_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- In a real implementation, this would call the Calendly API
    -- For now, just update the appointment in the database
    UPDATE appointments
    SET
        start_time = COALESCE(p_start_time, start_time),
        end_time = COALESCE(p_end_time, end_time),
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        updated_at = NOW()
    WHERE id = p_appointment_id;
    
    RETURN TRUE;
END;
$$;

-- Create a function to cancel an appointment in Calendly
-- This is a placeholder function that would be replaced with actual API integration
CREATE OR REPLACE FUNCTION cancel_calendly_appointment(
    p_appointment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_expert_id UUID;
    v_external_event_id TEXT;
BEGIN
    -- Get the appointment details
    SELECT expert_id, external_calendar_event_id
    INTO v_expert_id, v_external_event_id
    FROM appointments
    WHERE id = p_appointment_id
    AND calendar_type = 'calendly';
    
    -- If the appointment doesn't exist or isn't a Calendly appointment, return false
    IF v_expert_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- In a real implementation, this would call the Calendly API
    -- For now, just update the appointment status in the database
    UPDATE appointments
    SET
        status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_appointment_id;
    
    RETURN TRUE;
END;
$$;
