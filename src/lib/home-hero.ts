import { categoryToSlug, getCategoryShowcase } from './categories';
import type { CategoryRecord } from './cms';
import type { ProductData } from './data';

export type ProductGroup = {
  category: string;
  items: ProductData[];
};

export type CategoryCardData = {
  name: string;
  slug: string;
  description: string;
  accent: string;
  image: string;
  sortOrder: number;
  machineCount: number;
};

export type HeroCarouselSlide = {
  id: string;
  accent: string;
  categoryName: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  machineCount: number;
  detailHref: string;
  detailLabel: string;
  quoteHref: string;
  highlights: string[];
};

type HeroSlideBaseOverride = {
  featuredSlug?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  accent?: string;
  image?: string;
  imageAlt?: string;
  quoteHref?: string;
};

export type HeroCarouselOverrideFields = {
  accent?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  quoteHref?: string;
};

export type HeroCarouselOverrideMap = Record<string, HeroCarouselOverrideFields>;

const HERO_CATEGORY_PRIORITY = [
  'Sealing Machines',
  'Shrink Wrapping Machines',
  'Vacuum Packaging Machines',
  'Conveyor Systems',
  'Pallet Stretch Wrapping Machines',
  'End-of-Line Packaging',
] as const;

const HERO_SLIDE_OVERRIDES: Record<string, HeroSlideBaseOverride> = {
  'Sealing Machines': {
    featuredSlug: 'band-sealer-machine',
    title: 'Band Sealer Machine',
    subtitle: 'Continuous pouch sealing line for food, powder, and industrial bags',
    description:
      'A conveyor-fed band sealer with forced-air cooling that keeps pouch sealing fast, clean, and production-ready for regular daily output.',
    accent: 'Top Seller',
    image: '/images/products/band-sealer-machine-updated.jpeg',
    imageAlt: 'Band Sealer Machine by Spectra Pack Machines',
  },
  'Shrink Wrapping Machines': {
    featuredSlug: 'automatic-web-sealer-with-shrink-tunnel-box',
    title: 'Automatic Web Sealer Line',
    subtitle: 'Secondary shrink packaging for atta bags, cartons, boxes, and grouped packs',
    description:
      'Automatic sealing and shrink tunnel workflow built for clean bundle wrapping, dispatch-ready box packs, and steady high-volume secondary packaging.',
    accent: 'High Output',
    image: '/images/products/automatic-web-sealer-with-shrink-tunnel-box.png',
  },
  'Vacuum Packaging Machines': {
    featuredSlug: 'double-door-chamber-vacuum-machine-with-conveyor',
    title: 'Vacuum Packaging System',
    subtitle: 'Shelf-life-focused vacuum packing for food, pharma, and industrial applications',
    description:
      'Heavy-duty vacuum packaging setups designed for strong sealing, controlled evacuation, and repeatable pack quality where product protection matters.',
    accent: 'Vacuum Range',
  },
  'Conveyor Systems': {
    featuredSlug: 'pvc-belt-conveyor',
    title: 'Conveyor Handling System',
    subtitle: 'Smooth product transfer for packaging lines, loading zones, and dispatch flow',
    description:
      'PVC, modular, chain, and roller conveyor options built to move products steadily between machine stations without breaking line rhythm.',
    accent: 'Flow Systems',
  },
  'Pallet Stretch Wrapping Machines': {
    featuredSlug: 'pallet-stretch-wrapping-machine',
    title: 'Pallet Stretch Wrapper',
    subtitle: 'Stable pallet wrapping for warehouse staging, dispatch, and transport protection',
    description:
      'Automatic pallet wrapping solutions that improve load stability, wrapping consistency, and warehouse handling before dispatch.',
    accent: 'Dispatch Wrap',
  },
  'End-of-Line Packaging': {
    featuredSlug: 'pallet-stretch-wrap-machine',
    title: 'End-of-Line Wrap System',
    subtitle: 'Final-stage load securing and dispatch preparation for production output',
    description:
      'End-of-line packaging machines focused on pallet stabilization and clean outbound preparation once production and grouping are complete.',
    accent: 'Line Finish',
  },
};

