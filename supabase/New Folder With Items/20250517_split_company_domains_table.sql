-- Migration: Split company-specific domains into their own table

-- 1. Create the new company_domains table
CREATE TABLE company_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text,
  order_index integer DEFAULT 0,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

-- 2. Copy company-specific domains from business_domains to company_domains
INSERT INTO company_domains (id, name, description, icon, color, order_index, company_id, created_at, updated_at)
SELECT id, name, description, icon, color, order_index, company_id, created_at, updated_at
FROM business_domains
WHERE company_id IS NOT NULL;

-- 3. Remove company-specific domains from business_domains
DELETE FROM business_domains
WHERE company_id IS NOT NULL;

-- 4. (Optional) Drop company_id column from business_domains if only global domains remain
-- ALTER TABLE business_domains DROP COLUMN company_id;

-- 5. (Optional) Add/adjust unique constraint on business_domains for global domains
-- ALTER TABLE business_domains DROP CONSTRAINT IF EXISTS unique_business_domain_name;
-- ALTER TABLE business_domains ADD CONSTRAINT unique_global_business_domain_name UNIQUE (name);

-- 6. (Optional) Add RLS policies for company_domains as needed
-- Example: Enable RLS and allow company members to access their domains
-- ALTER TABLE company_domains ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow company members to access their domains"
--   ON company_domains
--   USING (auth.uid() IN (SELECT user_id FROM company_members WHERE company_id = company_domains.company_id));
