-- Additive integration storage. Apply after the 20260906 CRM security migration.
begin;
create table if not exists public.crm_ad_daily (
  provider text not null check (provider in ('google','meta')),
  account_id text not null, campaign_id text not null, campaign_name text not null,
  day date not null, currency text not null check (currency ~ '^[A-Z]{3}$'),
  impressions bigint not null, clicks bigint not null, spend numeric not null,
  conversions numeric not null, conversion_value numeric not null,
  synced_at timestamptz not null default now(),
  primary key (provider, account_id, campaign_id, day)
);
create table if not exists public.crm_integration_syncs (
  provider text primary key, status text not null, message text not null default '',
  range_start date not null, range_end date not null, completed_at timestamptz not null default now()
);
create table if not exists public.crm_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('whatsapp','twilio')),
  event_key text not null, external_id text not null,
  phone text not null default '', direction text not null check (direction in ('inbound','outbound','unknown')),
  kind text not null, status text not null, body text not null default '' check (length(body) <= 4000),
  occurred_at timestamptz not null, received_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  lead_id uuid references public.leads(id) on delete set null,
  unique (provider, event_key)
);
create index if not exists crm_provider_events_received on public.crm_provider_events(received_at desc);
create index if not exists crm_provider_events_lead on public.crm_provider_events(lead_id, occurred_at desc);
alter table public.crm_ad_daily enable row level security;
alter table public.crm_integration_syncs enable row level security;
alter table public.crm_provider_events enable row level security;
revoke all on public.crm_ad_daily, public.crm_integration_syncs, public.crm_provider_events from public, anon, authenticated;
grant select on public.crm_ad_daily, public.crm_provider_events to service_role;
grant select, insert, update on public.crm_integration_syncs to service_role;

-- Replace the entire requested slice in one transaction, only after all provider pages were fetched.
create or replace function public.crm_replace_ad_report(p_provider text, p_account text, p_since date, p_until date, p_rows jsonb)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_provider not in ('google','meta') or p_since > p_until or p_until - p_since > 89
    or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 20000 then
    raise exception 'Invalid report slice';
  end if;
  perform pg_advisory_xact_lock(hashtext('ad-report:' || p_provider || ':' || p_account));
  if exists (select 1 from jsonb_array_elements(p_rows) r where r->>'provider' is distinct from p_provider
    or r->>'account_id' is distinct from p_account or (r->>'day')::date not between p_since and p_until) then
    raise exception 'Report scope mismatch';
  end if;
  delete from public.crm_ad_daily where provider=p_provider and account_id=p_account and day between p_since and p_until;
  insert into public.crm_ad_daily (provider,account_id,campaign_id,campaign_name,day,currency,impressions,clicks,spend,conversions,conversion_value)
  select provider,account_id,campaign_id,campaign_name,day,currency,impressions,clicks,spend,conversions,conversion_value
  from jsonb_to_recordset(p_rows) as r(provider text,account_id text,campaign_id text,campaign_name text,day date,currency text,impressions bigint,clicks bigint,spend numeric,conversions numeric,conversion_value numeric);
  insert into public.crm_integration_syncs(provider,status,message,range_start,range_end,completed_at)
  values(p_provider,'ok','Report synced',p_since,p_until,now())
  on conflict(provider) do update set status='ok',message='Report synced',range_start=p_since,range_end=p_until,completed_at=now();
end; $$;

-- One exact international phone match may attach automatically. Multiple matches stay in owner inbox.
-- No external status is treated as proof of a human conversation or a completed sale.
create or replace function public.crm_ingest_provider_event(p_event jsonb)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare event_id uuid; matched uuid; matches uuid[]; phone_digits text := p_event->>'phone';
begin
  if p_event->>'provider' not in ('whatsapp','twilio') or length(p_event->>'event_key') not between 1 and 250 then
    raise exception 'Invalid provider event';
  end if;
  if phone_digits ~ '^[1-9][0-9]{7,14}$' then
    select array_agg(id) into matches from public.leads
      where regexp_replace(coalesce(phone,''),'[^0-9]','','g')=phone_digits;
    if array_length(matches,1)=1 then matched := matches[1]; end if;
  end if;
  insert into public.crm_provider_events(provider,event_key,external_id,phone,direction,kind,status,body,occurred_at,metadata,lead_id)
  values(p_event->>'provider',p_event->>'event_key',p_event->>'external_id',coalesce(phone_digits,''),p_event->>'direction',p_event->>'kind',p_event->>'status',left(coalesce(p_event->>'body',''),4000),(p_event->>'occurred_at')::timestamptz,coalesce(p_event->'metadata','{}'::jsonb),matched)
  on conflict(provider,event_key) do nothing returning id into event_id;
  if event_id is null then return null; end if;
  if matched is not null then
    insert into public.lead_activities(lead_id,activity_type,body,outcome,actor_name,metadata,created_at)
    values(matched,'provider_event',left(coalesce(p_event->>'body',''),4000),p_event->>'status',p_event->>'provider',
      jsonb_build_object('source','verified_webhook','provider',p_event->>'provider','event_id',event_id,'kind',p_event->>'kind','contactConfirmed',false),now());
  end if;
  return event_id;
end; $$;

create or replace function public.crm_link_provider_event(p_event_id uuid,p_lead_id uuid,p_actor_id text,p_actor_name text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare e public.crm_provider_events;
begin
  perform public.crm_assert_actor_access(p_actor_id,true);
  select * into e from public.crm_provider_events where id=p_event_id for update;
  if not found then raise exception 'Event not found'; end if;
  if e.lead_id=p_lead_id then return; end if;
  if e.lead_id is not null then raise exception 'Event already linked'; end if;
  perform 1 from public.leads where id=p_lead_id;
  if not found then raise exception 'Lead not found'; end if;
  update public.crm_provider_events set lead_id=p_lead_id where id=p_event_id;
  insert into public.lead_activities(lead_id,activity_type,body,outcome,actor_id,actor_name,metadata)
  values(p_lead_id,'provider_event',e.body,e.status,p_actor_id,p_actor_name,
    jsonb_build_object('source','verified_webhook','provider',e.provider,'event_id',e.id,'kind',e.kind,'contactConfirmed',false));
end; $$;
revoke all on function public.crm_replace_ad_report(text,text,date,date,jsonb),public.crm_ingest_provider_event(jsonb),public.crm_link_provider_event(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.crm_replace_ad_report(text,text,date,date,jsonb),public.crm_ingest_provider_event(jsonb),public.crm_link_provider_event(uuid,uuid,text,text) to service_role;
commit;
