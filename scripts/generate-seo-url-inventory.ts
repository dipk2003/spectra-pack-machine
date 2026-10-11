import { INDIA_DISTRICT_DIRECTORY } from '../src/lib/india-districts';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { listCategories, listProducts, listServices } from '../src/lib/cms';
import { listPublicBlogs } from '../src/lib/public-blogs';
import { INDIA_STATE_MARKETS } from '../src/lib/india-markets';
import { MODEL_GUIDE_PROFILES, MODEL_GUIDE_TOPICS, modelGuideHref, modelGuideMetadata } from '../src/lib/model-guides';
import { machineSearchKeywords } from '../src/lib/seo';
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
  canonical?: string;
};

const staticPages = [
  ['', 'Home'],
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/contact', 'Contact'],
  ['/clients', 'Industries'],
  ['/blog', 'Blog'],
  ['/machines', 'Machine catalogue'],
  ['/locations', 'All India state, district and town enquiries'],
  ['/schedule-meeting', 'Schedule meeting'],
  ['/packaging-machines', 'India location hub'],
  ['/packaging-machines/international', 'International enquiry hub'],
  ['/privacy-policy', 'Privacy policy'],
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
  const [blogs, cmsCategories, services] = await Promise.all([
    listPublicBlogs(),
    listCategories({ publishedOnly: true }).catch(() => []),
    listServices({ publishedOnly: true }).catch(() => []),
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

  INDIA_STATE_MARKETS.forEach((state) => {
    rows.push({ type: 'state-hub', location: state.name, machine: 'Packaging machine enquiry planning', url: `${COMPANY_INFO.website}/packaging-machines/india/${state.slug}` });
  });

  INDIA_DISTRICT_DIRECTORY.forEach(state => {
    state.districts.forEach(district => rows.push({ type: 'district-planner-consolidated', location: `${district.name}, ${state.name}`, machine: 'Machine and service enquiry', url: `${COMPANY_INFO.website}/packaging-machines/india/${state.slug}/${district.slug}`, canonical: `${COMPANY_INFO.website}/packaging-machines/india/${state.slug}` }));
  });

  services.forEach((service) => {
    rows.push({ type: 'service', location: '', machine: service.title, url: `${COMPANY_INFO.website}/services/${service.slug}` });
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
    if (MODEL_GUIDE_PROFILES[product.slug]) MODEL_GUIDE_TOPICS.forEach(topic => rows.push({
      type: 'machine-' + topic, location: 'India', machine: product.title,
      url: COMPANY_INFO.website + modelGuideHref(product.slug, topic),
    }));
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
    ['type', 'location', 'machine', 'url', 'canonical'].map(csvCell).join(','),
    ...rows.map((row) => [row.type, row.location, row.machine, row.url, row.canonical || row.url].map(csvCell).join(',')),
  ].join('\n');
  const docsDirectory = resolve(process.cwd(), 'docs');
  const outputPath = resolve(docsDirectory, 'seo-url-inventory.csv');

  await mkdir(docsDirectory, { recursive: true });
  await writeFile(outputPath, `${output}\n`, 'utf8');
  const keywordRows = products.flatMap(product => [
    [product.title, 'Specifications and purchase enquiry', `${COMPANY_INFO.website}/products/${product.slug}`, product.shortDesc, machineSearchKeywords(product.title, product.category).join('; ')],
    ...(MODEL_GUIDE_PROFILES[product.slug] ? MODEL_GUIDE_TOPICS.map(topic => {
      const metadata = modelGuideMetadata(product, topic);
      return [product.title, metadata.title, COMPANY_INFO.website + modelGuideHref(product.slug, topic), metadata.description, metadata.keywords.join('; ')];
    }) : []),
  ]);
  await writeFile(resolve(docsDirectory, 'machine-keyword-map.csv'), [
    ['machine', 'search_intent', 'preferred_url', 'description', 'target_phrases'].map(csvCell).join(','),
    ...keywordRows.map(row => row.map(csvCell).join(',')),
  ].join('\n') + '\n', 'utf8');

  const machineLocationCount = SEO_CITY_MARKETS.length * products.length;
  console.log(`Generated ${rows.length} public URLs at ${outputPath}`);
  console.log(`${SEO_CITY_MARKETS.length} locations × ${products.length} machines = ${machineLocationCount} machine-location URLs`);
}

void main();
