/**
 * Buyer-focused content for each machine category page.
 *
 * Each hub answers the questions buyers actually search for (from keyword research,
 * Oct 2026, India + export markets): what the machine is, how it works, which type
 * fits, what drives price, HSN classification, and export questions. Keep every
 * statement true for the machines Spectra builds; do not add prices or claims that
 * the sales team has not confirmed.
 */

export type CategoryHubFaq = { q: string; a: string };

export type CategoryHub = {
  /** Search-led page title, without the brand suffix. */
  seoTitle: string;
  /** Meta description, ~150 characters. */
  metaDescription: string;
  /** H1 shown on the page. */
  heading: string;
  /** Extra search terms used in metadata keywords. */
  keywords: string[];
  intro: string;
  howItWorks: { title: string; text: string };
  types: { name: string; text: string; productSlug?: string }[];
  applications: string[];
  priceFactors: { title: string; points: string[] };
  /** Wording buyers outside India use for the same machines. */
  globalTerms: string[];
  faqs: CategoryHubFaq[];
};

const EXPORT_FAQ: CategoryHubFaq = {
  q: 'Do you export these machines outside India?',
  a: 'Yes. We supply buyers outside India from our factory in Maharashtra, India. Share your country, site voltage, frequency and phase, and the product you pack; we confirm the electrical configuration, shipment terms and installation support in the quotation.',
};

const shrinkWrapping: CategoryHub = {
  seoTitle: 'Shrink Wrapping Machine Manufacturer in India | L-Sealer, Web Sealer & Shrink Tunnel',
  metaDescription:
    'Shrink wrapping machines from India: L-sealer with shrink tunnel, web sealers, sleeve and chamber machines for bottles, boxes and cartons. Export enquiries welcome.',
  heading: 'Shrink Wrapping Machines',
  keywords: [
    'shrink wrapping machine',
    'shrink wrap machine',
    'shrink tunnel machine',
    'l sealer with shrink tunnel',
    'automatic shrink wrapping machine',
    'semi automatic shrink wrapping machine',
    'bottle shrink wrapping machine',
    'shrink wrapping machine price',
    'shrink wrapping machine manufacturer',
    'L-bar sealer and shrink tunnel',
  ],
  intro:
    'A shrink wrapping machine wraps a product or group of products in heat-shrinkable film and passes it through heat so the film tightens around the pack. We manufacture L-sealers with shrink tunnels, web sealers with shrink tunnels for bottle and box bundles, sleeve shrink machines, chamber units and standalone shrink tunnels, in semi-automatic and fully automatic versions.',
  howItWorks: {
    title: 'How a shrink wrapping machine works',
    text:
      'The product is enclosed in film (POF, PVC or LD/PE depending on the machine), the film is sealed and cut around the pack, and the sealed pack travels on a conveyor through a heated tunnel. Hot air shrinks the film evenly so it grips the product, protecting it from dust, moisture and tampering and holding multi-packs together.',
  },
  types: [
    { name: 'L-sealer with shrink tunnel', text: 'Seals and cuts film on two sides in an L shape, then shrinks it. Suited to boxes, cartons, books, trays and retail packs.', productSlug: 'fully-automatic-l-sealer-with-shrink-tunnel-machine' },
    { name: 'Web sealer with shrink tunnel', text: 'Wraps grouped bottles, jars or boxes with a sleeve of film open at the ends ("bull’s-eye"). The usual choice for water bottle and beverage bundles.', productSlug: 'automatic-web-sealer-with-shrink-tunnel-bottles' },
    { name: 'Sleeve shrink wrapping machine', text: 'Applies and shrinks sleeves on containers for labelling, tamper evidence or multipacks.', productSlug: 'sleeve-shrink-wrapping-machine' },
    { name: 'Chamber shrink machine', text: 'Seal and shrink in one compact chamber for small batches and low output.', productSlug: 'chamber-shrink-tunnel' },
    { name: 'Shrink tunnel machine', text: 'The heating tunnel on its own, to pair with a manual or existing sealer.', productSlug: 'shrink-tunnel-machine' },
    { name: 'Portable shrink tunnel', text: 'Small tunnel for workshops, sampling and low-volume packing.', productSlug: 'portable-shrink-tunnel' },
  ],
  applications: ['Water and beverage bottle bundles', 'Boxes, cartons and corrugated packs', 'Food, snacks and bakery packs', 'Pharmaceutical and cosmetic cartons', 'Stationery, books and printed material', 'Industrial parts and hardware'],
  priceFactors: {
    title: 'What decides a shrink wrapping machine price',
    points: [
      'Automation level: manual feed and seal, semi-automatic, or fully automatic with auto film feeding and conveyor infeed.',
      'Maximum pack size and seal length, which set the frame and tunnel size.',
      'Output required in packs per minute and the number of shifts.',
      'Film type (POF, PVC or LD/PE) and tunnel heating capacity.',
      'Options such as product grouping for bottles, infeed conveyors, printers or line integration.',
    ],
  },
  globalTerms: ['shrink wrap machine', 'L-bar sealer and shrink tunnel', 'shrink bundler', 'sleeve wrapper'],
  faqs: [
    { q: 'What is a shrink wrapping machine used for?', a: 'It packs products in a tight layer of plastic film to protect them during storage and transport, show tampering, and hold several units together as a single pack, for example a 6 or 12 bottle bundle or a set of cartons.' },
    { q: 'Which shrink wrapping machine is best for water bottles?', a: 'For grouped water or beverage bottles, a web sealer with shrink tunnel is the usual choice because it wraps the bundle with film open at both ends. For single cartons and boxes, an L-sealer with shrink tunnel gives a fully enclosed pack.' },
    { q: 'What is the difference between semi-automatic and automatic shrink wrapping machines?', a: 'In a semi-automatic machine an operator places the product and starts the seal; the tunnel and conveyor run automatically. A fully automatic machine feeds, wraps, seals and shrinks the product continuously and suits higher, steady output.' },
    { q: 'What is the HSN code for a shrink wrapping machine?', a: 'Packing and wrapping machinery, including heat-shrink wrapping machinery, is classified under HSN 8422 40. GST on this heading has been 18%; the rate and code applicable to your order are stated on our quotation and invoice.' },
    { q: 'Which film is used in a shrink wrapping machine?', a: 'POF film gives a clear, strong finish for retail packs; PVC is economical for lighter packs; LD/PE film is used for heavier bundles such as bottle packs. The right film depends on the machine and product, and we confirm it with your samples.' },
    EXPORT_FAQ,
  ],
};

