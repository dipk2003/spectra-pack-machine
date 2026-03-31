import { getCategoryShowcase } from './categories';
import type { CategoryRecord } from './cms';
import type { ProductData } from './data';

export type ProductGroup = {
  category: string;
  slug: string;
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
  sourceType: 'default' | 'custom';
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

export type HeroCarouselCustomSlide = {
  id: string;
  accent: string;
  categoryName: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  quoteHref: string;
  detailHref: string;
  detailLabel: string;
};

export type HeroCarouselSettings = {
  overrides: HeroCarouselOverrideMap;
  orderedIds: string[];
  hiddenIds: string[];
  customSlides: HeroCarouselCustomSlide[];
};

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
  },
  'Shrink Wrapping Machines': {
    featuredSlug: 'automatic-web-sealer-with-shrink-tunnel-box',
    title: 'Automatic Web Sealer Line',
    subtitle: 'Secondary shrink packaging for atta bags, cartons, boxes, and grouped packs',
    description:
      'Automatic sealing and shrink tunnel workflow built for clean bundle wrapping, dispatch-ready box packs, and steady high-volume secondary packaging.',
    accent: 'High Output',
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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: unknown, maxLength = 2000) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const readStringArray = (
  value: unknown,
  maxItems = 20,
  maxLength = 120,
) =>
  Array.isArray(value)
    ? value
        .map((item) => readString(item, maxLength))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const isHeroCarouselSettingsShape = (input: unknown): input is Partial<HeroCarouselSettings> =>
  isPlainObject(input) &&
  ('overrides' in input || 'orderedIds' in input || 'hiddenIds' in input || 'customSlides' in input);

