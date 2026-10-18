-- Current Meta and Google campaign inventory, including paused campaigns that
-- may not have daily reporting rows in the selected range.
begin;

create table if not exists public.crm_ad_campaigns (
  provider text not null check (provider in ('google','meta')),
  account_id text not null,
  campaign_id text not null,
  campaign_name text not null,
  status text not null default 'UNKNOWN',
  objective text not null default '',
  channel text not null default '',
  start_date date,
  end_date date,
  synced_at timestamptz not null default now(),
  primary key (provider, account_id, campaign_id)
);
alter table public.crm_ad_campaigns enable row level security;
revoke all on public.crm_ad_campaigns from public,anon,authenticated;
grant select,insert,update,delete on public.crm_ad_campaigns to service_role;

create or replace function public.crm_replace_ad_campaigns(
  p_provider text, p_account text, p_campaigns jsonb
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_provider not in ('google','meta') or p_account !~ '^[0-9]{1,30}$'
    or jsonb_typeof(p_campaigns) <> 'array' or jsonb_array_length(p_campaigns) > 10000 then
    raise exception 'Invalid campaign inventory';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_campaigns) c
    where c->>'provider' is distinct from p_provider
      or c->>'account_id' is distinct from p_account
      or coalesce(c->>'campaign_id','') !~ '^[0-9]{1,40}$'
      or length(coalesce(c->>'campaign_name','')) > 300
      or length(coalesce(c->>'status','')) > 80
      or length(coalesce(c->>'objective','')) > 80
      or length(coalesce(c->>'channel','')) > 80
      or (nullif(c->>'start_date','') is not null and c->>'start_date' !~ '^\d{4}-\d{2}-\d{2}$')
      or (nullif(c->>'end_date','') is not null and c->>'end_date' !~ '^\d{4}-\d{2}-\d{2}$')
  ) then raise exception 'Invalid campaign details'; end if;

  perform pg_advisory_xact_lock(hashtext('ad-campaigns:' || p_provider || ':' || p_account));
  delete from public.crm_ad_campaigns where provider=p_provider and account_id=p_account;
  insert into public.crm_ad_campaigns(provider,account_id,campaign_id,campaign_name,status,objective,channel,start_date,end_date,synced_at)
  select p_provider,p_account,c->>'campaign_id',left(c->>'campaign_name',300),left(coalesce(c->>'status','UNKNOWN'),80),
    left(coalesce(c->>'objective',''),80),left(coalesce(c->>'channel',''),80),
    nullif(c->>'start_date','')::date,nullif(c->>'end_date','')::date,now()
  from jsonb_array_elements(p_campaigns) c;
end; $$;

revoke all on function public.crm_replace_ad_campaigns(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.crm_replace_ad_campaigns(text,text,jsonb) to service_role;
commit;