const sealing: CategoryHub = {
  seoTitle: 'Sealing Machine Manufacturer | Band Sealer, Impulse & Tube Sealing Machines',
  metaDescription:
    'Band sealer, impulse, tube, DH and mobile sealing machines made in India for pouches, bags and tubes, with nitrogen flushing options. Domestic and export supply.',
  heading: 'Sealing Machines',
  keywords: [
    'band sealer machine',
    'continuous band sealer',
    'vertical band sealer machine',
    'impulse sealer machine',
    'tube sealing machine',
    'pouch sealing machine',
    'hand sealer machine',
    'band sealer with nitrogen flushing',
    'sealing machine manufacturer',
  ],
  intro:
    'Sealing machines close pouches, bags and tubes with heat so the contents stay fresh, clean and tamper-evident. Our range covers continuous band sealers (horizontal and vertical), impulse sealers, DH and mobile sealers, flame-proof pneumatic vertical sealers and tube sealing machines.',
  howItWorks: {
    title: 'How a band sealer works',
    text:
      'In a continuous band sealer, the open edge of the pouch is carried between two moving bands that pass over a heating block and then a cooling block, pressing the film layers together into a flat seal. An embossing wheel can add a pattern or batch code. Impulse sealers instead heat a wire for a set time on each press, which suits lower volumes.',
  },
  types: [
    { name: 'Horizontal band sealer', text: 'Continuous sealing of lighter pouches lying flat, for snacks, spices, tea and powders.', productSlug: 'master-horizontal-band-sealer' },
    { name: 'Vertical band sealer', text: 'Seals heavier, standing bags of rice, flour, grains or chemicals on a conveyor.', productSlug: 'master-vertical-band-sealer' },
    { name: 'Mini band sealer', text: 'Compact continuous sealer for small businesses and shops.', productSlug: 'mini-horizontal-band-sealer' },
    { name: 'Impulse sealer', text: 'Press-to-seal machine for low volumes and occasional packing.', productSlug: 'impulse-sealing-machine' },
    { name: 'Tube sealing machine', text: 'Seals plastic and laminated tubes for creams, gels and ointments.', productSlug: 'tube-sealing-machine' },
    { name: 'Flame-proof pneumatic vertical sealer', text: 'Pneumatic sealing for hazardous-area or solvent-handling environments.', productSlug: 'pneumatic-vertical-sealing-machine-flame-proof' },
  ],
  applications: ['Snacks, namkeen and confectionery pouches', 'Spices, tea and coffee', 'Rice, flour, grains and pulses', 'Chemicals, fertiliser and seeds', 'Creams, gels and pharmaceutical tubes', 'Hardware and spare-part bags'],
  priceFactors: {
    title: 'What decides a sealing machine price',
    points: [
      'Machine type: impulse, horizontal band, vertical band or tube sealer.',
      'Pouch material and thickness, and the seal width required.',
      'Bag weight and whether a conveyor and height adjustment are needed.',
      'Options such as batch coding, embossing, nitrogen flushing or stainless steel contact parts.',
      'Hours of daily operation and required sealing speed.',
    ],
  },
  globalTerms: ['continuous band sealer', 'impulse heat sealer', 'tube filler sealer', 'bag sealer'],
  faqs: [
    { q: 'What is a band sealer machine?', a: 'A band sealer is a continuous heat sealing machine. Pouches move along between two bands over heating and cooling blocks, so a steady stream of bags can be sealed one after another.' },
    { q: 'Horizontal or vertical band sealer: which do I need?', a: 'Choose horizontal for light pouches that can travel lying flat, and vertical for heavier bags that must stand on a conveyor while their top edge is sealed.' },
    { q: 'Can a band sealer do nitrogen flushing?', a: 'Nitrogen flushing fills the pouch with nitrogen just before sealing, which helps keep snacks and other oxygen-sensitive foods fresh. Tell us your product and pouch size and we will confirm whether a nitrogen flushing option suits your model.' },
    { q: 'What is the HSN code for a sealing machine?', a: 'Machinery for closing and sealing bags and containers is classified under HSN 8422 30. The code and GST rate applicable to your order are stated on our quotation and invoice.' },
    EXPORT_FAQ,
  ],
};

