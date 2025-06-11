-- Migration to add set_updated_at function
-- This function is used as a trigger to automatically update updated_at columns
-- Date: May 3, 2025

-- Create the set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment to the function
COMMENT ON FUNCTION public.set_updated_at() IS 'Automatically sets the updated_at column to the current timestamp';
