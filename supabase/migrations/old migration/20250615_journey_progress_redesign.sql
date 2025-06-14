-- Migration for Journey Progress Tracking Redesign
-- Removes completion percentages and introduces maturity/engagement-based tracking

-- Step 1: Create the new_company_domain_progress table
CREATE TABLE IF NOT EXISTS new_company_domain_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_journey_id UUID REFERENCES company_new_journeys(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES journey_new_domains(id) ON DELETE CASCADE,
  
  -- Core tracking
  maturity_level TEXT CHECK (maturity_level IN ('exploring', 'learning', 'practicing', 'refining', 'teaching')) DEFAULT 'exploring',
  current_state TEXT CHECK (current_state IN ('active_focus', 'maintaining', 'future_focus', 'dormant')) DEFAULT 'future_focus',
  
  -- Engagement metrics
  total_steps_engaged INTEGER DEFAULT 0,
  engagement_streak INTEGER DEFAULT 0,
  time_invested_days INTEGER DEFAULT 0,
  first_engaged_date TIMESTAMP,
  last_activity_date TIMESTAMP,
  
  -- Team context
  primary_owner_id UUID REFERENCES auth.users(id),
  team_involvement_level TEXT CHECK (team_involvement_level IN ('solo', 'collaborative', 'delegated')) DEFAULT 'solo',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(company_journey_id, domain_id)
);

-- Step 2: Add index for faster lookups
CREATE INDEX idx_company_domain_progress_company_journey_id ON new_company_domain_progress(company_journey_id);
CREATE INDEX idx_company_domain_progress_domain_id ON new_company_domain_progress(domain_id);
CREATE INDEX idx_company_domain_progress_primary_owner ON new_company_domain_progress(primary_owner_id);

-- Step 3: Create update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION update_company_domain_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_domain_progress_updated_at
BEFORE UPDATE ON new_company_domain_progress
FOR EACH ROW
EXECUTE FUNCTION update_company_domain_progress_updated_at();

-- Step 4: Migrate existing progress data (if any)
-- This converts the percentage-based tracking to the new maturity/state model
INSERT INTO new_company_domain_progress (
  company_journey_id,
  domain_id,
  maturity_level,
  current_state,
  total_steps_engaged,
  first_engaged_date,
  last_activity_date,
  created_at
)
SELECT 
  cj.id as company_journey_id,
  d.id as domain_id,
  
  -- Use aggregate functions for maturity and state determination
  (CASE 
    WHEN COUNT(CASE WHEN ncs.status = 'complete' THEN 1 ELSE NULL END) > 0 THEN 'practicing'
    WHEN COUNT(CASE WHEN ncs.status = 'active' THEN 1 ELSE NULL END) > 0 THEN 'learning'
    ELSE 'exploring'
  END) as maturity_level,
  
  -- Use aggregate functions for state determination
  (CASE
    WHEN COUNT(CASE WHEN ncs.status = 'active' THEN 1 ELSE NULL END) > 0 THEN 'active_focus'
    WHEN COUNT(CASE WHEN ncs.status = 'complete' THEN 1 ELSE NULL END) > 0 THEN 'maintaining'
    ELSE 'future_focus'
  END) as current_state,
  
  -- Count steps engaged in this domain
  COUNT(ncs.id) as total_steps_engaged,
  
  -- First and last activity dates
  MIN(CASE WHEN ncs.status != 'not_started' THEN ncs.created_at ELSE NULL END) as first_engaged_date,
  MAX(CASE 
    WHEN ncs.status = 'complete' THEN ncs.completed_at
    WHEN ncs.status = 'active' THEN ncs.started_at
    ELSE NULL
  END) as last_activity_date,
  
  NOW() as created_at
FROM 
  company_new_journeys cj
  CROSS JOIN journey_new_domains d
  LEFT JOIN company_new_journey_steps ncs 
    ON ncs.journey_id = cj.id 
    AND ncs.domain_id = d.id
WHERE
  d.id IS NOT NULL
GROUP BY
  cj.id, d.id
ON CONFLICT (company_journey_id, domain_id) DO NOTHING;

