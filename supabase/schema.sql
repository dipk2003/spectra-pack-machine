create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  model_no text not null default '',
  category_id uuid,
  category text not null,
  short_desc text not null,
  description text not null,
  features jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  image text not null,
  image_alt text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  seo_title text not null default '',
  seo_desc text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  image text not null default '/images/brand/spectra-pack-logo.png',
  seo_title text not null default '',
  seo_desc text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  content text not null,
  icon text not null default 'settings',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text not null default '',
  message text not null,
  source text not null default 'contact',
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text not null default '',
  date text not null,
  time text not null,
  message text not null default '',
  meeting_link text not null default '',
  status text not null default 'pending',
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.meetings
  add column if not exists meeting_link text not null default '';

alter table if exists public.blogs
  add column if not exists category_id uuid,
  add column if not exists featured_product_id uuid;

alter table if exists public.services
  add column if not exists category_id uuid;

alter table if exists public.leads
  add column if not exists product_id uuid,
  add column if not exists category_id uuid,
  add column if not exists machine_interest text not null default '';

alter table if exists public.meetings
  add column if not exists product_id uuid,
  add column if not exists category_id uuid,
  add column if not exists machine_interest text not null default '';

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  accent text not null default 'Machine Family',
  image text not null,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists category_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_category_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id)
      references public.product_categories (id)
      on update cascade
      on delete restrict;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blogs_category_id_fkey'
      and conrelid = 'public.blogs'::regclass
  ) then
    alter table public.blogs
      add constraint blogs_category_id_fkey
      foreign key (category_id)
      references public.product_categories (id)
      on update cascade
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'blogs_featured_product_id_fkey'
      and conrelid = 'public.blogs'::regclass
  ) then
    alter table public.blogs
      add constraint blogs_featured_product_id_fkey
      foreign key (featured_product_id)
      references public.products (id)
      on update cascade
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'services_category_id_fkey'
      and conrelid = 'public.services'::regclass
  ) then
    alter table public.services
      add constraint services_category_id_fkey
      foreign key (category_id)
      references public.product_categories (id)
      on update cascade
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_product_id_fkey'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_product_id_fkey
      foreign key (product_id)
      references public.products (id)
      on update cascade
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_category_id_fkey'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_category_id_fkey
      foreign key (category_id)
      references public.product_categories (id)
      on update cascade
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'meetings_product_id_fkey'
      and conrelid = 'public.meetings'::regclass
  ) then
    alter table public.meetings
      add constraint meetings_product_id_fkey
      foreign key (product_id)
      references public.products (id)
      on update cascade
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'meetings_category_id_fkey'
      and conrelid = 'public.meetings'::regclass
  ) then
    alter table public.meetings
      add constraint meetings_category_id_fkey
      foreign key (category_id)
      references public.product_categories (id)
      on update cascade
      on delete set null;
  end if;
end;
$$;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  json_value jsonb,
  label text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists json_value jsonb;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  display_name text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rate_limits_count_nonnegative check (count >= 0)
);

create index if not exists products_published_sort_idx
  on public.products (published, sort_order, created_at desc);

create index if not exists products_category_id_sort_idx
  on public.products (category_id, published, sort_order, created_at desc);

create index if not exists blogs_published_created_idx
  on public.blogs (published, created_at desc);

create index if not exists blogs_category_published_created_idx
  on public.blogs (category_id, published, created_at desc);

create index if not exists blogs_featured_product_idx
  on public.blogs (featured_product_id);

create index if not exists services_published_sort_idx
  on public.services (published, sort_order, created_at desc);

create index if not exists services_category_published_sort_idx
  on public.services (category_id, published, sort_order, created_at desc);

create index if not exists leads_created_idx
  on public.leads (created_at desc);

create index if not exists leads_product_created_idx
  on public.leads (product_id, created_at desc);

create index if not exists leads_category_created_idx
  on public.leads (category_id, created_at desc);

create index if not exists meetings_created_idx
  on public.meetings (created_at desc);

create index if not exists meetings_product_created_idx
  on public.meetings (product_id, created_at desc);

create index if not exists meetings_category_created_idx
  on public.meetings (category_id, created_at desc);

create index if not exists product_categories_published_sort_idx
  on public.product_categories (published, sort_order, name);

create index if not exists site_settings_key_idx
  on public.site_settings (key);

create index if not exists admin_users_role_active_idx
  on public.admin_users (role, active);

create index if not exists rate_limits_updated_idx
  on public.rate_limits (updated_at);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
before update on public.blogs
for each row execute procedure public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute procedure public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute procedure public.set_updated_at();

drop trigger if exists meetings_set_updated_at on public.meetings;
create trigger meetings_set_updated_at
before update on public.meetings
for each row execute procedure public.set_updated_at();

drop trigger if exists product_categories_set_updated_at on public.product_categories;
create trigger product_categories_set_updated_at
before update on public.product_categories
for each row execute procedure public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute procedure public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute procedure public.set_updated_at();

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

alter table public.products enable row level security;
alter table public.blogs enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.meetings enable row level security;
alter table public.product_categories enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.rate_limits enable row level security;

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products
for select
using (published = true);

drop policy if exists "Public can read published blogs" on public.blogs;
create policy "Public can read published blogs"
on public.blogs
for select
using (published = true);

drop policy if exists "Public can read published services" on public.services;
create policy "Public can read published services"
on public.services
for select
using (published = true);

drop policy if exists "Public can read published categories" on public.product_categories;
create policy "Public can read published categories"
on public.product_categories
for select
using (published = true);

drop policy if exists "Public can read catalog setting" on public.site_settings;
create policy "Public can read catalog setting"
on public.site_settings
for select
using (key in ('catalog_path', 'hero_carousel_overrides'));

drop policy if exists "Public can create leads" on public.leads;
create policy "Public can create leads"
on public.leads
for insert
with check (true);

drop policy if exists "Public can create meetings" on public.meetings;
create policy "Public can create meetings"
on public.meetings
for insert
with check (true);