const vacuum: CategoryHub = {
  seoTitle: 'Vacuum Packaging Machine Manufacturer | Table Top & Double Chamber Vacuum Sealers',
  metaDescription:
    'Commercial and industrial vacuum packaging machines from India: table top and double chamber vacuum sealers for food, meat, pharma and industrial parts. Export supply.',
  heading: 'Vacuum Packaging Machines',
  keywords: [
    'vacuum packaging machine',
    'vacuum packing machine',
    'vacuum sealer machine',
    'commercial vacuum packaging machine',
    'industrial vacuum packaging machine',
    'double chamber vacuum packaging machine',
    'table top vacuum packaging machine',
    'vacuum packaging machine for food',
    'chamber vacuum sealer',
  ],
  intro:
    'A vacuum packaging machine removes air from a pouch before sealing it, which slows spoilage and oxidation and protects products from moisture. We build heavy-duty table top vacuum packaging machines and double chamber (double door) vacuum machines with conveyor for commercial and industrial users.',
  howItWorks: {
    title: 'How a chamber vacuum packaging machine works',
    text:
      'The filled pouch is placed in the chamber with its open end across the sealing bar. When the lid closes, a vacuum pump draws air out of the chamber and the pouch; the sealing bar then heat-seals the pouch, and air is let back into the chamber. Machines can be configured to flush with gas before sealing for some foods.',
  },
  types: [
    { name: 'Table top vacuum packaging machine', text: 'Single chamber unit for restaurants, food processors, labs and small production.', productSlug: 'heavy-duty-table-top-vacuum-packaging-machines' },
    { name: 'Double chamber vacuum machine', text: 'Two chambers working alternately for higher output; one is loaded while the other runs.', productSlug: 'double-door-chamber-vacuum-machine-with-conveyor' },
  ],
  applications: ['Meat, fish and poultry', 'Cheese, paneer and dairy', 'Rice, dry fruits, coffee and spices', 'Ready-to-eat and frozen foods', 'Pharmaceutical and medical items', 'Electronic and metal components'],
  priceFactors: {
    title: 'What decides a vacuum packaging machine price',
    points: [
      'Chamber size and number of chambers.',
      'Vacuum pump capacity, which sets cycle time.',
      'Number and length of sealing bars.',
      'Body material, such as stainless steel for food use.',
      'Options such as gas flushing or a conveyor.',
    ],
  },
  globalTerms: ['chamber vacuum sealer', 'commercial vacuum sealer', 'double chamber vacuum packer'],
  faqs: [
    { q: 'What is a vacuum packaging machine used for?', a: 'It removes air from a pouch and seals it, which extends shelf life of food, reduces freezer burn, and protects products such as metal parts and electronics from moisture and corrosion.' },
    { q: 'Table top or double chamber: which should I buy?', a: 'A table top machine suits low to moderate daily volume. A double chamber machine roughly doubles throughput because one chamber can be loaded while the other is running.' },
    { q: 'Is a chamber vacuum machine different from a home vacuum sealer?', a: 'Yes. Home sealers pull air through the pouch opening and need textured bags. Chamber machines evacuate the whole chamber, work with smooth pouches, handle liquids better and are built for continuous commercial use.' },
    { q: 'What is the HSN code for a vacuum packaging machine?', a: 'Vacuum packing machinery is generally classified under HSN 8422 40 (packing and wrapping machinery). The code and GST rate applicable to your order are stated on our quotation and invoice.' },
    EXPORT_FAQ,
  ],
};