export const parseHeroCarouselOverrideMap = (
  input: unknown,
): HeroCarouselOverrideMap => {
  const source = isHeroCarouselSettingsShape(input) ? input.overrides : input;

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return {};
  }

  return Object.entries(source).reduce<HeroCarouselOverrideMap>((acc, [key, rawValue]) => {
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

const parseHeroCarouselCustomSlides = (input: unknown): HeroCarouselCustomSlide[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const usedIds = new Set<string>();

  return input.reduce<HeroCarouselCustomSlide[]>((acc, rawSlide, index) => {
    if (!isPlainObject(rawSlide)) {
      return acc;
    }

    const requestedId = slugify(readString(rawSlide.id, 120));
    const baseId = requestedId ? `custom-${requestedId.replace(/^custom-/, '')}` : `custom-slide-${index + 1}`;
    let id = baseId;
    let dedupeIndex = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${dedupeIndex}`;
      dedupeIndex += 1;
    }

    usedIds.add(id);

    const quoteHref = readString(rawSlide.quoteHref, 1000);
    const detailHref = readString(rawSlide.detailHref, 1000) || quoteHref || '/contact';

    acc.push({
      id,
      accent: readString(rawSlide.accent, 120) || 'Custom Slide',
      categoryName: readString(rawSlide.categoryName, 160) || 'Custom Campaign',
      title: readString(rawSlide.title, 180) || 'New Hero Slide',
      subtitle: readString(rawSlide.subtitle, 240),
      description:
        readString(rawSlide.description, 1200) ||
        'Admin-managed hero slide for promotions, launches, or featured packaging solutions.',
      image: readString(rawSlide.image, 1000),
      imageAlt: readString(rawSlide.imageAlt, 240),
      quoteHref,
      detailHref,
      detailLabel: readString(rawSlide.detailLabel, 80) || 'View Details',
    });

    return acc;
  }, []);
};

export const parseHeroCarouselSettings = (input: unknown): HeroCarouselSettings => {
  if (!isHeroCarouselSettingsShape(input)) {
    return {
      overrides: parseHeroCarouselOverrideMap(input),
      orderedIds: [],
      hiddenIds: [],
      customSlides: [],
    };
  }

  return {
    overrides: parseHeroCarouselOverrideMap(input.overrides),
    orderedIds: readStringArray(input.orderedIds, 40, 120),
    hiddenIds: readStringArray(input.hiddenIds, 40, 120),
    customSlides: parseHeroCarouselCustomSlides(input.customSlides),
  };
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
    const showcase = getCategoryShowcase(group.category, group.items);
    const existing = cards.get(group.slug);

    if (existing) {
      existing.machineCount = group.items.length;
      existing.name = existing.name || group.category;
      existing.description = existing.description || showcase.description;
      existing.accent = existing.accent || showcase.accent;
      existing.image = existing.image || showcase.image;
      return;
    }

    cards.set(group.slug, {
      name: group.category,
      slug: group.slug,
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
  heroConfig: HeroCarouselSettings | HeroCarouselOverrideMap = {},
): HeroCarouselSlide[] => {
  const heroSettings = parseHeroCarouselSettings(heroConfig);
  const groupMap = new Map(productGroups.map((group) => [group.slug, group.items]));
  const priorityMap = new Map<string, number>(
    HERO_CATEGORY_PRIORITY.map((category, index) => [category, index]),
  );

  const defaultSlides: HeroCarouselSlide[] = [...categoryCards]
    .sort((left, right) => {
      const leftPriority = priorityMap.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = priorityMap.get(right.name) ?? Number.MAX_SAFE_INTEGER;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name);
    })
    .map((category): HeroCarouselSlide => {
      const items = groupMap.get(category.slug) ?? [];
      const baseOverride = HERO_SLIDE_OVERRIDES[category.name];
      const customOverride = heroSettings.overrides[category.slug];
      const mergedOverride = {
        ...baseOverride,
        ...customOverride,
      };
      const featuredProduct =
        items.find((item) => item.slug === baseOverride?.featuredSlug) ?? items[0];
      const overrideImage = mergedOverride.image?.trim() || '';
      const overrideImageAlt = mergedOverride.imageAlt?.trim() || '';
      const slideImage =
        overrideImage || featuredProduct?.image?.trim() || category.image?.trim() || '';
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
        image: slideImage,
        imageAlt: slideImage
          ? overrideImageAlt ||
            featuredProduct?.imageAlt?.trim() ||
            `${category.name} packaging machine by Spectra Pack Machines`
          : '',
        machineCount: effectiveMachineCount,
        detailHref,
        detailLabel: featuredProduct ? 'View Machine' : 'View Category',
        quoteHref: mergedOverride.quoteHref ?? detailHref,
        highlights,
        sourceType: 'default',
      };
    });

  const hiddenSlideIds = new Set(heroSettings.hiddenIds);
  const visibleDefaultSlides = defaultSlides.filter((slide) => !hiddenSlideIds.has(slide.id));
  const customSlides: HeroCarouselSlide[] = heroSettings.customSlides.map((slide): HeroCarouselSlide => {
    const quoteHref = slide.quoteHref || slide.detailHref || '/contact';
    const detailHref = slide.detailHref || quoteHref || '/contact';
    const fallbackHighlights = [
      slide.subtitle || 'Admin-managed slide for homepage promotion and featured messaging.',
      slide.description || 'Update this custom slide from admin whenever campaigns change.',
    ]
      .filter(Boolean)
      .slice(0, 2);

    return {
      ...slide,
      imageAlt:
        slide.image && slide.imageAlt
          ? slide.imageAlt
          : slide.image
            ? `${slide.title} hero slide image`
            : '',
      machineCount: 0,
      detailHref,
      detailLabel: slide.detailLabel || 'View Details',
      quoteHref,
      highlights: fallbackHighlights,
      sourceType: 'custom' as const,
    };
  });

  const orderedIdMap = new Map(
    heroSettings.orderedIds.map((id, index) => [id, index]),
  );

  return [...visibleDefaultSlides, ...customSlides]
    .map((slide, index) => ({ slide, index }))
    .sort((left, right) => {
      const leftOrder = orderedIdMap.get(left.slide.id);
      const rightOrder = orderedIdMap.get(right.slide.id);

      if (leftOrder !== undefined && rightOrder !== undefined) {
        return leftOrder - rightOrder;
      }

      if (leftOrder !== undefined) {
        return -1;
      }

      if (rightOrder !== undefined) {
        return 1;
      }

      return left.index - right.index;
    })
    .map(({ slide }) => slide);
};
