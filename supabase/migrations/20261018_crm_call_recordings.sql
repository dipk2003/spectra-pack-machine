begin;

alter table public.crm_call_requests
  add column if not exists recording_url text,
  add column if not exists recording_id text,
  add column if not exists recording_duration_seconds integer,
  add column if not exists recording_received_at timestamptz;

alter table public.crm_call_requests
  drop constraint if exists crm_call_recording_duration_check;
alter table public.crm_call_requests
  add constraint crm_call_recording_duration_check
  check (recording_duration_seconds is null or recording_duration_seconds between 0 and 10800);

comment on column public.crm_call_requests.recording_url is
  'Private CRM reference to the Plivo recording; do not expose from public APIs.';

create or replace function public.crm_save_call_recording(
  p_call_id uuid, p_recording_url text, p_recording_id text, p_duration_seconds integer
) returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare call_request public.crm_call_requests; actor public.admin_users;
begin
  if p_duration_seconds not between 0 and 10800 or length(p_recording_url) > 2048
    or length(p_recording_id) not between 1 and 200 then
    raise exception 'Invalid call recording metadata.';
  end if;
  select * into call_request from public.crm_call_requests where id = p_call_id for update;
  if not found then raise exception 'Call request not found.'; end if;
  if call_request.recording_received_at is not null then return false; end if;

  update public.crm_call_requests set recording_url = p_recording_url,
    recording_id = p_recording_id, recording_duration_seconds = p_duration_seconds,
    recording_received_at = now() where id = p_call_id;
  select * into actor from public.admin_users where user_id::text = call_request.actor_id;
  insert into public.lead_activities (
    lead_id, activity_type, body, actor_id, actor_name, actor_email, metadata
  ) values (
    call_request.lead_id, 'call_recording',
    'Plivo call recording available (' || floor(p_duration_seconds / 60.0)::integer || 'm ' || (p_duration_seconds % 60) || 's).',
    call_request.actor_id, coalesce(actor.display_name, actor.email, 'CRM team member'), coalesce(actor.email, ''),
    jsonb_build_object('recordingId', p_recording_id,
      'durationSeconds', p_duration_seconds, 'provider', 'plivo', 'callRequestId', p_call_id)
  );
  return true;
end;
$$;

revoke all on function public.crm_save_call_recording(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.crm_save_call_recording(uuid, text, text, integer) to service_role;

commit;

-- Native Google Ads lead-form and Meta Lead Ads webhook ingestion.
begin;

create table if not exists public.crm_external_leads (
  provider text not null check (provider in ('google-ads', 'meta-ads')),
  external_id text not null check (char_length(external_id) between 1 and 200),
  lead_id uuid not null references public.leads(id) on delete cascade,
  received_at timestamptz not null default now(),
  primary key (provider, external_id)
);
alter table public.crm_external_leads enable row level security;
revoke all on public.crm_external_leads from public, anon, authenticated;
grant select, insert on public.crm_external_leads to service_role;

create or replace function public.crm_ingest_external_lead(
  p_provider text, p_external_id text, p_lead jsonb
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare result_id uuid; new_lead_id uuid; source_name text;
begin
  if p_provider not in ('google-ads', 'meta-ads')
    or length(p_external_id) not between 1 and 200
    or jsonb_typeof(p_lead) <> 'object'
    or length(trim(coalesce(p_lead->>'name', ''))) not between 1 and 200
    or (nullif(trim(p_lead->>'email'), '') is null and nullif(trim(p_lead->>'phone'), '') is null) then
    raise exception 'Invalid external lead.';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_provider || ':' || p_external_id));
  select lead_id into result_id from public.crm_external_leads
    where provider = p_provider and external_id = p_external_id;
  if found then return result_id; end if;

  source_name := case p_provider when 'google-ads' then 'google-ads-lead-form' else 'meta-lead-ad' end;
  insert into public.leads (
    name, email, phone, company, machine_interest, message, source, origin, priority, read,
    utm_source, utm_medium, utm_campaign, utm_content
  ) values (
    left(trim(p_lead->>'name'), 200), lower(left(trim(coalesce(p_lead->>'email', '')), 200)),
    left(trim(coalesce(p_lead->>'phone', '')), 50), left(trim(coalesce(p_lead->>'company', '')), 200),
    left(trim(coalesce(p_lead->>'machineInterest', '')), 300), left(trim(coalesce(p_lead->>'message', '')), 4000),
    source_name, 'import', 'high', false,
    case p_provider when 'google-ads' then 'google' else 'meta' end,
    case p_provider when 'google-ads' then 'cpc' else 'paid_social' end,
    left(trim(coalesce(p_lead->>'campaignId', '')), 160),
    left(trim(coalesce(p_lead->>'formId', '')), 160)
  ) returning id into new_lead_id;
  insert into public.crm_external_leads(provider, external_id, lead_id)
    values (p_provider, p_external_id, new_lead_id);
  return new_lead_id;
end;
$$;
revoke all on function public.crm_ingest_external_lead(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.crm_ingest_external_lead(text, text, jsonb) to service_role;

commit;
