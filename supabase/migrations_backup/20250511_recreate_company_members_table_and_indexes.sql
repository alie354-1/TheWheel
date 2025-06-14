-- Migration: Recreate company_members table and indexes if needed for admin logic
-- Date: 2025-05-11

-- Only run this if you need to ensure the company_members table has the correct columns and indexes.
-- This will NOT drop the table if it already exists, but will ensure the correct structure.

CREATE TABLE IF NOT EXISTS company_members (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT,
  PRIMARY KEY (company_id, user_id)
);

-- Add index for admin lookups if not already present
CREATE INDEX IF NOT EXISTS idx_company_members_user_id_role ON company_members(user_id, role);

-- Add index for company lookups if not already present
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);

-- Add index for status if not already present
CREATE INDEX IF NOT EXISTS idx_company_members_status ON company_members(status);

-- This migration is safe to run even if the table already exists, and will ensure the correct columns and indexes for admin logic.
