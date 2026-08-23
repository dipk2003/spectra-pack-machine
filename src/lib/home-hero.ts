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

const FEATURED_LINE_SLIDES: HeroCarouselSlide[] = [
  {
    id: 'featured-liquid-filling-line',
    accent: 'Complete Automation',
    categoryName: 'Liquid Filling Solutions',
    title: 'Automatic Liquid Filling Line',
    subtitle: 'Bottle feeding, filling, capping and labelling in one synchronized line',
    description:
      'A production-ready bottling setup engineered for accurate dosing, repeatable container handling and clean end-of-line output. Every line is configured around your liquid, bottle format and target speed.',
    image: '/images/hero/automatic-liquid-filling-line-cutout.png',
    imageAlt:
      'Automatic liquid filling, capping and labelling line manufactured by Spectra Pack Machines',
    machineCount: 1,
    detailHref: '/services/custom-design',
    detailLabel: 'Plan Your Line',
    quoteHref:
      '/contact?machine=Automatic+Liquid+Filling+Line&source=home-hero',
    highlights: [
      'Integrated filling, capping and labelling workflow',
      'Configured for your product, container and output target',
    ],
    sourceType: 'default',
  },
  {
    id: 'featured-atta-packaging-line',
    accent: 'High-Output Line',
    categoryName: 'Atta & Bulk Bag Packaging',
    title: 'Automatic Atta Packaging Setup',
    subtitle: 'Integrated conveying, sealing and shrink finishing for flour and bulk-product bags',
    description:
      'A complete secondary packaging line for smooth bag transfer, consistent sealing and tight shrink finishing. Built to reduce manual handling and deliver repeatable, dispatch-ready packs.',
    image: '/images/hero/automatic-atta-packaging-line-cutout.png',
    imageAlt:
      'Automatic atta bag conveying, sealing and shrink packaging setup by Spectra Pack Machines',
    machineCount: 1,
    detailHref: '/services/custom-design',
    detailLabel: 'Plan Your Line',
    quoteHref:
      '/contact?machine=Automatic+Atta+Packaging+Setup&source=home-hero',
    highlights: [
      'Continuous bag transfer with automatic shrink finishing',
      'Designed for atta bags, grouped packs and production dispatch',
    ],
    sourceType: 'default',
  },
];

const FEATURED_LINE_SLIDE_IDS = new Set(
  FEATURED_LINE_SLIDES.map((slide) => slide.id),
);

type HeroDisplayCopyProfile = Pick<
  HeroCarouselSlide,
  'accent' | 'categoryName' | 'title' | 'subtitle' | 'description'
> & {
  detailHref?: string;
  imageAlt?: string;
};

const LIQUID_FILLING_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Complete Bottling',
  categoryName: 'Liquid Filling Lines',
  title: 'Automatic Liquid Filling Line',
  subtitle:
    'Integrated bottle feeding, filling, capping and labelling for continuous production',
  description:
    'A synchronized line for accurate dosing, repeatable container handling and clean finished bottles. Configured around your liquid, bottle format and target output.',
  detailHref: '/services/custom-design',
};

const ATTA_LINE_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'High-Output Line',
  categoryName: 'Atta & Bulk Bag Lines',
  title: 'Automatic Atta Packaging Line',
  subtitle:
    'Conveying, web sealing and shrink finishing for flour bags and bulk-product packs',
  description:
    'An integrated secondary-packaging line that transfers bags smoothly, seals film consistently and produces tight, dispatch-ready packs with less manual handling.',
  detailHref: '/services/custom-design',
};

const SEMI_AUTOMATIC_BOTTLE_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Operator-Fed System',
  categoryName: 'Bottle Shrink Packaging',
  title: 'Semi-Automatic Bottle Shrink Line',
  subtitle:
    'Operator-fed web sealing and uniform tunnel shrinking for grouped bottle packs',
  description:
    'A flexible solution for medium-volume bottle bundling. Controlled film sealing and even heat shrinking create secure multipacks with a clean finish.',
  detailHref: '/products/semi-automatic-web-sealer-with-shrink-tunnel',
};

const AUTOMATIC_BOTTLE_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Automatic Multipacking',
  categoryName: 'Bottle Multipack Systems',
  title: 'Automatic Bottle Shrink-Wrap Line',
  subtitle:
    'Continuous film sealing and heat shrinking for PET bottles, cans and containers',
  description:
    'Automatically groups bottles, seals the film and passes each pack through a shrink tunnel. Built for repeatable multipacks with reduced operator handling.',
  detailHref: '/products/automatic-web-sealer-with-shrink-tunnel-bottles',
};

