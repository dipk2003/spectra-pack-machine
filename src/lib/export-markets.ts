/**
 * Export market pages: /packaging-machines/international/[country].
 *
 * Each market carries details that genuinely differ by country (site power,
 * the words local buyers search with, import and safety questions buyers raise,
 * typical applications). Do not add a market by copying another one with the
 * name swapped; near-duplicate country pages do not help buyers or rankings.
 * Compliance lines are phrased as questions to confirm, not as claims that
 * Spectra machines hold a given certification.
 */

export type ExportMarket = {
  slug: string;
  name: string;
  /** "the UAE", "the UK" etc. for use mid-sentence. */
  inSentence: string;
  isoCode: string;
  seoTitle: string;
  metaDescription: string;
  intro: string;
  power: { singlePhase: string; threePhase: string; note: string };
  searchTerms: string[];
  applications: string[];
  importNotes: string[];
  faqs: { q: string; a: string }[];
};

const SHIPPING_FAQ = {
  q: 'How are machines shipped from India?',
  a: 'Machines are packed for sea freight and shipped from a port near Mumbai, such as Nhava Sheva (JNPT). We can quote ex-works, FOB or delivered to your port; the terms, packing and documents are agreed in the quotation.',
};

const SUPPORT_FAQ = {
  q: 'How do installation and after-sales support work abroad?',
  a: 'Machines are tested at our factory before dispatch, and we can record a trial with your product samples. Commissioning support is given by video call with manuals and settings, and an engineer visit can be discussed for your project. Spare parts are dispatched from India.',
};

