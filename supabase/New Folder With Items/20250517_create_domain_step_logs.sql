-- Migration: Create domain_step_logs table for auditing all step customizations

create table if not exists domain_step_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  domain_id uuid references business_domains(id) on delete cascade,
  step_id uuid references journey_steps(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  action text not null check (action in ('add', 'remove', 'edit')),
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_domain_step_logs_company_id on domain_step_logs(company_id);
create index if not exists idx_domain_step_logs_domain_id on domain_step_logs(domain_id);
create index if not exists idx_domain_step_logs_step_id on domain_step_logs(step_id);
create index if not exists idx_domain_step_logs_user_id on domain_step_logs(user_id);
create index if not exists idx_domain_step_logs_action on domain_step_logs(action);
