-- Migration: Create company_domain_progress table
-- Description: Creates the company_domain_progress table for tracking domain-level progress
-- with maturity-based approach for the new journey system

-- Create the company_domain_progress table
CREATE TABLE IF NOT EXISTS company_domain_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_journey_id UUID NOT NULL REFERENCES company_journeys_new(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES journey_domains_new(id) ON DELETE CASCADE,
  
  -- Maturity tracking
  maturity_level TEXT NOT NULL CHECK (maturity_level IN ('exploring', 'learning', 'practicing', 'refining', 'teaching')),
  current_state TEXT NOT NULL CHECK (current_state IN ('active_focus', 'maintaining', 'future_focus', 'dormant')),
  
  -- Engagement metrics
  total_steps_engaged INTEGER NOT NULL DEFAULT 0,
  engagement_streak INTEGER NOT NULL DEFAULT 0,
  time_invested_days INTEGER NOT NULL DEFAULT 0,
  
  -- Activity tracking
  first_engaged_date TIMESTAMPTZ,
  last_activity_date TIMESTAMPTZ,
  
  -- Team involvement
  primary_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_involvement_level TEXT NOT NULL DEFAULT 'solo' CHECK (team_involvement_level IN ('solo', 'collaborative', 'delegated')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique progress tracking per journey/domain combination
  UNIQUE(company_journey_id, domain_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_company_domain_progress_journey ON company_domain_progress(company_journey_id);
CREATE INDEX idx_company_domain_progress_domain ON company_domain_progress(domain_id);
CREATE INDEX idx_company_domain_progress_maturity ON company_domain_progress(maturity_level);
CREATE INDEX idx_company_domain_progress_state ON company_domain_progress(current_state);
CREATE INDEX idx_company_domain_progress_last_activity ON company_domain_progress(last_activity_date);

-- Add RLS policies
ALTER TABLE company_domain_progress ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view progress for their company's journey
CREATE POLICY "Users can view their company's domain progress" 
  ON company_domain_progress 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM company_journeys_new cj
      JOIN companies c ON cj.company_id = c.id
      JOIN company_members cm ON c.id = cm.company_id
      WHERE cj.id = company_domain_progress.company_journey_id
      AND cm.user_id = auth.uid()
    )
  );

-- Policy to allow users to update their company's domain progress
CREATE POLICY "Users can update their company's domain progress" 
  ON company_domain_progress 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM company_journeys_new cj
      JOIN companies c ON cj.company_id = c.id
      JOIN company_members cm ON c.id = cm.company_id
      WHERE cj.id = company_domain_progress.company_journey_id
      AND cm.user_id = auth.uid()
    )
  );

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_company_domain_progress_updated_at'
  ) THEN
    CREATE TRIGGER update_company_domain_progress_updated_at
    BEFORE UPDATE ON company_domain_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Add comment to table
COMMENT ON TABLE company_domain_progress IS 'Tracks company progress at the domain level using a maturity-based approach';

-- Add join alias for domain to match code usage
COMMENT ON COLUMN company_domain_progress.domain_id IS 'Foreign key to journey_domains_new table, aliased as "domain" in queries';

-- Create a view to handle the join alias correctly
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

-- Sample data for testing (commented out for production use)
/*
INSERT INTO company_domain_progress (
  company_journey_id,
  domain_id,
  maturity_level,
  current_state,
  total_steps_engaged,
  engagement_streak,
  time_invested_days,
  first_engaged_date,
  last_activity_date,
  team_involvement_level
) VALUES 
(
  '00000000-0000-0000-0000-000000000001', -- Replace with actual journey ID
  '00000000-0000-0000-0000-000000000002', -- Replace with actual domain ID
  'learning',
  'active_focus',
  5,
  3,
  14,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '2 days',
  'collaborative'
);
*/