const COMPACT_L_SEALER_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Flexible Shrink Pack',
  categoryName: 'L-Sealer Systems',
  title: 'Compact L-Sealer Shrink Line',
  subtitle:
    'Precise L-sealing and tunnel shrinking for cartons, retail packs and regular products',
  description:
    'An operator-friendly solution for varied product sizes. The L-sealer forms clean film edges before the tunnel produces a tight, tamper-evident finish.',
  detailHref: '/products/l-sealer-with-shrink-tunnel-machine',
};

const BAND_SEALER_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Continuous Pouch Sealing',
  categoryName: 'Continuous Band Sealers',
  title: 'Band Sealer Machine',
  subtitle:
    'Continuous conveyor sealing and forced-air cooling for filled pouches',
  description:
    'Pouches move through heated sealing bands for a repeatable seam, followed by forced-air cooling for a clean finish during regular production runs.',
  detailHref: '/products/band-sealer-machine',
};

const PNEUMATIC_SEALER_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Air-Powered Sealing',
  categoryName: 'Pneumatic Sealers',
  title: 'Pneumatic Impulse Sealer',
  subtitle:
    'Controlled air-pressure sealing for large bags and demanding industrial applications',
  description:
    'Pneumatic actuation delivers repeatable sealing pressure with less operator effort. A practical choice for thicker materials and continuous production duty.',
};

const CONVEYOR_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Line Integration',
  categoryName: 'Conveyor Systems',
  title: 'PVC Belt Conveyor',
  subtitle:
    'Smooth, low-noise transfer between filling, sealing and packaging stations',
  description:
    'A configurable PVC belt conveyor for cartons, pouches, bottles and components. Its dimensions, height and speed can be matched to your production-line layout.',
  detailHref: '/products/pvc-belt-conveyor',
  imageAlt:
    'PVC belt conveyor with carton-handling applications by Spectra Pack Machines',
};

const PALLET_WRAPPER_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Secure Dispatch Loads',
  categoryName: 'Pallet Wrapping Systems',
  title: 'Pallet Stretch Wrapping Machine',
  subtitle:
    'Uniform stretch-film application for stable loads during storage and transportation',
  description:
    'Adjustable film tension and wrap cycles secure palletized goods consistently, reduce manual wrapping and protect loads from shifting, dust and moisture.',
  detailHref: '/products/pallet-stretch-wrapping',
};

const SLEEVE_SHRINK_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Shrink Sleeve Finishing',
  categoryName: 'Sleeve Shrink Systems',
  title: 'Sleeve Shrink Wrapping Machine',
  subtitle:
    'Sleeve sealing and tunnel shrinking for single products and multipacks',
  description:
    'Sleeve film is sealed around the pack and finished with controlled tunnel heat for a tight, even result. Semi-automatic or automatic configurations are available.',
  detailHref: '/products/sleeve-shrink-wrapping-machine',
};

const BOX_SHRINK_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Automatic Box Wrapping',
  categoryName: 'Carton & Box Shrink Lines',
  title: 'Automatic Box Shrink-Wrap Line',
  subtitle:
    'Continuous web sealing and tunnel shrinking for cartons, boxes and rigid packs',
  description:
    'Wraps boxes from a film roll, seals each pack and applies controlled tunnel heat for a tight finish. Built for repeatable, high-volume secondary packaging.',
  detailHref: '/products/automatic-web-sealer-with-shrink-tunnel-box',
};

const SEMI_AUTOMATIC_SHRINK_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Flexible Production',
  categoryName: 'Semi-Automatic Shrink Lines',
  title: 'Semi-Automatic Web Sealer & Tunnel',
  subtitle:
    'Operator-assisted film sealing and uniform shrinking for varied product formats',
  description:
    'Designed for flexible production where packs are loaded manually and finished through an integrated shrink tunnel. Supports LDPE, POF and PVC films.',
  detailHref: '/products/semi-automatic-web-sealer-with-shrink-tunnel',
};

