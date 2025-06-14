-- Fix for Business Operations Hub domain_statistics view
-- Created: May 7, 2025

-- Drop the view if it exists
DROP VIEW IF EXISTS domain_statistics;

-- Recreate with correct table joins and column references
CREATE OR REPLACE VIEW domain_statistics AS
SELECT 
  bd.id AS domain_id,
  bd.name AS domain_name,
  COUNT(DISTINCT djm.journey_id) AS total_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'completed' THEN djm.journey_id END) AS completed_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'in_progress' THEN djm.journey_id END) AS in_progress_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'not_started' THEN djm.journey_id END) AS upcoming_steps,
  CASE 
    WHEN COUNT(DISTINCT djm.journey_id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN cjs.status = 'completed' THEN djm.journey_id END)::float / 
         COUNT(DISTINCT djm.journey_id)::float) * 100)
    ELSE 0
  END AS completion_percentage
FROM 
  business_domains bd
LEFT JOIN 
  domain_journey_mapping djm ON bd.id = djm.domain_id
LEFT JOIN 
  journey_steps js ON djm.journey_id = js.id
LEFT JOIN
  company_journey_steps cjs ON js.id = cjs.global_step_id
GROUP BY 
  bd.id, bd.name;
