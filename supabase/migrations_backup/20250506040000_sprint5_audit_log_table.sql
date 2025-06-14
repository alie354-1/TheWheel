-- Migration for Sprint 5: Enterprise Customization - Audit Log Table

-- Table to store audit trail of significant actions within the system
CREATE TABLE IF NOT EXISTS public.audit_logs ( -- Added IF NOT EXISTS
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp timestamptz NOT NULL DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User performing the action
    company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL, -- Company context, if applicable
    action text NOT NULL, -- Description of the action performed (e.g., 'user_login', 'updated_company_settings', 'deleted_journey_step')
    target_type text, -- Type of the entity being acted upon (e.g., 'user', 'company', 'journey_step')
    target_id text, -- ID of the entity being acted upon
    details jsonb, -- Additional context about the action (e.g., old/new values, IP address)
    status text -- Optional status like 'success', 'failure'
);

-- Ensure all columns exist even if table was partially created before (Idempotent)
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS timestamp timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action text NOT NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target_type text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target_id text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS details jsonb;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS status text;

-- Add indexes for common query patterns (Idempotent Check - Simplified)
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_audit_logs_timestamp' AND n.nspname = 'public') THEN
    CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_audit_logs_user_id' AND n.nspname = 'public') THEN
    CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_audit_logs_company_id' AND n.nspname = 'public') THEN
    CREATE INDEX idx_audit_logs_company_id ON public.audit_logs(company_id);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_audit_logs_action' AND n.nspname = 'public') THEN
    CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_audit_logs_target' AND n.nspname = 'public') THEN
    CREATE INDEX idx_audit_logs_target ON public.audit_logs(target_type, target_id);
END IF; END $$;

COMMENT ON TABLE public.audit_logs IS 'Records significant actions performed within the system for auditing and compliance.';
COMMENT ON COLUMN public.audit_logs.user_id IS 'The user who performed the action. Null if system action.';
COMMENT ON COLUMN public.audit_logs.action IS 'A code or description identifying the action.';
COMMENT ON COLUMN public.audit_logs.target_type IS 'The type of entity affected by the action.';
COMMENT ON COLUMN public.audit_logs.target_id IS 'The specific ID of the entity affected.';
COMMENT ON COLUMN public.audit_logs.details IS 'JSON object containing relevant details about the action, like changes made or IP address.';

-- Enable RLS (Restrict access primarily to admins)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins full access (Drop and Create for idempotency)
DROP POLICY IF EXISTS "Allow admin full access to audit logs" ON public.audit_logs;
CREATE POLICY "Allow admin full access to audit logs"
ON public.audit_logs
FOR ALL
USING (public.is_claims_admin()); -- Assuming is_claims_admin() function exists

-- Grant Permissions (Primarily for admin/system roles)
GRANT USAGE ON SCHEMA public TO supabase_admin;
GRANT ALL ON TABLE public.audit_logs TO supabase_admin;

-- Service role will likely need INSERT permissions to record events
-- GRANT INSERT ON TABLE public.audit_logs TO service_role;

-- Authenticated users should generally not have direct access
-- GRANT SELECT ON TABLE public.audit_logs TO authenticated; -- Consider if specific roles need read access