const CARTON_TAPING_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'End-of-Line Automation',
  categoryName: 'Carton Sealing & Strapping',
  title: 'Automatic Carton Taping & Strapping',
  subtitle:
    'Top-and-bottom tape sealing followed by PP strapping for secure carton dispatch',
  description:
    'A continuous system that closes cartons with BOPP tape and applies secure PP straps. It improves throughput and load stability with less manual handling.',
  detailHref: '/products/automatic-carton-taping-with-box-strapping',
};

const L_SEALER_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Clean Shrink Finish',
  categoryName: 'L-Sealer Shrink Systems',
  title: 'L-Sealer with Shrink Tunnel',
  subtitle:
    'Clean edge sealing and uniform shrinking for boxes, cartons and retail products',
  description:
    'The L-sealer encloses each product in film before the tunnel shrinks it evenly. Suitable for regular packs needing consistent protection and presentation.',
  detailHref: '/products/l-sealer-with-shrink-tunnel-machine',
};

const VACUUM_LINE_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'High-Volume Vacuum',
  categoryName: 'Vacuum Packaging Systems',
  title: 'Double-Door Chamber Vacuum Line',
  subtitle:
    'Dual-chamber vacuum sealing with conveyor transfer for continuous industrial output',
  description:
    'While one chamber seals, the other can be loaded to reduce idle time. The conveyor supports steady throughput and airtight packs for food, pharma and industry.',
  detailHref: '/products/double-door-chamber-vacuum-machine-with-conveyor',
  imageAlt:
    'Double-door chamber vacuum packaging machine with conveyor by Spectra Pack Machines',
};

const BOTTLE_BUNDLE_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Multipack Formats',
  categoryName: 'Bottle Bundle Packaging',
  title: 'Bottle Bundle Shrink System',
  subtitle:
    'Configurable shrink packs for PET bottles, glass bottles, cans and containers',
  description:
    'Creates compact bottle bundles in formats such as 2×2, 3×2 and 4×3. Film sealing and controlled shrinking deliver stable packs for handling and distribution.',
  detailHref: '/products/automatic-web-sealer-with-shrink-tunnel-bottles',
};

const PORTABLE_SHRINK_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Compact & Mobile',
  categoryName: 'Portable Shrink Systems',
  title: 'Portable Shrink Tunnel',
  subtitle:
    'Movable heat-shrink finishing for small and medium production areas',
  description:
    'A space-saving tunnel that circulates controlled hot air for even film shrinking. Its mobile format supports flexible placement across packaging workstations.',
  detailHref: '/products/portable-shrink-tunnel',
};

const END_OF_LINE_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Dispatch Ready',
  categoryName: 'End-of-Line Packaging',
  title: 'End-of-Line Wrap System',
  subtitle: 'Final-stage pallet stabilization for safer storage and outbound transport',
  description:
    'A repeatable stretch-wrapping workflow that secures finished pallet loads, reduces manual film application and prepares goods for dependable dispatch.',
  detailHref: '/products/pallet-stretch-wrap-machine',
};

const NOZZLE_VACUUM_DISPLAY_COPY: HeroDisplayCopyProfile = {
  accent: 'Industrial Vacuum',
  categoryName: 'Nozzle Vacuum Packaging',
  title: 'Nozzle Vacuum Sealer',
  subtitle: 'Air extraction and strong sealing for large bags and industrial products',
  description:
    'A heavy-duty nozzle system removes excess air before sealing larger packs, helping improve pack stability and protection during handling and storage.',
};

