-- supabase/migrations/20250609_add_journey_management_tables.sql

-- Phases (e.g., Company Setup, Planning, Pre-launch)
CREATE TABLE phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Domains (e.g., Marketing, Finance, Product)
CREATE TABLE domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Master step templates (reusable definitions)
CREATE TABLE step_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  base_description text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Steps (specific instances at the intersection of phase and domain)
CREATE TABLE steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES step_templates(id),
  phase_id uuid REFERENCES phases(id),
  domain_id uuid REFERENCES domains(id),
  name text NOT NULL, -- Can be customized from template
  description text, -- Can be customized from template
  why_this_now text,
  estimated_time text,
  effort_difficulty text,
  order_index integer NOT NULL,
  depends_on uuid[], -- Array of step IDs
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(phase_id, domain_id, template_id)
);

-- Tasks within steps
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid REFERENCES steps(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Tools library
CREATE TABLE tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  website_url text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Step-Tool relationships (many-to-many)
CREATE TABLE step_tools (
  step_id uuid REFERENCES steps(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  is_recommended boolean DEFAULT false,
  usage_notes text,
  PRIMARY KEY (step_id, tool_id)
);
