-- Create step_instances table to support multiple uses of a step template in different phases/domains
create table if not exists step_instances (
  id uuid primary key default uuid_generate_v4(),
  step_template_id uuid not null references step_templates(id) on delete cascade,
  phase_id uuid not null references journey_phases(id) on delete cascade,
  domain_id uuid not null references domains(id) on delete cascade,
  position integer default 0,
  config jsonb,
  created_at timestamptz default now()
);

-- Indexes for efficient lookup
create index if not exists idx_step_instances_phase on step_instances(phase_id);
create index if not exists idx_step_instances_domain on step_instances(domain_id);
create index if not exists idx_step_instances_template on step_instances(step_template_id);
