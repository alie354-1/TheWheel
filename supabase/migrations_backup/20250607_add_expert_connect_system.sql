-- Migration for Expert Connect System
-- This migration adds tables for expert connection requests, sessions, and availability

-- Table for expert connection requests
CREATE TABLE IF NOT EXISTS expert_connect_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  expertise_area TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS expert_connect_requests_requester_id_idx ON expert_connect_requests(requester_id);
CREATE INDEX IF NOT EXISTS expert_connect_requests_expert_id_idx ON expert_connect_requests(expert_id);
CREATE INDEX IF NOT EXISTS expert_connect_requests_status_idx ON expert_connect_requests(status);

-- Table for expert sessions
CREATE TABLE IF NOT EXISTS expert_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connect_request_id UUID NOT NULL REFERENCES expert_connect_requests(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_title TEXT,
  session_goals TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS expert_sessions_expert_id_idx ON expert_sessions(expert_id);
CREATE INDEX IF NOT EXISTS expert_sessions_requester_id_idx ON expert_sessions(requester_id);
CREATE INDEX IF NOT EXISTS expert_sessions_status_idx ON expert_sessions(status);
CREATE INDEX IF NOT EXISTS expert_sessions_scheduled_at_idx ON expert_sessions(scheduled_at);

-- Table for expert availability
CREATE TABLE IF NOT EXISTS expert_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL, -- Format: HH:MM (24-hour)
  end_time TEXT NOT NULL, -- Format: HH:MM (24-hour)
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(expert_id, day_of_week, start_time, end_time)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS expert_availability_expert_id_idx ON expert_availability(expert_id);
CREATE INDEX IF NOT EXISTS expert_availability_day_of_week_idx ON expert_availability(day_of_week);

-- RLS Policies for expert_connect_requests
ALTER TABLE expert_connect_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own connection requests (as requester or expert)
CREATE POLICY "Users can view their own connection requests"
  ON expert_connect_requests
  FOR SELECT
  USING (
    auth.uid() = requester_id OR
    auth.uid() = expert_id
  );

-- Users can create connection requests
CREATE POLICY "Users can create connection requests"
  ON expert_connect_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id
  );

-- Experts can update connection requests directed to them
CREATE POLICY "Experts can update connection requests directed to them"
  ON expert_connect_requests
  FOR UPDATE
  USING (
    auth.uid() = expert_id
  );

-- RLS Policies for expert_sessions
ALTER TABLE expert_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions (as requester or expert)
CREATE POLICY "Users can view their own sessions"
  ON expert_sessions
  FOR SELECT
  USING (
    auth.uid() = requester_id OR
    auth.uid() = expert_id
  );

-- Experts can create sessions
CREATE POLICY "Experts can create sessions"
  ON expert_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() = expert_id
  );

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON expert_sessions
  FOR UPDATE
  USING (
    auth.uid() = requester_id OR
    auth.uid() = expert_id
  );

-- RLS Policies for expert_availability
ALTER TABLE expert_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view expert availability
CREATE POLICY "Anyone can view expert availability"
  ON expert_availability
  FOR SELECT
  USING (
    TRUE
  );

-- Experts can manage their own availability
CREATE POLICY "Experts can manage their own availability"
  ON expert_availability
  FOR ALL
  USING (
    auth.uid() = expert_id
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_expert_connect_requests_updated_at
BEFORE UPDATE ON expert_connect_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_sessions_updated_at
BEFORE UPDATE ON expert_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_availability_updated_at
BEFORE UPDATE ON expert_availability
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
