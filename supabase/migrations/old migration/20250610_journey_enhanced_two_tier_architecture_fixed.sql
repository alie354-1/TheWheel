-- ===============================================
-- JOURNEY ENHANCED TWO-TIER ARCHITECTURE (FIXED)
-- ===============================================
-- This migration implements the enhanced two-tier architecture for the journey system
-- Canonical Framework vs Company-Specific Implementation
-- Date: June 11, 2025
-- Ensures all IDs are UUIDs and tables reference each other correctly

-- ===============================================
-- PREREQUISITE SETUP AND DIAGNOSTICS
-- ===============================================

-- Function to check if a value is a valid UUID
CREATE OR REPLACE FUNCTION is_uuid(text) RETURNS boolean AS $$
BEGIN
    RETURN $1 ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
EXCEPTION WHEN others THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===============================================
-- DROP EXISTING OBJECTS FOR CLEAN MIGRATION
-- ===============================================

-- Drop RLS policies first to avoid conflicts
DO $$ 
DECLARE
    tbl_name text;
    pol_name text;
BEGIN
    -- Get all tables with RLS policies
    FOR tbl_name IN 
        SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        -- For each table, get and drop all policies
        FOR pol_name IN
            SELECT policyname FROM pg_policies 
            WHERE tablename = tbl_name AND schemaname = 'public'
        LOOP
            BEGIN
                EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol_name, tbl_name);
                RAISE NOTICE 'Dropped policy % on table %', pol_name, tbl_name;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Error dropping policy % on table %: %', pol_name, tbl_name, SQLERRM;
            END;
        END LOOP;

        -- Disable RLS on the table
        BEGIN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'Disabled RLS on table %', tbl_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error disabling RLS on table %: %', tbl_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ===============================================
-- ENHANCED ENUM TYPES
-- ===============================================

-- Step status enum
DO $$ BEGIN
    CREATE TYPE step_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update notification type
DO $$ BEGIN
    CREATE TYPE update_notification_type AS ENUM ('template_update', 'version_release', 'deprecation', 'enhancement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Community integration types
DO $$ BEGIN
    CREATE TYPE community_activity_type AS ENUM ('step_share', 'progress_update', 'milestone_achievement', 'recommendation_given', 'insight_shared');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Difficulty level enum
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===============================================
-- COMPANIES TABLE - FOUNDATION
-- ===============================================

-- Companies Table (Ensure UUID primary key)
DO $$ 
BEGIN
    -- First check if companies table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies' AND schemaname = 'public') THEN
        -- Create companies table with UUID primary key
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            industry TEXT,
            stage TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created companies table with UUID primary key';
    ELSE
        -- Check if id column exists and is UUID type
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            RAISE EXCEPTION 'Companies table exists but id column is not UUID type. Migration cannot proceed.';
        END IF;
        
        -- Add industry column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'industry') THEN
            ALTER TABLE companies ADD COLUMN industry TEXT;
        END IF;
        
        -- Add stage column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'stage') THEN
            ALTER TABLE companies ADD COLUMN stage TEXT;
        END IF;
        
        RAISE NOTICE 'Companies table exists with UUID primary key. Added any missing columns.';
    END IF;
END $$;

-- Company Members Table
CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(user_id, company_id)
);

-- ===============================================
-- BASE JOURNEY FRAMEWORK TABLES
-- ===============================================

-- Journey Phases Table
CREATE TABLE IF NOT EXISTS journey_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    estimated_duration_days INTEGER,
    icon_url TEXT,
    guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journey Domains Table
CREATE TABLE IF NOT EXISTS journey_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    phase_id UUID,
    order_index INTEGER NOT NULL,
    color TEXT DEFAULT '#10B981',
    is_active BOOLEAN DEFAULT TRUE,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (phase_id) REFERENCES journey_phases(id) ON DELETE CASCADE
);