const HERO_DISPLAY_COPY_BY_ID: Record<string, HeroDisplayCopyProfile> = {
  'featured-liquid-filling-line': LIQUID_FILLING_DISPLAY_COPY,
  'featured-atta-packaging-line': ATTA_LINE_DISPLAY_COPY,
  'custom-1782659629659-jzihz1': SEMI_AUTOMATIC_BOTTLE_DISPLAY_COPY,
  'custom-1775110186198-wma4ln': AUTOMATIC_BOTTLE_DISPLAY_COPY,
  'custom-1782659627155-kzdzh3': COMPACT_L_SEALER_DISPLAY_COPY,
  'custom-1775110170502-2x1dkv': PALLET_WRAPPER_DISPLAY_COPY,
  'sealing-machines': BAND_SEALER_DISPLAY_COPY,
  'band-sealing-machines': BAND_SEALER_DISPLAY_COPY,
  'pneumatic-impulse-sealing': PNEUMATIC_SEALER_DISPLAY_COPY,
  conveyors: CONVEYOR_DISPLAY_COPY,
  'conveyor-systems': CONVEYOR_DISPLAY_COPY,
  'pallet-stretch-wrapping-machines': PALLET_WRAPPER_DISPLAY_COPY,
  'shrink-wrapping-machines': SLEEVE_SHRINK_DISPLAY_COPY,
  'automatic-web-sealer-with-shrink-tunnel-machines': BOX_SHRINK_DISPLAY_COPY,
  'semi-automatic-web-sealer-with-shrink-tunnel': SEMI_AUTOMATIC_SHRINK_DISPLAY_COPY,
  'automatic-carton-taping-with-box-strapping': CARTON_TAPING_DISPLAY_COPY,
  'l-sealer-with-shrink-tunnel': L_SEALER_DISPLAY_COPY,
  'vacuum-packaging-machines': VACUUM_LINE_DISPLAY_COPY,
  'automatic-web-sealer-with-shrink-tunnel-bottles': BOTTLE_BUNDLE_DISPLAY_COPY,
  'heavy-duty-shrink-tunnel-machines': PORTABLE_SHRINK_DISPLAY_COPY,
  'end-of-line-packaging': END_OF_LINE_DISPLAY_COPY,
  'heavy-duty-top-packaging': NOZZLE_VACUUM_DISPLAY_COPY,
};

const HERO_DISPLAY_LIMITS = {
  accent: 24,
  categoryName: 45,
  title: 42,
  subtitle: 90,
  description: 180,
} as const;

type HeroLegacyCopyFingerprint = Partial<
  Pick<
    HeroCarouselSlide,
    'accent' | 'categoryName' | 'title' | 'subtitle' | 'description'
  >
>;

const HERO_LEGACY_COPY_BY_ID: Record<string, HeroLegacyCopyFingerprint> = {
  'custom-1782659629659-jzihz1': {
    categoryName: 'Shrink Tunnel Machines',
  },
  'custom-1775110186198-wma4ln': {
    accent: 'Shrink Tunnel Machines',
    categoryName: 'Shrink Tunnel',
    subtitle: 'Fast, Reliable Bottle Packaging Solution',
  },
  'custom-1782659627155-kzdzh3': {
    categoryName: 'L Sealer Machines',
    title: 'L Sealer with shrink tunnel',
  },
  'custom-1775110170502-2x1dkv': {
    categoryName: 'Pallet Stretch Wrapping Machines',
    title: 'Pallet Stretch Wrapping',
  },
  'sealing-machines': {
    accent: 'Band Sealing Machines',
    categoryName: 'Foot Sealing Machines',
    title: 'Vertical Band Sealer Machine Indian Model',
  },
  conveyors: {
    accent: 'Conveyors',
    categoryName: 'Conveyors',
  },
  'shrink-wrapping-machines': {
    accent: 'Shrink Wrapping Machines',
    categoryName: 'Sleeve Shrink Wrapping Machines - Applicator',
    title: 'Sleeve Shrink Wrapping Machine - Applicator',
    subtitle:
      'Fast, Precise & Reliable Sleeve Application for Professional Packaging.',
    description:
      'Our Sleeve Applicator is designed for smooth and accurate application of shrink sleeves on bottles, jars, containers, and various products. With efficient automation and reliable performance, it ensures consistent sleeve placement, higher productivity, and a professional packaging finish. Perfect for: FMCG | Pharmaceuticals | Food & Beverage | Cosmetics | Consumer Products',
  },
  'automatic-web-sealer-with-shrink-tunnel-machines': {
    accent: 'For Boxes',
  },
  'semi-automatic-web-sealer-with-shrink-tunnel': {
    accent: 'Shrink Tunnel Machines',
  },
  'automatic-carton-taping-with-box-strapping': {
    accent: 'Carton Taping Machines',
  },
  'l-sealer-with-shrink-tunnel': {
    accent: 'L Sealer Machines',
    categoryName: 'L Sealer with shrink tunnel',
    title: 'L Sealer with Shrink Tunnel Machine',
  },
  'vacuum-packaging-machines': {
    accent: 'Vacuum Range',
    categoryName: 'Vacuum Packaging Machines',
    title: 'Vacuum Packaging System',
    subtitle:
      'Shelf-life-focused vacuum packing for food, pharma, and industrial applications',
    description:
      'Heavy-duty vacuum packaging setups designed for strong sealing, controlled evacuation, and repeatable pack quality where product protection matters.',
  },
  'automatic-web-sealer-with-shrink-tunnel-bottles': {
    accent: 'For Bottles',
  },
  'heavy-duty-shrink-tunnel-machines': {
    accent: 'Shrink Tunnel',
    categoryName: 'Heavy Duty Shrink Tunnel Machines',
    title: 'Portable Shrink Tunnel',
    subtitle:
      'Portable Shrink Tunnel Machine is a compact and movable packaging solution designed to shrink-wrap products efficiently with uniform heat, giving a tight and professional finish.',
    description:
      'Designed for continuous industrial packaging operations, the Heavy Duty Shrink Tunnel Machine delivers uniform heat distribution, reliable shrink performance, and consistent finishing even under demanding production conditions. Its robust construction and efficient heating system make it suitable for large products, heavy packaging loads, and high-volume production lines.',
  },
};

const collapseHeroWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const normalizeHeroCopyForComparison = (value: string) =>
  collapseHeroWhitespace(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const removeLegacyHeroDisplayField = (
  slideId: string,
  field: keyof HeroLegacyCopyFingerprint,
  value: string,
) => {
  const legacyValue = HERO_LEGACY_COPY_BY_ID[slideId]?.[field];

  if (
    legacyValue &&
    normalizeHeroCopyForComparison(value) ===
      normalizeHeroCopyForComparison(legacyValue)
  ) {
    return '';
  }

  return value;
};

const shortenHeroDisplayCopy = (
  value: string,
  maxLength: number,
  addTerminalPeriod = false,
) => {
  const normalized = collapseHeroWhitespace(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const contentLimit = addTerminalPeriod
    ? Math.max(1, maxLength - 1)
    : maxLength;
  const candidate = normalized.slice(0, contentLimit + 1);
  const lastWordBoundary = candidate.lastIndexOf(' ');
  const shortened = candidate
    .slice(
      0,
      lastWordBoundary > contentLimit * 0.55
        ? lastWordBoundary
        : contentLimit,
    )
    .replace(/[,:;.!?\-\s]+$/g, '')
    .trim();

  if (!addTerminalPeriod || !shortened) {
    return shortened;
  }

  return `${shortened}.`;
};

const resolveHeroDisplayField = (
  value: string,
  curatedValue: string | undefined,
  maxLength: number,
  addTerminalPeriod = false,
) => {
  const normalized = collapseHeroWhitespace(value);

  if (normalized && normalized.length <= maxLength) {
    return normalized;
  }

  const curated = collapseHeroWhitespace(curatedValue ?? '');
  if (curated) {
    return shortenHeroDisplayCopy(
      curated,
      maxLength,
      addTerminalPeriod,
    );
  }

  return shortenHeroDisplayCopy(normalized, maxLength, addTerminalPeriod);
};

const normalizeHeroHref = (href: string) => {
  const normalized = href.trim();
  return /^\/https?:\/\//i.test(normalized) ? normalized.slice(1) : normalized;
};

const getCustomHeroDisplayCopy = (slide: HeroCarouselSlide) => {
  if (slide.sourceType !== 'custom') {
    return undefined;
  }

  const searchText = normalizeHeroCopyForComparison(
    `${slide.title} ${slide.categoryName} ${slide.accent}`,
  );

  if (searchText.includes('pallet stretch')) {
    return PALLET_WRAPPER_DISPLAY_COPY;
  }

  if (searchText.includes('l sealer')) {
    return COMPACT_L_SEALER_DISPLAY_COPY;
  }

  if (searchText.includes('semi automatic') && searchText.includes('shrink tunnel')) {
    return SEMI_AUTOMATIC_BOTTLE_DISPLAY_COPY;
  }

  if (
    searchText.includes('automatic web sealer') &&
    searchText.includes('bottle')
  ) {
    return AUTOMATIC_BOTTLE_DISPLAY_COPY;
  }

  return undefined;
};

export const resolveHeroSlidesForDisplay = (
  slides: HeroCarouselSlide[],
): HeroCarouselSlide[] =>
  slides.map((slide) => {
    const curatedCopy =
      HERO_DISPLAY_COPY_BY_ID[slide.id] ?? getCustomHeroDisplayCopy(slide);
    const rawAccent = removeLegacyHeroDisplayField(
      slide.id,
      'accent',
      collapseHeroWhitespace(slide.accent),
    );
    const rawTitle = removeLegacyHeroDisplayField(
      slide.id,
      'title',
      collapseHeroWhitespace(slide.title),
    );
    const rawCategoryName = removeLegacyHeroDisplayField(
      slide.id,
      'categoryName',
      collapseHeroWhitespace(slide.categoryName),
    );
    const rawSubtitle = removeLegacyHeroDisplayField(
      slide.id,
      'subtitle',
      collapseHeroWhitespace(slide.subtitle),
    );
    const rawDescription = removeLegacyHeroDisplayField(
      slide.id,
      'description',
      collapseHeroWhitespace(slide.description),
    );
    const hasRepeatedHeading =
      normalizeHeroCopyForComparison(rawTitle) ===
      normalizeHeroCopyForComparison(rawCategoryName);
    const normalizedSubtitle = normalizeHeroCopyForComparison(rawSubtitle);
    const normalizedDescription = normalizeHeroCopyForComparison(rawDescription);
    const hasRepeatedBodyCopy =
      Boolean(normalizedSubtitle) &&
      Boolean(normalizedDescription) &&
      (normalizedSubtitle === normalizedDescription ||
        (normalizedSubtitle.length > 80 &&
          normalizedDescription.includes(normalizedSubtitle)) ||
        (normalizedDescription.length > 80 &&
          normalizedSubtitle.includes(normalizedDescription)));
    const accent = resolveHeroDisplayField(
      rawAccent,
      curatedCopy?.accent,
      HERO_DISPLAY_LIMITS.accent,
    );
    const categoryName = resolveHeroDisplayField(
      hasRepeatedHeading && curatedCopy ? '' : rawCategoryName,
      curatedCopy?.categoryName,
      HERO_DISPLAY_LIMITS.categoryName,
    );
    const title = resolveHeroDisplayField(
      hasRepeatedHeading && curatedCopy ? '' : rawTitle,
      curatedCopy?.title,
      HERO_DISPLAY_LIMITS.title,
    );
    const subtitle = resolveHeroDisplayField(
      rawSubtitle,
      curatedCopy?.subtitle,
      HERO_DISPLAY_LIMITS.subtitle,
      true,
    );
    const description = resolveHeroDisplayField(
      hasRepeatedBodyCopy ? '' : rawDescription,
      curatedCopy?.description,
      HERO_DISPLAY_LIMITS.description,
      true,
    );
    const detailHref = normalizeHeroHref(
      curatedCopy?.detailHref ?? slide.detailHref,
    );
    const imageAlt = collapseHeroWhitespace(
      curatedCopy?.imageAlt ?? slide.imageAlt,
    );
    const normalizedQuoteHref = normalizeHeroHref(slide.quoteHref);
    const contactQuoteHref = `/contact?machine=${encodeURIComponent(
      title,
    )}&source=home-hero`;
    const quoteHref =
      normalizedQuoteHref.startsWith('/contact')
        ? normalizedQuoteHref
        : curatedCopy || !normalizedQuoteHref || normalizedQuoteHref === detailHref
          ? contactQuoteHref
          : normalizedQuoteHref;

    return {
      ...slide,
      accent,
      categoryName,
      title,
      subtitle,
      description,
      imageAlt,
      detailHref,
      quoteHref,
    };
  });

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
  const visibleFeaturedSlides = FEATURED_LINE_SLIDES
    .map((slide): HeroCarouselSlide => {
      const override = heroSettings.overrides[slide.id];
      const image = override?.image ?? slide.image;

      return {
        ...slide,
        ...override,
        image,
        imageAlt:
          override?.imageAlt ??
          (image === slide.image
            ? slide.imageAlt
            : `${override?.title ?? slide.title} hero slide image`),
      };
    })
    .filter((slide) => !hiddenSlideIds.has(slide.id));
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

  const orderedSlides = [...visibleFeaturedSlides, ...visibleDefaultSlides, ...customSlides]
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

  const hasExplicitFeaturedOrder = heroSettings.orderedIds.some((id) =>
    FEATURED_LINE_SLIDE_IDS.has(id),
  );

  if (hasExplicitFeaturedOrder) {
    return orderedSlides;
  }

  return [
    ...orderedSlides.filter((slide) => FEATURED_LINE_SLIDE_IDS.has(slide.id)),
    ...orderedSlides.filter((slide) => !FEATURED_LINE_SLIDE_IDS.has(slide.id)),
  ];
};
