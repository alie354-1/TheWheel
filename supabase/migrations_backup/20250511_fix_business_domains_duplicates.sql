-- Migration: Remove duplicates and add unique constraint to business_domains.name

-- 1. Remove duplicates, keeping only the earliest created row for each name
DELETE FROM business_domains bd
USING business_domains bd2
WHERE bd.name = bd2.name
  AND bd.created_at > bd2.created_at;

-- 2. Add a unique constraint on the name column
ALTER TABLE business_domains
ADD CONSTRAINT unique_business_domain_name UNIQUE (name);