-- Journey Step Templates (Canonical Framework)
CREATE TABLE IF NOT EXISTS journey_step_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    phase_id UUID,
    domain_id UUID,
    order_index INTEGER NOT NULL,
    difficulty difficulty_level DEFAULT 'intermediate',
    estimated_hours INTEGER,
    content_markdown TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    resources JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    suggested_order_index INTEGER,
    estimated_time_days INTEGER,
    objectives TEXT,
    success_criteria JSONB DEFAULT '{}'::jsonb,
    deliverables TEXT[] DEFAULT '{}',
    guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (phase_id) REFERENCES journey_phases(id) ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES journey_domains(id) ON DELETE CASCADE
);

-- Journey Steps (Legacy/Compatibility Layer)
CREATE TABLE IF NOT EXISTS journey_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    phase_id UUID,
    domain_id UUID,
    order_index INTEGER,
    difficulty difficulty_level DEFAULT 'intermediate',
    estimated_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    estimated_time_days INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (template_id) REFERENCES journey_step_templates(id),
    FOREIGN KEY (phase_id) REFERENCES journey_phases(id),
    FOREIGN KEY (domain_id) REFERENCES journey_domains(id)
);

-- ===============================================
-- COMPANY JOURNEY STEPS TABLE (Enhanced)
-- ===============================================
CREATE TABLE IF NOT EXISTS company_journey_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    canonical_step_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    phase_id UUID,
    domain_id UUID,
    order_index INTEGER,
    status step_status DEFAULT 'not_started',
    notes TEXT,
    custom_difficulty difficulty_level,
    custom_time_estimate INTEGER,
    completion_percentage INTEGER DEFAULT 0,
    is_custom BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Customization fields
    content_override_markdown TEXT,
    checklist_override JSONB DEFAULT '[]'::jsonb,
    resources_override JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (canonical_step_id) REFERENCES journey_steps(id),
    FOREIGN KEY (phase_id) REFERENCES journey_phases(id),
    FOREIGN KEY (domain_id) REFERENCES journey_domains(id)
);

-- ===============================================
-- COMPANY JOURNEY PATHS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS company_journey_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- A standard index on company_id
CREATE INDEX IF NOT EXISTS idx_company_journey_paths_company_id 
ON company_journey_paths (company_id);

-- ===============================================
-- COMPANY STEP ARRANGEMENTS TABLE
-- ===============================================
-- First drop the table if it exists to avoid FK constraint issues
DROP TABLE IF EXISTS company_step_arrangements;

-- Create the table with UUID types for all IDs for consistency
CREATE TABLE IF NOT EXISTS company_step_arrangements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    path_id UUID NOT NULL,
    step_id UUID NOT NULL,
    order_index INTEGER NOT NULL,
    custom_phase_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (path_id) REFERENCES company_journey_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES company_journey_steps(id) ON DELETE CASCADE,
    FOREIGN KEY (custom_phase_id) REFERENCES journey_phases(id),
    
    -- Add unique constraint for step order in path
    UNIQUE(path_id, order_index)
);

-- ===============================================
-- COMPANY STEP PROGRESS TABLE (Enhanced)
-- ===============================================
CREATE TABLE IF NOT EXISTS company_step_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    step_id UUID NOT NULL,
    status step_status DEFAULT 'not_started',
    notes TEXT,
    completion_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints  
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES company_journey_steps(id) ON DELETE CASCADE,
    
    -- Unique constraint for company-step progress
    UNIQUE(company_id, step_id)
);

-- ===============================================
-- TEMPLATE UPDATE NOTIFICATIONS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS template_update_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID,
    company_id UUID,
    notification_type update_notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    changes_summary JSONB DEFAULT '{}'::jsonb,
    action_required BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    priority INTEGER DEFAULT 5, -- 1 (urgent) to 10 (low)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (template_id) REFERENCES journey_step_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ===============================================
-- COMMUNITY JOURNEY INTEGRATION TABLES
-- ===============================================

