-- Migration: Fix company_members admin checks to use 'role' column instead of 'member_role'
-- Date: 2025-05-11

-- Fix admin RLS policy on journey_feature_events
DROP POLICY IF EXISTS "Admins can view all journey feature events" ON public.journey_feature_events;

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

-- If there are any other policies or functions referencing 'member_role', update them here as well.
-- (Add additional DROP/CREATE POLICY or CREATE OR REPLACE FUNCTION statements as needed.)
