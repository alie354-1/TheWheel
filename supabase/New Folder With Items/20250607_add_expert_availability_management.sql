-- Migration: Add Expert Availability Management
-- Description: This migration adds the expert_availability table and related functions

-- Create expert_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS expert_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expert_availability_expert_id_idx ON expert_availability(expert_id);
CREATE INDEX IF NOT EXISTS expert_availability_day_of_week_idx ON expert_availability(day_of_week);

-- Enable Row Level Security
ALTER TABLE expert_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY expert_availability_select_policy ON expert_availability
  FOR SELECT USING (true);
  
CREATE POLICY expert_availability_insert_policy ON expert_availability
  FOR INSERT WITH CHECK (auth.uid() = expert_id);
  
CREATE POLICY expert_availability_update_policy ON expert_availability
  FOR UPDATE USING (auth.uid() = expert_id);
  
CREATE POLICY expert_availability_delete_policy ON expert_availability
  FOR DELETE USING (auth.uid() = expert_id);

-- Create function to set expert availability
CREATE OR REPLACE FUNCTION set_expert_availability(
  p_expert_id UUID,
  p_day_of_week SMALLINT,
  p_start_time TEXT,
  p_end_time TEXT,
  p_is_available BOOLEAN DEFAULT TRUE
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Check if the expert exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_expert_id) THEN
    RAISE EXCEPTION 'Expert with ID % does not exist', p_expert_id;
  END IF;
  
  -- Check if day_of_week is valid
  IF p_day_of_week < 0 OR p_day_of_week > 6 THEN
    RAISE EXCEPTION 'Invalid day of week: %. Must be between 0 and 6', p_day_of_week;
  END IF;
  
  -- Insert the availability record
  INSERT INTO expert_availability (
    expert_id,
    day_of_week,
    start_time,
    end_time,
    is_available
  ) VALUES (
    p_expert_id,
    p_day_of_week,
    p_start_time,
    p_end_time,
    p_is_available
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get expert availability
CREATE OR REPLACE FUNCTION get_expert_availability(
  p_expert_id UUID
) RETURNS SETOF expert_availability AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM expert_availability
  WHERE expert_id = p_expert_id
  ORDER BY day_of_week, start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete expert availability
CREATE OR REPLACE FUNCTION delete_expert_availability(
  p_availability_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM expert_availability
  WHERE id = p_availability_id
  AND (auth.uid() = expert_id OR auth.role() = 'service_role')
  RETURNING 1 INTO v_count;
  
  RETURN v_count = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if an expert is available at a specific time
CREATE OR REPLACE FUNCTION is_expert_available(
  p_expert_id UUID,
  p_date TIMESTAMPTZ,
  p_duration_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week SMALLINT;
  v_time TEXT;
  v_end_time TIMESTAMPTZ;
  v_is_available BOOLEAN;
BEGIN
  -- Get the day of week (0-6, Sunday-Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Get the time in HH:MM format
  v_time := TO_CHAR(p_date, 'HH24:MI');
  
  -- Calculate the end time
  v_end_time := p_date + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Check if the expert has availability for this day and time
  SELECT EXISTS (
    SELECT 1
    FROM expert_availability
    WHERE expert_id = p_expert_id
    AND day_of_week = v_day_of_week
    AND start_time <= v_time
    AND end_time >= TO_CHAR(v_end_time, 'HH24:MI')
    AND is_available = TRUE
  ) INTO v_is_available;
  
  -- Also check if there are no existing sessions at this time
  IF v_is_available THEN
    SELECT NOT EXISTS (
      SELECT 1
      FROM expert_sessions
      WHERE expert_id = p_expert_id
      AND scheduled_at <= v_end_time
      AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL >= p_date
      AND status = 'scheduled'
    ) INTO v_is_available;
  END IF;
  
  RETURN v_is_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add sample availability data for demo purposes
DO $$
DECLARE
  expert_user_id UUID;
BEGIN
  -- Get a sample expert user
  SELECT user_id INTO expert_user_id FROM expert_profiles LIMIT 1;
  
  -- Only add sample data if we have an expert and no availability data exists
  IF expert_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM expert_availability) THEN
    -- Monday morning
    PERFORM set_expert_availability(expert_user_id, 1, '09:00', '12:00', TRUE);
    
    -- Wednesday afternoon
    PERFORM set_expert_availability(expert_user_id, 3, '14:00', '17:00', TRUE);
    
    -- Friday all day
    PERFORM set_expert_availability(expert_user_id, 5, '10:00', '15:00', TRUE);
  END IF;
END;
$$;
