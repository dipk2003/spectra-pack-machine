import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { MACHINE_GUIDE_INPUTS } from '../src/lib/machine-guides';
import { EDITORIAL_GUIDES } from '../src/lib/editorial-guides';
import { PRODUCT_ALIASES } from '../src/lib/editorial-links';
import { buildMetaDescription } from '../src/lib/seo';

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error('Supabase URL or service-role key is missing.');

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id,category_id,slug,title,published,seo_title,seo_desc,short_desc');
  if (productError) throw productError;

  const productBySlug = new Map((products || []).map(product => [product.slug, product]));
  const now = new Date().toISOString();
  const rows = MACHINE_GUIDE_INPUTS.map(input => {
    const guide = EDITORIAL_GUIDES.find(item => item.slug === input.slug);
    if (!guide) throw new Error(`Missing generated guide: ${input.slug}`);
    const productSlugs = Array.from(new Set(
      guide.productSlugs.flatMap(slug => [slug, ...(PRODUCT_ALIASES[slug] || [])]),
    ));
    const featured = productSlugs
      .map(slug => productBySlug.get(slug))
      .find(product => product?.published);

    return {
      slug: guide.slug,
      title: guide.title,
      excerpt: guide.excerpt,
      content: guide.content,
      image: guide.image,
      seo_title: guide.seoTitle,
      seo_desc: buildMetaDescription(guide.seoDesc, guide.excerpt),
      seo_keywords: [
        input.family!,
        ...input.products.map(slug => slug.replace(/-/g, ' ')),
        'packaging machine guide',
        'Spectra Pack Machines',
      ],
      product_slugs: productSlugs,
      service_slugs: guide.serviceSlugs,
      related_blog_slugs: guide.relatedGuideSlugs,
      featured_product_id: featured?.id || null,
      category_id: featured?.category_id || null,
      published: true,
      created_at: now,
      updated_at: now,
    };
  });

  const { error: insertError } = await supabase
    .from('blogs')
    .upsert(rows, { onConflict: 'slug' });
  if (insertError) throw insertError;

  for (const product of products || []) {
    const seoTitle = product.seo_title?.trim() || product.title;
    const seoDesc = product.seo_desc?.trim() || product.short_desc?.slice(0, 160) || '';
    if (product.seo_title?.trim() && product.seo_desc?.trim()) continue;
    const { error } = await supabase
      .from('products')
      .update({ seo_title: seoTitle, seo_desc: seoDesc })
      .eq('id', product.id);
    if (error) throw error;
  }

  const slugs = rows.map(row => row.slug);
  const { data: verified, error: verifyError } = await supabase
    .from('blogs')
    .select('slug,published,seo_title,image,product_slugs,service_slugs')
    .in('slug', slugs);
  if (verifyError) throw verifyError;

  const valid = (verified || []).filter(blog =>
    blog.published &&
    blog.seo_title &&
    blog.image?.startsWith('/images/blog/') &&
    blog.product_slugs?.length > 0 &&
    blog.service_slugs?.length > 0,
  );
  if (valid.length !== rows.length) {
    throw new Error(`Verification failed: ${valid.length}/${rows.length} complete blog rows found.`);
  }
  console.log(`Supabase verified: ${valid.length}/${rows.length} machine blogs are published with SEO, images and relationships.`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
