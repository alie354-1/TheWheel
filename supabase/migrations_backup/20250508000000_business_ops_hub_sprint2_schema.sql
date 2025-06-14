-- Migration for Business Operations Hub Sprint 2
-- This adds the necessary database schema changes to support:
-- - Domain customization and organization
-- - Task reordering and priority management
-- - Domain relationships and dependencies
-- - Notifications and alerts

-- Update business_domains table with ordering and archiving
ALTER TABLE business_domains
ADD COLUMN IF NOT EXISTS order_index FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_icon TEXT,
ADD COLUMN IF NOT EXISTS custom_color TEXT,
ADD COLUMN IF NOT EXISTS company_id UUID;

COMMENT ON COLUMN business_domains.order_index IS 'Floating point index for domain ordering, allows reordering without renumbering all domains';
COMMENT ON COLUMN business_domains.is_archived IS 'Flag to indicate if domain is archived (soft deleted) but preserved for restoration';
COMMENT ON COLUMN business_domains.custom_icon IS 'Custom icon identifier for the domain';
COMMENT ON COLUMN business_domains.custom_color IS 'Custom color code for the domain (hex, rgb, etc.)';
COMMENT ON COLUMN business_domains.company_id IS 'Reference to company that owns this domain, if company-specific';

-- Create index on order_index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_business_domains_order ON business_domains(order_index ASC);
-- Create index on is_archived for efficient filtering
CREATE INDEX IF NOT EXISTS idx_business_domains_archived ON business_domains(is_archived);
-- Create index on company_id for efficient company filtering
CREATE INDEX IF NOT EXISTS idx_business_domains_company_id ON business_domains(company_id);

-- Update domain_steps table with priority ordering
ALTER TABLE domain_steps
ADD COLUMN IF NOT EXISTS priority_order FLOAT DEFAULT 0;

COMMENT ON COLUMN domain_steps.priority_order IS 'Floating point index for task ordering within a domain, allows reordering without renumbering';

-- Create index on priority_order for efficient sorting
CREATE INDEX IF NOT EXISTS idx_domain_steps_priority ON domain_steps(priority_order ASC);

-- Create domain relationships table for domain dependency visualization
CREATE TABLE IF NOT EXISTS domain_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_domain_id UUID NOT NULL REFERENCES business_domains(id) ON DELETE CASCADE,
    target_domain_id UUID NOT NULL REFERENCES business_domains(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    description TEXT,
    strength INTEGER DEFAULT 1, -- 1-10 scale for relationship strength/importance
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Prevent duplicate relationships of same type between same domains
    CONSTRAINT unique_domain_relationship UNIQUE (source_domain_id, target_domain_id, relationship_type)
);

COMMENT ON TABLE domain_relationships IS 'Stores relationships and dependencies between business domains';
COMMENT ON COLUMN domain_relationships.relationship_type IS 'Type of relationship: depends_on, informs, blocks, etc.';
COMMENT ON COLUMN domain_relationships.strength IS 'Strength of relationship on a scale of 1-10';
COMMENT ON COLUMN domain_relationships.metadata IS 'Additional relationship metadata as JSON';

-- Create indexes for efficient relationship queries
CREATE INDEX IF NOT EXISTS idx_domain_relationships_source ON domain_relationships(source_domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_relationships_target ON domain_relationships(target_domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_relationships_type ON domain_relationships(relationship_type);

-- Create domain notifications table
CREATE TABLE IF NOT EXISTS domain_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES business_domains(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT NOT NULL DEFAULT 'unread', -- unread, read, dismissed
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE domain_notifications IS 'Stores notifications and alerts related to business domains';
COMMENT ON COLUMN domain_notifications.notification_type IS 'Type of notification: task_overdue, status_change, goal_achieved, etc.';
COMMENT ON COLUMN domain_notifications.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN domain_notifications.status IS 'Status: unread, read, dismissed';
COMMENT ON COLUMN domain_notifications.action_url IS 'URL to navigate to when notification is clicked';
COMMENT ON COLUMN domain_notifications.metadata IS 'Additional notification metadata as JSON';

-- Create indexes for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_domain_notifications_domain ON domain_notifications(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_notifications_user ON domain_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_notifications_status ON domain_notifications(status);
CREATE INDEX IF NOT EXISTS idx_domain_notifications_priority ON domain_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_domain_notifications_created ON domain_notifications(created_at DESC);

-- Check if notification_preferences table exists and potentially missing columns
DO $$
BEGIN
    -- Check if the table already exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification_preferences'
    ) THEN
        -- Check if the notification_type column doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notification_preferences' 
            AND column_name = 'notification_type'
        ) THEN
            -- Add the missing column
            EXECUTE 'ALTER TABLE notification_preferences ADD COLUMN notification_type TEXT NOT NULL DEFAULT ''*''';
        END IF;
        
        -- Check if min_priority column doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notification_preferences' 
            AND column_name = 'min_priority'
        ) THEN
            -- Add the missing column
            EXECUTE 'ALTER TABLE notification_preferences ADD COLUMN min_priority TEXT DEFAULT ''low''';
        END IF;
        
        -- Check if email_enabled column doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notification_preferences' 
            AND column_name = 'email_enabled'
        ) THEN
            -- Add the missing column
            EXECUTE 'ALTER TABLE notification_preferences ADD COLUMN email_enabled BOOLEAN DEFAULT true';
        END IF;
        
        -- Check if in_app_enabled column doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notification_preferences' 
            AND column_name = 'in_app_enabled'
        ) THEN
            -- Add the missing column
            EXECUTE 'ALTER TABLE notification_preferences ADD COLUMN in_app_enabled BOOLEAN DEFAULT true';
        END IF;
        
        -- Check if push_enabled column doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notification_preferences' 
            AND column_name = 'push_enabled'
        ) THEN
            -- Add the missing column
            EXECUTE 'ALTER TABLE notification_preferences ADD COLUMN push_enabled BOOLEAN DEFAULT false';
        END IF;
    END IF;
