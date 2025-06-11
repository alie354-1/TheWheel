-- Fix remaining js.status references in Business Operations Hub views
-- Created: May 10, 2025 - TRULY FIXED VERSION

-- First verify the fix for domain_statistics worked properly
DROP VIEW IF EXISTS domain_statistics;

-- Recreate domain_statistics view with correct column references
CREATE OR REPLACE VIEW domain_statistics AS
SELECT 
  bd.id AS domain_id,
  bd.name AS domain_name,
  COUNT(DISTINCT djm.journey_id) AS total_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'completed' THEN djm.journey_id END) AS completed_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'in_progress' THEN djm.journey_id END) AS in_progress_steps,
  COUNT(DISTINCT CASE WHEN cjs.status = 'not_started' OR cjs.status IS NULL THEN djm.journey_id END) AS upcoming_steps,
  CASE 
    WHEN COUNT(DISTINCT djm.journey_id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN cjs.status = 'completed' THEN djm.journey_id END)::float / 
         NULLIF(COUNT(DISTINCT djm.journey_id), 0)::float) * 100)
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

-- Make sure the domain_steps_status view is correct too
DROP VIEW IF EXISTS domain_steps_status;

-- Recreate with proper join conditions - TRULY FIXED
CREATE OR REPLACE VIEW domain_steps_status AS
SELECT 
    ds.id,
    ds.domain_id,
    ds.step_id,
    ds.company_id,
    ds.priority,
    COALESCE(ds.custom_name, js.name) AS name,
    COALESCE(ds.custom_description, js.description) AS description,
    COALESCE(ds.custom_difficulty, js.difficulty_level) AS difficulty,
    COALESCE(ds.custom_time_estimate, js.estimated_time_max) AS time_estimate,
    ds.notes,
    js.key_outcomes,
    js.prerequisite_steps,
    bd.name AS domain_name,
    bd.icon AS domain_icon,
    bd.color AS domain_color,
    cjs.status,
    cjs.completion_percentage,
    js.phase_id,
    jp.name AS phase_name,
    js.order_index AS step_order,
    jp.order_index AS phase_order
FROM 
    domain_steps ds
JOIN 
    journey_steps js ON ds.step_id = js.id
JOIN
    business_domains bd ON ds.domain_id = bd.id
LEFT JOIN
    journey_phases jp ON js.phase_id = jp.id
LEFT JOIN
    -- TRULY FIXED: Use just the global_step_id for matching, company_id comes from domain_steps
    company_journey_steps cjs ON js.id = cjs.global_step_id
WHERE
    ds.company_id IS NOT NULL;

-- Finally ensure the domain_step_statistics view is correct
DROP VIEW IF EXISTS domain_step_statistics;

-- Recreate with proper NULL handling and status references
CREATE OR REPLACE VIEW domain_step_statistics AS
SELECT
    d.id AS domain_id,
    d.name AS domain_name,
    c.id AS company_id,
    c.name AS company_name,
    COUNT(dss.id) AS total_steps,
    COUNT(CASE WHEN dss.status = 'completed' THEN 1 END) AS completed_steps,
    COUNT(CASE WHEN dss.status = 'in_progress' THEN 1 END) AS in_progress_steps,
    COUNT(CASE WHEN dss.status = 'not_started' OR dss.status IS NULL THEN 1 END) AS not_started_steps,
    COUNT(CASE WHEN dss.status = 'skipped' THEN 1 END) AS skipped_steps,
    CASE
        WHEN COUNT(dss.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN dss.status = 'completed' THEN 1 END)::float / 
            NULLIF(COUNT(dss.id) - COUNT(CASE WHEN dss.status = 'skipped' THEN 1 END), 0)::float) * 100)
        ELSE 0
    END AS completion_percentage
FROM
    business_domains d
CROSS JOIN
    companies c
LEFT JOIN
    domain_steps_status dss ON d.id = dss.domain_id AND c.id = dss.company_id
GROUP BY
    d.id, d.name, c.id, c.name
ORDER BY
    c.name, d.name;
