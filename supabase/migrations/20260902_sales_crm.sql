-- Central sales CRM for website enquiries and the internal sales team.
-- Apply this migration in the Supabase SQL editor before opening /admin/leads.
create extension if not exists pgcrypto;

-- Keep team access in the same allow-list already used by NextAuth.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'staff',
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists role text not null default 'staff';
alter table public.admin_users add column if not exists display_name text;
alter table public.admin_users add column if not exists active boolean not null default true;
alter table public.admin_users add column if not exists created_at timestamptz not null default now();
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();

create unique index if not exists admin_users_email_lower_idx
  on public.admin_users (lower(email));
create index if not exists admin_users_active_role_idx
  on public.admin_users (active, role);

-- Ten active employees are supported in addition to owner/admin accounts.
create or replace function public.crm_enforce_staff_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_staff_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('spectra-crm-active-staff-limit'));

  select count(*)
    into active_staff_count
    from public.admin_users
   where active = true
     and lower(coalesce(role, 'staff')) not in ('owner', 'admin', 'superadmin');

  if active_staff_count > 10 then
    raise exception 'The CRM supports a maximum of 10 active employees.';
  end if;

  return new;
end;
$$;

drop trigger if exists crm_admin_users_staff_limit on public.admin_users;
create trigger crm_admin_users_staff_limit
after insert or update of active, role on public.admin_users
for each row execute function public.crm_enforce_staff_limit();

-- CRM fields added to every website lead. Existing leads remain website leads.
alter table public.leads add column if not exists status text not null default 'new';
alter table public.leads add column if not exists first_contacted_at timestamptz;
alter table public.leads add column if not exists last_contacted_at timestamptz;
alter table public.leads add column if not exists origin text not null default 'website';
alter table public.leads add column if not exists priority text not null default 'medium';
alter table public.leads add column if not exists assigned_to text;
alter table public.leads add column if not exists created_by text;
alter table public.leads add column if not exists created_by_name text;
alter table public.leads add column if not exists created_by_email text;
alter table public.leads add column if not exists last_modified_by text;
alter table public.leads add column if not exists last_modified_name text;
alter table public.leads add column if not exists last_modified_email text;
alter table public.leads add column if not exists next_follow_up_at timestamptz;
alter table public.leads add column if not exists last_activity_at timestamptz;
alter table public.leads add column if not exists estimated_value numeric(14, 2);

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'leads_crm_origin_check'
       and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_crm_origin_check
      check (origin in ('website', 'manual', 'import'));
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'leads_crm_priority_check'
       and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_crm_priority_check
      check (priority in ('low', 'medium', 'high', 'urgent'));
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'leads_crm_estimated_value_check'
       and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_crm_estimated_value_check
      check (estimated_value is null or estimated_value >= 0);
  end if;
end;
$$;

update public.leads
   set last_activity_at = coalesce(last_activity_at, updated_at, created_at)
 where last_activity_at is null;

create index if not exists leads_assigned_status_idx
  on public.leads (assigned_to, status, created_at desc);
create index if not exists leads_created_by_idx
  on public.leads (created_by, created_at desc);
create index if not exists leads_follow_up_idx
  on public.leads (next_follow_up_at)
  where next_follow_up_at is not null;
create index if not exists leads_last_activity_idx
  on public.leads (last_activity_at desc);

-- A booked website meeting is also a sales lead, so both inboxes stay unified.
alter table public.meetings add column if not exists source text not null default 'meeting-page';
alter table public.meetings add column if not exists lead_id uuid
  references public.leads(id) on delete set null;
create index if not exists meetings_lead_id_idx on public.meetings (lead_id);

-- Append-only work log: calls, WhatsApp, emails, meetings, notes and system changes.
create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  activity_type text not null,
  body text not null default '',
  outcome text not null default '',
  actor_id text,
  actor_name text not null default 'System',
  actor_email text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint lead_activities_type_length check (char_length(activity_type) between 1 and 50),
  constraint lead_activities_body_length check (char_length(body) <= 4000),
  constraint lead_activities_outcome_length check (char_length(outcome) <= 500),
  constraint lead_activities_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists lead_activities_lead_created_idx
  on public.lead_activities (lead_id, created_at desc);
create index if not exists lead_activities_actor_created_idx
  on public.lead_activities (actor_id, created_at desc);
create index if not exists lead_activities_created_idx
  on public.lead_activities (created_at desc);

create or replace function public.crm_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_touch_admin_users_updated_at on public.admin_users;
create trigger crm_touch_admin_users_updated_at
before update on public.admin_users
for each row execute function public.crm_touch_updated_at();

