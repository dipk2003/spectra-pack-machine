import { headers } from 'next/headers';
import HomePageClient from './HomePageClient';
import { listCategories, listProducts, type CategoryRecord, type ProductRecord } from '@/lib/cms';
import type { HeroCarouselSettings } from '@/lib/home-hero';

export const dynamic = 'force-dynamic';

const getRequestOrigin = () => {
  const requestHeaders = headers();
  const host =
    requestHeaders.get('x-forwarded-host') ||
    requestHeaders.get('host') ||
    'localhost:3000';
  const protocol =
    requestHeaders.get('x-forwarded-proto') ||
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
};

const fetchJson = async <T,>(path: string) => {
  const response = await fetch(`${getRequestOrigin()}${path}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
};

const getHomePageData = async () => {
  try {
    const [products, categories, siteSettings] = await Promise.all([
      fetchJson<ProductRecord[]>('/api/products'),
      fetchJson<CategoryRecord[]>('/api/categories'),
      fetchJson<{ heroCarouselSettings?: HeroCarouselSettings }>('/api/site-settings'),
    ]);

    return {
      products,
      categories,
      heroSettings: siteSettings.heroCarouselSettings || {
        overrides: {},
        orderedIds: [],
        hiddenIds: [],
        customSlides: [],
      },
    };
  } catch {
    const [products, categories] = await Promise.all([
      listProducts({ publishedOnly: true }),
      listCategories({ publishedOnly: true }),
    ]);

    return {
      products,
      categories,
      heroSettings: {
        overrides: {},
        orderedIds: [],
        hiddenIds: [],
        customSlides: [],
      },
    };
  }
};

export default async function HomePage() {
  const { products, categories, heroSettings } = await getHomePageData();

  return (
    <HomePageClient
      initialProducts={products}
      initialCategories={categories}
      initialHeroSettings={heroSettings}
    />
  );
}