END
$$;

-- Now create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT false,
    min_priority TEXT DEFAULT 'low', -- low, medium, high, urgent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_notification_preference UNIQUE (user_id, notification_type)
);

COMMENT ON TABLE notification_preferences IS 'Stores user preferences for notifications';
COMMENT ON COLUMN notification_preferences.notification_type IS 'Type of notification or * for all types';
COMMENT ON COLUMN notification_preferences.min_priority IS 'Minimum priority level to trigger notification';

-- Create index for efficient preference lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- Add triggers to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
DROP TRIGGER IF EXISTS set_timestamp ON business_domains;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON business_domains
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON domain_relationships;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON domain_relationships
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON notification_preferences;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS Policies
-- Enable Row Level Security
ALTER TABLE domain_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for domain relationships
CREATE POLICY domain_relationships_company_access
    ON domain_relationships
    USING (EXISTS (
        SELECT 1 FROM business_domains bd
        JOIN companies c ON bd.company_id = c.id
        WHERE bd.id = domain_relationships.source_domain_id
        AND is_in_same_company(c.id)
    ));

-- Policy for domain notifications
CREATE POLICY domain_notifications_user_access
    ON domain_notifications
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM business_domains bd
        JOIN companies c ON bd.company_id = c.id
        WHERE bd.id = domain_notifications.domain_id
        AND is_in_same_company(c.id)
    ));

-- Policy for notification preferences
CREATE POLICY notification_preferences_user_access
    ON notification_preferences
    USING (user_id = auth.uid());

-- Function to get priority tasks for a domain
CREATE OR REPLACE FUNCTION get_priority_tasks(p_domain_id UUID, p_limit INTEGER DEFAULT 3)
RETURNS SETOF domain_steps AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM domain_steps
    WHERE domain_id = p_domain_id
    ORDER BY 
        CASE WHEN status = 'in_progress' THEN 0
             WHEN status = 'blocked' THEN 1
             WHEN status = 'to_do' THEN 2
             ELSE 3
        END,
        priority_order ASC,
        due_date ASC NULLS LAST,
        created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder domains
CREATE OR REPLACE FUNCTION reorder_domains(p_domains JSONB)
RETURNS VOID AS $$
DECLARE
    domain_record JSONB;
BEGIN
    FOR domain_record IN SELECT * FROM jsonb_array_elements(p_domains)
    LOOP
        UPDATE business_domains
        SET order_index = (domain_record->>'order_index')::FLOAT
        WHERE id = (domain_record->>'id')::UUID;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder tasks
CREATE OR REPLACE FUNCTION reorder_tasks(p_tasks JSONB)
RETURNS VOID AS $$
DECLARE
    task_record JSONB;
BEGIN
    FOR task_record IN SELECT * FROM jsonb_array_elements(p_tasks)
    LOOP
        UPDATE domain_steps
        SET priority_order = (task_record->>'priority_order')::FLOAT,
            status = COALESCE((task_record->>'status')::TEXT, status)
        WHERE id = (task_record->>'id')::UUID;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a domain notification
CREATE OR REPLACE FUNCTION create_domain_notification(
    p_domain_id UUID,
    p_users JSONB, -- Array of user IDs to notify
    p_title TEXT,
    p_message TEXT,
    p_notification_type TEXT,
    p_priority TEXT DEFAULT 'medium',
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS SETOF domain_notifications AS $$
DECLARE
    current_user_id UUID;
    notification_id UUID;
BEGIN
    FOR current_user_id IN SELECT (json_array_elements_text(p_users::JSON))::UUID
    LOOP
        -- Check user notification preferences
        IF EXISTS (
            SELECT 1 FROM notification_preferences np
            WHERE np.user_id = current_user_id
            AND (np.notification_type = p_notification_type OR np.notification_type = '*')
            AND np.in_app_enabled = true
            AND (
                (np.min_priority = 'low') OR
                (np.min_priority = 'medium' AND p_priority IN ('medium', 'high', 'urgent')) OR
                (np.min_priority = 'high' AND p_priority IN ('high', 'urgent')) OR
                (np.min_priority = 'urgent' AND p_priority = 'urgent')
            )
        ) THEN
            INSERT INTO domain_notifications (
                domain_id, user_id, title, message, notification_type,
                priority, action_url, metadata
            ) VALUES (
                p_domain_id, current_user_id, p_title, p_message, p_notification_type,
                p_priority, p_action_url, p_metadata
            )
            RETURNING id INTO notification_id;
            
            RETURN QUERY SELECT * FROM domain_notifications WHERE id = notification_id;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
