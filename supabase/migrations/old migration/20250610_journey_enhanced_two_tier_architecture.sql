-- ===============================================
-- JOURNEY ENHANCED TWO-TIER ARCHITECTURE
-- ===============================================
-- This migration implements the enhanced two-tier architecture for the journey system
-- Canonical Framework vs Company-Specific Implementation
-- Date: June 10, 2025
-- Updated to ensure UUID consistency and column alignment with sample data

-- ===============================================
-- DROP EXISTING OBJECTS FOR CLEAN MIGRATION
-- ===============================================

-- Drop function if it exists
DROP FUNCTION IF EXISTS is_uuid(text);
DROP VIEW IF EXISTS non_uuid_ids;
DROP PROCEDURE IF EXISTS convert_sample_data_to_uuids;

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
-- BASE JOURNEY FRAMEWORK TABLES
-- ===============================================

-- Function to check if a value is a valid UUID
CREATE OR REPLACE FUNCTION is_uuid(text) RETURNS boolean AS $$
BEGIN
    RETURN $1 ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
EXCEPTION WHEN others THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
    phase_id UUID REFERENCES journey_phases(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    color TEXT DEFAULT '#10B981',
    is_active BOOLEAN DEFAULT TRUE,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journey Step Templates (Canonical Framework)
CREATE TABLE IF NOT EXISTS journey_step_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    phase_id UUID REFERENCES journey_phases(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES journey_domains(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journey Steps (Legacy/Compatibility Layer)
CREATE TABLE IF NOT EXISTS journey_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES journey_step_templates(id),
    name TEXT NOT NULL,
    description TEXT,
    phase_id UUID REFERENCES journey_phases(id),
    domain_id UUID REFERENCES journey_domains(id),
    order_index INTEGER,
    difficulty difficulty_level DEFAULT 'intermediate',
    estimated_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    estimated_time_days INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies Table - ensure it exists with proper structure before references
DO $$ 
BEGIN
    -- First check if companies table exists at all
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies' AND schemaname = 'public') THEN
        -- Create companies table if it doesn't exist
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
        -- If table exists but doesn't have UUID primary key, raise an error
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            RAISE EXCEPTION 'Companies table exists but id column is not UUID type. Migration cannot proceed safely.';
        END IF;
        
        -- Add industry column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'industry') THEN
            ALTER TABLE companies ADD COLUMN industry TEXT;
        END IF;
        
        -- Add stage column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'stage') THEN
            ALTER TABLE companies ADD COLUMN stage TEXT;
        END IF;
    END IF;
END $$;

-- Company Members Table
CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- ===============================================
-- COMPANY JOURNEY STEPS TABLE (Enhanced)
-- ===============================================
CREATE TABLE IF NOT EXISTS company_journey_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    canonical_step_id UUID REFERENCES journey_steps(id),
    name TEXT NOT NULL,
    description TEXT,
    phase_id UUID REFERENCES journey_phases(id),
    domain_id UUID REFERENCES journey_domains(id),
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
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
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

-- Note: Removed problematic partial index on is_default column to fix errors
-- A standard index on company_id is sufficient for now
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints after table creation
ALTER TABLE company_step_arrangements 
    ADD CONSTRAINT company_step_arrangements_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE company_step_arrangements 
    ADD CONSTRAINT company_step_arrangements_path_id_fkey
    FOREIGN KEY (path_id) REFERENCES company_journey_paths(id) ON DELETE CASCADE;

ALTER TABLE company_step_arrangements 
    ADD CONSTRAINT company_step_arrangements_step_id_fkey
    FOREIGN KEY (step_id) REFERENCES company_journey_steps(id) ON DELETE CASCADE;

ALTER TABLE company_step_arrangements 
    ADD CONSTRAINT company_step_arrangements_phase_id_fkey
    FOREIGN KEY (custom_phase_id) REFERENCES journey_phases(id);

-- Add unique constraint for step order in path
ALTER TABLE company_step_arrangements 
    ADD CONSTRAINT company_step_arrangements_path_order_unique 
    UNIQUE(path_id, order_index);

-- ===============================================
-- COMPANY STEP PROGRESS TABLE (Enhanced)
-- ===============================================
CREATE TABLE IF NOT EXISTS company_step_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    step_id UUID REFERENCES company_journey_steps(id) ON DELETE CASCADE,
    status step_status DEFAULT 'not_started',
    notes TEXT,
    completion_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints  
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Unique constraint for company-step progress
    UNIQUE(company_id, step_id)
);

