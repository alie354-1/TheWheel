-- Migration to add journey_feature_events table for advanced analytics
-- Part of Sprint 3 Implementation
-- Date: May 3, 2025

-- Create the journey_feature_events table for analytics tracking
CREATE TABLE IF NOT EXISTS public.journey_feature_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    feature_name TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_info JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.journey_feature_events ENABLE ROW LEVEL SECURITY;

-- Create policies for row level security
-- Allow logged-in users to insert their own events
CREATE POLICY "Users can insert their own journey feature events"
    ON public.journey_feature_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow company members to view company events
CREATE POLICY "Company members can view company journey feature events"
    ON public.journey_feature_events
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Allow admins to view all events
CREATE POLICY "Admins can view all journey feature events"
    ON public.journey_feature_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.company_members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_journey_feature_events_company_id ON public.journey_feature_events(company_id);
CREATE INDEX IF NOT EXISTS idx_journey_feature_events_user_id ON public.journey_feature_events(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_feature_events_feature_name ON public.journey_feature_events(feature_name);
CREATE INDEX IF NOT EXISTS idx_journey_feature_events_created_at ON public.journey_feature_events(created_at);

-- Create a function to automatically capture client information
CREATE OR REPLACE FUNCTION public.set_journey_feature_events_client_info()
RETURNS TRIGGER AS $$
BEGIN
    NEW.client_info = jsonb_build_object(
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
        'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
        'request_id', current_setting('request.request_id', true)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to capture client information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_journey_feature_events_client_info'
      AND tgrelid = 'journey_feature_events'::regclass
  ) THEN
    CREATE TRIGGER set_journey_feature_events_client_info
    BEFORE INSERT ON public.journey_feature_events
    FOR EACH ROW
    EXECUTE FUNCTION public.set_journey_feature_events_client_info();
  END IF;
END $$;

-- Add comment to table
COMMENT ON TABLE public.journey_feature_events IS 'Stores analytics data for journey system feature usage and interactions';
