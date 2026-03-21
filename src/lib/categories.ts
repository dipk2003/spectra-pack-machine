import type { ProductData } from './data';

export type CategoryShowcase = {
  image: string;
  description: string;
  accent: string;
};

export const CATEGORY_SHOWCASE: Record<string, CategoryShowcase> = {
  'Shrink Wrapping Machines': {
    image: '/images/products/l-sealer-with-shrink-tunnel-machine-indian.png',
    description: 'L-sealers, web sealers, chamber units, and shrink tunnels for retail, cartons, and grouped packs.',
    accent: 'Shrink Build',
  },
  'Sealing Machines': {
    image: '/images/products/band-sealer-machine.png',
    description: 'Band sealers and industrial sealing formats for pouches, bags, and continuous packaging lines.',
    accent: 'Seal Range',
  },
  'Vacuum Packaging Machines': {
    image: '/images/products/heavy-duty-table-top-vacuum-packaging-machines.png',
    description: 'Vacuum packing systems for food, pharma, and shelf-life-driven packaging applications.',
    accent: 'Vacuum Range',
  },
  'Conveyor Systems': {
    image: '/images/products/pvc-belt-conveyor.png',
    description: 'PVC, modular, roller, and chain conveyors built for steady product flow and line integration.',
    accent: 'Flow Systems',
  },
  'Pallet Stretch Wrapping Machines': {
    image: '/images/products/pallet-stretch-wrap-machine.png',
    description: 'Turntable pallet stretch wrapping machines for stable dispatch loads and warehouse movement.',
    accent: 'Dispatch Wrap',
  },
  'End-of-Line Packaging': {
    image: '/images/products/pallet-stretch-wrap-machine.png',
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

export const getCategoryShowcase = (category: string, items: readonly ProductData[]): CategoryShowcase =>
  CATEGORY_SHOWCASE[category] ?? {
    image: items[0]?.image ?? '/images/products/l-sealer-with-shrink-tunnel-machine-indian.png',
    description: items[0]?.shortDesc ?? 'Explore application-focused packaging machines from this machine family.',
    accent: 'Machine Family',
  };
