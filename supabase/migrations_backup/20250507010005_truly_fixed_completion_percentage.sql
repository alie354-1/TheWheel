-- Add completion_percentage column to company_journey_steps table
-- Created: May 10, 2025 - TRULY FIXED VERSION with CASCADE for view dependencies

-- First, add the completion_percentage column to company_journey_steps table
ALTER TABLE company_journey_steps
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Comment on column
COMMENT ON COLUMN company_journey_steps.completion_percentage IS 'Percentage of completion for this step (0-100)';

-- Drop views with CASCADE to ensure dependent views are also dropped
DROP VIEW IF EXISTS domain_step_statistics CASCADE;
DROP VIEW IF EXISTS domain_steps_status CASCADE;

-- Recreate domain_steps_status view with proper join conditions and column references
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
    COALESCE(cjs.completion_percentage, 0) AS completion_percentage,
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
    company_journey_steps cjs ON (js.id = cjs.global_step_id AND ds.company_id = cjs.company_id)
WHERE
    ds.company_id IS NOT NULL;

-- Recreate domain_step_statistics view with proper NULL handling
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

-- Add function to update completion percentage automatically
CREATE OR REPLACE FUNCTION update_step_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update completion percentage based on status
    IF NEW.status = 'completed' THEN
        NEW.completion_percentage := 100;
    ELSIF NEW.status = 'in_progress' AND (NEW.completion_percentage IS NULL OR NEW.completion_percentage = 0) THEN
        NEW.completion_percentage := 50;
    ELSIF NEW.status = 'not_started' OR NEW.status IS NULL THEN
        NEW.completion_percentage := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS set_company_journey_steps_completion_percentage ON company_journey_steps;
CREATE TRIGGER set_company_journey_steps_completion_percentage
BEFORE INSERT OR UPDATE ON company_journey_steps
FOR EACH ROW
EXECUTE FUNCTION update_step_completion_percentage();