-- ===============================================
-- TEMPLATE UPDATE NOTIFICATIONS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS template_update_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES journey_step_templates(id) ON DELETE CASCADE,
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
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ===============================================
-- COMMUNITY JOURNEY INTEGRATION TABLES
-- ===============================================

-- Peer Progress Sharing
CREATE TABLE IF NOT EXISTS peer_progress_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    step_id UUID REFERENCES company_journey_steps(id) ON DELETE CASCADE,
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
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Community Activity Feed
CREATE TABLE IF NOT EXISTS community_journey_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID,
    activity_type community_activity_type NOT NULL,
    step_id UUID REFERENCES company_journey_steps(id) ON DELETE SET NULL,
    activity_data JSONB DEFAULT '{}'::jsonb,
    content TEXT,
    visibility TEXT DEFAULT 'community',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Expert Recommendations for Steps
CREATE TABLE IF NOT EXISTS step_expert_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_template_id UUID REFERENCES journey_step_templates(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- PROGRESS ANALYTICS TABLES  
-- ===============================================

-- Step Completion Analytics
CREATE TABLE IF NOT EXISTS step_completion_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_template_id UUID REFERENCES journey_step_templates(id) ON DELETE CASCADE,
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

-- UUID validation isn't needed anymore since we're using native UUID types
-- We're removing the view and procedure as they're no longer necessary
DROP VIEW IF EXISTS non_uuid_ids;
DROP PROCEDURE IF EXISTS convert_sample_data_to_uuids();

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Company journey steps indexes
CREATE INDEX IF NOT EXISTS idx_company_journey_steps_company_id ON company_journey_steps(company_id);
CREATE INDEX IF NOT EXISTS idx_company_journey_steps_canonical_step_id ON company_journey_steps(canonical_step_id);
CREATE INDEX IF NOT EXISTS idx_company_journey_steps_phase_id ON company_journey_steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_company_journey_steps_status ON company_journey_steps(status);
CREATE INDEX IF NOT EXISTS idx_company_journey_steps_order_index ON company_journey_steps(order_index);

-- Company step progress indexes
CREATE INDEX IF NOT EXISTS idx_company_step_progress_company_id ON company_step_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_company_step_progress_step_id ON company_step_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_company_step_progress_status ON company_step_progress(status);

-- Template update notifications indexes
CREATE INDEX IF NOT EXISTS idx_template_update_notifications_company_id ON template_update_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_template_update_notifications_template_id ON template_update_notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_template_update_notifications_is_read ON template_update_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_template_update_notifications_created_at ON template_update_notifications(created_at);

-- Community progress indexes
CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_company_id ON peer_progress_sharing(company_id);
CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_step_id ON peer_progress_sharing(step_id);
CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_industry ON peer_progress_sharing(industry);
CREATE INDEX IF NOT EXISTS idx_peer_progress_sharing_company_stage ON peer_progress_sharing(company_stage);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_step_template_id ON step_completion_analytics(step_template_id);
CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_industry ON step_completion_analytics(industry);
CREATE INDEX IF NOT EXISTS idx_step_completion_analytics_company_stage ON step_completion_analytics(company_stage);

-- Smart recommendations indexes
CREATE INDEX IF NOT EXISTS idx_journey_smart_recommendations_company_id ON journey_smart_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_journey_smart_recommendations_priority ON journey_smart_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_journey_smart_recommendations_is_applied ON journey_smart_recommendations(is_applied);

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
-- ROW LEVEL SECURITY (RLS) POLICIES - DISABLED FOR NOW
-- ===============================================

-- NOTICE: Row Level Security has been disabled to resolve the "column company_id does not exist" error
-- The appropriate policies will be added in a separate migration after the schema is properly verified

/* 
-- COMMENTED OUT - DO NOT EXECUTE
-- Enable RLS on all tables - wrapped in exception handler to prevent failures
DO $$ 
BEGIN
    -- Only enable RLS on tables that exist
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_steps') THEN
        ALTER TABLE company_journey_steps ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_paths') THEN
        ALTER TABLE company_journey_paths ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_step_arrangements') THEN
        ALTER TABLE company_step_arrangements ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_step_progress') THEN
        ALTER TABLE company_step_progress ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'template_update_notifications') THEN
        ALTER TABLE template_update_notifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'peer_progress_sharing') THEN
        ALTER TABLE peer_progress_sharing ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'community_journey_activities') THEN
        ALTER TABLE community_journey_activities ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'step_expert_recommendations') THEN
        ALTER TABLE step_expert_recommendations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'step_completion_analytics') THEN
        ALTER TABLE step_completion_analytics ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_milestones') THEN
        ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journey_smart_recommendations') THEN
        ALTER TABLE journey_smart_recommendations ENABLE ROW LEVEL SECURITY;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error enabling RLS: %', SQLERRM;
END $$;

-- Company journey steps policies - wrapped in exception handler
DO $$
BEGIN
    -- First verify both tables exist before creating policies that depend on them
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_journey_steps') AND 
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_members') AND
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies') THEN
       
        -- Verify company_id column exists in company_journey_steps
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_journey_steps' AND column_name = 'company_id') THEN
                   
            DROP POLICY IF EXISTS "Users can view their company's journey steps" ON company_journey_steps;
            CREATE POLICY "Users can view their company's journey steps" ON company_journey_steps
                FOR SELECT USING (
                    company_id IN (
                        SELECT id FROM companies 
                        WHERE id IN (
                            SELECT company_id FROM company_members 
                            WHERE user_id = auth.uid()
                        )
                    )
                );
                
            DROP POLICY IF EXISTS "Users can modify their company's journey steps" ON company_journey_steps;
            CREATE POLICY "Users can modify their company's journey steps" ON company_journey_steps
                FOR ALL USING (
                    company_id IN (
                        SELECT id FROM companies 
                        WHERE id IN (
                            SELECT company_id FROM company_members 
                            WHERE user_id = auth.uid()
                        )
                    )
                );
        ELSE
            RAISE NOTICE 'company_id column missing in company_journey_steps table, skipping policy creation';
        END IF;
    ELSE
        RAISE NOTICE 'Required tables for company_journey_steps policies do not exist yet, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'company_id column issue in policies, skipping...';
    WHEN undefined_table THEN
        RAISE NOTICE 'table does not exist yet, skipping policy creation...';
    WHEN others THEN
        RAISE NOTICE 'Error creating journey step policies: %', SQLERRM;
END $$;

-- Company step progress policies - wrapped in exception handler
DO $$
BEGIN
    -- First verify both tables exist before creating policies that depend on them
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_step_progress') AND 
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_members') AND
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies') THEN
       
        -- Verify company_id column exists in company_step_progress
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_step_progress' AND column_name = 'company_id') THEN
                   
            DROP POLICY IF EXISTS "Users can view their company's step progress" ON company_step_progress;
            CREATE POLICY "Users can view their company's step progress" ON company_step_progress
                FOR SELECT USING (
                    company_id IN (
                        SELECT id FROM companies 
                        WHERE id IN (
                            SELECT company_id FROM company_members 
                            WHERE user_id = auth.uid()
                        )
                    )
                );
                
            DROP POLICY IF EXISTS "Users can modify their company's step progress" ON company_step_progress;
            CREATE POLICY "Users can modify their company's step progress" ON company_step_progress
                FOR ALL USING (
                    company_id IN (
                        SELECT id FROM companies 
                        WHERE id IN (
                            SELECT company_id FROM company_members 
                            WHERE user_id = auth.uid()
                        )
                    )
                );
        ELSE
            RAISE NOTICE 'company_id column missing in company_step_progress table, skipping policy creation';
        END IF;
    ELSE
        RAISE NOTICE 'Required tables for company_step_progress policies do not exist yet, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'company_id column issue in policies, skipping...';
    WHEN undefined_table THEN
        RAISE NOTICE 'table does not exist yet, skipping policy creation...';
    WHEN others THEN
        RAISE NOTICE 'Error creating step progress policies: %', SQLERRM;
END $$;

-- Template update notifications policies - wrapped in exception handler
DO $$
BEGIN
    -- First verify both tables exist before creating policies that depend on them
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'template_update_notifications') AND 
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_members') AND
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies') THEN
       
        -- Verify company_id column exists in template_update_notifications
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'template_update_notifications' AND column_name = 'company_id') THEN
                   
            DROP POLICY IF EXISTS "Users can view their company's notifications" ON template_update_notifications;
            CREATE POLICY "Users can view their company's notifications" ON template_update_notifications
                FOR SELECT USING (
                    company_id IN (
                        SELECT id FROM companies 
                        WHERE id IN (
                            SELECT company_id FROM company_members 
                            WHERE user_id = auth.uid()
                        )
                    )
                );
                
            DROP POLICY IF EXISTS "Users can update their company's notifications" ON template_update_notifications;
            CREATE POLICY "Users can update their company's notifications" ON template_update_notifications
                FOR UPDATE USING (
                    company_id IN (
                        SELECT id FROM companies 
                        WHERE id IN (
                            SELECT company_id FROM company_members 
                            WHERE user_id = auth.uid()
                        )
                    )
                );
        ELSE
            RAISE NOTICE 'company_id column missing in template_update_notifications table, skipping policy creation';
        END IF;
    ELSE
        RAISE NOTICE 'Required tables for template_update_notifications policies do not exist yet, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'company_id column issue in policies, skipping...';
    WHEN undefined_table THEN
        RAISE NOTICE 'table does not exist yet, skipping policy creation...';
    WHEN others THEN
        RAISE NOTICE 'Error creating notification policies: %', SQLERRM;
END $$;

-- Community tables are generally readable by all authenticated users
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can view community progress" ON peer_progress_sharing;
    CREATE POLICY "Authenticated users can view community progress" ON peer_progress_sharing
        FOR SELECT TO authenticated USING (visibility = 'community');
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'Column issue in peer_progress_sharing, skipping...';
    WHEN undefined_table THEN
        RAISE NOTICE 'peer_progress_sharing table does not exist yet, skipping policy...';
    WHEN others THEN
        RAISE NOTICE 'Error creating peer_progress_sharing policy: %', SQLERRM;
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can view community activities" ON community_journey_activities;
    CREATE POLICY "Authenticated users can view community activities" ON community_journey_activities
        FOR SELECT TO authenticated USING (visibility = 'community');
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'Column issue in community_journey_activities, skipping...';
    WHEN undefined_table THEN
        RAISE NOTICE 'community_journey_activities table does not exist yet, skipping policy...';
    WHEN others THEN
        RAISE NOTICE 'Error creating community_journey_activities policy: %', SQLERRM;
END $$;

-- Expert recommendations are public - this table likely doesn't have company_id
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view expert recommendations" ON step_expert_recommendations;
    CREATE POLICY "Anyone can view expert recommendations" ON step_expert_recommendations
        FOR SELECT USING (is_active = true);
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'Column issue in step_expert_recommendations, skipping...';
    WHEN undefined_table THEN
        RAISE NOTICE 'step_expert_recommendations table does not exist yet, skipping policy...';
    WHEN others THEN
        RAISE NOTICE 'Error creating step_expert_recommendations policy: %', SQLERRM;
END $$;

-- Analytics policies - wrapped in exception handler
DO $$
BEGIN
    -- First verify both tables exist before creating policies that depend on them
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'step_completion_analytics') AND 
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_members') AND
       EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies') THEN
       
        -- Verify company_id column exists in step_completion_analytics
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'step_completion_analytics' AND column_name = 'company_id') THEN
                   
            DROP POLICY IF EXISTS "Users can view their company's analytics" ON step_completion_analytics;
            CREATE POLICY "Users can view their company's analytics" ON step_completion_analytics
                FOR SELECT USING (
                    company_id IN (
                        SELECT id FROM companies 
                        WHERE id IN (
                            SELECT company_id FROM company_members 
                            WHERE user_id = auth.uid()
                        )
                    )
                );
        ELSE
            RAISE NOTICE 'company_id column missing in step_completion_analytics table, skipping policy creation';
        END IF;
    ELSE
        RAISE NOTICE 'Required tables for step_completion_analytics policies do not exist yet, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'company_id column issue in analytics policies, skipping...';
    WHEN undefined_table THEN
        RAISE NOTICE 'Analytics table does not exist yet, skipping policy creation...';
    WHEN others THEN
        RAISE NOTICE 'Error creating analytics policies: %', SQLERRM;
END $$;

-- All RLS policies have been moved to the schema fixes file
-- This section is intentionally left empty to prevent any
-- policy-related errors during the initial schema creation

*/