export const EXPORT_MARKETS: ExportMarket[] = [
  {
    slug: 'uae',
    name: 'United Arab Emirates',
    inSentence: 'the UAE',
    isoCode: 'AE',
    seoTitle: 'Packaging Machine Supplier for UAE & Dubai | Shrink Wrapping & Sealing Machines from India',
    metaDescription:
      'Shrink wrapping, sealing, vacuum packaging and conveyor machines for Dubai, Sharjah, Abu Dhabi and the UAE, built in India for 230/400 V 50 Hz sites.',
    intro:
      'Factories, bottling plants and trading companies in Dubai, Sharjah, Ajman and Abu Dhabi buy packaging machines from India for water and beverage bundling, food packing and re-export packing. We manufacture the machines in Maharashtra and ship them to UAE ports.',
    power: {
      singlePhase: '230 V, 50 Hz',
      threePhase: '400 V, 50 Hz',
      note: 'The UAE uses the same 50 Hz frequency as India, so standard motor and heater configurations usually apply. Confirm the phase available at your site.',
    },
    searchTerms: ['shrink wrapping machine in UAE', 'packaging machine supplier in Dubai', 'band sealer machine Dubai', 'water bottle shrink wrap machine UAE', 'vacuum packing machine Dubai'],
    applications: ['Water and juice bottle bundles', 'Food trading and repacking', 'Dates, spices and dry fruit packing', 'Cosmetics and personal care', 'Carton packing for re-export'],
    importNotes: [
      'Share the consignee name and the free zone or mainland location, as documents differ.',
      'We provide a commercial invoice, packing list and certificate of origin from India; tell us if your importer needs other documents.',
      'Plan unloading and site access before the container arrives.',
    ],
    faqs: [
      { q: 'Do you supply packaging machines to Dubai and the rest of the UAE?', a: 'Yes. We supply machines to buyers in the UAE from our factory in India. Share your emirate, the product you pack and the output you need, and we will recommend a machine and quote shipment to your port.' },
      SHIPPING_FAQ,
      SUPPORT_FAQ,
    ],
  },
  {
    slug: 'saudi-arabia',
    name: 'Saudi Arabia',
    inSentence: 'Saudi Arabia',
    isoCode: 'SA',
    seoTitle: 'Packaging Machine Supplier for Saudi Arabia | 60 Hz Shrink Wrapping & Sealing Machines from India',
    metaDescription:
      'Packaging machines from India for Riyadh, Jeddah, Dammam and all of Saudi Arabia: shrink wrapping, band sealers, vacuum packaging and conveyors configured for 60 Hz.',
    intro:
      'Water bottlers, date and food processors and FMCG factories in Riyadh, Jeddah, Dammam and across Saudi Arabia source packaging machines from India. Because Saudi Arabia runs on 60 Hz power, the electrical configuration is confirmed for every order before the machine is built.',
    power: {
      singlePhase: '230 V, 60 Hz',
      threePhase: '400 V, 60 Hz',
      note: 'Saudi Arabia uses 60 Hz, unlike India. Motors, pumps and drives must be specified for 60 Hz, and conveyor speeds are set accordingly. Some older sites still use 127/220 V, so confirm your supply.',
    },
    searchTerms: ['shrink wrapping machine Saudi Arabia', 'packaging machine supplier Riyadh', 'band sealer machine Jeddah', 'water bottle shrink wrapping machine KSA', 'vacuum packaging machine Saudi'],
    applications: ['Bottled water bundles', 'Dates and dry food packing', 'Spices, rice and grains', 'Dairy and packaged foods', 'Carton and pallet dispatch'],
    importNotes: [
      'Imported machinery generally needs conformity documentation for Saudi customs; ask your importer or clearing agent which certificates apply to your shipment.',
      'Confirm the 60 Hz supply, voltage and phase before ordering so the machine is built for your site.',
      'We provide a commercial invoice, packing list and certificate of origin from India.',
    ],
    faqs: [
      { q: 'Can your machines run on 60 Hz power in Saudi Arabia?', a: 'Machines for Saudi Arabia are specified for 60 Hz when ordered. Tell us your voltage, frequency and phase and we confirm the motors, heaters and controls in the quotation.' },
      SHIPPING_FAQ,
      SUPPORT_FAQ,
    ],
  },
  {
    slug: 'usa',
    name: 'United States',
    inSentence: 'the USA',
    isoCode: 'US',
    seoTitle: 'Shrink Wrap Machines, L-Bar Sealers & Band Sealers from India | USA Packaging Machine Supplier',
    metaDescription:
      'L-bar sealers and shrink tunnels, continuous band sealers, chamber vacuum sealers, stretch wrappers and conveyors built in India for US buyers on 60 Hz power.',
    intro:
      'US manufacturers, co-packers and e-commerce fulfilment businesses source packaging equipment from India. We manufacture L-bar sealers with shrink tunnels, shrink bundlers, continuous band sealers, chamber vacuum sealers, stretch wrappers and conveyors, and configure each machine for US power.',
    power: {
      singlePhase: '120 V or 240 V, 60 Hz',
      threePhase: '208 V, 240 V or 480 V, 60 Hz',
      note: 'US sites run on 60 Hz with several voltages. Tell us the exact voltage and phase so the machine is built for it; a transformer may be specified for some configurations.',
    },
    searchTerms: ['shrink wrap machine', 'L-bar sealer and shrink tunnel', 'continuous band sealer', 'chamber vacuum sealer', 'stretch wrapper', 'shrink bundler'],
    applications: ['E-commerce and fulfilment packing', 'Food and snack co-packing', 'Bottled beverages and bundles', 'Printed material and retail boxes', 'Industrial parts'],
    importNotes: [
      'Buyers and insurers often ask about electrical safety standards for industrial machinery (for example NFPA 79 or a UL-listed control panel). Tell us your requirement and we confirm what we can provide before you order.',
      'Electrical connection on site should be done by a licensed local electrician.',
      'Your customs broker handles US import entry; we supply the commercial invoice, packing list and certificate of origin.',
    ],
    faqs: [
      { q: 'What is an L-bar sealer?', a: 'An L-bar sealer is the US name for an L-sealer: it seals and cuts shrink film around a product in an L shape, and the pack then passes through a shrink tunnel. We build semi-automatic and fully automatic L-bar sealers with tunnels.' },
      SHIPPING_FAQ,
      SUPPORT_FAQ,
    ],
  },
  {
    slug: 'uk',
    name: 'United Kingdom',
    inSentence: 'the UK',
    isoCode: 'GB',
    seoTitle: 'Shrink Wrapping Machines, Band Sealers & Vacuum Packers from India | UK Supplier',
    metaDescription:
      'Shrink wrapping machines, L-sealers, continuous band sealers, vacuum packers and pallet wrappers built in India for UK businesses on 230/400 V 50 Hz power.',
    intro:
      'UK food producers, contract packers and online retailers source shrink wrapping machines, band sealers, vacuum packers and pallet wrappers from India. The UK uses 50 Hz power like India, so our standard configurations usually suit UK sites.',
    power: {
      singlePhase: '230 V, 50 Hz',
      threePhase: '400 V, 50 Hz',
      note: 'UK supply matches Indian frequency. Confirm single- or three-phase availability and the plug or isolator required at your site.',
    },
    searchTerms: ['shrink wrapping machine UK', 'L sealer shrink wrap machine', 'continuous band sealer UK', 'vacuum packing machine UK', 'pallet wrapper UK'],
    applications: ['Food and bakery packing', 'Online retail and fulfilment', 'Contract packing and multi-packs', 'Cosmetics and gift sets', 'Pallet dispatch'],
    importNotes: [
      'Machinery placed on the UK market needs conformity marking and documentation (UKCA or CE). Tell us your requirement and we confirm the documentation we can supply before you order.',
      'Your importer or customs agent handles UK import declarations; we supply the commercial invoice, packing list and certificate of origin.',
    ],
    faqs: [
      { q: 'Do your machines work on UK power?', a: 'The UK runs on 230/400 V at 50 Hz, the same frequency as India, so standard motors and heaters usually apply. We confirm the phase and connection for your site in the quotation.' },
      SHIPPING_FAQ,
      SUPPORT_FAQ,
    ],
  },
  {
    slug: 'australia',
    name: 'Australia',
    inSentence: 'Australia',
    isoCode: 'AU',
    seoTitle: 'Shrink Wrap Machines, Band Sealers & Vacuum Packers from India | Australia Supplier',
    metaDescription:
      'Shrink wrap machines, L-sealers, band sealers, vacuum packing machines, stretch wrappers and conveyors built in India for Australian businesses on 230/400 V 50 Hz.',
    intro:
      'Food processors, farms, wholesalers and fulfilment businesses in Sydney, Melbourne, Brisbane, Perth and Adelaide buy packaging machines from India. Australia runs on 50 Hz power like India, so most standard configurations suit Australian sites.',
    power: {
      singlePhase: '230 V, 50 Hz',
      threePhase: '400 V, 50 Hz',
      note: 'Australian supply matches Indian frequency. Confirm the phase, and note that electrical connection must be done by a licensed Australian electrician.',
    },
    searchTerms: ['shrink wrap machine Australia', 'L bar sealer Australia', 'band sealer Australia', 'vacuum packing machine Australia', 'stretch wrapper Australia'],
    applications: ['Fresh produce and agricultural packing', 'Meat and seafood vacuum packing', 'Food and snack production', 'Wholesale and fulfilment', 'Pallet dispatch'],
    importNotes: [
      'Buyers often ask about Australian machinery safety and electrical requirements; tell us yours and we confirm what we can provide before you order.',
      'Wooden packing entering Australia must meet biosecurity treatment rules (ISPM 15); we confirm compliant export packing in the quotation.',
      'Your customs broker handles import clearance; we supply the commercial invoice, packing list and certificate of origin.',
    ],
    faqs: [
      { q: 'Can I buy a shrink wrap machine from India for use in Australia?', a: 'Yes. Australian buyers order shrink wrap machines, L-bar sealers and tunnels from us for 230/400 V 50 Hz sites. Share your product and output and we quote the machine and shipment to your port.' },
      SHIPPING_FAQ,
      SUPPORT_FAQ,
    ],
  },
];

export const getExportMarket = (slug: string) => EXPORT_MARKETS.find((market) => market.slug === slug) ?? null;
