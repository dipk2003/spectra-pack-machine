import { PRODUCTS, type ProductData } from './products';

export { PRODUCTS };
export type { ProductData };

const foundedYear = 2001;
const currentYear = new Date().getFullYear();

export const COMPANY_INFO = {
  name: 'Spectra Pack Machines',
  legalName: 'Spectra Pack Machines',
  tagline: 'Top Packaging Machine Manufacturers in India',
  taglineDisplay: 'Top Packaging Machines Manufacturers In India',
  phone: ['+91 84529 65327', '+91 93704 40729'],
  email: [
    'info@spectrapackmachines.com',
    'sales@spectrapackmachines.com',
    'spectrapackmachines@gmail.com',
  ],
  whatsapp: '919370440729',
  headOffice:
    '505, Dattani Prism 1, Above Janseva Hospital, Behind Dattani Mall, Vasai West - 401207, Maharashtra, India',
  factory:
    'Sr. No. 69/21, Devdal, Post-Kaman, Vasai Virar City, Palghar - 401208, Maharashtra, India',
  website: 'https://www.spectrapackmachines.com',
  yearsOfExperience: currentYear - foundedYear,
  foundedYear,
  logoPath: '/images/brand/spectra-pack-logo.png',
  catalogPath: '/catalog/spectra-pack-machines-catalog.pdf',
  companyDescription: [
    'Our journey has been shaped by a simple belief: delivering packaging solutions that businesses can truly rely on. Based in Mumbai, Maharashtra, Spectra Pack Machines has grown into one of India\'s trusted names in the packaging machinery industry by consistently focusing on quality, innovation, and practical engineering.',
    'With more than two decades of experience, the company has built a strong reputation for designing and manufacturing packaging machines that combine precision, durability, and efficiency. The range supports FMCG, pharmaceuticals, food and beverage, logistics, retail, and general manufacturing applications where dependable performance and production efficiency are critical.',
    'From automatic and semi-automatic systems to fully customized packaging solutions, Spectra Pack Machines continues to invest in research and development to stay aligned with current production requirements and evolving technology.',
    'Guided by Mr. Mata Prasad Pandey, Director, and Mr. Shubham J. Mishra, CEO, the business has steadily expanded its capabilities and market reach while keeping reliability, long-term value, and customer support at the center of every machine build.',
    'As the company continues to grow across domestic and international markets, it remains focused on helping manufacturers improve packaging processes while setting higher standards in performance, sustainability, and service.',
  ],
  leadership: [
    { name: 'Mr. Mata Prasad Pandey', role: 'Director' },
    { name: 'Mr. Shubham J. Mishra', role: 'CEO' },
  ],
  infrastructure: {
    officeTitle: 'Vasai West Head Office',
    officeDescription: [
      'Our head office is strategically located in Vasai West, a well-connected business zone in the Mumbai metropolitan region. It acts as the central hub for management, sales coordination, customer support, and project planning.',
      'The office is equipped with modern administrative facilities and a dedicated technical support team that manages product consultations, order processing, and after-sales coordination so clients receive timely assistance throughout their journey.',
    ],
    factoryTitle: 'Chinchoti Manufacturing Facility',
    factoryDescription: [
      'Our manufacturing facility is located in the industrial belt of Chinchoti, a rapidly growing industrial hub near Mumbai with strong access to major highways and logistics networks.',
      'The factory is equipped with advanced machinery, modern fabrication equipment, and a well-organized production layout. Skilled engineers and technicians handle fabrication, assembly, testing, and quality inspection with a strong focus on durable and high-performance packaging machines.',
    ],
    summary:
      'Together, the Vasai West head office and Chinchoti manufacturing facility form the backbone of our operations, enabling Spectra Pack Machines to deliver reliable packaging solutions with efficiency, consistency, and a strong commitment to customer satisfaction.',
  },
  socialLinks: {
    instagram: 'https://www.instagram.com/spectrapack_machines/',
    x: 'https://x.com/Spectrapack5005',
    youtube: 'https://www.youtube.com/@SpectrapackMachines',
    facebook: 'https://www.facebook.com/profile.php?id=61586964737420',
    linkedin: 'https://www.linkedin.com/in/spectrapack-machines-b87402380/',
  },
};