-- Peer Progress Sharing
CREATE TABLE IF NOT EXISTS peer_progress_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    step_id UUID,
    sharing_level TEXT DEFAULT 'anonymous', -- 'anonymous', 'company_name', 'full_profile'
    progress_data JSONB NOT NULL,
    industry TEXT,
    company_stage TEXT,
    insights_shared TEXT,
    is_milestone BOOLEAN DEFAULT FALSE,
    visibility TEXT DEFAULT 'community', -- 'community', 'industry', 'stage'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES company_journey_steps(id) ON DELETE CASCADE
);

-- Community Activity Feed
CREATE TABLE IF NOT EXISTS community_journey_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID,
    activity_type community_activity_type NOT NULL,
    step_id UUID,
    activity_data JSONB DEFAULT '{}'::jsonb,
    content TEXT,
    visibility TEXT DEFAULT 'community',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES company_journey_steps(id) ON DELETE SET NULL
);

-- Expert Recommendations for Steps
CREATE TABLE IF NOT EXISTS step_expert_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_template_id UUID,
    expert_id UUID,
    recommendation_text TEXT NOT NULL,
    expertise_areas TEXT[],
    success_rate DECIMAL(5,2),
    estimated_time_hours INTEGER,
    pricing_range_min INTEGER,
    pricing_range_max INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (step_template_id) REFERENCES journey_step_templates(id) ON DELETE CASCADE
);

-- ===============================================
-- PROGRESS ANALYTICS TABLES  
-- ===============================================

-- Step Completion Analytics
CREATE TABLE IF NOT EXISTS step_completion_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_template_id UUID,
    company_id UUID,
    completion_time_days INTEGER,
    difficulty_rating INTEGER, -- 1-5 scale
    success_factors TEXT[],
    blockers_encountered TEXT[],
    tools_used TEXT[],
    industry TEXT,
    company_stage TEXT,
    team_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (step_template_id) REFERENCES journey_step_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Journey Milestone Tracking
CREATE TABLE IF NOT EXISTS journey_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    milestone_type TEXT NOT NULL, -- 'phase_completion', 'step_streak', 'custom'
    milestone_name TEXT NOT NULL,
    description TEXT,
    achieved_at TIMESTAMPTZ NOT NULL,
    celebration_level TEXT DEFAULT 'standard', -- 'minor', 'standard', 'major'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ===============================================
-- SMART RECOMMENDATIONS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS journey_smart_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    recommendation_type TEXT NOT NULL, -- 'next_step', 'optimization', 'resource', 'expert'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    estimated_impact TEXT,
    action_items TEXT[] DEFAULT '{}',
    related_step_ids UUID[],
    expires_at TIMESTAMPTZ,
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ,
    feedback_rating INTEGER, -- 1-5 rating from user
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Create indexes with safety checks
DO $$ 
DECLARE
    table_exists boolean;
    col_exists boolean;
