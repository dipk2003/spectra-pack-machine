create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  display_name text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users
  add column if not exists email text;

alter table public.admin_users
  add column if not exists role text not null default 'admin';

alter table public.admin_users
  add column if not exists display_name text not null default '';

alter table public.admin_users
  add column if not exists active boolean not null default true;

alter table public.admin_users
  add column if not exists created_at timestamptz not null default now();

alter table public.admin_users
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists admin_users_email_key
  on public.admin_users (email);

create index if not exists admin_users_role_active_idx
  on public.admin_users (role, active);

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute procedure public.set_updated_at();

alter table public.admin_users enable row level security;

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

update public.products as p
set category_id = c.id
from public.product_categories as c
where p.category_id is null
  and (
    c.slug = lower(regexp_replace(trim(p.category), '[^a-z0-9]+', '-', 'g'))
    or c.name = p.category
  );

update public.products as p
set category = c.name
from public.product_categories as c
where p.category_id = c.id
  and p.category <> c.name;

create index if not exists products_category_id_sort_idx
  on public.products (category_id, published, sort_order, created_at desc);
