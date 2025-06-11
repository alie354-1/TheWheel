-- Create domain steps special table
-- Created: May 7, 2025

-- This table provides a specialized view of steps that connects business domains to journey steps
-- while maintaining a company-specific context
CREATE TABLE IF NOT EXISTS domain_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES business_domains(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    custom_name TEXT,
    custom_description TEXT,
    custom_difficulty INTEGER CHECK (custom_difficulty BETWEEN 1 AND 5),
    custom_time_estimate INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, step_id, company_id)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_domain_steps_domain_id ON domain_steps(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_steps_step_id ON domain_steps(step_id);
CREATE INDEX IF NOT EXISTS idx_domain_steps_company_id ON domain_steps(company_id);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS set_domain_steps_updated_at ON domain_steps;
CREATE TRIGGER set_domain_steps_updated_at
BEFORE UPDATE ON domain_steps
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE domain_steps ENABLE ROW LEVEL SECURITY;

-- Domain Steps Policies
CREATE POLICY domain_steps_select_policy ON domain_steps
  FOR SELECT USING (
    company_id IS NULL OR
    is_admin(auth.uid()) OR
    (company_id IS NOT NULL AND is_in_same_company(company_id))
  );

CREATE POLICY domain_steps_insert_policy ON domain_steps
  FOR INSERT WITH CHECK (
    is_admin(auth.uid()) OR
    (company_id IS NOT NULL AND is_in_same_company(company_id))
  );
  
CREATE POLICY domain_steps_update_policy ON domain_steps
  FOR UPDATE USING (
    is_admin(auth.uid()) OR
    (company_id IS NOT NULL AND is_in_same_company(company_id))
  );
  
CREATE POLICY domain_steps_delete_policy ON domain_steps
  FOR DELETE USING (
    is_admin(auth.uid()) OR
    (company_id IS NOT NULL AND is_in_same_company(company_id))
  );

-- Create a view that combines domain steps with journey step status from company_journey_steps
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
    company_journey_steps cjs ON js.id = cjs.global_step_id
WHERE
    ds.company_id IS NOT NULL;

-- Create a aggregated statistics view for domain step progress
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

-- Create function to get domain steps with company context
CREATE OR REPLACE FUNCTION get_domain_steps(p_domain_id UUID, p_company_id UUID)
RETURNS TABLE(
    id UUID,
    step_id UUID,
    name TEXT,
    description TEXT,
    difficulty INTEGER,
    time_estimate INTEGER,
    status TEXT,
    completion_percentage INTEGER,
    phase_name TEXT,
    phase_order INTEGER,
    step_order INTEGER,
    has_custom_fields BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dss.id,
        dss.step_id,
        dss.name,
        dss.description,
        dss.difficulty,
        dss.time_estimate,
        COALESCE(dss.status, 'not_started'::TEXT) AS status,
        COALESCE(dss.completion_percentage, 0) AS completion_percentage,
        dss.phase_name,
        dss.phase_order,
        dss.step_order,
        (dss.custom_name IS NOT NULL OR dss.custom_description IS NOT NULL OR 
         dss.custom_difficulty IS NOT NULL OR dss.custom_time_estimate IS NOT NULL) AS has_custom_fields
    FROM
        domain_steps_status dss
    WHERE
        dss.domain_id = p_domain_id AND
        dss.company_id = p_company_id
    ORDER BY
        dss.phase_order, dss.step_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
