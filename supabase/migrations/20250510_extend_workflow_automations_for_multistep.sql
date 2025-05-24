-- Sprint 4: Extend workflow_automations for multi-step and conditional automations (BOH-401.1)
-- Created: 2025-05-10

ALTER TABLE workflow_automations
  ADD COLUMN IF NOT EXISTS actions JSONB, -- Array of actions: [{type: 'assign', config: {...}}, ...]
  ADD COLUMN IF NOT EXISTS conditions JSONB; -- Conditional logic: { branches: [{if: {...}, then: [...]}, ...], else: [...] }

-- Optionally, keep action_type and action_config for backward compatibility.
-- Future: Migrate existing action_type/action_config into actions array for legacy records.

COMMENT ON COLUMN workflow_automations.actions IS 'Array of actions for multi-step workflow automations.';
COMMENT ON COLUMN workflow_automations.conditions IS 'Conditional logic for workflow automations (if/then/else branching).';
