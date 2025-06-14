-- Sample data for the new maturity-based journey progress system
-- This demonstrates the shift from percentage-based completion to a continuous maturity approach

-- First, ensure we have a sample company and journey
INSERT INTO companies (id, name, created_at)
VALUES 
  ('fc7fb948-790a-4167-84c1-e90a3bea8c5e', 'TechNova Startup', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO company_new_journeys (id, company_id, name, status, customization_level, created_at)
VALUES 
  ('e42c9a2b-7a1c-4b3d-8f16-4a9d6e3b5c2d', 'fc7fb948-790a-4167-84c1-e90a3bea8c5e', 'TechNova Founder Journey', 'active', 'standard', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create a new table for domain progress tracking (if not already created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'new_company_domain_progress'
  ) THEN
    CREATE TABLE new_company_domain_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_journey_id UUID NOT NULL REFERENCES company_new_journeys(id),
      domain_id UUID NOT NULL REFERENCES journey_new_domains(id),
      maturity_level VARCHAR(20) NOT NULL CHECK (maturity_level IN ('exploring', 'learning', 'practicing', 'refining', 'teaching')),
      current_state VARCHAR(20) NOT NULL CHECK (current_state IN ('active_focus', 'maintaining', 'future_focus', 'dormant')),
      total_steps_engaged INTEGER DEFAULT 0,
      engagement_streak INTEGER DEFAULT 0,
      time_invested_days INTEGER DEFAULT 0,
      first_engaged_date TIMESTAMP,
      last_activity_date TIMESTAMP,
      team_involvement_level VARCHAR(20) DEFAULT 'solo' CHECK (team_involvement_level IN ('solo', 'collaborative', 'delegated')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(company_journey_id, domain_id)
    );
  END IF;
END $$;

-- Insert sample domain progress data using the domain ids from the framework
-- We'll use a DO block to get the actual domain IDs from the database
DO $$
DECLARE
    strategy_id UUID;
    product_id UUID;
    marketing_id UUID;
    sales_id UUID;
    finance_id UUID;
    legal_id UUID;
    operations_id UUID;
    team_id UUID;
    
    journey_id UUID := 'e42c9a2b-7a1c-4b3d-8f16-4a9d6e3b5c2d';
BEGIN
    -- Get domain IDs from the framework
    SELECT id INTO strategy_id FROM journey_new_domains WHERE name = 'Strategy';
    SELECT id INTO product_id FROM journey_new_domains WHERE name = 'Product';
    SELECT id INTO marketing_id FROM journey_new_domains WHERE name = 'Marketing';
    SELECT id INTO sales_id FROM journey_new_domains WHERE name = 'Sales';
    SELECT id INTO finance_id FROM journey_new_domains WHERE name = 'Finance';
    SELECT id INTO legal_id FROM journey_new_domains WHERE name = 'Legal';
    SELECT id INTO operations_id FROM journey_new_domains WHERE name = 'Operations';
    SELECT id INTO team_id FROM journey_new_domains WHERE name = 'Team';
    
    -- Clear any existing progress data (avoiding the ambiguous column reference)
    EXECUTE 'DELETE FROM new_company_domain_progress WHERE company_journey_id = $1' USING journey_id;
    
    -- Strategy: High maturity, actively maintained
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      strategy_id,
      'refining',
      'maintaining',
      12,
      3,
      45,
      NOW() - INTERVAL '60 days',
      NOW() - INTERVAL '5 days',
      'collaborative'
    );
    
    -- Product: Actively working on it
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      product_id,
      'practicing',
      'active_focus',
      8,
      5,
      30,
      NOW() - INTERVAL '45 days',
      NOW(),
      'collaborative'
    );
    
    -- Marketing: Just getting started
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      marketing_id,
      'learning',
      'active_focus',
      5,
      2,
      12,
      NOW() - INTERVAL '20 days',
      NOW() - INTERVAL '1 day',
      'solo'
    );
    
    -- Sales: Early stages
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      sales_id,
      'learning',
      'future_focus',
      2,
      0,
      5,
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '14 days',
      'solo'
    );
    
    -- Finance: Just exploring
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      finance_id,
      'exploring',
      'future_focus',
      1,
      0,
      2,
      NOW() - INTERVAL '25 days',
      NOW() - INTERVAL '21 days',
      'solo'
    );
    
    -- Legal: Completed most work but dormant
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      legal_id,
      'refining',
      'dormant',
      7,
      0,
      25,
      NOW() - INTERVAL '90 days',
      NOW() - INTERVAL '45 days',
      'delegated'
    );
    
    -- Operations: Not started yet
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      operations_id,
      'exploring',
      'future_focus',
      0,
      0,
      0,
      NULL,
      NULL,
      'solo'
    );
    
    -- Team: Good progress
    INSERT INTO new_company_domain_progress (
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
    ) VALUES (
      journey_id,
      team_id,
      'practicing',
      'maintaining',
      9,
      1,
      28,
      NOW() - INTERVAL '40 days',
      NOW() - INTERVAL '12 days',
      'collaborative'
    );
