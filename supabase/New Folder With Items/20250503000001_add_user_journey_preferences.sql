-- Migration to add user_journey_preferences table
-- Part of Sprint 3 Implementation
-- Date: May 3, 2025

-- Create the user_journey_preferences table
CREATE TABLE IF NOT EXISTS public.user_journey_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Create a unique constraint to ensure one set of preferences per user per company
    CONSTRAINT user_journey_preferences_user_company_unique UNIQUE (user_id, company_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_journey_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for row level security
-- Allow users to view their own preferences
CREATE POLICY "Users can view their own journey preferences"
    ON public.user_journey_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own preferences
CREATE POLICY "Users can insert their own journey preferences"
    ON public.user_journey_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own preferences
CREATE POLICY "Users can update their own journey preferences"
    ON public.user_journey_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);
    
-- Add indexes for performance
CREATE INDEX idx_user_journey_preferences_user_id ON public.user_journey_preferences(user_id);
CREATE INDEX idx_user_journey_preferences_company_id ON public.user_journey_preferences(company_id);

-- Add updated_at trigger
CREATE TRIGGER set_user_journey_preferences_updated_at
BEFORE UPDATE ON public.user_journey_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Add comment to table
COMMENT ON TABLE public.user_journey_preferences IS 'Stores user preferences for the journey system, including view modes, filters, and UI state';
