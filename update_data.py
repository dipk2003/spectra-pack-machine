import json
import re

new_products_code = """export const PRODUCTS: ProductData[] = [
  {
    title: 'Shrink Tunnel Machine — Model: SPST-101',
    slug: 'shrink-tunnel-machine-spst-101',
    category: 'Shrinking Machines',
    shortDesc: 'The SPST-101 Shrink Tunnel Machine is a robust and highly efficient semi-automatic packaging solution designed for industrial applications.',
    description: 'The SPST-101 Shrink Tunnel Machine is a robust and highly efficient semi-automatic packaging solution designed for industrial applications. Ideal for medium to large-scale operations in India, it provides consistent and secure shrinkage for various products using mild steel or SS 304 construction.',
    features: ['Semi-Automatic Automation', 'Electric (Three Phase) Drive', 'Mild Steel / SS 304 Construction', 'Integrated cooling section for optimal finishing', 'Roller Rod, Mesh, or Belt Conveyors'],
    specs: { 'Power': '9–10 KW', 'Heaters': '12–14 (0–300°C)', 'Automation': 'Semi-Automatic' },
    faqs: [
      { q: 'What material is the machine made of?', a: 'It is constructed from Mild Steel / SS 304.' }
    ],
    image: '/images/products/shrink-tunnel.jpg'
  },
  {
    title: 'Band Sealer Machine — Model: SPVBS-S401',
    slug: 'band-sealer-machine-spvbs-s401',
    category: 'Sealing Machines',
    shortDesc: 'The SPVBS-S401 Band Sealer Machine offers high-speed, continuous sealing for pouches and bags, making it perfect for FMCG packaging.',
    description: 'The SPVBS-S401 Band Sealer Machine offers high-speed, continuous sealing for pouches and bags, making it perfect for FMCG packaging. With a sealing speed of up to 100 m/min and an integrated forced-air cooling system, it ensures strong, professional seals every time.',
    features: ['Continuous sealing', 'Up to 100 m/min production speed', 'Dual 500W heaters', 'Built-in forced air cooling', 'Adjustable seal width (6, 8, 10, or 12 mm)'],
    specs: { 'Sealing Width': '6/8/10/12 mm', 'Speed': '100 m/min', 'Power': '3 Phase 400V, 1.5 kW', 'Conveyor Size': '200mm x 1570mm', 'Heaters': 'Dual 500W x 2 (115V)' },
    faqs: [
      { q: 'What is the maximum sealing speed?', a: 'The maximum sealing speed is 100 m/min.' }
    ],
    image: '/images/products/band-sealer.jpg'
  },
  {
    title: 'Automatic Web Sealer with Shrink Tunnel (Bottles) — Model: SPAWSST-201',
    slug: 'auto-web-sealer-shrink-tunnel-bottles-spawsst-201',
    category: 'Sealing Machines',
    shortDesc: 'Designed for the beverage industry, the SPAWSST-201 is a heavy-duty fully automatic web sealer that efficiently bundles and shrink-wraps bottles.',
    description: 'Designed for the beverage industry, the SPAWSST-201 is a heavy-duty fully automatic web sealer that efficiently bundles and shrink-wraps bottles. Capable of handling high volumes, it is the perfect solution for mineral water plants, juice manufacturers, and large-scale packaging facilities.',
    features: ['Fully automatic operation', 'High capacity packaging', 'Durable Mild Steel / Stainless Steel construction', 'Integrated shrink tunnel'],
    specs: { 'Capacity': '120 bottles/min (1 Liter)', 'Voltage': '3 Phase 440V, 50 Hz', 'Dimensions': '18ft x 4.5ft x 5.5ft', 'Options': '60/90/120/200 bottles per minute' },
    faqs: [
      { q: 'What capacity options are available?', a: 'It is available in 60, 90, 120, or 200 bottles per minute configurations.' }
    ],
    image: '/images/products/web-sealer.jpg'
  },
  {
    title: 'Semi-Automatic Web Sealer with Shrink Tunnel (Bottles) — Model: SPSAWST-203',
    slug: 'semi-auto-web-sealer-shrink-tunnel-bottles-spsawst-203',
    category: 'Sealing Machines',
    shortDesc: 'The SPSAWST-203 provides excellent value for mid-sized bottling plants requiring reliable bundling and shrink-wrapping.',
    description: 'The SPSAWST-203 provides excellent value for mid-sized bottling plants requiring reliable bundling and shrink-wrapping. It combines affordability with industrial-grade mild steel construction, processing up to 40 bottles per minute with ease.',
    features: ['Semi-automatic operation', 'Affordable and reliable', 'Sturdy Mild Steel construction', 'Processes up to 40 bottles per minute'],
    specs: { 'Capacity': '30–40 bottles/min', 'Power': '12 KV, 50 Hz', 'Dimensions': '12ft x 5ft x 5.5ft' },
    faqs: [
      { q: 'What is the capacity of this machine?', a: 'It can process 30-40 bottles per minute.' }
    ],
    image: '/images/products/web-sealer.jpg'
  },
  {
    title: 'Automatic Web Sealer with Shrink Tunnel (Box) — Model: SPAWST-202',
    slug: 'auto-web-sealer-shrink-tunnel-box-spawst-202',
    category: 'Sealing Machines',
    shortDesc: 'Streamline your end-of-line packaging with the SPAWST-202 Automatic Box Web Sealer.',
    description: 'Streamline your end-of-line packaging with the SPAWST-202 Automatic Box Web Sealer. Engineered for versatility, this machine securely wraps and shrinks secondary packaging such as boxes, Aata bags, batteries, and mechanical bearings at a steady industrial pace.',
    features: ['Automatic box sealing', 'Versatile packaging capabilities', 'Mild Steel / Stainless Steel construction'],
    specs: { 'Capacity': '10–12 boxes/min', 'Power': '15 KV, 50 Hz', 'Dimensions': '14ft x 4.5ft x 5.5ft' },
    faqs: [
      { q: 'What products can it wrap?', a: 'It is ideal for Boxes, Aata Bags, Batteries, and Bearings.' }
    ],
    image: '/images/products/web-sealer.jpg'
  },
  {
    title: 'Semi-Automatic Web Sealer with Shrink Tunnel (Box) — Model: SPSAWST-204',
    slug: 'semi-auto-web-sealer-shrink-tunnel-box-spsawst-204',
    category: 'Sealing Machines',
    shortDesc: 'The SPSAWST-204 is a practical and highly efficient semi-automatic box wrapper designed to handle diverse industrial products.',
    description: 'The SPSAWST-204 is a practical and highly efficient semi-automatic box wrapper designed to handle diverse industrial products. Excellent for businesses needing sturdy wrap solutions for small batches of boxes, heavy batteries, or bearings.',
    features: ['Semi-automatic box wrapper', 'Practical and highly efficient', 'Mild Steel Finish'],
    specs: { 'Capacity': '5 boxes/min', 'Power': '10–12 KV, 50 Hz', 'Dimensions': '12ft x 5ft x 5.5ft' },
    faqs: [
      { q: 'What is the capacity of this machine?', a: 'It can wrap 5 boxes per minute.' }
    ],
    image: '/images/products/web-sealer.jpg'
  },
  {
    title: 'Chamber Shrink Tunnel — Model: SPSC-301',
    slug: 'chamber-shrink-tunnel-spsc-301',
    category: 'Shrinking Machines',
    shortDesc: 'The SPSC-301 Chamber Shrink Tunnel is an all-in-one manual packaging solution that seals and shrinks in a single step.',
    description: 'The SPSC-301 Chamber Shrink Tunnel is an all-in-one manual packaging solution that seals and shrinks in a single step. Perfect for retail spaces, small manufacturing units, and businesses needing visual product appeal with minimal floor space.',
    features: ['Manual operation', 'All-in-one sealing and shrinking', 'Mild Steel framework', 'Compact and space-saving'],
    specs: { 'Automation': 'Manual Operation', 'Drive System': 'Electric', 'Construction': 'Mild Steel framework' },
    faqs: [
      { q: 'Who is this machine for?', a: 'Perfect for retail spaces, small manufacturing units, and businesses needing visual product appeal.' }
    ],
    image: '/images/products/shrink-chamber.jpg'
  },
  {
    title: 'L-Sealer with Shrink Tunnel (Indian) — Model: SPLST-302',
    slug: 'l-sealer-with-shrink-tunnel-splst-302',
    category: 'Sealing Machines',
    shortDesc: 'Increase your packaging efficiency with the SPLST-302 Semi-Automatic L-Sealer.',
    description: 'Increase your packaging efficiency with the SPLST-302 Semi-Automatic L-Sealer. Designed for precise sealing followed by immediate shrinkage, this system protects your products from dust and moisture while delivering a premium retail-ready look.',
    features: ['Semi-Automatic operation', 'Precise sealing and immediate shrinkage', 'Mild Steel structure'],
    specs: { 'Automation': 'Semi-Automatic', 'Drive System': 'Electric (Three Phase)' },
    faqs: [
      { q: 'What is the automation level?', a: 'It is a Semi-Automatic L-Sealer.' }
    ],
    image: '/images/products/l-sealer.jpg'
  },
  {
    title: 'Fully Automatic L-Sealer with Shrink Tunnel — Model: SPALST-303',
    slug: 'fully-automatic-l-sealer-with-shrink-tunnel-spalst-303',
    category: 'Sealing Machines',
    shortDesc: 'Maximize your production line throughput with the SPALST-303 Fully Automatic L-Sealer.',
    description: 'Maximize your production line throughput with the SPALST-303 Fully Automatic L-Sealer. Built for high-volume packaging applications, this machine requires minimal operator intervention while delivering flawless, tight shrink wraps around your goods.',
    features: ['Fully Automatic Operation', 'High-volume packaging', 'Heavy-duty Mild Steel construction', 'Seamlessly connects to existing production lines'],
    specs: { 'Automation': 'Fully Automatic', 'Drive System': 'Electric (Three Phase)' },
    faqs: [
      { q: 'Can it be integrated into existing lines?', a: 'Yes, it seamlessly connects to existing production lines.' }
    ],
    image: '/images/products/l-sealer.jpg'
  },
  {
    title: 'Pallet Stretch Wrap Machine — Model: SPPSW',
    slug: 'pallet-stretch-wrap-machine-sppsw',
    category: 'Wrapping Machines',
    shortDesc: 'Secure your pallets for transit with the robust SPPSW Pallet Stretch Wrap Machine.',
    description: 'Secure your pallets for transit with the robust SPPSW Pallet Stretch Wrap Machine. Offering computerized frequency speed control, this semi-automatic wrapper ensures tight, stable pallet loads, reducing material waste and preventing shipping damages.',
    features: ['Computerized Frequency Speed Control', 'Stainless Steel (Green Finish) construction', 'Tight, stable pallet loads'],
    specs: { 'Automation': 'Semi-Automatic', 'Strapping Speed': '15 rpm mm/s', 'Weight': '250 kg', 'Dimensions': '50x50x80 mm' },
    faqs: [
      { q: 'What is the control system?', a: 'It uses Computerized Frequency Speed Control.' }
    ],
    image: '/images/products/stretch-wrapping.jpg'
  },
  {
    title: 'Portable Shrink Tunnel — Model: SPST-102',
    slug: 'portable-shrink-tunnel-spst-102',
    category: 'Shrinking Machines',
    shortDesc: 'The SPST-102 Portable Shrink Tunnel offers maximum flexibility for dynamic workspaces.',
    description: 'The SPST-102 Portable Shrink Tunnel offers maximum flexibility for dynamic workspaces. While primarily designed for water bottle sleeve packing, its easily movable design and three-phase electric heating make it adaptable to varying production line setups.',
    features: ['Easily movable design', 'Three-phase electric heating', 'Mild Steel Main Body'],
    specs: { 'Automation': 'Semi-Automatic', 'Drive System': 'Electric (Three Phase)', 'Application': 'Water Bottle Packing' },
    faqs: [
      { q: 'Is it movable?', a: 'Yes, its easily movable design makes it adaptable to varying setups.' }
    ],
    image: '/images/products/portable-shrink-tunnel.jpg'
  },
  {
    title: 'Sleeve Shrink Wrapping Machine — Model: SPAST-601',
    slug: 'sleeve-shrink-wrapping-machine-spast-601',
    category: 'Shrinking Machines',
    shortDesc: 'The SPAST-601 is a premium fully automatic sleeve wrapper designed specifically for high-speed bottle bundling.',
    description: 'The SPAST-601 is a premium fully automatic sleeve wrapper designed specifically for high-speed bottle bundling. It provides exceptionally strong sleeve wrapping, ensuring multi-packs hold together securely during rigorous logistics and transport.',
    features: ['Fully Automatic operation', 'High-speed bottle bundling', 'Solid Mild Steel structure'],
    specs: { 'Automation': 'Fully Automatic', 'Drive System': 'Electric (Three Phase)' },
    faqs: [
      { q: 'What is the primary application?', a: 'High-volume Water Bottle Packing.' }
    ],
    image: '/images/products/sleeve-shrinking.jpg'
  },
  {
    title: 'Foot Sealer Machines',
    slug: 'foot-sealer-machines',
    category: 'Sealing Machines',
    shortDesc: 'Our industrial Foot Sealer series provides hands-free operation for fast and reliable bag sealing.',
    description: 'Our industrial Foot Sealer series provides hands-free operation for fast and reliable bag sealing. Perfect for granular or liquid product packaging, allowing operators to position pouches accurately while maintaining high production rates.',
    features: ['Hands-free operation', 'Comfortable pedal-operated mechanism', 'Fast and reliable bag sealing'],
    specs: { 'Models': 'SPTS, SPFIS, SPDHFS', 'Operation': 'Pedal-operated' },
    faqs: [
      { q: 'Are these hands-free?', a: 'Yes, they provide hands-free operation via a comfortable pedal mechanism.' }
    ],
    image: '/images/products/foot-impulse-sealer.jpg'
  },
  {
    title: 'Band Sealer Machines (Mini & Master)',
    slug: 'band-sealer-machines-mini-master',
    category: 'Sealing Machines',
    shortDesc: 'Spectra Pack Band Sealers are built for continuous, assembly-line pouch sealing.',
    description: 'Spectra Pack Band Sealers are built for continuous, assembly-line pouch sealing. Available in both horizontal and vertical configurations, they are the backbone of small to medium FMCG packaging, ensuring leak-proof sealing of food, snacks, and chemicals.',
    features: ['Continuous, assembly-line pouch sealing', 'Horizontal and vertical configurations', 'Leak-proof sealing'],
    specs: { 'Models': 'SPHBS-S402, SPHBS-M403, SPVBS-M404', 'Application': 'Continuous pouch sealing' },
    faqs: [
      { q: 'What configurations are available?', a: 'Available in both horizontal and vertical configurations.' }
    ],
    image: '/images/products/band-sealer.jpg'
  },
  {
    title: 'Pneumatic Sealer Machines',
    slug: 'pneumatic-sealer-machines',
    category: 'Sealing Machines',
    shortDesc: 'When heavy-duty, high-pressure sealing is required, our Pneumatic Sealer series delivers.',
    description: 'When heavy-duty, high-pressure sealing is required, our Pneumatic Sealer series delivers. Utilizing compressed air for uniform seal pressure, these machines are ideal for thick industrial bags and hazardous environments requiring flame-proof equipment.',
    features: ['Compressed air-driven strong sealing power', 'Uniform seal pressure', 'Flame-proof equipment (SPPFS)'],
    specs: { 'Models': 'SPPFS, SPMS', 'Operation': 'Compressed air-driven' },
    faqs: [
      { q: 'Is it suitable for thick bags?', a: 'Yes, these machines are ideal for thick industrial bags.' }
    ],
    image: '/images/products/pneumatic-impulse-sealer.jpg'
  },
  {
    title: 'Heavy Duty Table Top Vacuum Packaging Machines',
    slug: 'heavy-duty-table-top-vacuum-packaging-machines',
    category: 'Vacuum Machines',
    shortDesc: 'Extend the shelf life of your perishable goods with the heavy-duty SPVP Vacuum Packaging machines.',
    description: 'Extend the shelf life of your perishable goods with the heavy-duty SPVP Vacuum Packaging machines. Highly sought after by the food industry, these machines extract air to preserve freshness and prevent contamination in grains, pulses, and dry fruits.',
    features: ['Heavy-duty vacuum packaging', 'Extracts air to preserve freshness'],
    specs: { 'Models': 'SPVP-501 to SPVP-506', 'Industrial Application': 'Food Items, Grains, Pulses, and Dry Fruits' },
    faqs: [
      { q: 'Is there an advanced option available?', a: 'Yes, the Double Door Chamber Vacuum Machine with Conveyor (Model SPCVP-506).' }
    ],
    image: '/images/products/vacuum-chamber.jpg'
  },
  {
    title: 'Industrial Conveyor Systems',
    slug: 'industrial-conveyor-systems',
    category: 'Conveyor Systems',
    shortDesc: 'Optimize your factory logistics and machine integration with Spectra Pack\'s robust material handling Conveyor Systems.',
    description: 'Optimize your factory logistics and machine integration with Spectra Pack\'s robust material handling Conveyor Systems. Customized to your specific weight and speed requirements, they form the crucial link between production and final packaging.',
    features: ['Customized to specific weight and speed requirements', 'Robust material handling', 'Belt, Slate Chain, and Roller Conveyors available'],
    specs: { 'Belt Conveyors': 'Modular, PVC', 'Slate Chain Conveyors': 'U-Type, Heavy Duty', 'Roller Conveyors': 'Flexible, Heavy Duty' },
    faqs: [
      { q: 'Can they be customized?', a: 'Yes, they are customized to your specific weight and speed requirements.' }
    ],
    image: '/images/products/conveyor.jpg'
  }
];"""

new_company_info_code = """export const COMPANY_INFO = {
  name: 'Spectra Pack Machines',
  tagline: 'Leading Packaging Machine Manufacturers in India',
  phone: ['+91 93704 40729', '+91 8452965327'],
  email: ['info@spectrapackmachines.com', 'sales@spectrapackmachines.com'],
  whatsapp: '919370440729',
  headOffice: '505, Dattani Prism 1, Above Janseva Hospital, behind Dattani Mall, Vasai West – 401207',
  factory: 'Sr No 69/21 Devdal, Post-Kaman, Palghar 401208, Maharashtra, India',
  website: 'https://www.spectrapackmachines.com',
  yearsOfExperience: 25,
  foundedYear: 2001,
  socialLinks: {
    facebook: '#',
    instagram: '#',
    linkedin: '#',
    youtube: '#'
  }
};"""

with open('src/lib/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace PRODUCTS
content = re.sub(r'export const PRODUCTS: ProductData\[\] = \[.*?\];', new_products_code, content, flags=re.DOTALL)

# Replace COMPANY_INFO
content = re.sub(r'export const COMPANY_INFO = \{.*?\};', new_company_info_code, content, flags=re.DOTALL)

with open('src/lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)
