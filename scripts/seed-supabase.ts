import { createClient } from '@supabase/supabase-js';
import { categoryToSlug, getCategoryShowcase } from '../src/lib/categories';
import { COMPANY_INFO, PRODUCTS, SERVICES, groupProductsByCategory } from '../src/lib/data';
import { SAMPLE_BLOGS } from '../src/lib/seed-data';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const hasPlaceholderValue = (value: string) =>
  !value ||
  value.includes('YOUR_') ||
  value.includes('change-this') ||
  value.includes('ChangeThis');

if (
  !supabaseUrl.startsWith('http') ||
  hasPlaceholderValue(supabaseUrl) ||
  hasPlaceholderValue(supabaseServiceRoleKey)
) {
  throw new Error(
    'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY with real Supabase values before seeding.',
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type SeedCategoryRow = {
  id: string;
  name: string;
  slug: string;
};

const buildCategoryLookup = (categories: SeedCategoryRow[]) => {
  const lookup = new Map<string, SeedCategoryRow>();

  categories.forEach((category) => {
    lookup.set(category.id, category);
    lookup.set(category.slug, category);
    lookup.set(category.name, category);
  });

  return lookup;
};

async function seedProducts(categoryLookup: Map<string, SeedCategoryRow>) {
  const payload = PRODUCTS.map((product, index) => ({
    category_id:
      categoryLookup.get(product.categorySlug || categoryToSlug(product.category))?.id ||
      categoryLookup.get(product.category)?.id ||
      '',
    title: product.title,
    slug: product.slug,
    model_no: product.modelNo,
    category: product.category,
    short_desc: product.shortDesc,
    description: product.description,
    features: product.features,
    specs: product.specs,
    faqs: product.faqs,
    image: product.image,
    image_alt: product.imageAlt,
    gallery: [product.image],
    seo_title: `${product.title} | Spectra Pack Machines`,
    seo_desc: product.shortDesc,
    published: true,
    sort_order: index,
  }));

  const missingCategory = payload.find((product) => !product.category_id);
  if (missingCategory) {
    throw new Error(
      `Missing product category mapping for ${missingCategory.title}. Seed categories before products.`,
    );
  }

  const { error } = await supabase
    .from('products')
    .upsert(payload, { onConflict: 'slug' });

  if (error) throw error;
  console.log(`Seeded ${payload.length} products`);
}

async function seedBlogs() {
  const payload = SAMPLE_BLOGS.map((blog) => ({
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    image: blog.image,
    seo_title: blog.seoTitle,
    seo_desc: blog.seoDesc,
    published: blog.published,
  }));

  const { error } = await supabase
    .from('blogs')
    .upsert(payload, { onConflict: 'slug' });

  if (error) throw error;
  console.log(`Seeded ${payload.length} blogs`);
}

async function seedServices() {
  const payload = SERVICES.map((service, index) => ({
    title: service.title,
    slug: service.slug,
    description: service.description,
    content: service.content,
    icon: service.icon,
    published: true,
    sort_order: index,
  }));

  const { error } = await supabase
    .from('services')
    .upsert(payload, { onConflict: 'slug' });

  if (error) throw error;
  console.log(`Seeded ${payload.length} services`);
}

async function seedCategories() {
  const payload = groupProductsByCategory(PRODUCTS).map((group, index) => {
    const showcase = getCategoryShowcase(group.category, group.items);

    return {
      name: group.category,
      slug: categoryToSlug(group.category),
      description: showcase.description,
      accent: showcase.accent,
      image: showcase.image,
      published: true,
      sort_order: index,
    };
  });

  const { error } = await supabase
    .from('product_categories')
    .upsert(payload, { onConflict: 'slug' });

  if (error) throw error;
  console.log(`Seeded ${payload.length} categories`);

  const categoryRows = await supabase
    .from('product_categories')
    .select('id, name, slug');

  if (categoryRows.error) throw categoryRows.error;

  return buildCategoryLookup((categoryRows.data || []) as SeedCategoryRow[]);
}

async function seedSiteSettings() {
  const payload = {
    key: 'catalog_path',
    value: COMPANY_INFO.catalogPath,
    label: 'Catalog PDF',
    description: 'Public PDF path or full URL used for Download Catalog links.',
  };

  const { error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'key' });

  if (error) throw error;
  console.log('Seeded site settings');
}

async function main() {
  console.log('Seeding Supabase content...');
  const categoryLookup = await seedCategories();
  await seedProducts(categoryLookup);
  await seedBlogs();
  await seedServices();
  await seedSiteSettings();
  console.log('Supabase seed complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
