begin;
create table if not exists public.crm_call_requests (
  id uuid primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id text not null,
  agent_phone text not null,
  customer_phone text not null,
  caller_id text not null,
  status text not null default 'pending' check (status in ('pending', 'queued', 'failed', 'uncertain')),
  provider_id text,
  call_uuid text,
  created_at timestamptz not null default now()
);
create index if not exists crm_call_requests_actor_created on public.crm_call_requests(actor_id, created_at desc);
alter table public.crm_call_requests enable row level security;
revoke all on public.crm_call_requests from public, anon, authenticated;
grant select, insert, update on public.crm_call_requests to service_role;
commit;
