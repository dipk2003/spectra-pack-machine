import type { Metadata } from 'next';
import { headers } from 'next/headers';
import HomePageClient from './HomePageClient';
import { listCategories, listProducts, type CategoryRecord, type ProductRecord } from '@/lib/cms';
import type { HeroCarouselSettings } from '@/lib/home-hero';
import { COMPANY_INFO, FAQS } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Packaging Machine Manufacturer in India | Spectra Pack Machines',
  description:
    'Spectra Pack Machines manufactures shrink wrapping, sealing, vacuum packaging, conveyor and pallet stretch wrapping machines with pan-India supply and support.',
  keywords: [
    'packaging machine manufacturer in India',
    'packing machine',
    'Spectra Pack Machine',
    'spectrapackmachine',
    'shrink wrapping machine',
    'sealing machine manufacturer',
    'vacuum packaging machine',
    'conveyor system manufacturer',
    'pallet stretch wrapping machine',
  ],
  alternates: { canonical: '/' },
};

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

  const homeStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: COMPANY_INFO.name,
      url: COMPANY_INFO.website,
      inLanguage: 'en-IN',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <HomePageClient
        initialProducts={products}
        initialCategories={categories}
        initialHeroSettings={heroSettings}
      />
    </>
  );
}