const conveyors: CategoryHub = {
  seoTitle: 'Conveyor System Manufacturer | PVC Belt, Modular, Roller & Slat Chain Conveyors',
  metaDescription:
    'Conveyor systems for packaging lines made in India: PVC belt, modular belt, roller and slat chain conveyors built to your layout. Domestic and export projects.',
  heading: 'Conveyor Systems',
  keywords: [
    'conveyor system',
    'conveyor system manufacturer',
    'belt conveyor system',
    'flat belt conveyor',
    'pvc belt conveyor',
    'modular belt conveyor',
    'roller conveyor',
    'slat chain conveyor',
    'packaging line conveyor',
  ],
  intro:
    'Conveyor systems move products between filling, sealing, wrapping and dispatch so a packaging line runs without manual handling. We manufacture PVC belt, modular belt, U-type slat, heavy-duty slat chain, flexible roller and heavy-duty roller conveyors, built to your product, line length and height.',
  howItWorks: {
    title: 'How a packaging conveyor system works',
    text:
      'A motor and gearbox drive a belt, chain or set of rollers that carries products along a frame at a controlled speed. Guides keep products aligned, and speed, height and transfer points are matched to the machines before and after the conveyor so products pass smoothly from one stage to the next.',
  },
  types: [
    { name: 'PVC belt conveyor', text: 'Flat belt conveyor for cartons, pouches and general packaging lines.', productSlug: 'pvc-belt-conveyor' },
    { name: 'Modular belt conveyor', text: 'Plastic modular belt for washdown, curves and food areas.', productSlug: 'modular-belt-conveyor' },
    { name: 'Slat chain conveyor', text: 'Chain conveyor for bottles and containers on filling and capping lines.', productSlug: 'heavy-duty-slate-chain-conveyor' },
    { name: 'Roller conveyor', text: 'Gravity or powered rollers for cartons, crates and dispatch areas.', productSlug: 'heavy-duty-roller-conveyor' },
    { name: 'Flexible roller conveyor', text: 'Extendable conveyor for loading and unloading trucks.', productSlug: 'flexible-roller-conveyor' },
  ],
  applications: ['Bottle filling and capping lines', 'Carton and box packing lines', 'Food and FMCG production', 'Warehouse and dispatch areas', 'Truck loading and unloading', 'Linking shrink wrapping and sealing machines'],
  priceFactors: {
    title: 'What decides a conveyor system price',
    points: [
      'Length, width and number of sections or curves.',
      'Belt or chain type: PVC, modular plastic, slat chain or rollers.',
      'Frame material: mild steel, painted or stainless steel.',
      'Load per metre and required speed.',
      'Drives, controls, sensors and integration with existing machines.',
    ],
  },
  globalTerms: ['belt conveyor', 'tabletop chain conveyor', 'roller conveyor system', 'packaging line conveyor'],
  faqs: [
    { q: 'What is a conveyor system?', a: 'A conveyor system is equipment that moves products automatically from one point to another, usually on a belt, chain or rollers. In packaging it connects filling, sealing, wrapping and dispatch stations.' },
    { q: 'Which conveyor is best for bottles?', a: 'Slat chain conveyors are the usual choice for bottles and jars on filling and capping lines because they give a stable, flat surface and handle side transfers well.' },
    { q: 'Can you build a conveyor to my layout?', a: 'Yes. Share the line drawing or photos, product sizes, required length and height, and the machines it connects to. We design the conveyor around that layout.' },
    { q: 'What is the HSN code for a conveyor?', a: 'Continuous-action conveyors for goods are classified under HSN 8428 (for example 8428 33 for belt type). The code and GST rate for your order are stated on our quotation and invoice.' },
    EXPORT_FAQ,
  ],
};

