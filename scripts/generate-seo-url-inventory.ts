import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { listBlogs, listCategories, listProducts } from '../src/lib/cms';
import {
  COMPANY_INFO,
  PRODUCTS,
  SEO_CITY_MARKETS,
  groupProductsByCategory,
  type ProductData,
} from '../src/lib/data';

loadEnvConfig(process.cwd());

type UrlRow = {
  type: string;
  location: string;
  machine: string;
  url: string;
};

const staticPages = [
  ['', 'Home'],
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/contact', 'Contact'],
  ['/clients', 'Industries'],
  ['/blog', 'Blog'],
  ['/schedule-meeting', 'Schedule meeting'],
  ['/packaging-machines', 'India location hub'],
] as const;

const technicalSeoUrls = [
  ['/robots.txt', 'Robots directives'],
  ['/sitemap.xml', 'XML sitemap'],
] as const;

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

async function loadPublishedProducts(): Promise<ProductData[]> {
  try {
    const products = await listProducts({ publishedOnly: true });
    return products.length > 0 ? products : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

async function main() {
  const products = await loadPublishedProducts();
  const productCategories = groupProductsByCategory(products);
  const [blogs, cmsCategories] = await Promise.all([
    listBlogs({ publishedOnly: true }).catch(() => []),
    listCategories({ publishedOnly: true }).catch(() => []),
  ]);
  const categories = new Map(
    cmsCategories.map((category) => [category.slug, { name: category.name, slug: category.slug }]),
  );
  productCategories.forEach((category) => {
    if (!categories.has(category.slug)) {
      categories.set(category.slug, { name: category.category, slug: category.slug });
    }
  });
  const rows: UrlRow[] = [];

  staticPages.forEach(([path, label]) => {
    rows.push({ type: 'static', location: '', machine: label, url: `${COMPANY_INFO.website}${path}` });
  });

  technicalSeoUrls.forEach(([path, label]) => {
    rows.push({ type: 'technical-seo', location: '', machine: label, url: `${COMPANY_INFO.website}${path}` });
  });

  SEO_CITY_MARKETS.forEach((city) => {
    rows.push({
      type: 'location-hub',
      location: `${city.name}, ${city.region}`,
      machine: 'All packaging machines',
      url: `${COMPANY_INFO.website}/packaging-machines/${city.slug}`,
    });
  });

  categories.forEach((category) => {
    const hasPublishedProducts = productCategories.some((group) => group.slug === category.slug);
    rows.push({
      type: hasPublishedProducts ? 'category' : 'category-noindex',
      location: 'India',
      machine: category.name,
      url: `${COMPANY_INFO.website}/products/category/${category.slug}`,
    });
  });

  products.forEach((product) => {
    rows.push({
      type: 'product',
      location: 'India',
      machine: product.title,
      url: `${COMPANY_INFO.website}/products/${product.slug}`,
    });
  });

  blogs.forEach((blog) => {
    rows.push({
      type: 'blog',
      location: '',
      machine: blog.title,
      url: `${COMPANY_INFO.website}/blog/${blog.slug}`,
    });
  });

  SEO_CITY_MARKETS.forEach((city) => {
    products.forEach((product) => {
      rows.push({
        type: 'machine-location',
        location: `${city.name}, ${city.region}`,
        machine: product.title,
        url: `${COMPANY_INFO.website}/${city.slug}/${product.slug}`,
      });
    });
  });

  const output = [
    ['type', 'location', 'machine', 'url'].map(csvCell).join(','),
    ...rows.map((row) => [row.type, row.location, row.machine, row.url].map(csvCell).join(',')),
  ].join('\n');
  const docsDirectory = resolve(process.cwd(), 'docs');
  const outputPath = resolve(docsDirectory, 'seo-url-inventory.csv');

  await mkdir(docsDirectory, { recursive: true });
  await writeFile(outputPath, `${output}\n`, 'utf8');

  const machineLocationCount = SEO_CITY_MARKETS.length * products.length;
  console.log(`Generated ${rows.length} public URLs at ${outputPath}`);
  console.log(`${SEO_CITY_MARKETS.length} locations × ${products.length} machines = ${machineLocationCount} machine-location URLs`);
}

void main();
