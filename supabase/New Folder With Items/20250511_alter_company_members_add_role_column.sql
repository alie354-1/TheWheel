-- Migration: ALTER company_members to add 'role' and 'status' columns if missing
-- Date: 2025-05-11

DO $$
BEGIN
  -- Add 'role' column if it does not exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='company_members' AND column_name='role'
  ) THEN
    ALTER TABLE company_members ADD COLUMN role TEXT;
  END IF;

  -- Add 'status' column if it does not exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='company_members' AND column_name='status'
  ) THEN
    ALTER TABLE company_members ADD COLUMN status TEXT;
  END IF;
END $$;

-- Add index for admin lookups if not already present
CREATE INDEX IF NOT EXISTS idx_company_members_user_id_role ON company_members(user_id, role);

-- Add index for company lookups if not already present
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);

-- Add index for status if not already present
CREATE INDEX IF NOT EXISTS idx_company_members_status ON company_members(status);

-- This migration is safe to run and will only add missing columns/indexes.
