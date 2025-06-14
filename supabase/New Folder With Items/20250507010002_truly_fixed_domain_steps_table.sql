-- Create domain steps special table with completion_percentage fix
-- Created: May 10, 2025

-- First, add the completion_percentage column to company_journey_steps table
-- This is needed because the views we're creating reference this column
ALTER TABLE company_journey_steps
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Comment on column
COMMENT ON COLUMN company_journey_steps.completion_percentage IS 'Percentage of completion for this step (0-100)';

-- Create trigger for completion_percentage
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

-- Now create the domain steps table
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
-- TRULY FIXED: Removed the reference to cjs.company_id which doesn't exist
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
    -- TRULY FIXED JOIN - use just the global_step_id for matching, company_id comes from domain_steps
    company_journey_steps cjs ON js.id = cjs.global_step_id
