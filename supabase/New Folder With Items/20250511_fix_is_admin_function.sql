-- Migration to fix is_admin function to use company_members table
-- instead of non-existent user_roles table
-- Created: May 11, 2025

-- Drop and recreate is_admin function with CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS is_admin CASCADE;

-- Create a new is_admin function that uses company_members table
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_role BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM company_members 
    WHERE user_id = is_admin.user_id AND role = 'admin'
  ) INTO admin_role;
  
  RETURN admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Optional) Recreate is_in_same_company for completeness
DROP FUNCTION IF EXISTS is_in_same_company CASCADE;
CREATE OR REPLACE FUNCTION is_in_same_company(company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_company_id UUID;
BEGIN
  SELECT c.id INTO user_company_id
  FROM companies c
  INNER JOIN company_members cm ON c.id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active';
  
  RETURN user_company_id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
