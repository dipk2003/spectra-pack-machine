import HomePageClient from './HomePageClient';
import { getSiteSetting, listCategories, listProducts } from '@/lib/cms';
import { parseHeroCarouselOverrideMap } from '@/lib/home-hero';

export const dynamic = 'force-dynamic';

const getHeroOverrides = async () => {
  try {
    const heroOverrideSetting = await getSiteSetting('hero_carousel_overrides', {
      access: 'public',
    });

    if (!heroOverrideSetting) {
      return {};
    }

    if (heroOverrideSetting.jsonValue) {
      return parseHeroCarouselOverrideMap(heroOverrideSetting.jsonValue);
    }

    if (!heroOverrideSetting.value) {
      return {};
    }

    return parseHeroCarouselOverrideMap(JSON.parse(heroOverrideSetting.value));
  } catch {
    return {};
  }
};

export default async function HomePage() {
  const [resolvedProducts, categories, heroOverrides] = await Promise.all([
    listProducts({ publishedOnly: true }),
    listCategories({ publishedOnly: true }),
    getHeroOverrides(),
  ]);

  return (
    <HomePageClient
      initialProducts={resolvedProducts}
      initialCategories={categories}
      initialHeroOverrides={heroOverrides}
    />
  );
}
