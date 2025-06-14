-- Sprint 3: Create workflow_automations table for workflow automation (BOH-307)
-- Created: 2025-05-10

CREATE TABLE IF NOT EXISTS workflow_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES business_domains(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL, -- e.g., 'status_change', 'new_comment', 'time_elapsed'
  trigger_config JSONB,       -- e.g., { "from": "in_progress", "to": "completed" }
  action_type TEXT NOT NULL,  -- e.g., 'assign', 'notify', 'update_status'
  action_config JSONB,        -- e.g., { "assign_to": "user-1" }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_automations_company_id ON workflow_automations(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_automations_domain_id ON workflow_automations(domain_id);

COMMENT ON TABLE workflow_automations IS 'Stores workflow automation rules for triggers and actions in the Business Operations Hub.';
