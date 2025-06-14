-- Migration: Fix company_domain_progress_with_domain view
-- Description: Updates the view to use the correct column name (color instead of color_hex)

-- Drop the existing view
DROP VIEW IF EXISTS company_domain_progress_with_domain;

-- Recreate the view with the correct column names
CREATE OR REPLACE VIEW company_domain_progress_with_domain AS
SELECT 
  cdp.*,
  jd.id as "domain.id",
  jd.name as "domain.name",
  jd.color as "domain.color"
FROM 
  company_domain_progress cdp
JOIN 
  journey_domains_new jd ON cdp.domain_id = jd.id;

COMMENT ON VIEW company_domain_progress_with_domain IS 'View that joins company_domain_progress with journey_domains_new to provide the domain alias used in code';