drop trigger if exists crm_touch_leads_updated_at on public.leads;
create trigger crm_touch_leads_updated_at
before update on public.leads
for each row execute function public.crm_touch_updated_at();

create or replace function public.crm_touch_lead_from_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leads
     set last_activity_at = new.created_at,
         first_contacted_at = case
           when new.activity_type in ('note', 'created', 'updated', 'status_change', 'assignment', 'follow_up')
             then first_contacted_at
           else coalesce(first_contacted_at, new.created_at)
         end,
         last_contacted_at = case
           when new.activity_type in ('note', 'created', 'updated', 'status_change', 'assignment', 'follow_up')
             then last_contacted_at
           else new.created_at
         end,
         read = case
           when new.activity_type in ('note', 'created', 'updated', 'status_change', 'assignment', 'follow_up')
             then read
           else true
         end,
         last_modified_by = coalesce(new.actor_id, last_modified_by),
         last_modified_name = coalesce(nullif(new.actor_name, ''), last_modified_name),
         last_modified_email = coalesce(nullif(new.actor_email, ''), last_modified_email)
   where id = new.lead_id;
  return new;
end;
$$;

drop trigger if exists crm_activity_touch_lead on public.lead_activities;
create trigger crm_activity_touch_lead
after insert on public.lead_activities
for each row execute function public.crm_touch_lead_from_activity();

create or replace function public.crm_log_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  activity_actor_name text;
  activity_actor_email text;
begin
  if new.created_by is null then
    activity_actor_name := 'Website';
    activity_actor_email := '';
  else
    activity_actor_name := nullif(new.created_by_name, '');
    activity_actor_email := nullif(new.created_by_email, '');

    select
      coalesce(activity_actor_name, nullif(display_name, ''), email),
      coalesce(activity_actor_email, email)
      into activity_actor_name, activity_actor_email
      from public.admin_users
     where user_id::text = new.created_by
     limit 1;

    activity_actor_name := coalesce(activity_actor_name, 'Team member');
    activity_actor_email := coalesce(activity_actor_email, '');
  end if;

  insert into public.lead_activities (
    lead_id,
    activity_type,
    body,
    actor_id,
    actor_name,
    actor_email,
    metadata
  ) values (
    new.id,
    'created',
    case
      when new.origin = 'manual' then 'Lead added manually to the CRM.'
      when new.origin = 'import' then 'Lead imported into the CRM.'
      else 'New lead received from the website.'
    end,
    new.created_by,
    activity_actor_name,
    activity_actor_email,
    jsonb_build_object('source', coalesce(new.source, ''), 'origin', new.origin)
  );

  return new;
end;
$$;

drop trigger if exists crm_log_new_lead on public.leads;
create trigger crm_log_new_lead
after insert on public.leads
for each row execute function public.crm_log_new_lead();

create or replace function public.crm_log_lead_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  change_type text := 'updated';
  change_body text := 'Lead details updated.';
  change_metadata jsonb := '{}'::jsonb;
begin
  if old.status is distinct from new.status then
    change_type := 'status_change';
    change_body := 'Stage changed from ' || coalesce(old.status, 'new') || ' to ' || new.status || '.';
    change_metadata := change_metadata || jsonb_build_object(
      'status', jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  if old.assigned_to is distinct from new.assigned_to then
    if change_type = 'updated' then
      change_type := 'assignment';
      change_body := case
        when new.assigned_to is null then 'Lead was unassigned.'
        else 'Lead assignment changed.'
      end;
    end if;
    change_metadata := change_metadata || jsonb_build_object(
      'assigned_to', jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to)
    );
  end if;

  if old.next_follow_up_at is distinct from new.next_follow_up_at then
    if change_type = 'updated' then
      change_type := 'follow_up';
      change_body := case
        when new.next_follow_up_at is null then 'Follow-up marked complete.'
        else 'Next follow-up scheduled.'
      end;
    end if;
    change_metadata := change_metadata || jsonb_build_object(
      'next_follow_up_at',
      jsonb_build_object('from', old.next_follow_up_at, 'to', new.next_follow_up_at)
    );
  end if;

  if old.priority is distinct from new.priority then
    change_metadata := change_metadata || jsonb_build_object(
      'priority', jsonb_build_object('from', old.priority, 'to', new.priority)
    );
  end if;

  if old.estimated_value is distinct from new.estimated_value then
    change_metadata := change_metadata || jsonb_build_object(
      'estimated_value', jsonb_build_object('from', old.estimated_value, 'to', new.estimated_value)
    );
  end if;

  if old.name is distinct from new.name
     or old.email is distinct from new.email
     or old.phone is distinct from new.phone
     or old.company is distinct from new.company
     or old.machine_interest is distinct from new.machine_interest
     or old.message is distinct from new.message then
    change_metadata := change_metadata || jsonb_build_object('contact_details_updated', true);
  end if;

  insert into public.lead_activities (
    lead_id,
    activity_type,
    body,
    actor_id,
    actor_name,
    actor_email,
    metadata
  ) values (
    new.id,
    change_type,
    change_body,
    new.last_modified_by,
    coalesce(nullif(new.last_modified_name, ''), 'System'),
    coalesce(new.last_modified_email, ''),
    change_metadata
  );

  return new;
