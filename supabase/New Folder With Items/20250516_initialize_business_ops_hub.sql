-- Migration: Initialize Business Operations Hub for New Companies
-- Date: 2025-05-16

-- Add created_by_user_id to companies table if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='companies' AND column_name='created_by_user_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN created_by_user_id UUID;
  END IF;
END $$;

-- Create or replace function to initialize Business Ops Hub for a company
CREATE OR REPLACE FUNCTION initialize_business_ops_hub(
  p_company_id UUID,
  p_user_id UUID,
  p_industries TEXT[]
) RETURNS void AS $$
DECLARE
  v_domain_id UUID;
  v_relevance FLOAT;
BEGIN
  -- For each industry, associate relevant business domains (simple match, can be improved)
  FOR i IN 1..array_length(p_industries, 1) LOOP
    FOR v_domain_id, v_relevance IN
      SELECT id, 1.0 -- Placeholder for actual relevance calculation
      FROM business_domains
      WHERE name ILIKE '%' || p_industries[i] || '%'
    LOOP
      -- Insert mapping if not already present
      INSERT INTO domain_journey_mapping (
        domain_id,
        journey_id,
        relevance_score,
        primary_domain,
        created_at,
        updated_at
      )
      VALUES (
        v_domain_id,
        NULL, -- Set journey_id as needed
        v_relevance,
        (v_relevance > 0.7),
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Initialize workspace configurations for all business domains
  INSERT INTO workspace_configurations (
    company_id,
    user_id,
    domain_id,
    name,
    configuration,
    is_shared,
    created_at,
    updated_at
  )
  SELECT
    p_company_id,
    p_user_id,
    id,
    name || ' Workspace',
    jsonb_build_object(
      'layout', 'default',
      'widgets', jsonb_build_array(
        jsonb_build_object('type', 'summary', 'position', 1),
        jsonb_build_object('type', 'tasks', 'position', 2),
        jsonb_build_object('type', 'recommendations', 'position', 3)
      )
    ),
    TRUE,
    NOW(),
    NOW()
  FROM business_domains
  WHERE id NOT IN (
    SELECT domain_id FROM workspace_configurations WHERE company_id = p_company_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION initialize_business_ops_hub(UUID, UUID, TEXT[]) TO service_role;

-- Add index for created_by_user_id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename='companies' AND indexname='idx_companies_created_by_user_id'
  ) THEN
    CREATE INDEX idx_companies_created_by_user_id ON companies(created_by_user_id);
  END IF;
END $$;