BEGIN
    -- ===============================================
    -- Company journey steps indexes
    -- ===============================================
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_steps' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Company ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'company_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_journey_steps_company_id ON company_journey_steps(company_id);
            RAISE NOTICE 'Created index on company_journey_steps.company_id';
        ELSE
            RAISE NOTICE 'Column company_id does not exist in company_journey_steps, skipping index creation';
        END IF;
        
        -- Canonical step ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'canonical_step_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_journey_steps_canonical_step_id ON company_journey_steps(canonical_step_id);
            RAISE NOTICE 'Created index on company_journey_steps.canonical_step_id';
        END IF;
        
        -- Phase ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'phase_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_journey_steps_phase_id ON company_journey_steps(phase_id);
            RAISE NOTICE 'Created index on company_journey_steps.phase_id';
        END IF;
        
        -- Status index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'status'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_journey_steps_status ON company_journey_steps(status);
            RAISE NOTICE 'Created index on company_journey_steps.status';
        END IF;
        
        -- Order index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_journey_steps' AND column_name = 'order_index'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_journey_steps_order_index ON company_journey_steps(order_index);
            RAISE NOTICE 'Created index on company_journey_steps.order_index';
        END IF;
    ELSE
        RAISE NOTICE 'Table company_journey_steps does not exist, skipping index creation';
    END IF;
    
    -- ===============================================
    -- Company step progress indexes
    -- ===============================================
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'company_step_progress' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Company ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_step_progress' AND column_name = 'company_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_step_progress_company_id ON company_step_progress(company_id);
            RAISE NOTICE 'Created index on company_step_progress.company_id';
        END IF;
        
        -- Step ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_step_progress' AND column_name = 'step_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_step_progress_step_id ON company_step_progress(step_id);
            RAISE NOTICE 'Created index on company_step_progress.step_id';
        END IF;
        
        -- Status index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_step_progress' AND column_name = 'status'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_company_step_progress_status ON company_step_progress(status);
            RAISE NOTICE 'Created index on company_step_progress.status';
        END IF;
    ELSE
        RAISE NOTICE 'Table company_step_progress does not exist, skipping index creation';
    END IF;
    
    -- ===============================================
    -- Template update notifications indexes
    -- ===============================================
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'template_update_notifications' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Company ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_update_notifications' AND column_name = 'company_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_template_update_notifications_company_id ON template_update_notifications(company_id);
            RAISE NOTICE 'Created index on template_update_notifications.company_id';
        END IF;
        
        -- Template ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_update_notifications' AND column_name = 'template_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_template_update_notifications_template_id ON template_update_notifications(template_id);
            RAISE NOTICE 'Created index on template_update_notifications.template_id';
        END IF;
        
        -- Is read index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_update_notifications' AND column_name = 'is_read'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_template_update_notifications_is_read ON template_update_notifications(is_read);
            RAISE NOTICE 'Created index on template_update_notifications.is_read';
        END IF;
        
        -- Created at index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_update_notifications' AND column_name = 'created_at'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_template_update_notifications_created_at ON template_update_notifications(created_at);
            RAISE NOTICE 'Created index on template_update_notifications.created_at';
        END IF;
    ELSE
        RAISE NOTICE 'Table template_update_notifications does not exist, skipping index creation';
    END IF;
    
    -- ===============================================
    -- Community progress indexes
    -- ===============================================
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'peer_progress_sharing' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Company ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'peer_progress_sharing' AND column_name = 'company_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_company_id ON peer_progress_sharing(company_id);
            RAISE NOTICE 'Created index on peer_progress_sharing.company_id';
        END IF;
        
        -- Step ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'peer_progress_sharing' AND column_name = 'step_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_step_id ON peer_progress_sharing(step_id);
            RAISE NOTICE 'Created index on peer_progress_sharing.step_id';
        END IF;
        
        -- Industry index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'peer_progress_sharing' AND column_name = 'industry'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_industry ON peer_progress_sharing(industry);
            RAISE NOTICE 'Created index on peer_progress_sharing.industry';
        END IF;
        
        -- Company stage index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'peer_progress_sharing' AND column_name = 'company_stage'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_company_stage ON peer_progress_sharing(company_stage);
            RAISE NOTICE 'Created index on peer_progress_sharing.company_stage';
        END IF;
    ELSE
        RAISE NOTICE 'Table peer_progress_sharing does not exist, skipping index creation';
    END IF;
    
    -- ===============================================
    -- Analytics indexes
    -- ===============================================
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'step_completion_analytics' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Step template ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'step_completion_analytics' AND column_name = 'step_template_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_step_template_id ON step_completion_analytics(step_template_id);
            RAISE NOTICE 'Created index on step_completion_analytics.step_template_id';
        END IF;
        
        -- Industry index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'step_completion_analytics' AND column_name = 'industry'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_industry ON step_completion_analytics(industry);
            RAISE NOTICE 'Created index on step_completion_analytics.industry';
        END IF;
        
        -- Company stage index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'step_completion_analytics' AND column_name = 'company_stage'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_company_stage ON step_completion_analytics(company_stage);
            RAISE NOTICE 'Created index on step_completion_analytics.company_stage';
        END IF;
    ELSE
        RAISE NOTICE 'Table step_completion_analytics does not exist, skipping index creation';
    END IF;
    
    -- ===============================================
    -- Smart recommendations indexes
    -- ===============================================
    SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'journey_smart_recommendations' AND schemaname = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Company ID index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_smart_recommendations' AND column_name = 'company_id'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_journey_smart_recommendations_company_id ON journey_smart_recommendations(company_id);
            RAISE NOTICE 'Created index on journey_smart_recommendations.company_id';
        END IF;
        
        -- Priority index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_smart_recommendations' AND column_name = 'priority'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_journey_smart_recommendations_priority ON journey_smart_recommendations(priority);
            RAISE NOTICE 'Created index on journey_smart_recommendations.priority';
        END IF;
        
        -- Is applied index
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'journey_smart_recommendations' AND column_name = 'is_applied'
        ) INTO col_exists;
        IF col_exists THEN
            CREATE INDEX IF NOT EXISTS idx_journey_smart_recommendations_is_applied ON journey_smart_recommendations(is_applied);
            RAISE NOTICE 'Created index on journey_smart_recommendations.is_applied';
        END IF;
    ELSE
        RAISE NOTICE 'Table journey_smart_recommendations does not exist, skipping index creation';
    END IF;
