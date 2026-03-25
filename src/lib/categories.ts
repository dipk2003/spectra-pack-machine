import type { ProductData } from './data';

export type CategoryShowcase = {
  image: string;
  description: string;
  accent: string;
};

type CategoryShowcaseCopy = Omit<CategoryShowcase, 'image'>;

export const CATEGORY_SHOWCASE: Record<string, CategoryShowcaseCopy> = {
  'Shrink Wrapping Machines': {
    description: 'L-sealers, web sealers, chamber units, and shrink tunnels for retail, cartons, and grouped packs.',
    accent: 'Shrink Build',
  },
  'Sealing Machines': {
    description: 'Band sealers and industrial sealing formats for pouches, bags, and continuous packaging lines.',
    accent: 'Seal Range',
  },
  'Vacuum Packaging Machines': {
    description: 'Vacuum packing systems for food, pharma, and shelf-life-driven packaging applications.',
    accent: 'Vacuum Range',
  },
  'Conveyor Systems': {
    description: 'PVC, modular, roller, and chain conveyors built for steady product flow and line integration.',
    accent: 'Flow Systems',
  },
  'Pallet Stretch Wrapping Machines': {
    description: 'Turntable pallet stretch wrapping machines for stable dispatch loads and warehouse movement.',
    accent: 'Dispatch Wrap',
  },
  'End-of-Line Packaging': {
    description: 'End-of-line packaging support for pallet handling, stabilization, and dispatch-ready output.',
    accent: 'Line Finish',
  },
};

export const categoryToSlug = (category: string) =>
  category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const getCategoryBySlug = (categories: readonly string[], slug: string) =>
  categories.find((category) => categoryToSlug(category) === slug) ?? null;

const getPrimaryProductImage = (items: readonly ProductData[]) =>
  items.find((item) => item.image.trim())?.image.trim() ?? '';

export const getCategoryShowcase = (
  category: string,
  items: readonly ProductData[],
): CategoryShowcase => {
  const categoryCopy = CATEGORY_SHOWCASE[category];

  return {
    image: getPrimaryProductImage(items),
    description:
      categoryCopy?.description ??
      items[0]?.shortDesc ??
      'Explore application-focused packaging machines from this machine family.',
    accent: categoryCopy?.accent ?? 'Machine Family',
  };
};