end;
$$;

drop trigger if exists crm_log_lead_update on public.leads;
create trigger crm_log_lead_update
after update of
  status,
  priority,
  assigned_to,
  next_follow_up_at,
  estimated_value,
  name,
  email,
  phone,
  company,
  machine_interest,
  message
on public.leads
for each row execute function public.crm_log_lead_update();

create or replace function public.crm_link_meeting_to_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_lead_id uuid;
begin
  if new.lead_id is not null then
    return new;
  end if;

  insert into public.leads (
    name,
    email,
    phone,
    company,
    product_id,
    category_id,
    machine_interest,
    message,
    source,
    origin,
    priority
  ) values (
    new.name,
    new.email,
    new.phone,
    new.company,
    new.product_id,
    new.category_id,
    new.machine_interest,
    coalesce(nullif(new.message, ''), 'Meeting requested for ' || new.date || ' at ' || new.time),
    coalesce(nullif(new.source, ''), 'meeting-page'),
    'website',
    'high'
  ) returning id into linked_lead_id;

  update public.meetings set lead_id = linked_lead_id where id = new.id;

  insert into public.lead_activities (
    lead_id,
    activity_type,
    body,
    actor_name,
    metadata
  ) values (
    linked_lead_id,
    'meeting',
    'Customer booked a website meeting for ' || new.date || ' at ' || new.time || '.',
    'Website',
    jsonb_build_object(
      'meeting_id', new.id,
      'meeting_date', new.date,
      'meeting_time', new.time,
      'meeting_link', coalesce(new.meeting_link, '')
    )
  );

  return new;
end;
$$;

drop trigger if exists crm_link_meeting_to_lead on public.meetings;
create trigger crm_link_meeting_to_lead
after insert on public.meetings
for each row execute function public.crm_link_meeting_to_lead();

-- Bring historic meeting enquiries into the same CRM once, without duplicates.
do $$
declare
  meeting_record record;
  linked_lead_id uuid;
begin
  for meeting_record in
    select * from public.meetings where lead_id is null order by created_at
  loop
    insert into public.leads (
      name,
      email,
      phone,
      company,
      product_id,
      category_id,
      machine_interest,
      message,
      source,
      origin,
      priority,
      created_at
    ) values (
      meeting_record.name,
      meeting_record.email,
      meeting_record.phone,
      meeting_record.company,
      meeting_record.product_id,
      meeting_record.category_id,
      meeting_record.machine_interest,
      coalesce(
        nullif(meeting_record.message, ''),
        'Meeting requested for ' || meeting_record.date || ' at ' || meeting_record.time
      ),
      coalesce(nullif(meeting_record.source, ''), 'meeting-page'),
      'website',
      'high',
      meeting_record.created_at
    ) returning id into linked_lead_id;

    update public.meetings
       set lead_id = linked_lead_id
     where id = meeting_record.id;

    insert into public.lead_activities (
      lead_id,
      activity_type,
      body,
      actor_name,
      metadata,
      created_at
    ) values (
      linked_lead_id,
      'meeting',
      'Customer booked a website meeting for ' || meeting_record.date || ' at ' || meeting_record.time || '.',
      'Website',
      jsonb_build_object(
        'meeting_id', meeting_record.id,
        'meeting_date', meeting_record.date,
        'meeting_time', meeting_record.time,
        'meeting_link', coalesce(meeting_record.meeting_link, '')
      ),
      meeting_record.created_at
    );
  end loop;
end;
$$;

alter table public.admin_users enable row level security;
alter table public.lead_activities enable row level security;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.lead_activities from anon, authenticated;
grant all on table public.admin_users to service_role;
grant all on table public.lead_activities to service_role;

comment on table public.lead_activities is
  'Private CRM audit timeline. Read and written only through authenticated server endpoints.';
