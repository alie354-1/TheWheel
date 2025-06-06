-- Migration to add last_activity_at and ensure updated_at for the reviewer_sessions table

-- Ensure the public schema is targeted if not explicit in table name by service
SET search_path = public;

-- Add last_activity_at column if it doesn't exist
-- This column is intended to be updated by the application logic when a reviewer performs an action.
ALTER TABLE reviewer_sessions
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN reviewer_sessions.last_activity_at IS 'Timestamp of the last known activity for this reviewer session, typically updated by application logic.';

-- Add updated_at column if it doesn't exist, for tracking record changes
ALTER TABLE reviewer_sessions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN reviewer_sessions.updated_at IS 'Timestamp of the last update to this session record, automatically managed by a trigger.';

-- Ensure the moddatetime function exists (idempotent)
-- This function is commonly used to update 'updated_at' columns.
CREATE OR REPLACE FUNCTION moddatetime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger for updated_at on reviewer_sessions if it exists, then (re)create it.
-- This ensures the trigger uses the common moddatetime function.
DROP TRIGGER IF EXISTS handle_reviewer_sessions_updated_at ON reviewer_sessions;
CREATE TRIGGER handle_reviewer_sessions_updated_at
BEFORE UPDATE ON reviewer_sessions
FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Note: If DeckService.createOrUpdateReviewerSession is an upsert that explicitly tries to set last_activity_at,
-- this migration ensures the column exists. The default NOW() for last_activity_at will apply on insert
-- if the service does not provide a value for it. The service should ideally provide the specific activity time.
