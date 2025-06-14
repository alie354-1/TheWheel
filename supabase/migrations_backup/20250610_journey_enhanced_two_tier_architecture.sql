-- ===============================================
-- JOURNEY ENHANCED TWO-TIER ARCHITECTURE
-- ===============================================
-- This migration implements the enhanced two-tier architecture for the journey system
-- Canonical Framework vs Company-Specific Implementation
-- Date: June 10, 2025

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

-- ===============================================
-- COMPANY JOURNEY STEPS TABLE (Enhanced)
-- ===============================================
CREATE TABLE IF NOT EXISTS company_journey_steps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
    canonical_step_id TEXT REFERENCES journey_steps(id),
    name TEXT NOT NULL,
    description TEXT,
    phase_id TEXT REFERENCES journey_phases(id),
    domain_id TEXT REFERENCES journey_domains(id),
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Unique constraint for default path per company
    UNIQUE(company_id, is_default) WHERE is_default = TRUE
);

-- ===============================================
-- COMPANY STEP ARRANGEMENTS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS company_step_arrangements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
    path_id TEXT REFERENCES company_journey_paths(id) ON DELETE CASCADE,
    step_id TEXT REFERENCES company_journey_steps(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    custom_phase_id TEXT REFERENCES journey_phases(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Unique constraint for step order in path
    UNIQUE(path_id, order_index)
);

-- ===============================================
-- COMPANY STEP PROGRESS TABLE (Enhanced)
-- ===============================================
CREATE TABLE IF NOT EXISTS company_step_progress (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
    step_id TEXT REFERENCES company_journey_steps(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    template_id TEXT REFERENCES journey_step_templates(id) ON DELETE CASCADE,
    company_id TEXT,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
    step_id TEXT REFERENCES company_journey_steps(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
    user_id TEXT,
    activity_type community_activity_type NOT NULL,
    step_id TEXT REFERENCES company_journey_steps(id) ON DELETE SET NULL,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    step_template_id TEXT REFERENCES journey_step_templates(id) ON DELETE CASCADE,
    expert_id TEXT,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    step_template_id TEXT REFERENCES journey_step_templates(id) ON DELETE CASCADE,
    company_id TEXT,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL,
    recommendation_type TEXT NOT NULL, -- 'next_step', 'optimization', 'resource', 'expert'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    estimated_impact TEXT,
    action_items TEXT[] DEFAULT '{}',
    related_step_ids TEXT[],
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE company_journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_journey_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_step_arrangements ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_update_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_progress_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_journey_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_expert_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_completion_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_smart_recommendations ENABLE ROW LEVEL SECURITY;

-- Company journey steps policies
CREATE POLICY "Users can view their company's journey steps" ON company_journey_steps
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can modify their company's journey steps" ON company_journey_steps
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Company step progress policies
CREATE POLICY "Users can view their company's step progress" ON company_step_progress
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can modify their company's step progress" ON company_step_progress
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Template update notifications policies
CREATE POLICY "Users can view their company's notifications" ON template_update_notifications
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their company's notifications" ON template_update_notifications
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Community tables are generally readable by all authenticated users
CREATE POLICY "Authenticated users can view community progress" ON peer_progress_sharing
    FOR SELECT TO authenticated USING (visibility = 'community');

CREATE POLICY "Authenticated users can view community activities" ON community_journey_activities
    FOR SELECT TO authenticated USING (visibility = 'community');

-- Expert recommendations are public
CREATE POLICY "Anyone can view expert recommendations" ON step_expert_recommendations
    FOR SELECT USING (is_active = true);

-- Analytics policies (company-specific data)
CREATE POLICY "Users can view their company's analytics" ON step_completion_analytics
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Journey milestones policies
CREATE POLICY "Users can view their company's milestones" ON journey_milestones
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Smart recommendations policies
CREATE POLICY "Users can view their company's recommendations" ON journey_smart_recommendations
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their company's recommendations" ON journey_smart_recommendations
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM company_members 
            WHERE user_id = auth.uid()
        )
    );
