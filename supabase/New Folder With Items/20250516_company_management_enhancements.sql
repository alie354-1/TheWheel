-- Migration: Company Management Enhancements
-- Date: 2025-05-16

-- 1. Add audit and soft-delete fields to companies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='created_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='updated_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='deleted_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='created_by_user_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN created_by_user_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='updated_by_user_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN updated_by_user_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='deleted_by_user_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN deleted_by_user_id UUID;
  END IF;
END $$;

-- 2. Add audit and soft-delete fields to company_members table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='company_members' AND column_name='created_at'
  ) THEN
    ALTER TABLE company_members ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='company_members' AND column_name='updated_at'
  ) THEN
    ALTER TABLE company_members ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='company_members' AND column_name='deleted_at'
  ) THEN
    ALTER TABLE company_members ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='company_members' AND column_name='created_by_user_id'
  ) THEN
    ALTER TABLE company_members ADD COLUMN created_by_user_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='company_members' AND column_name='updated_by_user_id'
  ) THEN
    ALTER TABLE company_members ADD COLUMN updated_by_user_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='company_members' AND column_name='deleted_by_user_id'
  ) THEN
    ALTER TABLE company_members ADD COLUMN deleted_by_user_id UUID;
  END IF;
END $$;

-- 3. Enable Row Level Security (RLS) and add policies

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow company members to select companies they belong to (not deleted)
CREATE POLICY "Allow company members to view their companies"
  ON companies
  FOR SELECT
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = companies.id
        AND company_members.user_id = auth.uid()
        AND company_members.deleted_at IS NULL
    )
  );

-- Policy: Allow company owner/admin to update their company
CREATE POLICY "Allow company owner/admin to update company"
  ON companies
  FOR UPDATE
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = companies.id
        AND company_members.user_id = auth.uid()
        AND company_members.role IN ('owner', 'admin')
        AND company_members.deleted_at IS NULL
    )
  );

-- Policy: Allow company owner to delete (soft delete) their company
CREATE POLICY "Allow company owner to delete company"
  ON companies
  FOR DELETE
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = companies.id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
        AND company_members.deleted_at IS NULL
    )
  );

-- Enable RLS on company_members
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own company memberships
CREATE POLICY "Allow user to view their company memberships"
  ON company_members
  FOR SELECT
  USING (
    deleted_at IS NULL AND user_id = auth.uid()
  );

-- Policy: Allow company owner/admin to manage company members
CREATE POLICY "Allow company owner/admin to manage members"
  ON company_members
  FOR ALL
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM company_members AS cm2
      WHERE cm2.company_id = company_members.company_id
        AND cm2.user_id = auth.uid()
        AND cm2.role IN ('owner', 'admin')
        AND cm2.deleted_at IS NULL
    )
  );

-- 4. (Optional) Function for hard deletion of a company and all related data
CREATE OR REPLACE FUNCTION hard_delete_company(target_company_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM company_members WHERE company_id = target_company_id;
  -- Add other related deletes as needed (e.g., company_tools, documents, etc.)
  DELETE FROM companies WHERE id = target_company_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Add comments for future migrations
-- - Add more granular permissions as needed
-- - Add triggers for audit fields if not already present