const readString = (value: unknown, maxLength = 2000) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export const parseHeroCarouselOverrideMap = (
  input: unknown,
): HeroCarouselOverrideMap => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return Object.entries(input).reduce<HeroCarouselOverrideMap>((acc, [key, rawValue]) => {
    if (!key || !rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return acc;
    }

    const value = rawValue as Record<string, unknown>;
    const override: HeroCarouselOverrideFields = {};

    const accent = readString(value.accent, 120);
    const title = readString(value.title, 180);
    const subtitle = readString(value.subtitle, 240);
    const description = readString(value.description, 1200);
    const image = readString(value.image, 1000);
    const imageAlt = readString(value.imageAlt, 240);
    const quoteHref = readString(value.quoteHref, 1000);

    if (accent) override.accent = accent;
    if (title) override.title = title;
    if (subtitle) override.subtitle = subtitle;
    if (description) override.description = description;
    if (image) override.image = image;
    if (imageAlt) override.imageAlt = imageAlt;
    if (quoteHref) override.quoteHref = quoteHref;

    if (Object.keys(override).length > 0) {
      acc[key] = override;
    }

    return acc;
  }, {});
};

export const buildCategoryCards = (
  productGroups: ProductGroup[],
  categories: CategoryRecord[],
): CategoryCardData[] => {
  const cards = new Map<string, CategoryCardData>();

  categories.forEach((category, index) => {
    cards.set(category.slug, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      accent: category.accent,
      image: category.image,
      sortOrder: category.sortOrder ?? index,
      machineCount: 0,
    });
  });

  productGroups.forEach((group, index) => {
    const slug = categoryToSlug(group.category);
    const showcase = getCategoryShowcase(group.category, group.items);
    const existing = cards.get(slug);

    if (existing) {
      existing.machineCount = group.items.length;
      existing.name = existing.name || group.category;
      existing.description = existing.description || showcase.description;
      existing.accent = existing.accent || showcase.accent;
      existing.image = existing.image || showcase.image;
      return;
    }

    cards.set(slug, {
      name: group.category,
      slug,
      description: showcase.description,
      accent: showcase.accent,
      image: showcase.image,
      sortOrder: categories.length + index,
      machineCount: group.items.length,
    });
  });

  return Array.from(cards.values()).sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
};

export const buildHeroSlides = (
  productGroups: ProductGroup[],
  categoryCards: CategoryCardData[],
  heroOverrides: HeroCarouselOverrideMap = {},
): HeroCarouselSlide[] => {
  const groupMap = new Map(productGroups.map((group) => [group.category, group.items]));
  const priorityMap = new Map<string, number>(
    HERO_CATEGORY_PRIORITY.map((category, index) => [category, index]),
  );

  return [...categoryCards]
    .sort((left, right) => {
      const leftPriority = priorityMap.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = priorityMap.get(right.name) ?? Number.MAX_SAFE_INTEGER;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name);
    })
    .map((category) => {
      const items = groupMap.get(category.name) ?? [];
      const baseOverride = HERO_SLIDE_OVERRIDES[category.name];
      const customOverride = heroOverrides[category.slug];
      const mergedOverride = {
        ...baseOverride,
        ...customOverride,
      };
      const featuredProduct =
        items.find((item) => item.slug === baseOverride?.featuredSlug) ?? items[0];
      const detailHref = featuredProduct
        ? `/products/${featuredProduct.slug}`
        : `/products/category/${category.slug}`;
      const effectiveMachineCount = category.machineCount || items.length;
      const highlights =
        featuredProduct?.features.filter(Boolean).slice(0, 2) ?? [
          effectiveMachineCount > 0
            ? `${effectiveMachineCount} machine ${
                effectiveMachineCount === 1 ? 'option' : 'options'
              } available in this family.`
            : 'Application-focused machine options available on request.',
          category.description ||
            'Explore production-ready packaging machines from this machine family.',
        ];

      return {
        id: category.slug,
        accent: mergedOverride.accent ?? category.accent ?? 'Machine Family',
        categoryName: category.name,
        title: mergedOverride.title ?? featuredProduct?.title ?? category.name,
        subtitle:
          mergedOverride.subtitle ?? featuredProduct?.shortDesc ?? category.description,
        description:
          mergedOverride.description ??
          category.description ??
          featuredProduct?.shortDesc ??
          'Explore production-ready packaging machines from this machine family.',
        image: mergedOverride.image ?? featuredProduct?.image ?? category.image,
        imageAlt:
          mergedOverride.imageAlt ??
          featuredProduct?.imageAlt ??
          `${category.name} packaging machine by Spectra Pack Machines`,
        machineCount: effectiveMachineCount,
        detailHref,
        detailLabel: featuredProduct ? 'View Machine' : 'View Category',
        quoteHref: mergedOverride.quoteHref ?? detailHref,
        highlights,
      };
    });
};
