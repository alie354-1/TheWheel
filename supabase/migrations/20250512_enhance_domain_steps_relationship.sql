-- Migration: Enhance domain_steps table for flexible domain-step relationships and metadata

-- 1. Add new columns for metadata and flexibility
ALTER TABLE domain_steps
  ADD COLUMN IF NOT EXISTS relevance_score FLOAT DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS domain_specific_description TEXT,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order INTEGER,
  ADD COLUMN IF NOT EXISTS added_by UUID,
  ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_domain_steps_domain_id ON domain_steps(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_steps_step_id ON domain_steps(step_id);
CREATE INDEX IF NOT EXISTS idx_domain_steps_company_id ON domain_steps(company_id);

-- 3. (Optional) Add a unique constraint to prevent duplicate domain-step-company links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_domain_step_company'
  ) THEN
    ALTER TABLE domain_steps
      ADD CONSTRAINT unique_domain_step_company UNIQUE (domain_id, step_id, company_id);
  END IF;
END$$;

-- 4. Add a table for domain step recommendations
CREATE TABLE IF NOT EXISTS domain_step_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES business_domains(id) ON DELETE CASCADE,
  step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE,
  relevance_score FLOAT DEFAULT 0.5,
  recommendation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(domain_id, step_id)
);

-- 5. Add a table for domain step metadata (for extensibility)
CREATE TABLE IF NOT EXISTS domain_step_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_step_id UUID REFERENCES domain_steps(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(domain_step_id, key)
);