export const SERVICES = [
  {
    title: 'Machine Manufacturing',
    slug: 'manufacturing',
    description: 'Packaging machines built in India for bottle, box, pouch, vacuum, and conveyor applications.',
    content:
      'We manufacture shrink wrapping machines, sealing machines, vacuum packaging machines, conveyor systems, and end-of-line packaging equipment from our Vasai-Palghar setup. Every machine is matched to the intended product flow and packaging format.',
    icon: 'factory',
  },
  {
    title: 'Machine Selection & Line Consultation',
    slug: 'consultation',
    description: 'Application-based guidance to match the right machine format to your production requirement.',
    content:
      'If you are comparing bottle wrapping, pouch sealing, vacuum packaging, or conveyor movement options, our team helps shortlist the right machine based on output, pack style, available space, and operating preference.',
    icon: 'pencil-ruler',
  },
  {
    title: 'Custom Machine Design',
    slug: 'custom-design',
    description: 'Machine configurations adapted to your product size, pack count, and line layout.',
    content:
      'Many packaging lines need modifications in conveyor width, machine dimensions, sealing format, or loading method. We support application-specific customization so the machine fits the actual job instead of forcing your production around a standard frame.',
    icon: 'pencil-ruler',
  },
  {
    title: 'Installation & Commissioning',
    slug: 'installation',
    description: 'On-site setup, trial support, and operator handover for new machine installations.',
    content:
      'We assist with machine installation, commissioning, and initial trial runs so your team can move from delivery to production with less friction. This includes practical guidance on use, adjustments, and routine operating checks.',
    icon: 'wrench',
  },
  {
    title: 'After-Sales Support & Spares',
    slug: 'after-sales',
    description: 'Ongoing technical support, service coordination, and spare-part assistance after dispatch.',
    content:
      'Support does not stop at machine delivery. We help with troubleshooting, consumable or spare requirements, and service coordination so your packaging operation keeps moving with minimal downtime.',
    icon: 'headphones',
  },
];

export const INDUSTRIES = [
  {
    title: 'Water & Beverage Packaging',
    description:
      'Bottle bundle wrapping, sleeve shrinking, and grouped pack handling for water and beverage lines.',
  },
  {
    title: 'Boxes, Cartons & Corrugated Packs',
    description:
      'Shrink wrapping and sealing solutions for boxes, printed cartons, batteries, and dispatch-ready grouped packs.',
  },
  {
    title: 'Food, Spices & Dry Goods',
    description:
      'Pouch sealing and vacuum packaging support for food products, spices, and shelf-life-focused packing.',
  },
  {
    title: 'Personal Care & Tube Products',
    description:
      'Tube sealing and compact packaging support for creams, gels, and personal care product formats.',
  },
  {
    title: 'Industrial Components & General Manufacturing',
    description:
      'Packaging equipment for bearings, hardware, and industrial items that need secure grouped wrapping or sealing.',
  },
  {
    title: 'Warehouse & Dispatch Operations',
    description:
      'Conveyor systems and pallet stretch wrapping solutions for movement, staging, and dispatch stabilization.',
  },
];

export const FAQS = [
  {
    q: 'What types of packaging machines does Spectra Pack Machines manufacture?',
    a: 'Our catalog covers shrink wrapping machines, sealing machines, vacuum packaging machines, conveyor systems, and pallet stretch wrapping solutions for Indian production lines.',
  },
  {
    q: 'Do you offer both semi-automatic and automatic machines?',
    a: 'Yes. The catalog includes semi-automatic and automatic configurations across different machine families, depending on the application and production requirement.',
  },
  {
    q: 'Can you help choose the right machine for my product?',
    a: 'Yes. Share your product type, pack style, required output, and available floor space, and our team can suggest the most suitable machine configuration.',
  },
  {
    q: 'Do you provide installation and support after purchase?',
    a: 'Yes. We support machine installation, commissioning, basic operator handover, and post-sale service coordination for machine users.',
  },
  {
    q: 'Can I download the Spectra Pack Machines catalog?',
    a: 'Yes. The website includes a direct catalog download so you can review machine families, application types, and contact details in one place.',
  },
  {
    q: 'Can I visit your office or factory?',
    a: 'Yes. You can schedule a discussion and coordinate an office meeting or factory visit with the Spectra Pack team in Vasai and Palghar.',
  },
  {
    q: 'Do you support custom conveyor or machine layouts?',
    a: 'Yes. Conveyor systems and several packaging machines can be configured around your product flow, size range, and production layout.',
  },
  {
    q: 'How do I get a quotation?',
    a: 'Call, WhatsApp, or submit an enquiry with your product details and expected output. The team will review the requirement and share the right machine recommendation with quotation details.',
  },
];

export const SEO_CITIES = [
  'mumbai',
  'delhi',
  'bangalore',
  'hyderabad',
  'ahmedabad',
  'chennai',
  'kolkata',
  'pune',
  'jaipur',
  'lucknow',
  'kanpur',
  'nagpur',
  'indore',
  'thane',
  'bhopal',
  'visakhapatnam',
  'vadodara',
  'surat',
  'noida',
  'gurgaon',
];

export const SEO_MACHINES = PRODUCTS.map((p) => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
}));

export const groupProductsByCategory = (products: ProductData[]) => {
  const categoryMap = new Map<string, ProductData[]>();

  products.forEach((product) => {
    const items = categoryMap.get(product.category);
    if (items) {
      items.push(product);
      return;
    }

    categoryMap.set(product.category, [product]);
  });

  return Array.from(categoryMap.entries()).map(([category, items]) => ({
    category,
    items,
  }));
};
