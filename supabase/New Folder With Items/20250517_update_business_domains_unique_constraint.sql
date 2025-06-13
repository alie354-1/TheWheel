-- Migration: Update unique constraint on business_domains to (company_id, name)

-- 1. Drop the old unique constraint on name
ALTER TABLE business_domains
DROP CONSTRAINT IF EXISTS unique_business_domain_name;

-- 2. Add a new unique constraint on (company_id, name)
ALTER TABLE business_domains
ADD CONSTRAINT unique_business_domain_company_name UNIQUE (company_id, name);
