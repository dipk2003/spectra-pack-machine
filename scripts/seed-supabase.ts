import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../src/lib/products';
import { SERVICES } from '../src/lib/data';
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

const supabase = createClient<any>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function seedProducts() {
  const payload = PRODUCTS.map((product, index) => ({
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

async function main() {
  console.log('Seeding Supabase content...');
  await seedProducts();
  await seedBlogs();
  await seedServices();
  console.log('Supabase seed complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
