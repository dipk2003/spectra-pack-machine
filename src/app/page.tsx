import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { getSiteSetting, listCategories, listProducts } from '@/lib/cms';
import { parseHeroCarouselSettings } from '@/lib/home-hero';
import { FAQS } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Packaging Machine Manufacturer in India | Spectra Pack Machines' },
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

const getHomePageData = async () => {
  try {
    const [products, categories, heroSetting] = await Promise.all([
      listProducts({ publishedOnly: true }),
      listCategories({ publishedOnly: true }),
      getSiteSetting('hero_carousel_overrides', { access: 'public' }),
    ]);
    const rawHeroSettings = heroSetting?.jsonValue || (() => {
      try {
        return heroSetting?.value ? JSON.parse(heroSetting.value) : {};
      } catch {
        return {};
      }
    })();

    return {
      products,
      categories,
      heroSettings: parseHeroCarouselSettings(rawHeroSettings),
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
