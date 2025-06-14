-- Company Management Enhancements Migration
-- Date: 2025-05-17

-- 1. Enhance company_members table
alter table company_members
  add column if not exists user_email text,
  add column if not exists title text,
  add column if not exists department text,
  add column if not exists invitation_status text default 'accepted',
  add column if not exists invited_by uuid,
  add column if not exists invited_at timestamptz,
  add column if not exists accepted_at timestamptz;

-- 2. Create company_roles table (custom roles per company)
create table if not exists company_roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  description text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 3. Create company_permissions table (permissions per role)
create table if not exists company_permissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  role_id uuid references company_roles(id) on delete cascade,
  permission text not null,
  created_at timestamptz default now()
);

-- 4. Add RLS policies for company_members
alter table company_members enable row level security;

-- Allow members to see their own company memberships
create policy if not exists "Members can view their company memberships"
  on company_members
  for select
  using (user_id = auth.uid());

-- Allow company admins/owners to manage members (example, should be extended)
create policy if not exists "Admins can manage company members"
  on company_members
  for all
  using (
    exists (
      select 1 from company_members as cm
      where cm.company_id = company_members.company_id
        and cm.user_id = auth.uid()
        and (cm.role = 'admin' or cm.role = 'owner')
    )
  );

-- 5. Add audit logging trigger (basic version)
create table if not exists audit_log (
  id bigserial primary key,
  table_name text,
  action text,
  record_id uuid,
  user_id uuid,
  changed_at timestamptz default now(),
  details jsonb
);

create or replace function log_company_member_changes()
returns trigger as $$
begin
  insert into audit_log (table_name, action, record_id, user_id, details)
  values (
    'company_members',
    TG_OP,
    NEW.id,
    auth.uid(),
    to_jsonb(NEW)
  );
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists company_member_audit on company_members;
create trigger company_member_audit
  after insert or update or delete on company_members
  for each row execute function log_company_member_changes();

-- 6. Indexes for performance
create index if not exists idx_company_members_company_id on company_members(company_id);
create index if not exists idx_company_roles_company_id on company_roles(company_id);
create index if not exists idx_company_permissions_company_id on company_permissions(company_id);

-- 7. Invitation status enum (optional, for stricter typing)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'invitation_status') then
    create type invitation_status as enum ('pending', 'accepted', 'declined', 'revoked');
  end if;
end$$;

alter table company_members
  alter column invitation_status drop default,
  alter column invitation_status type invitation_status using invitation_status::invitation_status,
  alter column invitation_status set default 'accepted';

-- 8. Add default roles if not present (admin, member, guest)
insert into company_roles (company_id, name, description, is_default)
select c.id, r.name, r.description, true
from companies c
cross join (values
  ('admin', 'Administrator with full permissions'),
  ('member', 'Standard member'),
  ('guest', 'Limited access guest')
) as r(name, description)
on conflict do nothing;

-- End of migration
