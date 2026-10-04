-- Berberim.com core schema (review draft only; not applied).
-- This migration intentionally contains no onboarding, trial, seed/demo, or public-booking logic.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.organization_role as enum ('owner', 'admin', 'staff');
create type public.appointment_status as enum ('confirmed', 'completed', 'cancelled', 'no_show');

-- 1. Organizations: each business is an isolated tenant.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$'),
  business_type text not null check (business_type in (
    'mens_barber', 'womens_hair', 'beauty_salon', 'unisex_salon', 'hair_salon', 'other'
  )),
  custom_business_type text,
  phone text,
  email text,
  address text,
  city text,
  logo_url text check (logo_url is null or logo_url ~* '^https?://'),
  timezone text not null default 'Europe/Istanbul',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint organizations_custom_type_check
    check (business_type <> 'other' or nullif(btrim(custom_business_type), '') is not null)
);

-- 2. Organization memberships.
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, id)
);
create unique index organization_members_active_unique
  on public.organization_members (organization_id, user_id)
  where deleted_at is null;
create index organization_members_user_idx
  on public.organization_members (user_id, organization_id)
  where deleted_at is null;

-- 3. Services offered by an organization.
create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text,
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  price numeric(10,2) not null default 0 check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, id)
);
create index services_org_active_idx
  on public.services (organization_id, active)
  where deleted_at is null;

-- 4. Staff members; role is free-form to support mixed-specialty teams.
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  phone text,
  role text not null default 'Uzman' check (char_length(btrim(role)) between 1 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, id)
);
create index staff_org_active_idx
  on public.staff (organization_id, active)
  where deleted_at is null;

-- 5. Staff/service relation includes organization_id to enforce same-tenant links.
create table public.staff_services (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid not null,
  service_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, staff_id, service_id),
  foreign key (organization_id, staff_id)
    references public.staff (organization_id, id) on delete cascade,
  foreign key (organization_id, service_id)
    references public.services (organization_id, id) on delete cascade
);
create index staff_services_service_idx
  on public.staff_services (organization_id, service_id);

-- 6. Weekly business/staff hours. PostgreSQL DOW: 0=Sun ... 6=Sat.
-- staff_id NULL means organization-wide hours; a staff row is that person's schedule.
create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  constraint working_hours_range check (start_time < end_time),
  foreign key (organization_id, staff_id)
    references public.staff (organization_id, id) on delete cascade
);
create unique index working_hours_org_day_unique
  on public.working_hours (organization_id, day_of_week)
  where staff_id is null;
create unique index working_hours_staff_day_unique
  on public.working_hours (organization_id, staff_id, day_of_week)
  where staff_id is not null;
create index working_hours_org_day_idx
  on public.working_hours (organization_id, day_of_week, staff_id);

-- 7. Recurring weekly breaks; staff_id NULL applies to the organization.
create table public.breaks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint breaks_range check (start_time < end_time),
  foreign key (organization_id, staff_id)
    references public.staff (organization_id, id) on delete cascade
);
create index breaks_org_day_idx
  on public.breaks (organization_id, day_of_week, staff_id);

-- 8. Specific-date staff leave/time off.
create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint time_off_range check (start_at < end_at),
  foreign key (organization_id, staff_id)
    references public.staff (organization_id, id) on delete cascade
);
create index time_off_staff_range_idx
  on public.time_off using gist (organization_id, staff_id, tstzrange(start_at, end_at, '[)'));

-- 9. Customers are tenant-specific; phone uniqueness is tenant-scoped.
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  phone text not null check (char_length(btrim(phone)) between 1 and 32),
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, id)
);
create unique index customers_org_phone_active_unique
  on public.customers (organization_id, phone)
  where deleted_at is null;
create index customers_org_name_idx
  on public.customers (organization_id, name)
  where deleted_at is null;

-- 10. Appointments. Composite FKs prevent cross-organization references.
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid not null,
  service_id uuid not null,
  customer_id uuid not null,
  customer_name text not null check (char_length(btrim(customer_name)) between 1 and 120),
  customer_phone text not null check (char_length(btrim(customer_phone)) between 1 and 32),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint appointments_range check (start_at < end_at),
  foreign key (organization_id, staff_id)
    references public.staff (organization_id, id),
  foreign key (organization_id, service_id)
    references public.services (organization_id, id),
  foreign key (organization_id, customer_id)
    references public.customers (organization_id, id),
  constraint appointments_no_staff_overlap
    exclude using gist (
      staff_id with =,
      tstzrange(start_at, end_at, '[)') with &&
    ) where (status <> 'cancelled' and deleted_at is null)
);
create index appointments_org_start_idx
  on public.appointments (organization_id, start_at)
  where deleted_at is null;
create index appointments_staff_start_idx
  on public.appointments (organization_id, staff_id, start_at)
  where deleted_at is null;
create index appointments_customer_idx
  on public.appointments (organization_id, customer_id, start_at desc)
  where deleted_at is null;

