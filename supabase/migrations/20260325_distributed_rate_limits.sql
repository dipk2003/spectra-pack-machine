create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rate_limits_count_nonnegative check (count >= 0)
);

create index if not exists rate_limits_updated_idx
  on public.rate_limits (updated_at);

drop trigger if exists rate_limits_set_updated_at on public.rate_limits;
create trigger rate_limits_set_updated_at
before update on public.rate_limits
for each row execute procedure public.set_updated_at();

create or replace function public.enforce_rate_limit(
  identifier text,
  max_requests integer,
  window_seconds integer
)
returns table (
  allowed boolean,
  current_count integer,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
as $$
declare
  now_ts timestamptz := now();
  window_boundary timestamptz := now_ts - make_interval(secs => greatest(window_seconds, 1));
begin
  if identifier is null or btrim(identifier) = '' then
    raise exception 'identifier is required';
  end if;

  if max_requests < 1 then
    raise exception 'max_requests must be >= 1';
  end if;

  if window_seconds < 1 then
    raise exception 'window_seconds must be >= 1';
  end if;

  if mod(extract(epoch from now_ts)::bigint, 200) = 0 then
    delete from public.rate_limits
    where updated_at < now_ts - interval '2 days';
  end if;

  return query
  with upserted as (
    insert into public.rate_limits as rl (
      key,
      count,
      window_started_at,
      created_at,
      updated_at
    )
    values (
      identifier,
      1,
      now_ts,
      now_ts,
      now_ts
    )
    on conflict (key) do update
    set
      count = case
        when rl.window_started_at <= window_boundary then 1
        else least(rl.count + 1, max_requests + 1)
      end,
      window_started_at = case
        when rl.window_started_at <= window_boundary then now_ts
        else rl.window_started_at
      end,
      updated_at = now_ts
    returning count, window_started_at
  )
  select
    upserted.count <= max_requests,
    upserted.count,
    greatest(max_requests - upserted.count, 0),
    upserted.window_started_at + make_interval(secs => window_seconds)
  from upserted;
end;
$$;

alter table public.rate_limits enable row level security;
