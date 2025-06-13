-- Sprint 4: Drag-and-Drop, Journey Sharing, and Notifications
-- Created: May 4, 2025

-- 4. Drag and Drop Functionality

-- Table: custom_step_arrangements
-- For persistent custom ordering of steps
CREATE TABLE IF NOT EXISTS custom_step_arrangements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: custom_step_order
-- For storing the actual order of steps in a custom arrangement
CREATE TABLE IF NOT EXISTS custom_step_order (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arrangement_id UUID NOT NULL REFERENCES custom_step_arrangements(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  custom_phase_id UUID, -- For custom phases/categories
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(arrangement_id, step_id)
);

-- Table: custom_phases
-- For user-defined phases or categories
CREATE TABLE IF NOT EXISTS custom_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: step_batch_operations
-- For tracking batch operations on multiple steps
CREATE TABLE IF NOT EXISTS step_batch_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL, -- 'move', 'status_change', 'add_to_collection', etc.
  affected_steps UUID[] NOT NULL,
  source_arrangement_id UUID REFERENCES custom_step_arrangements(id) ON DELETE SET NULL,
  target_arrangement_id UUID REFERENCES custom_step_arrangements(id) ON DELETE SET NULL,
  operation_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Journey Sharing Capabilities

-- Table: shared_journey_reports
-- For shareable progress reports
CREATE TABLE IF NOT EXISTS shared_journey_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  included_phases UUID[] DEFAULT '{}', -- NULL means all phases
  included_steps UUID[] DEFAULT '{}', -- NULL means all steps
  access_type TEXT NOT NULL CHECK (access_type IN ('public', 'company', 'private', 'specific_users')),
  allowed_users UUID[] DEFAULT '{}',
  display_options JSONB DEFAULT '{}'::JSONB,
  expiration_date TIMESTAMPTZ,
  public_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: shared_journey_exports
-- For exports in different formats
CREATE TABLE IF NOT EXISTS shared_journey_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES shared_journey_reports(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'csv', 'json', 'pptx', 'xlsx')),
  file_url TEXT NOT NULL,
  size_bytes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  download_count INT DEFAULT 0
);

