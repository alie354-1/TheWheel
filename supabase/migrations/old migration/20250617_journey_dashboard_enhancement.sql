-- Migration to enhance journey dashboard with peer insights, recommendations, and activity tracking
-- Date: 2025-06-17

-- Table for tracking step activity (when a user last worked on a step)
CREATE TABLE IF NOT EXISTS step_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  last_activity_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(company_id, step_id)
);

-- Table for peer insights/founder comments
CREATE TABLE IF NOT EXISTS peer_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  author_company TEXT NOT NULL,
  content TEXT NOT NULL,
  domain_id UUID REFERENCES journey_domains(id) ON DELETE SET NULL,
  step_id UUID REFERENCES journey_steps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_featured BOOLEAN NOT NULL DEFAULT false
);

-- Table for step recommendations with "why" explanations
CREATE TABLE IF NOT EXISTS step_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  peer_adoption_percentage INTEGER,
  recommendation_order INTEGER,
  CHECK (peer_adoption_percentage >= 0 AND peer_adoption_percentage <= 100)
);

-- Function to calculate the recommended steps for a company based on their progress
CREATE OR REPLACE FUNCTION get_recommended_steps(p_company_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  step_id UUID,
  name TEXT,
  description TEXT,
  domain TEXT,
  domain_id UUID,
  priority TEXT,
  reason TEXT,
  peer_adoption_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- This is a simplified version - in a real implementation, this would use more 
  -- sophisticated logic based on the company's journey progress and step dependencies
  SELECT 
    sr.id,
    js.id AS step_id,
    js.name,
    js.description,
    jd.name AS domain,
    jd.id AS domain_id,
    sr.priority,
    sr.reason,
    sr.peer_adoption_percentage
  FROM step_recommendations sr
  JOIN journey_steps js ON sr.step_id = js.id
  JOIN journey_domains jd ON js.domain_id = jd.id
  WHERE js.id NOT IN (
    -- Exclude steps the company has already completed or started
    SELECT step_id FROM company_journey_steps 
    WHERE company_id = p_company_id
  )
  ORDER BY sr.recommendation_order, sr.priority DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing
-- Step activity data
INSERT INTO step_activity (company_id, step_id, last_activity_timestamp, time_spent_minutes, progress_percentage)
SELECT 
  c.id,
  js.id,
  NOW() - (RANDOM() * INTERVAL '10 days'),
  (RANDOM() * 300)::INTEGER,
  (RANDOM() * 100)::INTEGER
FROM 
  companies c
CROSS JOIN journey_steps js
WHERE 
  c.id = (SELECT id FROM companies LIMIT 1)
  AND js.id IN (SELECT id FROM journey_steps LIMIT 5)
ON CONFLICT (company_id, step_id) DO UPDATE
SET 
  last_activity_timestamp = EXCLUDED.last_activity_timestamp,
  time_spent_minutes = EXCLUDED.time_spent_minutes,
  progress_percentage = EXCLUDED.progress_percentage;

-- Peer insights data
INSERT INTO peer_insights (author_name, author_company, content, domain_id, is_featured)
VALUES
  ('Jane Doe', 'TechStart', 'We found customer interviews critical to pivot our product focus early.', 
   (SELECT id FROM journey_domains WHERE name = 'Product Development' LIMIT 1), true),
  ('Mark Smith', 'DataFlow', 'Setting up analytics from day one helped us identify which features were most valuable.', 
   (SELECT id FROM journey_domains WHERE name = 'Analytics' LIMIT 1), true),
  ('Sarah Chen', 'Quantum', 'Competitive analysis revealed an underserved niche we could target.', 
   (SELECT id FROM journey_domains WHERE name = 'Research' LIMIT 1), true),
  ('Alex Wong', 'FinPlus', 'Building a financial model early helped us understand our runway and make better hiring decisions.', 
   (SELECT id FROM journey_domains WHERE name = 'Finance' LIMIT 1), false),
  ('Jessica Kim', 'Cloudrise', 'Our user persona development completely changed how we built our onboarding flow.', 
   (SELECT id FROM journey_domains WHERE name = 'Product Development' LIMIT 1), true);

-- Step recommendations data
INSERT INTO step_recommendations (step_id, reason, priority, peer_adoption_percentage, recommendation_order)
VALUES
  ((SELECT id FROM journey_steps WHERE name LIKE '%User Persona%' LIMIT 1), 
   'Based on your progress in customer discovery', 'High', 86, 1),
  ((SELECT id FROM journey_steps WHERE name LIKE '%Analytics%' LIMIT 1), 
   'Required for data-driven decision making', 'Medium', 64, 2),
  ((SELECT id FROM journey_steps WHERE name LIKE '%Competitive%' LIMIT 1), 
   'Will help refine your value proposition', 'Medium', 58, 3),
  ((SELECT id FROM journey_steps WHERE name LIKE '%Pricing%' LIMIT 1), 
   'Critical for your business model', 'High', 53, 4);