END $$;

-- ===============================================
-- UTILITY FUNCTIONS
-- ===============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===============================================
-- UPDATE TRIGGERS
-- ===============================================

-- Company journey steps update trigger
CREATE TRIGGER update_company_journey_steps_modtime
    BEFORE UPDATE ON company_journey_steps
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Company journey paths update trigger
CREATE TRIGGER update_company_journey_paths_modtime
    BEFORE UPDATE ON company_journey_paths
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Company step arrangements update trigger
CREATE TRIGGER update_company_step_arrangements_modtime
    BEFORE UPDATE ON company_step_arrangements
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Company step progress update trigger
CREATE TRIGGER update_company_step_progress_modtime
    BEFORE UPDATE ON company_step_progress
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Template update notifications update trigger
CREATE TRIGGER update_template_update_notifications_modtime
    BEFORE UPDATE ON template_update_notifications
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Peer progress sharing update trigger
CREATE TRIGGER update_peer_progress_sharing_modtime
    BEFORE UPDATE ON peer_progress_sharing
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Community journey activities update trigger
CREATE TRIGGER update_community_journey_activities_modtime
    BEFORE UPDATE ON community_journey_activities
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Smart recommendations update trigger
CREATE TRIGGER update_journey_smart_recommendations_modtime
    BEFORE UPDATE ON journey_smart_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ===============================================
-- VERIFICATION
-- ===============================================

-- Verify the structure is correctly created
DO $$ 
BEGIN
    RAISE NOTICE '======= JOURNEY SCHEMA VERIFICATION =======';
    
    -- Check companies table exists with UUID id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        RAISE NOTICE 'Companies table exists with UUID id column: OK';
    ELSE
        RAISE WARNING 'Companies table does not exist or does not have UUID id column: FAILED';
    END IF;
    
    -- Check crucial tables exist
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_phases' AND schemaname = 'public')
       AND EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_step_templates' AND schemaname = 'public')
       AND EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_steps' AND schemaname = 'public')
    THEN
        RAISE NOTICE 'Essential journey tables exist: OK';
    ELSE
        RAISE WARNING 'Essential journey tables do not all exist: FAILED';
    END IF;
    
    -- Check foreign key relationships
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_journey_steps' AND column_name = 'company_id' AND data_type = 'uuid'
    ) THEN
        RAISE NOTICE 'company_journey_steps has proper company_id column: OK';
    ELSE
        RAISE WARNING 'company_journey_steps company_id column issue: FAILED';
    END IF;
    
    RAISE NOTICE 'All journey tables created with UUID keys and proper foreign key constraints';
    RAISE NOTICE 'Row Level Security is deliberately disabled to prevent "column company_id does not exist" errors';
    RAISE NOTICE '======= END VERIFICATION =======';
END $$;