-- Table: step_recommendations
-- For recommendations shared between team members
CREATE TABLE IF NOT EXISTS step_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  context_note TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  response_note TEXT,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: step_recommendation_groups
-- For batch sharing of multiple steps
CREATE TABLE IF NOT EXISTS step_recommendation_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: step_recommendation_group_items
-- For individual steps in a recommendation group
CREATE TABLE IF NOT EXISTS step_recommendation_group_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES step_recommendation_groups(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES step_recommendations(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  UNIQUE(group_id, recommendation_id)
);

-- 6. Advanced Notification System

-- Table: notification_preferences
-- For user notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'step_completed', 'comment_added', 'step_recommended', etc.
  channels TEXT[] DEFAULT '{"in_app"}', -- 'in_app', 'email', 'mobile'
  is_enabled BOOLEAN DEFAULT TRUE,
  batch_frequency TEXT DEFAULT 'instant' CHECK (batch_frequency IN ('instant', 'hourly', 'daily', 'weekly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, company_id, event_type)
);

-- Table: notifications
-- For storing notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  resource_type TEXT, -- 'step', 'comment', 'recommendation', etc.
  resource_id UUID,
  action_url TEXT, -- URL to navigate to when clicking the notification
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  delivered_channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: notification_batches
-- For grouping notifications for batch delivery
CREATE TABLE IF NOT EXISTS notification_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_type TEXT NOT NULL CHECK (batch_type IN ('hourly', 'daily', 'weekly')),
  notification_ids UUID[] NOT NULL,
  is_delivered BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: smart_alerts
-- For intelligent notifications based on patterns and thresholds
CREATE TABLE IF NOT EXISTS smart_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'milestone_proximity', 'stalled_progress', 'team_activity', etc.
  config JSONB NOT NULL, -- Configuration specific to the alert type
  is_enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: smart_alert_conditions
-- For complex conditions that trigger alerts
CREATE TABLE IF NOT EXISTS smart_alert_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES smart_alerts(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL, -- 'time_elapsed', 'count_threshold', 'percentage_change', etc.
  condition_params JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE custom_step_arrangements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_step_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_batch_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_journey_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_journey_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_recommendation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_recommendation_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alert_conditions ENABLE ROW LEVEL SECURITY;

-- Simplified policies that don't depend on company_access table
-- These should be updated when the company_access table is available

-- Policy for custom_step_arrangements
CREATE POLICY custom_step_arrangements_basic_access ON custom_step_arrangements
  FOR ALL USING (TRUE);

-- Policy for custom_step_order
CREATE POLICY custom_step_order_basic_access ON custom_step_order
  FOR ALL USING (TRUE);

-- Policy for custom_phases
CREATE POLICY custom_phases_basic_access ON custom_phases
  FOR ALL USING (TRUE);

-- Policy for step_batch_operations
CREATE POLICY step_batch_operations_basic_access ON step_batch_operations
  FOR ALL USING (TRUE);

-- Policy for shared_journey_reports - simplified for basic access
CREATE POLICY shared_journey_reports_creator_access ON shared_journey_reports
  FOR ALL USING (creator_id = auth.uid() OR TRUE);

-- Additional policy for reading shared reports
CREATE POLICY shared_journey_reports_reader_access ON shared_journey_reports
  FOR SELECT USING (
    access_type = 'public' OR
    (access_type = 'specific_users' AND auth.uid() = ANY(allowed_users))
  );

-- Policy for shared_journey_exports - simplified to avoid company_access dependency
CREATE POLICY shared_journey_exports_access ON shared_journey_exports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shared_journey_reports sjr
      WHERE shared_journey_exports.report_id = sjr.id AND
      (sjr.creator_id = auth.uid() OR
       sjr.access_type = 'public' OR
       (sjr.access_type = 'specific_users' AND auth.uid() = ANY(sjr.allowed_users)) OR
       (sjr.access_type = 'company' AND TRUE) -- Allow all company reports for now
      )
    )
  );

-- Policy for step_recommendations - simplified basic access
CREATE POLICY step_recommendations_basic_access ON step_recommendations
  FOR ALL USING (TRUE);

-- Additional policy for recipients
CREATE POLICY step_recommendations_recipient_access ON step_recommendations
  FOR SELECT USING (
    recipient_id = auth.uid()
  );

-- Policy for step_recommendation_groups - simplified basic access
CREATE POLICY step_recommendation_groups_basic_access ON step_recommendation_groups
  FOR ALL USING (TRUE);

-- Policy for step_recommendation_group_items - simplified basic access
CREATE POLICY step_recommendation_group_items_basic_access ON step_recommendation_group_items
  FOR ALL USING (TRUE);

-- Policy for notification_preferences (users only see their own)
CREATE POLICY notification_preferences_user_access ON notification_preferences
  FOR ALL USING (
    user_id = auth.uid()
  );

-- Policy for notifications (users only see their own)
CREATE POLICY notifications_user_access ON notifications
  FOR ALL USING (
    user_id = auth.uid()
  );

-- Policy for notification_batches (users only see their own)
CREATE POLICY notification_batches_user_access ON notification_batches
  FOR ALL USING (
    user_id = auth.uid()
  );

-- Policy for smart_alerts - simplified basic access
CREATE POLICY smart_alerts_basic_access ON smart_alerts
  FOR ALL USING (TRUE);

-- Policy for smart_alert_conditions - simplified basic access
CREATE POLICY smart_alert_conditions_basic_access ON smart_alert_conditions
  FOR ALL USING (TRUE);

-- Functions

-- Function to create default user notification preferences
CREATE OR REPLACE FUNCTION create_default_notification_preferences(
  p_user_id UUID,
  p_company_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_event_types TEXT[] := ARRAY[
    'step_completed', 
    'step_status_changed', 
    'comment_added', 
    'comment_replied',
    'step_recommended', 
    'milestone_reached',
    'team_activity_digest',
    'feedback_addressed'
  ];
  v_event_type TEXT;
BEGIN
  FOREACH v_event_type IN ARRAY v_event_types
  LOOP
    INSERT INTO notification_preferences (
      user_id, company_id, event_type,
      channels, is_enabled, batch_frequency
    )
    VALUES (
      p_user_id, p_company_id, v_event_type,
      ARRAY['in_app', 'email'], TRUE, 
      CASE 
        WHEN v_event_type IN ('team_activity_digest') THEN 'daily'
        ELSE 'instant'
      END
    )
    ON CONFLICT (user_id, company_id, event_type)
    DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Skip the company_access trigger for now since that table doesn't exist yet
-- Will need to add it back when company_access table is available

-- Commented out trigger function:
-- CREATE OR REPLACE FUNCTION create_notification_preferences_on_company_access()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   PERFORM create_default_notification_preferences(NEW.user_id, NEW.company_id);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER create_notification_preferences_trigger
-- AFTER INSERT ON company_access
-- FOR EACH ROW
-- EXECUTE FUNCTION create_notification_preferences_on_company_access();

-- Function to send a notification based on preferences
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_company_id UUID,
  p_event_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
  v_should_batch BOOLEAN;
BEGIN
  -- Get user's preferences for this event type
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id
    AND company_id = p_company_id
    AND event_type = p_event_type;

  -- If no preferences or notifications disabled, don't send anything
  IF v_preferences IS NULL OR NOT v_preferences.is_enabled THEN
    RETURN NULL;
  END IF;

  -- Check if we should batch this notification
  v_should_batch := v_preferences.batch_frequency != 'instant';

  -- Create the notification
  INSERT INTO notifications (
    user_id, company_id, event_type,
    title, body, resource_type, resource_id,
    action_url, priority,
    delivered_channels -- Will be updated when actually delivered
  )
  VALUES (
    p_user_id, p_company_id, p_event_type,
    p_title, p_body, p_resource_type, p_resource_id,
    p_action_url, p_priority,
    CASE WHEN v_should_batch THEN '{}' ELSE ARRAY['in_app'] END
  )
  RETURNING id INTO v_notification_id;

  -- If batching is enabled, add to appropriate batch
  IF v_should_batch THEN
    -- For now, just record that we need to batch
    -- In a real system, we'd have a separate service scheduling these batches
    INSERT INTO notification_batches (
      user_id, company_id, batch_type,
      notification_ids, scheduled_for
    )
    VALUES (
      p_user_id, p_company_id, v_preferences.batch_frequency,
      ARRAY[v_notification_id],
      CASE
        WHEN v_preferences.batch_frequency = 'hourly' THEN
          date_trunc('hour', NOW()) + INTERVAL '1 hour'
        WHEN v_preferences.batch_frequency = 'daily' THEN
          date_trunc('day', NOW()) + INTERVAL '1 day' + INTERVAL '8 hours'
        WHEN v_preferences.batch_frequency = 'weekly' THEN
          date_trunc('week', NOW()) + INTERVAL '1 week' + INTERVAL '8 hours'
        ELSE NOW() -- Shouldn't happen
      END
    )
    ON CONFLICT (id) DO UPDATE SET
      notification_ids = notification_batches.notification_ids || excluded.notification_ids;
  END IF;

  -- In a real system, we'd now send to other channels like email
  -- based on the preferences.channels array

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  UPDATE notifications
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id
  RETURNING TRUE INTO v_success;
  
  RETURN COALESCE(v_success, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to mark multiple notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_notification_ids UUID[],
  p_user_id UUID
)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE notifications
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE id = ANY(p_notification_ids) AND user_id = p_user_id
  RETURNING COUNT(*) INTO v_count;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create a step recommendation
CREATE OR REPLACE FUNCTION recommend_step(
  p_company_id UUID,
  p_sender_id UUID,
  p_recipient_id UUID,
  p_step_id UUID,
  p_context_note TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  v_recommendation_id UUID;
BEGIN
  -- Create the recommendation
  INSERT INTO step_recommendations (
    company_id, sender_id, recipient_id, step_id,
    context_note, priority, status
  )
  VALUES (
    p_company_id, p_sender_id, p_recipient_id, p_step_id,
    p_context_note, p_priority, 'pending'
  )
  RETURNING id INTO v_recommendation_id;
  
  -- Send a notification to the recipient
  PERFORM send_notification(
    p_recipient_id,
    p_company_id,
    'step_recommended',
    'Step Recommendation',
    (SELECT name FROM journey_steps WHERE id = p_step_id) || ' has been recommended to you',
    'recommendation',
    v_recommendation_id,
    '/step/' || p_step_id,
    p_priority
  );
  
  RETURN v_recommendation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate a shareable link for a journey report
CREATE OR REPLACE FUNCTION generate_journey_report_link(
  p_report_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_base_url TEXT := 'https://app.thewheel.com/shared/';
BEGIN
  -- Generate a random token
  SELECT encode(gen_random_bytes(12), 'hex') INTO v_token;
  
  -- Update the report with the new token
  UPDATE shared_journey_reports
  SET public_token = v_token
  WHERE id = p_report_id;
  
  -- Return the full link
  RETURN v_base_url || v_token;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX IF NOT EXISTS custom_step_order_arrangement_id_idx ON custom_step_order(arrangement_id);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notification_batches_scheduled_idx ON notification_batches(scheduled_for) WHERE is_delivered = FALSE;
CREATE INDEX IF NOT EXISTS step_recommendations_recipient_idx ON step_recommendations(recipient_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS shared_journey_reports_public_token_idx ON shared_journey_reports(public_token) WHERE public_token IS NOT NULL;