-- Step 5: Calculate time_invested_days based on step durations
UPDATE new_company_domain_progress cdp
SET time_invested_days = subquery.total_days
FROM (
  SELECT 
    ncs.journey_id,
    ncs.domain_id,
    COALESCE(SUM(
      CASE 
        WHEN ncs.status = 'complete' AND ncs.started_at IS NOT NULL AND ncs.completed_at IS NOT NULL 
        THEN EXTRACT(DAY FROM (ncs.completed_at - ncs.started_at))
        ELSE 0
      END
    ), 0) as total_days
  FROM 
    company_new_journey_steps ncs
  WHERE 
    ncs.status = 'complete'
  GROUP BY 
    ncs.journey_id, ncs.domain_id
) as subquery
WHERE 
  cdp.company_journey_id = subquery.journey_id 
  AND cdp.domain_id = subquery.domain_id;

-- Step 6: Add function to update domain progress when steps are updated
CREATE OR REPLACE FUNCTION update_domain_progress_on_step_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When a step status changes, update the domain progress metrics
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status)) THEN
    -- Update total_steps_engaged and last_activity_date
    UPDATE new_company_domain_progress
    SET 
      total_steps_engaged = (
        SELECT COUNT(*) 
        FROM company_new_journey_steps 
        WHERE journey_id = NEW.journey_id 
        AND domain_id = NEW.domain_id
        AND status IN ('active', 'complete')
      ),
      last_activity_date = NOW()
    WHERE 
      company_journey_id = NEW.journey_id 
      AND domain_id = NEW.domain_id;
      
    -- If this is the first interaction with this domain, set first_engaged_date
    UPDATE new_company_domain_progress
    SET first_engaged_date = COALESCE(first_engaged_date, NOW())
    WHERE 
      company_journey_id = NEW.journey_id 
      AND domain_id = NEW.domain_id
      AND first_engaged_date IS NULL
      AND NEW.status IN ('active', 'complete');
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_domain_progress_on_step_change
AFTER INSERT OR UPDATE OF status ON company_new_journey_steps
FOR EACH ROW
EXECUTE FUNCTION update_domain_progress_on_step_change();

-- Add index on status for faster query performance
CREATE INDEX IF NOT EXISTS idx_company_new_journey_steps_status 
ON company_new_journey_steps(status);

-- Step 7: Function to suggest state changes based on activity
CREATE OR REPLACE FUNCTION suggest_domain_state_changes()
RETURNS TABLE (
  company_journey_id UUID,
  domain_id UUID,
  suggested_state TEXT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Suggest dormant for domains with no activity in 30+ days
  SELECT 
    cdp.company_journey_id,
    cdp.domain_id,
    'dormant'::TEXT as suggested_state,
    'No activity for over 30 days'::TEXT as reason
  FROM 
    new_company_domain_progress cdp
  WHERE 
    cdp.current_state != 'dormant'
    AND cdp.last_activity_date IS NOT NULL
    AND NOW() - cdp.last_activity_date > INTERVAL '30 days'
  
  UNION ALL
  
  -- Suggest active_focus for domains with multiple recent completions
  SELECT
    cdp.company_journey_id,
    cdp.domain_id,
    'active_focus'::TEXT as suggested_state,
    'Multiple steps completed recently'::TEXT as reason
  FROM
    new_company_domain_progress cdp
  WHERE
    cdp.current_state != 'active_focus'
    AND (
      SELECT COUNT(*)
      FROM company_new_journey_steps ncs
      WHERE 
        ncs.journey_id = cdp.company_journey_id
        AND ncs.domain_id = cdp.domain_id
        AND ncs.status = 'complete'
        AND ncs.completed_at > NOW() - INTERVAL '14 days'
    ) >= 2;
  
  -- More suggestion rules can be added here
END;
$$ LANGUAGE plpgsql;

-- Convenience view for domain progress with domain names
CREATE OR REPLACE VIEW view_company_domain_progress AS
SELECT
  cdp.*,
  d.name as domain_name,
  d.icon as domain_icon,
  d.color as domain_color,
  u.email as primary_owner_email,
  EXTRACT(DAY FROM (NOW() - cdp.last_activity_date)) as days_since_last_activity
FROM
  new_company_domain_progress cdp
  JOIN journey_new_domains d ON cdp.domain_id = d.id
  LEFT JOIN auth.users u ON cdp.primary_owner_id = u.id;

-- Add RLS policies
ALTER TABLE new_company_domain_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view their company's domain progress"
  ON new_company_domain_progress
  FOR SELECT
  USING (
    company_journey_id IN (
      SELECT id FROM company_new_journeys
      WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid()
      )
    )
  );
  
CREATE POLICY "Company members can update their company's domain progress"
  ON new_company_domain_progress
  FOR UPDATE
  USING (
    company_journey_id IN (
      SELECT id FROM company_new_journeys
      WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid()
      )
    )
  );
