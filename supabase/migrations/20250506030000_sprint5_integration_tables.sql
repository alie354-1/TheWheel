-- Migration for Sprint 5: External Training Integration Tables

-- Table to store connection details for external systems (LMS, Content Providers)
CREATE TABLE public.external_systems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    system_name text NOT NULL,
    system_type text NOT NULL, -- e.g., 'lms', 'content_provider', 'sso'
    base_url text,
    api_endpoint text,
    auth_type text, -- e.g., 'oauth2', 'api_key', 'basic'
    configuration jsonb, -- Store system-specific settings like tenant ID, scopes, etc.
    is_enabled boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Apply the updated_at trigger
CREATE TRIGGER set_external_systems_updated_at
BEFORE UPDATE ON public.external_systems
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); -- Assuming set_updated_at exists

COMMENT ON TABLE public.external_systems IS 'Stores configuration details for integrated external systems like LMS or content providers.';
COMMENT ON COLUMN public.external_systems.system_type IS 'Type of the external system (e.g., lms, content_provider).';
COMMENT ON COLUMN public.external_systems.auth_type IS 'Authentication method used by the external system.';
COMMENT ON COLUMN public.external_systems.configuration IS 'System-specific configuration details.';

-- Table to store credentials securely (Consider using Supabase Vault or similar for production)
-- NOTE: Storing sensitive credentials directly in the database is NOT recommended for production.
-- This is a simplified structure. Use Supabase Vault secrets or an external secret manager.
CREATE TABLE public.integration_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_system_id uuid NOT NULL REFERENCES public.external_systems(id) ON DELETE CASCADE,
    credential_name text NOT NULL, -- e.g., 'api_key', 'client_secret', 'refresh_token'
    credential_value text NOT NULL, -- Encrypt this value in a real application!
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_integration_credentials_external_system_id ON public.integration_credentials(external_system_id);

-- Apply the updated_at trigger
CREATE TRIGGER set_integration_credentials_updated_at
BEFORE UPDATE ON public.integration_credentials
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.integration_credentials IS 'Stores credentials for external systems. WARNING: Encrypt sensitive values in production!';
COMMENT ON COLUMN public.integration_credentials.credential_value IS 'The credential value (e.g., API key, token). MUST BE ENCRYPTED IN PRODUCTION.';

-- Table to map content between The Wheel and external systems
CREATE TABLE public.content_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_system_id uuid NOT NULL REFERENCES public.external_systems(id) ON DELETE CASCADE,
    internal_content_type text NOT NULL, -- e.g., 'journey_step', 'tool', 'resource'
    internal_content_id text NOT NULL, -- ID of the content within The Wheel
    external_content_id text NOT NULL, -- ID of the content in the external system
    external_content_url text, -- Direct URL to the content if available
    mapping_details jsonb, -- Additional mapping info (e.g., course ID, module ID)
    last_synced_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_content_mappings_external_system_id ON public.content_mappings(external_system_id);
CREATE INDEX idx_content_mappings_internal_content ON public.content_mappings(internal_content_type, internal_content_id);
CREATE INDEX idx_content_mappings_external_content_id ON public.content_mappings(external_content_id);

-- Apply the updated_at trigger
CREATE TRIGGER set_content_mappings_updated_at
BEFORE UPDATE ON public.content_mappings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.content_mappings IS 'Maps content entities between The Wheel and external systems.';
COMMENT ON COLUMN public.content_mappings.internal_content_type IS 'Type of content within The Wheel (e.g., journey_step).';
COMMENT ON COLUMN public.content_mappings.internal_content_id IS 'ID of the content within The Wheel.';
COMMENT ON COLUMN public.content_mappings.external_content_id IS 'ID of the corresponding content in the external system.';

-- Table to log synchronization activities with external systems
CREATE TABLE public.synchronization_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_system_id uuid NOT NULL REFERENCES public.external_systems(id) ON DELETE CASCADE,
    sync_type text NOT NULL, -- e.g., 'content_import', 'progress_update', 'credential_refresh'
    status text NOT NULL, -- e.g., 'started', 'completed', 'failed'
    start_time timestamptz NOT NULL DEFAULT now(),
    end_time timestamptz,
    records_processed integer,
    records_failed integer,
    log_details jsonb -- Store error messages or other relevant details
);

-- Add indexes
CREATE INDEX idx_synchronization_logs_external_system_id ON public.synchronization_logs(external_system_id);
CREATE INDEX idx_synchronization_logs_sync_type ON public.synchronization_logs(sync_type);
CREATE INDEX idx_synchronization_logs_status ON public.synchronization_logs(status);
CREATE INDEX idx_synchronization_logs_start_time ON public.synchronization_logs(start_time);

COMMENT ON TABLE public.synchronization_logs IS 'Logs synchronization jobs run between The Wheel and external systems.';
COMMENT ON COLUMN public.synchronization_logs.sync_type IS 'Type of synchronization performed.';
COMMENT ON COLUMN public.synchronization_logs.status IS 'Outcome of the synchronization job.';
COMMENT ON COLUMN public.synchronization_logs.log_details IS 'Detailed logs, including error messages if applicable.';

-- Enable RLS (Restrict access primarily to admins/system roles)
ALTER TABLE public.external_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synchronization_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Likely admin-only access for configuration and logs)
CREATE POLICY "Allow admin full access to external systems"
ON public.external_systems FOR ALL USING (public.is_claims_admin());

CREATE POLICY "Allow admin full access to integration credentials"
ON public.integration_credentials FOR ALL USING (public.is_claims_admin());

CREATE POLICY "Allow admin full access to content mappings"
ON public.content_mappings FOR ALL USING (public.is_claims_admin());

CREATE POLICY "Allow admin full access to synchronization logs"
ON public.synchronization_logs FOR ALL USING (public.is_claims_admin());

-- Grant Permissions (Primarily for admin/system roles)
GRANT USAGE ON SCHEMA public TO supabase_admin;
GRANT ALL ON TABLE public.external_systems TO supabase_admin;
GRANT ALL ON TABLE public.integration_credentials TO supabase_admin;
GRANT ALL ON TABLE public.content_mappings TO supabase_admin;
GRANT ALL ON TABLE public.synchronization_logs TO supabase_admin;

-- Authenticated users typically wouldn't interact directly with these tables.
-- Access might be granted selectively via specific functions or views if needed.
-- GRANT SELECT ON TABLE public.external_systems TO authenticated; -- If users need to see available integrations
