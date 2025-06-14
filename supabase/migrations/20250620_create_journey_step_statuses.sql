-- Migration: Create Journey Step Statuses Table
-- Description: Creates a table to store all possible step statuses and their display properties

-- Create the journey_step_statuses table
CREATE TABLE IF NOT EXISTS journey_step_statuses (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color_class TEXT NOT NULL,
  show_in_side_panel BOOLEAN NOT NULL DEFAULT false,
  show_in_most_recent BOOLEAN NOT NULL DEFAULT false,
  show_in_active BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE journey_step_statuses IS 'Stores all possible step statuses and their display properties';

-- Insert default statuses
INSERT INTO journey_step_statuses 
  (id, label, description, icon, color_class, show_in_side_panel, show_in_most_recent, show_in_active, order_index, is_system)
VALUES
  ('not_started', 'Not Started', 'Step has been added but work has not begun', 'AlertCircle', 'bg-gray-100 text-gray-800', true, false, true, 1, true),
  ('active', 'In Progress', 'Work is currently being done on this step', 'Clock', 'bg-blue-100 text-blue-800', true, true, true, 2, true),
  ('complete', 'Completed', 'All work for this step has been finished', 'CheckCircle', 'bg-green-100 text-green-800', false, false, false, 3, true),
  ('skipped', 'Skipped', 'Step was intentionally skipped', 'AlertTriangle', 'bg-yellow-100 text-yellow-800', false, false, false, 4, true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_journey_step_statuses_updated_at
BEFORE UPDATE ON journey_step_statuses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add a check constraint to ensure the id is lowercase and contains only letters, numbers, and underscores
ALTER TABLE journey_step_statuses
ADD CONSTRAINT journey_step_statuses_id_format
CHECK (id ~ '^[a-z0-9_]+$');

-- Create a view to make it easier to query statuses for different UI components
CREATE OR REPLACE VIEW journey_step_statuses_view AS
SELECT 
  id,
  label,
  description,
  icon,
  color_class,
  show_in_side_panel,
  show_in_most_recent,
  show_in_active,
  order_index
FROM journey_step_statuses
ORDER BY order_index;

-- Create specific views for each UI component
CREATE OR REPLACE VIEW journey_step_statuses_side_panel AS
SELECT id, label, icon, color_class, order_index
FROM journey_step_statuses
WHERE show_in_side_panel = true
ORDER BY order_index;

CREATE OR REPLACE VIEW journey_step_statuses_most_recent AS
SELECT id, label, icon, color_class, order_index
FROM journey_step_statuses
WHERE show_in_most_recent = true
ORDER BY order_index;

CREATE OR REPLACE VIEW journey_step_statuses_active AS
SELECT id, label, icon, color_class, order_index
FROM journey_step_statuses
WHERE show_in_active = true
ORDER BY order_index;

-- Add RLS policies
ALTER TABLE journey_step_statuses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage statuses (in a real app, you'd restrict this to admins)
CREATE POLICY journey_step_statuses_admin_policy
ON journey_step_statuses
FOR ALL
TO authenticated
USING (true);

-- Allow all users to read statuses
CREATE POLICY journey_step_statuses_read_policy
ON journey_step_statuses
FOR SELECT
TO authenticated
USING (true);

-- Add foreign key constraint to company_journey_steps_new table
ALTER TABLE company_journey_steps_new
ADD CONSTRAINT fk_company_journey_steps_new_status
FOREIGN KEY (status)
REFERENCES journey_step_statuses(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;
