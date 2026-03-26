-- Compatibility migration for the richer blog editor/template flow.
-- The current implementation stores left/right article images inside blogs.content as JSON text,
-- so the only schema requirements are the hero image column plus related product/category links.

alter table if exists public.blogs
  add column if not exists image text,
  add column if not exists category_id uuid,
  add column if not exists featured_product_id uuid;

update public.blogs
set image = '/images/brand/spectra-pack-logo.png'
where image is null or btrim(image) = '';

alter table if exists public.blogs
  alter column image set default '/images/brand/spectra-pack-logo.png';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'blogs'
      and column_name = 'image'
  ) then
    alter table public.blogs
      alter column image set not null;
  end if;

  if to_regclass('public.product_categories') is not null
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'blogs'
        and column_name = 'category_id'
    )
    and not exists (
      select 1
      from pg_constraint
      where conname = 'blogs_category_id_fkey'
        and conrelid = 'public.blogs'::regclass
    )
  then
    alter table public.blogs
      add constraint blogs_category_id_fkey
      foreign key (category_id)
      references public.product_categories (id)
      on update cascade
      on delete set null;
  end if;

  if to_regclass('public.products') is not null
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'blogs'
        and column_name = 'featured_product_id'
    )
    and not exists (
      select 1
      from pg_constraint
      where conname = 'blogs_featured_product_id_fkey'
        and conrelid = 'public.blogs'::regclass
    )
  then
    alter table public.blogs
      add constraint blogs_featured_product_id_fkey
      foreign key (featured_product_id)
      references public.products (id)
      on update cascade
      on delete set null;
  end if;
end;
$$;

create index if not exists blogs_published_created_idx
  on public.blogs (published, created_at desc);

create index if not exists blogs_category_published_created_idx
  on public.blogs (category_id, published, created_at desc);

create index if not exists blogs_featured_product_idx
  on public.blogs (featured_product_id);
