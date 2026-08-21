-- First-party, non-PII website analytics for the private developer dashboard.
-- Run this migration in Supabase before enabling first-party event reporting.
create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_category text not null default 'engagement',
  path text not null default '/',
  session_id text not null,
  source text not null default 'direct',
  medium text,
  campaign text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint analytics_events_name_length check (char_length(event_name) between 1 and 64),
  constraint analytics_events_path_length check (char_length(path) between 1 and 500),
  constraint analytics_events_session_length check (char_length(session_id) between 8 and 128),
  constraint analytics_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);
create index if not exists analytics_events_path_created_at_idx
  on public.analytics_events (path, created_at desc);
create index if not exists analytics_events_source_created_at_idx
  on public.analytics_events (source, created_at desc);

alter table public.analytics_events enable row level security;
revoke all on table public.analytics_events from anon, authenticated;
grant all on table public.analytics_events to service_role;

-- Queryable first-touch/last-touch fields for CRM and Ads attribution.
alter table public.leads add column if not exists submission_id uuid default gen_random_uuid();
alter table public.leads add column if not exists landing_path text;
alter table public.leads add column if not exists referrer text;
alter table public.leads add column if not exists utm_source text;
alter table public.leads add column if not exists utm_medium text;
alter table public.leads add column if not exists utm_campaign text;
alter table public.leads add column if not exists utm_term text;
alter table public.leads add column if not exists utm_content text;
alter table public.leads add column if not exists gclid text;
alter table public.leads add column if not exists gbraid text;
alter table public.leads add column if not exists wbraid text;
alter table public.leads add column if not exists status text not null default 'new';
alter table public.leads add column if not exists first_contacted_at timestamptz;
alter table public.leads add column if not exists last_contacted_at timestamptz;

create unique index if not exists leads_submission_id_idx on public.leads (submission_id);
create index if not exists leads_status_created_at_idx on public.leads (status, created_at desc);
create index if not exists leads_read_created_at_idx on public.leads (read, created_at desc);
create index if not exists leads_source_created_at_idx on public.leads (source, created_at desc);

alter table public.meetings add column if not exists submission_id uuid default gen_random_uuid();
alter table public.meetings add column if not exists source text not null default 'meeting-page';
alter table public.meetings add column if not exists landing_path text;
alter table public.meetings add column if not exists referrer text;
alter table public.meetings add column if not exists utm_source text;
alter table public.meetings add column if not exists utm_medium text;
alter table public.meetings add column if not exists utm_campaign text;
alter table public.meetings add column if not exists gclid text;

create unique index if not exists meetings_submission_id_idx on public.meetings (submission_id);
create index if not exists meetings_status_created_at_idx on public.meetings (status, created_at desc);
create index if not exists meetings_date_status_idx on public.meetings (date, status);
