-- Migration for Sprint 5: Personalization Tables

-- Table to store detected or inferred user learning styles and preferences
CREATE TABLE public.user_learning_profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    learning_style_preference text, -- e.g., 'visual', 'auditory', 'kinesthetic', 'reading/writing', or a more complex model
    preferred_content_types text[], -- e.g., ['video', 'article', 'interactive_tutorial']
    pace_preference smallint, -- e.g., 1 (slow) to 5 (fast)
    engagement_level float, -- Calculated metric indicating overall engagement
    skill_gaps jsonb, -- Store identified skill gaps, perhaps mapping skill ID to proficiency level
    preferences_payload jsonb, -- For storing other miscellaneous preferences
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Apply the updated_at trigger
CREATE TRIGGER set_user_learning_profiles_updated_at
BEFORE UPDATE ON public.user_learning_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); -- Assuming set_updated_at exists

COMMENT ON TABLE public.user_learning_profiles IS 'Stores user-specific learning preferences, styles, and calculated metrics for personalization.';
COMMENT ON COLUMN public.user_learning_profiles.learning_style_preference IS 'Detected or user-stated preferred learning style.';
COMMENT ON COLUMN public.user_learning_profiles.pace_preference IS 'User''s preferred learning speed (e.g., 1-5 scale).';
COMMENT ON COLUMN public.user_learning_profiles.engagement_level IS 'Calculated score representing user engagement.';
COMMENT ON COLUMN public.user_learning_profiles.skill_gaps IS 'JSON object storing identified skill gaps and potentially proficiency levels.';

-- Table to store custom or dynamically generated journey paths for users/companies
CREATE TABLE public.personalized_paths (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    path_name text NOT NULL,
    description text,
    source_model_id uuid REFERENCES public.ai_models(id) ON DELETE SET NULL, -- Which model generated this path?
    path_definition jsonb NOT NULL, -- Structure defining the sequence of steps, modules, etc.
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_or_company_path CHECK (user_id IS NOT NULL OR company_id IS NOT NULL) -- Ensure path belongs to a user or company
);

-- Add indexes
CREATE INDEX idx_personalized_paths_user_id ON public.personalized_paths(user_id);
CREATE INDEX idx_personalized_paths_company_id ON public.personalized_paths(company_id);
CREATE INDEX idx_personalized_paths_is_active ON public.personalized_paths(is_active);

-- Apply the updated_at trigger
CREATE TRIGGER set_personalized_paths_updated_at
BEFORE UPDATE ON public.personalized_paths
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.personalized_paths IS 'Stores custom or AI-generated learning/journey paths for users or companies.';
COMMENT ON COLUMN public.personalized_paths.path_definition IS 'JSON object defining the structure and sequence of the personalized path.';
COMMENT ON CONSTRAINT user_or_company_path ON public.personalized_paths IS 'Ensures that each path is associated with either a user or a company.';

-- Table for tracking user skill assessments or proficiencies
CREATE TABLE public.skill_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id text NOT NULL, -- Identifier for the skill (could reference another table if skills are predefined)
    proficiency_level float, -- Numerical score or level
    assessment_method text, -- e.g., 'self_reported', 'quiz', 'project_evaluation', 'inferred'
    assessed_at timestamptz NOT NULL DEFAULT now(),
    assessment_details jsonb -- Additional context like quiz results, evaluator notes
);

-- Add indexes
CREATE INDEX idx_skill_assessments_user_id ON public.skill_assessments(user_id);
CREATE INDEX idx_skill_assessments_skill_id ON public.skill_assessments(skill_id);
CREATE INDEX idx_skill_assessments_assessed_at ON public.skill_assessments(assessed_at);

COMMENT ON TABLE public.skill_assessments IS 'Tracks user proficiency levels for various skills.';
COMMENT ON COLUMN public.skill_assessments.skill_id IS 'Identifier for the assessed skill.';
COMMENT ON COLUMN public.skill_assessments.proficiency_level IS 'Score or level indicating user''s proficiency in the skill.';
COMMENT ON COLUMN public.skill_assessments.assessment_method IS 'How the proficiency level was determined.';

-- Table for storing calculated engagement metrics (could also be part of analytics_aggregates)
-- This provides a dedicated space if complex engagement scoring is needed.
CREATE TABLE public.engagement_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    metric_name text NOT NULL, -- e.g., 'login_frequency', 'content_completion_rate', 'interaction_score'
    metric_value float NOT NULL,
    calculation_period_start timestamptz,
    calculation_period_end timestamptz,
    calculated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_engagement_metrics_user_id ON public.engagement_metrics(user_id);
CREATE INDEX idx_engagement_metrics_company_id ON public.engagement_metrics(company_id);
CREATE INDEX idx_engagement_metrics_metric_name ON public.engagement_metrics(metric_name);
CREATE INDEX idx_engagement_metrics_calculated_at ON public.engagement_metrics(calculated_at);

COMMENT ON TABLE public.engagement_metrics IS 'Stores calculated user engagement metrics over specific periods.';
COMMENT ON COLUMN public.engagement_metrics.metric_name IS 'Identifier for the specific engagement metric.';
COMMENT ON COLUMN public.engagement_metrics.metric_value IS 'The calculated value of the engagement metric.';

-- Enable RLS
ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Refine based on roles and data access needs)

-- User Learning Profiles: Users manage their own profile
CREATE POLICY "Allow users to manage their own learning profile"
ON public.user_learning_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Personalized Paths: Users manage their own paths, potentially company admins manage company paths
CREATE POLICY "Allow users to manage their own personalized paths"
ON public.personalized_paths
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
-- Add policy for company admins if needed

-- Skill Assessments: Users manage their own assessments
CREATE POLICY "Allow users to manage their own skill assessments"
ON public.skill_assessments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Engagement Metrics: Likely read-only for users, managed by system/admins
CREATE POLICY "Allow users to view their own engagement metrics"
ON public.engagement_metrics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow admin read access to engagement metrics"
ON public.engagement_metrics
FOR SELECT
USING (public.is_claims_admin()); -- Assuming is_claims_admin() exists

-- Grant Permissions
GRANT USAGE ON SCHEMA public TO supabase_admin;
GRANT ALL ON TABLE public.user_learning_profiles TO supabase_admin;
GRANT ALL ON TABLE public.personalized_paths TO supabase_admin;
GRANT ALL ON TABLE public.skill_assessments TO supabase_admin;
GRANT ALL ON TABLE public.engagement_metrics TO supabase_admin;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_learning_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.personalized_paths TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.skill_assessments TO authenticated;
GRANT SELECT ON TABLE public.engagement_metrics TO authenticated; -- Read-only for users

-- Grant broader permissions to admin/service roles as needed
-- GRANT ALL ON TABLE public.engagement_metrics TO service_role; -- For system updates
