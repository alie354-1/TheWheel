-- Create generic preferences table for the preferences service
-- This supports the unified preferences service that handles user, company, and application scopes

CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('user', 'company', 'application')),
  scope_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique preference per key/scope/scope_id combination
  CONSTRAINT preferences_unique_key_scope UNIQUE (key, scope, scope_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_preferences_scope_id ON public.preferences(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_preferences_key ON public.preferences(key);
CREATE INDEX IF NOT EXISTS idx_preferences_scope ON public.preferences(scope);

-- Enable Row Level Security
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for different scopes
-- User preferences: users can only access their own
CREATE POLICY "Users can manage their own preferences"
  ON public.preferences
  FOR ALL
  USING (
    scope = 'user' AND scope_id = auth.uid()::text
  );

-- Company preferences: users can access preferences for companies they're members of
CREATE POLICY "Users can manage company preferences they have access to"
  ON public.preferences
  FOR ALL
  USING (
    scope = 'company' AND auth.uid() IN (
      SELECT user_id FROM public.company_members 
      WHERE company_id = preferences.scope_id::uuid
    )
  );

-- Application preferences: only admins can manage
CREATE POLICY "Admins can manage application preferences"
  ON public.preferences
  FOR ALL
  USING (
    scope = 'application' AND auth.uid() IN (
      SELECT user_id FROM public.company_members 
      WHERE role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE TRIGGER set_preferences_updated_at
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp_column();

-- Add comments
COMMENT ON TABLE public.preferences IS 'Generic preferences table supporting user, company, and application scopes';
COMMENT ON COLUMN public.preferences.scope IS 'The scope of the preference: user, company, or application';
COMMENT ON COLUMN public.preferences.scope_id IS 'The ID within the scope (user_id for user scope, company_id for company scope, empty for application scope)';
COMMENT ON COLUMN public.preferences.key IS 'The preference key/name';
COMMENT ON COLUMN public.preferences.value IS 'The preference value stored as JSONB';
