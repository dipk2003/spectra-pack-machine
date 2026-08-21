-- Retire legacy misspelled/truncated URLs while preserving redirects in Next.js.
-- The application also canonicalizes these records at read time, so deployment
-- remains safe if this cleanup is applied after the code release.

with slug_map(legacy_slug, canonical_slug) as (
  values
    (
      'double-door-chamber-vaccum-machine-with-conveyor',
      'double-door-chamber-vacuum-machine-with-conveyor'
    ),
    (
      'pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea',
      'pneumatic-vertical-sealing-machine-flame-proof'
    )
)
update public.products as legacy
set published = false,
    updated_at = now()
from slug_map
where legacy.slug = slug_map.legacy_slug
  and exists (
    select 1
    from public.products as canonical
    where canonical.slug = slug_map.canonical_slug
  );

with slug_map(legacy_slug, canonical_slug, canonical_title) as (
  values
    (
      'double-door-chamber-vaccum-machine-with-conveyor',
      'double-door-chamber-vacuum-machine-with-conveyor',
      'Double Door Chamber Vacuum Machine with Conveyor'
    ),
    (
      'pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea',
      'pneumatic-vertical-sealing-machine-flame-proof',
      'Pneumatic Vertical Sealing Machine - Flame Proof'
    )
)
update public.products as legacy
set slug = slug_map.canonical_slug,
    title = slug_map.canonical_title,
    seo_title = slug_map.canonical_title,
    updated_at = now()
from slug_map
where legacy.slug = slug_map.legacy_slug
  and not exists (
    select 1
    from public.products as canonical
    where canonical.slug = slug_map.canonical_slug
  );

-- The legacy vacuum category is superseded by the consolidated category hub.
update public.product_categories
set published = false,
    updated_at = now()
where slug = 'double-door-chamber-vaccum-packing-machine'
  and exists (
    select 1
    from public.product_categories
    where slug = 'vacuum-packaging-machines'
  );

update public.product_categories
set slug = 'vacuum-packaging-machines',
    name = 'Vacuum Packaging Machines',
    updated_at = now()
where slug = 'double-door-chamber-vaccum-packing-machine'
  and not exists (
    select 1
    from public.product_categories
    where slug = 'vacuum-packaging-machines'
  );