const palletStretch: CategoryHub = {
  seoTitle: 'Pallet Stretch Wrapping Machine Manufacturer | Turntable Pallet Wrapper',
  metaDescription:
    'Turntable pallet stretch wrapping machines made in India for stable, dust-protected dispatch loads. Semi-automatic pallet wrappers for warehouses and export.',
  heading: 'Pallet Stretch Wrapping Machines',
  keywords: [
    'pallet stretch wrapping machine',
    'pallet wrapping machine',
    'stretch wrapping machine',
    'pallet stretch film wrapping machine',
    'semi automatic pallet wrapping machine',
    'stretch wrapper',
    'pallet wrapper',
    'turntable stretch wrapper',
  ],
  intro:
    'A pallet stretch wrapping machine wraps stretch film around a loaded pallet so the boxes or bags stay together and protected during storage, loading and transport. Our turntable pallet wrappers rotate the pallet while a film carriage moves up and down to cover the full load.',
  howItWorks: {
    title: 'How a pallet stretch wrapper works',
    text:
      'The loaded pallet is placed on the turntable and the film end is attached. As the turntable rotates, the film carriage travels up and down the mast, applying overlapping layers of stretch film. The number of top and bottom wraps and the carriage speed are set to suit the load.',
  },
  types: [
    { name: 'Turntable pallet stretch wrapping machine', text: 'Standard pallet wrapper for warehouses, factories and dispatch areas.', productSlug: 'pallet-stretch-wrapping-machine' },
  ],
  applications: ['Cartons and boxes on pallets', 'Bagged goods such as cement, grain and chemicals', 'Bottled water and beverage loads', 'Export container loads', 'Warehouse and logistics dispatch'],
  priceFactors: {
    title: 'What decides a pallet wrapping machine price',
    points: [
      'Maximum pallet size, height and weight.',
      'Turntable diameter and drive.',
      'Film carriage type and controls for wrap patterns.',
      'Semi-automatic or automatic operation.',
      'Options such as a weighing scale, ramp or top sheet.',
    ],
  },
  globalTerms: ['stretch wrapper', 'pallet wrapper', 'turntable stretch wrapper'],
  faqs: [
    { q: 'What is a pallet stretch wrapping machine?', a: 'It is a machine that wraps stretch film around a loaded pallet. The film holds the load together, keeps out dust and moisture, and makes tampering visible.' },
    { q: 'Stretch wrap or shrink wrap for pallets?', a: 'Stretch wrapping uses film that clings under tension and needs no heat, so it is faster and simpler for most pallet loads. Shrink wrapping uses heat and is used for special loads that need a fully sealed cover.' },
    { q: 'What is the HSN code for a pallet wrapping machine?', a: 'Wrapping machinery is classified under HSN 8422 40. The code and GST rate for your order are stated on our quotation and invoice.' },
    EXPORT_FAQ,
  ],
};

const endOfLine: CategoryHub = {
  ...palletStretch,
  seoTitle: 'End-of-Line Packaging Machines | Pallet Wrapping & Dispatch Systems',
  metaDescription:
    'End-of-line packaging equipment from India: pallet stretch wrapping and dispatch-ready packing systems for factories and warehouses. Domestic and export supply.',
  heading: 'End-of-Line Packaging Machines',
  keywords: ['end of line packaging', 'end of line packaging machine', 'pallet stretch wrap machine', 'dispatch packaging system', 'stretch wrapper'],
  intro:
    'End-of-line packaging is the final stage of a production line, where finished packs are grouped, wrapped and stabilised for dispatch. We supply pallet stretch wrapping machines and can link them with conveyors and shrink wrapping machines to form a complete line end.',
  types: [
    { name: 'Pallet stretch wrap machine', text: 'Wraps finished pallets for safe storage and transport.', productSlug: 'pallet-stretch-wrap-machine' },
  ],
};

const webSealer: CategoryHub = {
  ...shrinkWrapping,
  seoTitle: 'Web Sealer Machine Manufacturer | Web Sealer with Shrink Tunnel',
  metaDescription:
    'Web sealer machines with shrink tunnel for bottle and box bundles, made in India. Semi-automatic and automatic models for domestic and export buyers.',
  heading: 'Web Sealer Machines',
  keywords: ['web sealer machine', 'web sealer with shrink tunnel', 'bottle bundling machine', 'shrink bundler', 'web sealer machine price'],
  intro:
    'A web sealer wraps a group of bottles, jars or boxes in a sleeve of shrink film, seals it and sends it through a shrink tunnel so the bundle is held tightly together with open "bull’s-eye" ends. It is widely used for water, beverage and FMCG multi-packs.',
};

export const CATEGORY_HUBS: Record<string, CategoryHub> = {
  'shrink-wrapping-machines': shrinkWrapping,
  'sealing-machines': sealing,
  'vacuum-packaging-machines': vacuum,
  'conveyor-systems': conveyors,
  'pallet-stretch-wrapping-machines': palletStretch,
  'end-of-line-packaging': endOfLine,
  'web-sealer-machines': webSealer,
};

export const getCategoryHub = (slug: string): CategoryHub | null => CATEGORY_HUBS[slug] ?? null;
