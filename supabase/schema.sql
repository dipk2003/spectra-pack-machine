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
  status text not null default 'pending',
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_published_sort_idx
  on public.products (published, sort_order, created_at desc);

create index if not exists blogs_published_created_idx
  on public.blogs (published, created_at desc);

create index if not exists services_published_sort_idx
  on public.services (published, sort_order, created_at desc);

create index if not exists leads_created_idx
  on public.leads (created_at desc);

create index if not exists meetings_created_idx
  on public.meetings (created_at desc);

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

alter table public.products enable row level security;
alter table public.blogs enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.meetings enable row level security;

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