END $$;

-- Now let's add some sample steps linked to the framework
DO $$
DECLARE
    ideation_id UUID;
    validation_id UUID;
    foundation_id UUID;
    build_id UUID;
    growth_id UUID;
    
    strategy_id UUID;
    product_id UUID;
    marketing_id UUID;
    sales_id UUID;
    finance_id UUID;
    legal_id UUID;
    operations_id UUID;
    team_id UUID;
    
    journey_id UUID := 'e42c9a2b-7a1c-4b3d-8f16-4a9d6e3b5c2d';
    
    -- Sample step IDs (these would normally come from journey_new_steps)
    vision_mission_step_id UUID;
    market_research_step_id UUID;
    legal_entity_step_id UUID;
    build_mvp_step_id UUID;
    content_strategy_step_id UUID;
    financial_tracking_step_id UUID;
BEGIN
    -- Get phase IDs
    SELECT id INTO ideation_id FROM journey_new_phases WHERE name = 'Ideation';
    SELECT id INTO validation_id FROM journey_new_phases WHERE name = 'Validation';
    SELECT id INTO foundation_id FROM journey_new_phases WHERE name = 'Foundation';
    SELECT id INTO build_id FROM journey_new_phases WHERE name = 'Build';
    SELECT id INTO growth_id FROM journey_new_phases WHERE name = 'Growth';
    
    -- Get domain IDs
    SELECT id INTO strategy_id FROM journey_new_domains WHERE name = 'Strategy';
    SELECT id INTO product_id FROM journey_new_domains WHERE name = 'Product';
    SELECT id INTO marketing_id FROM journey_new_domains WHERE name = 'Marketing';
    SELECT id INTO sales_id FROM journey_new_domains WHERE name = 'Sales';
    SELECT id INTO finance_id FROM journey_new_domains WHERE name = 'Finance';
    SELECT id INTO legal_id FROM journey_new_domains WHERE name = 'Legal';
    SELECT id INTO operations_id FROM journey_new_domains WHERE name = 'Operations';
    SELECT id INTO team_id FROM journey_new_domains WHERE name = 'Team';
    
    -- Get framework step IDs
    SELECT id INTO vision_mission_step_id FROM journey_new_steps WHERE name = 'Define Vision & Mission' LIMIT 1;
    SELECT id INTO market_research_step_id FROM journey_new_steps WHERE name = 'Conduct Market Research' LIMIT 1;
    SELECT id INTO legal_entity_step_id FROM journey_new_steps WHERE name = 'Legal Entity Setup' LIMIT 1;
    SELECT id INTO build_mvp_step_id FROM journey_new_steps WHERE name = 'Build MVP' LIMIT 1;
    SELECT id INTO content_strategy_step_id FROM journey_new_steps WHERE name = 'Develop Content Strategy' LIMIT 1;
    SELECT id INTO financial_tracking_step_id FROM journey_new_steps WHERE name = 'Set Up Financial Tracking' LIMIT 1;
    
    -- Clear existing steps (using USING to avoid ambiguity)
    EXECUTE 'DELETE FROM company_new_journey_steps WHERE journey_id = $1' USING journey_id;
    
    -- Strategy domain steps - showing high maturity with completed steps
    INSERT INTO company_new_journey_steps (
      id,
      journey_id,
      framework_step_id,
      name,
      description,
      phase_id,
      domain_id,
      status,
      started_at,
      completed_at,
      is_custom_step,
      order_index
    ) VALUES (
      gen_random_uuid(),
      journey_id,
      vision_mission_step_id,
      'Define Vision & Mission',
      'Create a clear and compelling vision and mission statement that will guide your company strategy and align team members.',
      ideation_id,
      strategy_id,
      'complete',
      NOW() - INTERVAL '60 days',
      NOW() - INTERVAL '58 days',
      false,
      1
    );
    
    -- Add more completed strategy steps
    INSERT INTO company_new_journey_steps (
      id,
      journey_id,
      framework_step_id,
      name,
      description,
      phase_id,
      domain_id,
      status,
      started_at,
      completed_at,
      is_custom_step,
      order_index
    ) VALUES (
      gen_random_uuid(),
      journey_id,
      NULL, -- Custom step
      'Strategy Workshop',
      'Conduct a strategy workshop with all key stakeholders to align on direction.',
      ideation_id,
      strategy_id,
      'complete',
      NOW() - INTERVAL '55 days',
      NOW() - INTERVAL '54 days',
      true,
      2
    );
    
    -- Product steps - showing practicing level with active steps
    INSERT INTO company_new_journey_steps (
      id,
      journey_id,
      framework_step_id,
      name,
      description,
      phase_id,
      domain_id,
      status,
      started_at,
      completed_at,
      is_custom_step,
      order_index
    ) VALUES (
      gen_random_uuid(),
      journey_id,
      market_research_step_id,
      'Conduct Market Research',
      'Research your target market to validate product-market fit and identify opportunities and threats.',
      validation_id,
      product_id,
      'complete',
      NOW() - INTERVAL '45 days',
      NOW() - INTERVAL '40 days',
      false,
      1
    );
    
    INSERT INTO company_new_journey_steps (
      id,
      journey_id,
      framework_step_id,
      name,
      description,
      phase_id,
      domain_id,
      status,
      started_at,
      completed_at,
      is_custom_step,
      order_index
    ) VALUES (
      gen_random_uuid(),
      journey_id,
      build_mvp_step_id,
      'Build MVP',
      'Develop your minimum viable product to begin testing with users.',
      build_id,
      product_id,
      'active',
      NOW() - INTERVAL '10 days',
      NULL,
      false,
      2
    );
    
    -- Legal steps - showing refining but dormant
    INSERT INTO company_new_journey_steps (
      id,
      journey_id,
      framework_step_id,
      name,
      description,
      phase_id,
      domain_id,
      status,
      started_at,
      completed_at,
      is_custom_step,
      order_index
    ) VALUES (
      gen_random_uuid(),
      journey_id,
      legal_entity_step_id,
      'Legal Entity Setup',
      'Establish your legal business entity and complete necessary registrations.',
      foundation_id,
      legal_id,
      'complete',
      NOW() - INTERVAL '90 days',
      NOW() - INTERVAL '85 days',
      false,
      1
    );
    
    -- Marketing steps - showing learning with active work
    INSERT INTO company_new_journey_steps (
      id,
      journey_id,
      framework_step_id,
      name,
      description,
      phase_id,
      domain_id,
      status,
      started_at,
      completed_at,
      is_custom_step,
      order_index
    ) VALUES (
      gen_random_uuid(),
      journey_id,
      content_strategy_step_id,
      'Develop Content Strategy',
      'Create a content plan to establish your brand voice and reach customers.',
      growth_id,
      marketing_id,
      'active',
      NOW() - INTERVAL '5 days',
      NULL,
      false,
      1
    );
    
    -- Finance steps - just exploring
    INSERT INTO company_new_journey_steps (
      id,
      journey_id,
      framework_step_id,
      name,
      description,
      phase_id,
      domain_id,
      status,
      started_at,
      completed_at,
      is_custom_step,
      order_index
    ) VALUES (
      gen_random_uuid(),
      journey_id,
      financial_tracking_step_id,
      'Set Up Financial Tracking',
      'Implement financial tracking systems for accounting and reporting.',
      foundation_id,
      finance_id,
      'not_started',
      NULL,
      NULL,
      false,
      1
    );
    
END $$;
