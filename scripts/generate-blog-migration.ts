import { writeFileSync } from 'node:fs';
import { MACHINE_GUIDE_INPUTS } from '../src/lib/machine-guides';
import { EDITORIAL_GUIDES } from '../src/lib/editorial-guides';
import { buildMetaDescription } from '../src/lib/seo';
import { PRODUCT_ALIASES } from '../src/lib/editorial-links';

const rows = MACHINE_GUIDE_INPUTS.map(input => {
  const guide = EDITORIAL_GUIDES.find(item => item.slug === input.slug)!;
  return {
    slug: guide.slug, title: guide.title, excerpt: guide.excerpt,
    content: guide.content, image: guide.image,
    seo_title: guide.seoTitle, seo_desc: buildMetaDescription(guide.seoDesc, guide.excerpt),
    seo_keywords: [input.family!, ...input.products.map(slug => slug.replace(/-/g, ' ')), 'packaging machine guide', 'Spectra Pack Machines'],
    product_slugs: Array.from(new Set(guide.productSlugs.flatMap(slug => [slug, ...(PRODUCT_ALIASES[slug] || [])]))), service_slugs: guide.serviceSlugs,
    related_blog_slugs: guide.relatedGuideSlugs,
  };
});
const payload = JSON.stringify(rows, null, 2);
if (payload.includes('$machine_blogs$')) throw new Error('SQL delimiter collision');
const sql = `-- 30 complete illustrated machine articles, SEO metadata and relationships.
-- Run in the Supabase SQL editor after existing application tables exist.
-- Transactional and rerunnable. Existing matching slugs are preserved, including
-- edits and unpublished status. No existing rows are deleted or overwritten.
-- Image files are shipped with the website under /images; deploy them with code.
BEGIN;

ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS product_slugs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_slugs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_blog_slugs text[] NOT NULL DEFAULT '{}';

WITH articles AS (
  SELECT * FROM jsonb_to_recordset($machine_blogs$
${payload}
$machine_blogs$::jsonb) AS article(
    slug text, title text, excerpt text, content text, image text,
    seo_title text, seo_desc text, seo_keywords text[],
    product_slugs text[], service_slugs text[], related_blog_slugs text[]
  )
)
INSERT INTO public.blogs (
  slug, title, excerpt, content, image, seo_title, seo_desc, seo_keywords,
  product_slugs, service_slugs, related_blog_slugs,
  featured_product_id, category_id, published, created_at, updated_at
)
SELECT a.slug, a.title, a.excerpt, a.content, a.image, a.seo_title, a.seo_desc,
  a.seo_keywords, a.product_slugs, a.service_slugs, a.related_blog_slugs,
  p.id, p.category_id, true, now(), now()
FROM articles a
LEFT JOIN LATERAL (
  SELECT product.id, product.category_id FROM public.products product
  WHERE product.published = true AND product.slug = ANY(a.product_slugs)
  ORDER BY array_position(a.product_slugs, product.slug)
  LIMIT 1
) p ON true
ON CONFLICT (slug) DO NOTHING;

-- Fill missing metadata only; preserve deliberate CMS wording.
UPDATE public.products
SET seo_title = COALESCE(NULLIF(btrim(seo_title), ''), title),
    seo_desc = COALESCE(NULLIF(btrim(seo_desc), ''), left(short_desc, 160))
WHERE NULLIF(btrim(seo_title), '') IS NULL OR NULLIF(btrim(seo_desc), '') IS NULL;

COMMIT;

-- Confirm the migration's 30 slugs are present (existing matching rows included).
SELECT slug, published, seo_title, image,
  cardinality(product_slugs) AS related_machines,
  cardinality(service_slugs) AS related_services
FROM public.blogs
WHERE slug IN (${rows.map(row => `'${row.slug}'`).join(',\n  ')})
ORDER BY slug;
`;
const destination = 'supabase/migrations/20260916_machine_blogs_and_seo.sql';
writeFileSync(destination, sql);
console.log(`Wrote ${rows.length} complete articles to ${destination}`);
