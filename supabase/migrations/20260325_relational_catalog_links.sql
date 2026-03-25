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

create index if not exists blogs_category_published_created_idx
  on public.blogs (category_id, published, created_at desc);

create index if not exists blogs_featured_product_idx
  on public.blogs (featured_product_id);

create index if not exists services_category_published_sort_idx
  on public.services (category_id, published, sort_order, created_at desc);

create index if not exists leads_product_created_idx
  on public.leads (product_id, created_at desc);

create index if not exists leads_category_created_idx
  on public.leads (category_id, created_at desc);

create index if not exists meetings_product_created_idx
  on public.meetings (product_id, created_at desc);

create index if not exists meetings_category_created_idx
  on public.meetings (category_id, created_at desc);
