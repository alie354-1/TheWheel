-- Migration to add status column to company_journey_steps table
-- Created: May 7, 2025

-- Add status column with default value and check constraint
ALTER TABLE company_journey_steps
ADD COLUMN status TEXT NOT NULL DEFAULT 'not_started' 
CHECK (status IN ('not_started', 'in_progress', 'completed'));

-- Update existing rows with default values if needed
-- (This is optional since the default is already 'not_started')
-- UPDATE company_journey_steps SET status = 'not_started' WHERE status IS NULL;

COMMENT ON COLUMN company_journey_steps.status IS 'Tracks the status of a step for a specific company. Values: not_started, in_progress, completed';
