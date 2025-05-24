-- Sprint 4: Add reminders table for scheduled/recurring notifications (BOH-403.1)
-- Created: 2025-05-10

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'task_due', 'custom', etc.
  title TEXT NOT NULL,
  body TEXT,
  schedule TEXT NOT NULL, -- cron expression or interval (e.g., '0 9 * * *' or 'daily')
  next_run TIMESTAMP WITH TIME ZONE NOT NULL,
  channels TEXT[] DEFAULT ARRAY['in-app'], -- e.g., ['in-app', 'email', 'slack']
  is_active BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_company_id ON reminders(company_id);
CREATE INDEX IF NOT EXISTS idx_reminders_next_run ON reminders(next_run);
