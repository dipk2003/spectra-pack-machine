export interface ProductData {
  title: string;
  slug: string;
  modelNo: string;
  category: string;
  shortDesc: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  faqs: { q: string; a: string }[];
  image: string;
  imageAlt: string;
}

const withBrandAndOrigin = (specs: Record<string, string>) => ({
  ...specs,
  Brand: 'Spectra Pack Machines',
  Origin: 'Made in India',
});

const buildFaqs = () => [
  {
    q: 'Can this machine be matched to my product and pack size?',
    a: 'Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration.',
  },
  {
    q: 'Do you support installation and after-sales service?',
    a: 'Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination.',
  },
];

const createProduct = (
  product: Omit<ProductData, 'faqs' | 'image' | 'imageAlt'> & {
    faqs?: ProductData['faqs'];
    image?: string;
    imageAlt?: string;
  }
): ProductData => ({
  ...product,
  faqs: product.faqs ?? buildFaqs(),
  image: product.image ?? `/images/products/${product.slug}.png`,
  imageAlt: product.imageAlt ?? `${product.title} by Spectra Pack Machines`,
});

export const PRODUCTS: ProductData[] = [
  createProduct({
    title: 'Shrink Tunnel Machine',
    slug: 'shrink-tunnel-machine',
    modelNo: 'SPST-101',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Semi-automatic shrink tunnel with integrated cooling section for bottles, cartons, and sleeve-wrapped packs.',
    description:
      'The SPST-101 shrink tunnel machine in the Spectra Pack catalog is a semi-automatic electric unit with integrated cooling. It is built in mild steel or SS 304 and supports roller rod, mesh, or belt conveyor arrangements for consistent shrink finishing.',
    features: [
      'Integrated cooling section for stable pack finishing',
      'Suitable for sleeve and shrink applications across multiple pack formats',
      'Supports roller rod, mesh, or belt conveyor layouts',
      'Built for continuous industrial use with three-phase operation',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPST-101',
      'Automation Grade': 'Semi-Auto',
      'Driven Type': 'Electric',
      Material: 'Mild Steel / SS 304',
      Phase: 'Three Phase',
      'Heater Configuration': '12-14 heaters',
      'Power Consumption': '9-10 kW',
      'Temperature Range': '0-300 C',
      'Cooling Chamber': 'Integrated cooling section',
      'Conveyor System': 'Roller rod / mesh / belt conveyors',
    }),
  }),
  createProduct({
    title: 'Automatic Web Sealer with Shrink Tunnel - Bottles',
    slug: 'automatic-web-sealer-with-shrink-tunnel-bottles',
    modelNo: 'SPAWSST-201',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Automatic bottle wrapping line with sealing and shrink tunnel stages for high-throughput grouped packs.',
    description:
      'The catalog lists the SPAWSST-201 as an automatic web sealer with shrink tunnel for bottle packs. It is designed around 1 litre bottle applications and is available in 60, 90, 120, and 200 bottle-per-minute variants.',
    features: [
      'Integrated web sealing and shrink tunnel workflow',
      'Configured for grouped bottle packs and bottle bundles',
      'Available in multiple output variants up to 200 bottles per minute',
      'Built in mild steel or stainless steel for industrial packaging lines',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPAWSST-201',
      Capacity: '120 bottles per minute for 1 litre pack',
      'Available Variants': '60 / 90 / 120 / 200 bottles per minute',
      Voltage: '3 Phase, 440 V',
      MOC: 'Mild Steel / Stainless Steel',
      'Driven Type': 'Electric',
      Frequency: '50 Hz',
      Size: '18 ft x 4.5 ft x 5.5 ft',
    }),
  }),
  createProduct({
    title: 'Semi-Automatic Web Sealer with Shrink Tunnel - Bottles',
    slug: 'semi-automatic-web-sealer-with-shrink-tunnel-bottles',
    modelNo: 'SPSAWST-203',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Semi-automatic bottle shrink wrapping machine for grouped packs where operator-assisted loading is preferred.',
    description:
      'The SPSAWST-203 is shown in the Spectra Pack catalog as a semi-automatic bottle web sealer with shrink tunnel. It is suited to plants that need grouped bottle wrapping without a fully automatic end-to-end line.',
    features: [
      'Semi-automatic workflow for moderate bottle output requirements',
      'Integrated shrink tunnel for clean bundle wrapping',
      'Useful where operator loading is part of the packaging process',
      'Compact footprint compared with higher-throughput automatic lines',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPSAWST-203',
      Capacity: '30-40 bottles per minute',
      Voltage: '12 kV',
      Material: 'Mild Steel',
      'Driven Type': 'Electric',
      Frequency: '50 Hz',
      Size: '12 ft x 5 ft x 5.5 ft',
    }),
  }),
  createProduct({
    title: 'Automatic Web Sealer with Shrink Tunnel - Box',
    slug: 'automatic-web-sealer-with-shrink-tunnel-box',
    modelNo: 'SPAWST-202',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Automatic shrink wrapping system for boxes, aata bags, batteries, bearings, and similar rigid packs.',
    description:
      'The SPAWST-202 automatic web sealer with shrink tunnel is presented in the catalog for box and industrial pack applications. It is built for higher-volume grouped wrapping where cartons or similar rigid products move through a continuous sealing and shrinking process.',
    features: [
      'Automatic sealing and shrinking for box-style products',
      'Suitable for cartons, aata bags, bearings, and battery packs',
      'Continuous production format for dispatch-ready shrink wrapping',
      'Available in mild steel or stainless steel construction',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPAWST-202',
      Capacity: '10-12 boxes per minute',
      Voltage: '15 kV',
      MOC: 'Mild Steel / Stainless Steel',
      'Driven Type': 'Electric',
      Frequency: '50 Hz',
      Size: '14 ft x 4.5 ft x 5.5 ft',
      Applications: 'Boxes / aata bags / battery / bearings',
    }),
  }),
  createProduct({
    title: 'Semi-Automatic Web Sealer with Shrink Tunnel - Box',
    slug: 'semi-automatic-web-sealer-with-shrink-tunnel-box',
    modelNo: 'SPSAWST-204',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Semi-automatic shrink wrapping setup for box and bundle applications with controlled operator handling.',
    description:
      'The SPSAWST-204 catalog model is a semi-automatic web sealer with shrink tunnel for boxes and grouped industrial products. It is suited to plants that need flexible loading and lower line speeds without giving up a complete wrap-and-shrink process.',
    features: [
      'Semi-automatic operation for flexible box handling',
      'Useful for cartons, aata bags, battery packs, and similar products',
      'Integrated shrink tunnel for finished pack appearance',
      'Built for practical medium-throughput packaging operations',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPSAWST-204',
      Capacity: '5 boxes per minute',
      Voltage: '10-12 kV',
      Material: 'Mild Steel',
      'Driven Type': 'Electric',
      Frequency: '50 Hz',
      Size: '12 ft x 5 ft x 5.5 ft',
      Applications: 'Boxes / aata bags / battery / bearings',
    }),
  }),
  createProduct({
    title: 'Chamber Shrink Tunnel',
    slug: 'chamber-shrink-tunnel',
    modelNo: 'SPSC-301',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Manual chamber-style shrink machine for compact retail packs, printed cartons, and short-run jobs.',
    description:
      'The SPSC-301 chamber shrink tunnel is listed as a manual electric model in the Spectra Pack catalog. It is a compact option for smaller shrink wrapping jobs where clean presentation and simple operator control matter more than very high throughput.',
    features: [
      'Manual operation for flexible short-run packing jobs',
      'Compact chamber format for limited floor space',
      'Suitable for regular retail packs and cartons',
      'Simple load, seal, and shrink workflow',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPSC-301',
      'Automation Grade': 'Manual',
      'Driven Type': 'Electric',
      Material: 'Mild Steel',
      'Machine Format': 'Chamber shrink tunnel',
    }),
  }),
  createProduct({
    title: 'L-Sealer with Shrink Tunnel Machine - Indian',
    slug: 'l-sealer-with-shrink-tunnel-machine-indian',
    modelNo: 'SPLST-302',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Semi-automatic L-sealer and shrink tunnel combination for cartons, printed packs, and retail-ready wrapping.',
    description:
      'The SPLST-302 is shown in the catalog as an Indian L-sealer with shrink tunnel machine. It is a semi-automatic electric system meant for regular-shaped products that need neat edge sealing and a clean final shrink wrap finish.',
    image: '/images/products/l-sealer-with-shrink-tunnel-machine-indian.png',
    imageAlt: 'L-Sealer with shrink tunnel machine by Spectra Pack Machines',
    features: [
      'L-sealer format for neat edge sealing',
      'Semi-automatic control for product-by-product handling',
      'Suitable for cartons, boxes, and retail-ready packs',
      'Three-phase build for production use',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPLST-302',
      'Automation Grade': 'Semi-Auto',
      'Driven Type': 'Electric',
      Material: 'Mild Steel',
      Phase: 'Three Phase',
      'Machine Format': 'L-sealer with shrink tunnel',
    }),
  }),
  createProduct({
    title: 'Fully Automatic L-Sealer with Shrink Tunnel Machine',
    slug: 'fully-automatic-l-sealer-with-shrink-tunnel-machine',
    modelNo: 'SPALST-303',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Automatic L-sealer and tunnel line for regular-shaped products needing continuous shrink wrapping.',
    description:
      'The SPALST-303 fully automatic L-sealer with shrink tunnel is cataloged for higher-throughput shrink wrapping. It reduces operator handling and is intended for regular production environments where repeatable sealing and shrink results are required.',
    features: [
      'Fully automatic seal-and-shrink cycle',
      'Well suited to regular-shaped products and cartons',
      'Supports continuous production with reduced manual intervention',
      'Three-phase electric build for industrial operation',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPALST-303',
      'Automation Grade': 'Automatic',
      'Driven Type': 'Electric',
      Material: 'Mild Steel',
      Phase: 'Three Phase',
      'Machine Format': 'Fully automatic L-sealer with shrink tunnel',
    }),
  }),
  createProduct({
    title: 'Portable Shrink Tunnel',
    slug: 'portable-shrink-tunnel',
    modelNo: 'SPST-102',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Portable shrink tunnel for water bottle packing and flexible line-side shrink operations.',
    description:
      'The SPST-102 portable shrink tunnel is shown in the catalog as a semi-auto electric machine for water bottle packing. Its portable format makes it useful where the shrink unit needs to be moved between packaging points or used in compact layouts.',
    features: [
      'Portable tunnel layout for flexible deployment',
      'Semi-automatic operation for practical shop-floor use',
      'Three-phase electric build for bottle shrink work',
      'Useful for compact layouts and line-side shrink support',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPST-102',
      'Automation Grade': 'Semi-Auto',
      'Driven Type': 'Electric',
      Material: 'Mild Steel',
      Phase: 'Three Phase',
      'Usage / Application': 'Water bottle packing',
    }),
  }),
  createProduct({
    title: 'Sleeve Shrink Wrapping Machine',
    slug: 'sleeve-shrink-wrapping-machine',
    modelNo: 'SPAST-601',
    category: 'Shrink Wrapping Machines',
    shortDesc:
      'Automatic sleeve shrink wrapping machine for water bottle bundles and grouped container packs.',
    description:
      'The SPAST-601 sleeve shrink wrapping machine is listed in the Spectra Pack catalog for water bottle packing applications. It is designed for grouped container wrapping where a clean sleeve pack and automatic operation are required.',
    features: [
      'Automatic sleeve shrink process for grouped containers',
      'Built for water bottle packing applications',
      'Three-phase electric machine format',
      'Made for bottle bundle wrapping lines',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPAST-601',
      'Automation Grade': 'Automatic',
      'Driven Type': 'Electric',
      Material: 'Mild Steel',
      Phase: 'Three Phase',
      'Usage / Application': 'Water bottle packing',
    }),
  }),
  createProduct({
    title: 'Band Sealer Machine',
    slug: 'band-sealer-machine',
    modelNo: 'SPVBS-S401',
    category: 'Sealing Machines',
    shortDesc:
      'Continuous band sealer for pouch and bag sealing with selectable sealing widths and forced-air cooling.',
    description:
      'The SPVBS-S401 band sealer machine is listed in the Spectra Pack catalog as a continuous sealing system for pouch lines. It supports multiple sealing widths, forced-air cooling, and a conveyor-based workflow for steady production output.',
    image: '/images/products/band-sealer-machine.jpg',
    imageAlt: 'Vertical band sealer machine by Spectra Pack Machines',
    features: [
      'Continuous sealing format for pouches and bags',
      'Available sealing width options from 6 to 12 mm',
      'Forced-air cooling for stable seal quality',
      'Conveyor-supported operation for production use',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPVBS-S401',
      'Sealing Width': '6 / 8 / 10 / 12 mm',
      'Sealing Speed': '100 m/min',
      Heater: '500 W x 2 - 115 V',
      Cooling: 'Forced air cooling',
      'Power Consumption': '3 phase 400 V, 1.5 kW',
      'Conveyor Size': 'Width 200 mm, Length 1570 mm',
      Dimensions: 'Length 1570 mm, Width 620 mm',
    }),
  }),
  createProduct({
    title: 'Pallet Stretch Wrapping Machine',
    slug: 'pallet-stretch-wrapping-machine',
    modelNo: 'SPPW-401',
    category: 'Pallet Stretch Wrapping Machines',
    shortDesc:
      'Automatic pallet stretch wrapping machine for stable pallet dispatch and transport-safe packaging.',
    description:
      'The SPPW-401 pallet stretch wrapping machine is designed for high-volume dispatch lines, supporting power-rotary platforms and film pre-stretch rollers. It protects pallet loads for road and rail transport in an industrial setup.',
    image: '/images/products/pallet-stretch-wrapping-machine.jpg',
    imageAlt: 'Pallet stretch wrapping machine by Spectra Pack Machines',
    features: [
      'Automatic turntable with variable wrap counts',
      'Pre-stretch film carriage for shaped load stability',
      'PLC-controlled wrap cycles and emergency stop safety',
      'Safe pallet line integration with easy operator controls',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPPW-401',
      Capacity: '20-30 pallets per hour',
      'Turntable Diameter': '1500 mm',
      'Film Pre-stretch': '200-300%',
      'Power Supply': '3 Phase, 415 V',
      'Safety': 'Light curtain, E-stop',
    }),
  }),
  createProduct({
    title: 'Tube Sealing Machine',
    slug: 'tube-sealing-machine',
    modelNo: 'SPTS',
    category: 'Sealing Machines',
    shortDesc:
      'Pedestal-mounted tube sealing machine for tube-packed creams, gels, pastes, and similar products.',
    description:
      'The Spectra Pack catalog lists the SPTS tube sealing machine in its sealing equipment range. It is intended for tube-closing operations where a compact dedicated sealing station is required on the production floor.',
    features: [
      'Dedicated tube sealing station for tube-packed products',
      'Compact pedestal-mounted format for line-side use',
      'Suited to consistent end-sealing on repeat jobs',
      'Useful for cosmetic, personal care, and paste tube applications',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPTS',
      'Machine Type': 'Tube Sealing Machine',
      Mounting: 'Pedestal stand',
      Application: 'Tube-packed products',
      'Catalog Section': 'Sealing Machines',
    }),
  }),
  createProduct({
    title: 'Impulse Sealing Machine',
    slug: 'impulse-sealing-machine',
    modelNo: 'SPFIS',
    category: 'Sealing Machines',
    shortDesc:
      'Compact impulse sealing machine for intermittent pouch sealing where quick manual control is required.',
    description:
      'Model SPFIS is shown in the Spectra Pack catalog as an impulse sealing machine. It is suited to pouch sealing jobs where controlled intermittent sealing is preferred over a continuous band system.',
    features: [
      'Impulse sealing format for controlled heat application',
      'Compact freestanding layout for packing counters and line support',
      'Useful for low-to-medium volume pouch sealing',
      'Designed for repeatable manual sealing tasks',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPFIS',
      'Machine Type': 'Impulse Sealing Machine',
      Mounting: 'Pedestal stand',
      Application: 'Intermittent pouch sealing',
      'Catalog Section': 'Sealing Machines',
    }),
  }),
  createProduct({
    title: 'DH Sealing Machine',
    slug: 'dh-sealing-machine',
    modelNo: 'SPDHFS',
    category: 'Sealing Machines',
    shortDesc:
      'DH sealing machine for pouch and bag sealing where a stable standalone sealing head is preferred.',
    description:
      'The SPDHFS model appears in the Spectra Pack catalog under the sealing machine range. It is a dedicated standing sealing station suited to plants that need reliable manual bag sealing with a fixed working height.',
    features: [
      'Standalone sealing station for bag and pouch packing',
      'Stable work height for repetitive sealing jobs',
      'Compact layout for line-side or dispatch use',
      'Suitable for manual sealing tasks that need better operator control',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPDHFS',
      'Machine Type': 'DH Sealing Machine',
      Mounting: 'Pedestal stand',
      Application: 'Bag and pouch sealing',
      'Catalog Section': 'Sealing Machines',
    }),
  }),
  createProduct({
    title: 'Mini Horizontal Band Sealer',
    slug: 'mini-horizontal-band-sealer',
    modelNo: 'SPHBS-S402',
    category: 'Sealing Machines',
    shortDesc:
      'Compact horizontal continuous band sealer for smaller pouches and line-side sealing jobs.',
    description:
      'The SPHBS-S402 mini horizontal band sealer is part of the Spectra Pack band sealer range. It offers a compact horizontal sealing format for pouch applications that need continuous sealing in a smaller machine footprint.',
    image: '/images/products/mini-horizontal-band-sealer.webp',
    imageAlt: 'Mini horizontal band sealer by Spectra Pack Machines',
    features: [
      'Compact horizontal continuous sealing format',
      'Suitable for smaller pouch sizes and lighter packs',
      'Useful where floor space is limited',
      'Part of the Spectra Pack continuous band sealer range',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPHBS-S402',
      'Machine Type': 'Mini Horizontal Band Sealer',
      Orientation: 'Horizontal',
      'Sealing Width': '6 / 8 / 10 / 12 mm',
      'Sealing Speed': 'Up to 100 m/min',
      Cooling: 'Forced air cooling',
    }),
  }),
  createProduct({
    title: 'Master Horizontal Band Sealer',
    slug: 'master-horizontal-band-sealer',
    modelNo: 'SPHBS-M403',
    category: 'Sealing Machines',
    shortDesc:
      'Horizontal master band sealer for continuous pouch sealing on medium-duty packaging lines.',
    description:
      'The SPHBS-M403 master horizontal band sealer is shown in the catalog as part of the Spectra Pack continuous sealing range. It is built for steady pouch sealing where a horizontal feed format is preferred.',
    image: '/images/products/master-horizontal-band-sealer.webp',
    imageAlt: 'Master horizontal band sealer by Spectra Pack Machines',
    features: [
      'Continuous sealing for repeat pouch output',
      'Horizontal feed format for flat or supported packs',
      'Useful for medium-duty packaging line integration',
      'Designed for reliable production sealing',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPHBS-M403',
      'Machine Type': 'Master Horizontal Band Sealer',
      Orientation: 'Horizontal',
      'Sealing Width': '6 / 8 / 10 / 12 mm',
      'Sealing Speed': 'Up to 100 m/min',
      Cooling: 'Forced air cooling',
    }),
  }),
  createProduct({
    title: 'Master Vertical Band Sealer',
    slug: 'master-vertical-band-sealer',
    modelNo: 'SPVBS-M404',
    category: 'Sealing Machines',
    shortDesc:
      'Vertical continuous band sealer for taller pouches and bag formats requiring upright handling.',
    description:
      'The SPVBS-M404 master vertical band sealer appears in the Spectra Pack catalog as a vertical continuous sealing machine. It is suited to pouch formats that are easier to seal upright, including filled bags and heavier packs.',
    image: '/images/products/master-vertical-band-sealer.jpg',
    imageAlt: 'Master vertical band sealer by Spectra Pack Machines',
    features: [
      'Vertical pouch handling for filled bag applications',
      'Continuous sealing for steady production flow',
      'Useful where upright pack stability matters',
      'Industrial frame suited to shop-floor sealing work',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPVBS-M404',
      'Machine Type': 'Master Vertical Band Sealer',
      Orientation: 'Vertical',
      'Sealing Width': '6 / 8 / 10 / 12 mm',
      'Sealing Speed': 'Up to 100 m/min',
      Cooling: 'Forced air cooling',
    }),
  }),
  createProduct({
    title: 'Pneumatic Vertical Sealing Machine - Flame Proof',
    slug: 'pneumatic-vertical-sealing-machine-flame-proof',
    modelNo: 'SPPFS',
    category: 'Sealing Machines',
    shortDesc:
      'Flame-proof pneumatic vertical sealer for industrial bag sealing where controlled pressure is required.',
    description:
      'The SPPFS pneumatic vertical sealing machine is listed in the Spectra Pack catalog in a flame-proof configuration. It is intended for industrial bag sealing tasks that need a vertical format and pneumatic sealing pressure.',
    features: [
      'Pneumatic sealing action for repeatable pressure',
      'Vertical sealing format for larger bags and liners',
      'Flame-proof configuration for sensitive operating environments',
      'Industrial structure for heavier sealing duty',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPPFS',
      'Machine Type': 'Pneumatic Vertical Sealing Machine',
      Operation: 'Pneumatic',
      Orientation: 'Vertical',
      'Safety Format': 'Flame proof',
      Application: 'Industrial bag sealing',
    }),
  }),
  createProduct({
    title: 'Mobile Sealer Machine',
    slug: 'mobile-sealer-machine',
    modelNo: 'SPMS',
    category: 'Sealing Machines',
    shortDesc:
      'Mobile sealing machine for on-site bag sealing where the sealing head needs to move around the shop floor.',
    description:
      'The SPMS mobile sealer machine is shown in the Spectra Pack catalog as part of the sealing machine range. Its movable stand and adjustable head make it useful for larger bags or sealing jobs that are easier to handle in place.',
    features: [
      'Mobile stand for flexible shop-floor positioning',
      'Useful for larger bags and awkward pack sizes',
      'Good fit for on-site sealing instead of fixed workstation sealing',
      'Simple industrial layout for practical daily use',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPMS',
      'Machine Type': 'Mobile Sealer Machine',
      Mounting: 'Mobile pedestal stand',
      Application: 'Bag and liner sealing',
      'Catalog Section': 'Sealing Machines',
    }),
  }),
  createProduct({
    title: 'Heavy Duty Table Top Vacuum Packaging Machines',
    slug: 'heavy-duty-table-top-vacuum-packaging-machines',
    modelNo: 'SPVP-501 / SPVP-502 / SPVP-503 / SPVP-504 / SPVP-505 / SPVP-506',
    category: 'Vacuum Packaging Machines',
    shortDesc:
      'Table top vacuum packaging machine range for food, industrial components, and shelf-life-focused pouch packing.',
    description:
      'The Spectra Pack catalog presents a heavy duty table top vacuum packaging machine range covering models SPVP-501 through SPVP-506. These chamber-style systems are meant for vacuum sealing jobs where compact installation and dependable vacuum packing are important.',
    features: [
      'Table top chamber vacuum format for compact installation',
      'Multiple model options within the SPVP range',
      'Useful for food, industrial, and retail pouch packing',
      'Designed for cleaner packs, better protection, and shelf-life support',
    ],
    specs: withBrandAndOrigin({
      'Model Range': 'SPVP-501 / 502 / 503 / 504 / 505 / 506',
      'Machine Type': 'Heavy duty table top vacuum packaging machines',
      Format: 'Table top chamber vacuum system',
      Application: 'Vacuum pouch packing',
      'Catalog Section': 'Vacuum Packaging Machines',
    }),
  }),
  createProduct({
    title: 'Double Door Chamber Vacuum Machine with Conveyor',
    slug: 'double-door-chamber-vacuum-machine-with-conveyor',
    modelNo: 'SPCVP-506',
    category: 'Vacuum Packaging Machines',
    shortDesc:
      'Conveyor-supported double door chamber vacuum machine for larger or repeat-cycle vacuum packaging work.',
    description:
      'The SPCVP-506 double door chamber vacuum machine with conveyor is shown in the Spectra Pack catalog for higher-duty vacuum packaging. Its conveyor-assisted layout is suited to repeat-cycle packing lines where larger packs or heavier product movement need more support.',
    features: [
      'Double door chamber format for higher-duty vacuum packing',
      'Integrated conveyor support for product movement',
      'Useful for repeat-cycle or bulk vacuum jobs',
      'Designed for production environments needing stable pack handling',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPCVP-506',
      'Machine Type': 'Double door chamber vacuum machine with conveyor',
      Format: 'Double chamber / conveyor supported',
      Application: 'Higher-duty vacuum pouch packing',
      'Catalog Section': 'Vacuum Packaging Machines',
    }),
  }),
  createProduct({
    title: 'Modular Belt Conveyor',
    slug: 'modular-belt-conveyor',
    modelNo: 'Catalog Range',
    category: 'Conveyor Systems',
    shortDesc:
      'Modular belt conveyor for continuous product transfer between processing, packing, and dispatch stations.',
    description:
      'The modular belt conveyor is part of the Spectra Pack conveyor range shown in the catalog. It is suited to production lines that need stable product movement, easy maintenance access, and practical line integration.',
    features: [
      'Modular belt surface for stable product movement',
      'Useful between filling, sealing, and dispatch stages',
      'Industrial frame for production floor use',
      'Catalog-listed as part of the Spectra Pack conveyor range',
    ],
    specs: withBrandAndOrigin({
      'Machine Type': 'Modular Belt Conveyor',
      Layout: 'Straight modular belt transfer',
      Application: 'Continuous product movement',
      'Catalog Section': 'Conveyor Systems',
    }),
  }),
  createProduct({
    title: 'PVC Belt Conveyor',
    slug: 'pvc-belt-conveyor',
    modelNo: 'Catalog Range',
    category: 'Conveyor Systems',
    shortDesc:
      'PVC belt conveyor for straight product transfer across packaging and material handling lines.',
    description:
      'The PVC belt conveyor is listed in the Spectra Pack catalog as part of the conveyor product range. It is intended for controlled straight-line movement of products through packaging, inspection, or dispatch areas.',
    features: [
      'PVC belt surface for straight product transfer',
      'Suitable for packaging and line balancing applications',
      'Supports consistent movement between workstations',
      'Practical fit for general manufacturing environments',
    ],
    specs: withBrandAndOrigin({
      'Machine Type': 'PVC Belt Conveyor',
      Layout: 'Straight belt transfer',
      Application: 'Packaging and material movement lines',
      'Catalog Section': 'Conveyor Systems',
    }),
  }),
  createProduct({
    title: 'U Type Slate Conveyor',
    slug: 'u-type-slate-conveyor',
    modelNo: 'Catalog Range',
    category: 'Conveyor Systems',
    shortDesc:
      'Curved U type slate conveyor for guided product flow around turns and constrained layouts.',
    description:
      'The U type slate conveyor shown in the Spectra Pack catalog is meant for layouts where the product path needs to turn while staying guided and stable. It is a practical solution for packaging lines with constrained floor plans or directional flow requirements.',
    features: [
      'Curved slate format for directional product movement',
      'Useful where line layouts need guided turns',
      'Supports stable transfer of regular packaged products',
      'Industrial structure built for factory handling',
    ],
    specs: withBrandAndOrigin({
      'Machine Type': 'U Type Slate Conveyor',
      Layout: 'Curved slate conveyor',
      Application: 'Directional transfer in constrained layouts',
      'Catalog Section': 'Conveyor Systems',
    }),
  }),
  createProduct({
    title: 'Heavy Duty Slate Chain Conveyor',
    slug: 'heavy-duty-slate-chain-conveyor',
    modelNo: 'Catalog Range',
    category: 'Conveyor Systems',
    shortDesc:
      'Heavy duty slate chain conveyor for rugged product transfer and industrial line support.',
    description:
      'The heavy duty slate chain conveyor appears in the Spectra Pack catalog for more demanding material movement duties. It is suited to industrial lines that need stronger conveying surfaces and dependable product handling.',
    features: [
      'Heavy duty chain-driven conveying format',
      'Suitable for rugged industrial handling',
      'Built for steady movement of heavier or tougher products',
      'Useful on packaging, inspection, and dispatch lines',
    ],
    specs: withBrandAndOrigin({
      'Machine Type': 'Heavy Duty Slate Chain Conveyor',
      Layout: 'Straight slate chain transfer',
      Application: 'Heavy-duty industrial product movement',
      'Catalog Section': 'Conveyor Systems',
    }),
  }),
  createProduct({
    title: 'Flexible Roller Conveyor',
    slug: 'flexible-roller-conveyor',
    modelNo: 'Catalog Range',
    category: 'Conveyor Systems',
    shortDesc:
      'Flexible roller conveyor for adjustable carton transfer, staging, and dispatch movement.',
    description:
      'The flexible roller conveyor is shown in the Spectra Pack catalog as an extendable transfer solution. It is a useful option for staging, loading, and dispatch areas where the conveyor path needs to be adjusted to the available space.',
    features: [
      'Flexible layout for adjustable transfer paths',
      'Useful in loading, unloading, and staging areas',
      'Well suited to carton and box movement',
      'Helps adapt material flow to changing floor layouts',
    ],
    specs: withBrandAndOrigin({
      'Machine Type': 'Flexible Roller Conveyor',
      Layout: 'Adjustable roller transfer',
      Application: 'Dispatch and staging movement',
      'Catalog Section': 'Conveyor Systems',
    }),
  }),
  createProduct({
    title: 'Heavy Duty Roller Conveyor',
    slug: 'heavy-duty-roller-conveyor',
    modelNo: 'Catalog Range',
    category: 'Conveyor Systems',
    shortDesc:
      'Heavy duty roller conveyor for industrial cartons, components, and dispatch-ready packs.',
    description:
      'The heavy duty roller conveyor appears in the Spectra Pack catalog as part of the material movement range. It is intended for plants that need reliable roller-based transfer for boxes, components, or heavier packaged goods.',
    features: [
      'Roller conveying format for cartons and rigid packs',
      'Heavy-duty build for industrial handling',
      'Useful in production, staging, and dispatch zones',
      'Supports consistent straight-line product movement',
    ],
    specs: withBrandAndOrigin({
      'Machine Type': 'Heavy Duty Roller Conveyor',
      Layout: 'Straight roller transfer',
      Application: 'Industrial cartons and component handling',
      'Catalog Section': 'Conveyor Systems',
    }),
  }),
  createProduct({
    title: 'Pallet Stretch Wrap Machine',
    slug: 'pallet-stretch-wrap-machine',
    modelNo: 'SPPSW',
    category: 'End-of-Line Packaging',
    shortDesc:
      'Semi-automatic pallet stretch wrapping machine for load stabilization before dispatch and storage.',
    description:
      'The SPPSW pallet stretch wrap machine is listed in the Spectra Pack catalog for end-of-line load wrapping. It is meant for stabilizing palletized goods before dispatch, handling, or warehousing.',
    image: '/images/products/pallet-stretch-wrapping-machine.jpg',
    imageAlt: 'Pallet stretch wrap machine securing pallet loads',
    features: [
      'Semi-automatic pallet load wrapping format',
      'Useful for dispatch and warehouse load stabilization',
      'Frequency speed control based system',
      'Built to improve pack containment and handling confidence',
    ],
    specs: withBrandAndOrigin({
      'Model No.': 'SPPSW',
      Color: 'Green',
      Material: 'Stainless Steel',
      Computerized: 'Yes',
      'Automatic Grade': 'Semi-Automatic',
      'Control System': 'Frequency speed control',
      'Selection Mode': 'Automatic',
      Weight: '250 kg',
    }),
  }),
];