-- Minimal trigger to keep updated_at synchronized on mutable entities.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger organizations_set_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger organization_members_set_updated_at before update on public.organization_members
  for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger staff_set_updated_at before update on public.staff
  for each row execute function public.set_updated_at();
create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- Minimal private helpers prevent recursive RLS checks on organization_members.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    join public.organizations o on o.id = m.organization_id
    where m.organization_id = target_org
      and m.user_id = (select auth.uid())
      and m.deleted_at is null
      and o.deleted_at is null
  );
$$;

create function private.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    join public.organizations o on o.id = m.organization_id
    where m.organization_id = target_org
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin')
      and m.deleted_at is null
      and o.deleted_at is null
  );
$$;
revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.is_org_admin(uuid) from public;
grant execute on function private.is_org_member(uuid), private.is_org_admin(uuid) to authenticated;

-- RLS: access is based on tenant membership, never on a client-supplied organization id alone.
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_services enable row level security;
alter table public.working_hours enable row level security;
alter table public.breaks enable row level security;
alter table public.time_off enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;

create policy organizations_read_member_or_owner
  on public.organizations for select to authenticated
  using (deleted_at is null and (owner_user_id = (select auth.uid()) or private.is_org_member(id)));
create policy organizations_insert_owner
  on public.organizations for insert to authenticated
  with check (owner_user_id = (select auth.uid()));
create policy organizations_update_admin
  on public.organizations for update to authenticated
  using (private.is_org_admin(id))
  with check (private.is_org_admin(id));

create policy organization_members_read_member
  on public.organization_members for select to authenticated
  using (deleted_at is null and private.is_org_member(organization_id));
create policy organization_members_insert_owner_or_admin
  on public.organization_members for insert to authenticated
  with check (
    (user_id = (select auth.uid()) and role = 'owner' and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_user_id = (select auth.uid()) and o.deleted_at is null
    ))
    or (private.is_org_admin(organization_id) and role <> 'owner')
  );
create policy organization_members_update_admin
  on public.organization_members for update to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy services_read_member
  on public.services for select to authenticated
  using (deleted_at is null and private.is_org_member(organization_id));
create policy services_write_admin
  on public.services for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy staff_read_member
  on public.staff for select to authenticated
  using (deleted_at is null and private.is_org_member(organization_id));
create policy staff_write_admin
  on public.staff for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy staff_services_read_member
  on public.staff_services for select to authenticated
  using (private.is_org_member(organization_id));
create policy staff_services_write_admin
  on public.staff_services for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (
    private.is_org_admin(organization_id)
    and exists (
      select 1 from public.staff s
      where s.organization_id = staff_services.organization_id
        and s.id = staff_services.staff_id and s.deleted_at is null
    )
    and exists (
      select 1 from public.services v
      where v.organization_id = staff_services.organization_id
        and v.id = staff_services.service_id and v.deleted_at is null
    )
  );

create policy working_hours_read_member
  on public.working_hours for select to authenticated
  using (private.is_org_member(organization_id));
create policy working_hours_write_admin
  on public.working_hours for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy breaks_read_member
  on public.breaks for select to authenticated
  using (private.is_org_member(organization_id));
create policy breaks_write_admin
  on public.breaks for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy time_off_read_member
  on public.time_off for select to authenticated
  using (private.is_org_member(organization_id));
create policy time_off_write_admin
  on public.time_off for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy customers_read_member
  on public.customers for select to authenticated
  using (deleted_at is null and private.is_org_member(organization_id));
create policy customers_insert_member
  on public.customers for insert to authenticated
  with check (private.is_org_member(organization_id));
create policy customers_update_admin
  on public.customers for update to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy appointments_read_member
  on public.appointments for select to authenticated
  using (deleted_at is null and private.is_org_member(organization_id));
create policy appointments_insert_member
  on public.appointments for insert to authenticated
  with check (private.is_org_member(organization_id));
create policy appointments_update_member
  on public.appointments for update to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

-- No anon/public access policy in this core schema.
-- Column-level grants prevent normal clients from changing tenant ownership or roles.
grant select, insert on public.organizations to authenticated;
grant update (name, slug, business_type, custom_business_type, phone, email, address, city, logo_url, updated_at, deleted_at)
  on public.organizations to authenticated;

grant select, insert on public.organization_members to authenticated;
grant update (deleted_at, updated_at) on public.organization_members to authenticated;

grant select, insert on public.services to authenticated;
grant update (name, description, duration_minutes, price, active, updated_at, deleted_at)
  on public.services to authenticated;

grant select, insert on public.staff to authenticated;
grant update (name, phone, role, active, updated_at, deleted_at)
  on public.staff to authenticated;

grant select, insert, delete on public.staff_services to authenticated;
grant select, insert, update, delete on public.working_hours, public.breaks, public.time_off to authenticated;
grant select, insert on public.customers to authenticated;
grant update (name, phone, email, notes, updated_at, deleted_at) on public.customers to authenticated;
grant select, insert on public.appointments to authenticated;
grant update (status, notes, updated_at, deleted_at) on public.appointments to authenticated;
