import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Factory, Headphones, MapPin, PackageCheck, Phone, Settings } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { listProducts } from '@/lib/cms';
import {
  COMPANY_INFO,
  PRODUCTS,
  SEO_CITY_MARKETS,
  groupProductsByCategory,
  type ProductData,
} from '@/lib/data';
import styles from '../locations.module.css';

type Props = { params: { city: string } };

export function generateStaticParams() {
  return SEO_CITY_MARKETS.map((city) => ({ city: city.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const city = SEO_CITY_MARKETS.find((market) => market.slug === params.city);
  if (!city) return {};

  return {
    title: `Packaging Machine Manufacturer & Supplier in ${city.name}`,
    description: `Looking for packing machines in ${city.name}? Explore Spectra Pack shrink wrapping, sealing, vacuum packaging, conveyor and pallet wrapping machines with pan-India support.`,
    keywords: [
      `packaging machine manufacturer in ${city.name}`,
      `packing machine supplier in ${city.name}`,
      `shrink wrapping machine in ${city.name}`,
      `sealing machine in ${city.name}`,
      `Spectra Pack Machines ${city.name}`,
    ],
    alternates: { canonical: `/packaging-machines/${city.slug}` },
    openGraph: {
      title: `Packaging Machines in ${city.name} | Spectra Pack Machines`,
      description: `Factory-backed packaging machine supply and support for businesses in ${city.name}, ${city.region}.`,
      url: `/packaging-machines/${city.slug}`,
    },
  };
}

async function getProducts(): Promise<ProductData[]> {
  try {
    const products = await listProducts({ publishedOnly: true });
    return products.length > 0 ? products : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export default async function CityPackagingMachinesPage({ params }: Props) {
  const city = SEO_CITY_MARKETS.find((market) => market.slug === params.city);
  if (!city) notFound();

  const products = await getProducts();
  const categories = groupProductsByCategory(products);
  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Packaging Machines in ${city.name}`,
      url: `${COMPANY_INFO.website}/packaging-machines/${city.slug}`,
      description: `Packaging machine supply and technical support for production teams in ${city.name}, ${city.region}.`,
      provider: { '@type': 'Organization', name: COMPANY_INFO.name, url: COMPANY_INFO.website },
      areaServed: { '@type': 'City', name: city.name, containedInPlace: city.region },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${product.title} in ${city.name}`,
          url: `${COMPANY_INFO.website}/${city.slug}/${product.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        { '@type': 'ListItem', position: 2, name: 'Packaging Machines Across India', item: `${COMPANY_INFO.website}/packaging-machines` },
        { '@type': 'ListItem', position: 3, name: city.name, item: `${COMPANY_INFO.website}/packaging-machines/${city.slug}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection className={styles.heroInner}>
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link><span>/</span><Link href="/packaging-machines">India Reach</Link><span>/</span><span>{city.name}</span>
            </div>
            <span className={styles.eyebrow}><MapPin size={15} /> {city.name}, {city.region}</span>
            <h1>Packaging Machine <span>Manufacturer & Supplier in {city.name}</span></h1>
            <p className={styles.heroDescription}>
              Explore Spectra Pack shrink wrapping, sealing, vacuum packaging, conveyor, and pallet stretch
              wrapping machines for production teams in {city.name}. Machines are manufactured at our Vasai facility
              and supplied with application guidance and support across India.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact" className="btn btn-accent btn-lg">Get Price & Recommendation <ArrowRight size={17} /></Link>
              <a href={`tel:${primaryPhone}`} className="btn btn-white btn-lg"><Phone size={17} /> {COMPANY_INFO.phone[0]}</a>
            </div>
            <div className={styles.proofStrip}>
              <div><strong>Direct manufacturer</strong><span>Vasai, Maharashtra</span></div>
              <div><strong>Pan-India dispatch</strong><span>Serving {city.name} enquiries</span></div>
              <div><strong>Technical support</strong><span>Selection to after-sales</span></div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.introGrid}>
            <AnimatedSection direction="left" className={styles.copy}>
              <span className="section-label">Packaging Solutions in {city.name}</span>
              <h2>Choose the Right Packing Machine for Your Product</h2>
              <p>
                Buyers in {city.name} can compare machines by pack format, product dimensions, expected output,
                operator involvement, and available line space. Our team helps translate those details into a practical configuration.
              </p>
              <p>
                We support applications across food, beverage, FMCG, pharmaceutical, warehouse, logistics, and general
                manufacturing operations. For accurate pricing, share your product photos, pack size, production target, and delivery location.
              </p>
            </AnimatedSection>
            <AnimatedSection direction="right">
              <aside className={styles.contactCard}>
                <h3>Talk to Spectra Pack Machines</h3>
                <div className={styles.contactLine}><MapPin size={17} /><span><strong>Head Office</strong><br />{COMPANY_INFO.headOffice}</span></div>
                <div className={styles.contactLine}><Phone size={17} /><span>{COMPANY_INFO.phone.join(' · ')}</span></div>
                <div className={styles.contactLine}><Headphones size={17} /><span>Machine selection, quotation, installation guidance, and after-sales coordination.</span></div>
                <Link href="/schedule-meeting" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Schedule a Technical Call</Link>
              </aside>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <AnimatedSection className={styles.sectionHeader}>
            <span className="section-label">Machines Available for {city.name}</span>
            <h2>Explore Packaging Machine Categories</h2>
            <p>Each link opens a focused {city.name} machine page with model information, features, and quotation actions.</p>
          </AnimatedSection>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <AnimatedSection key={category.slug} delay={index * 0.04}>
                <article className={styles.categoryCard}>
                  <h3>{category.category}</h3>
                  <p>{category.items.length} machine options for {city.name} production requirements.</p>
                  <div className={styles.machineLinks}>
                    {category.items.map((product) => (
                      <Link key={product.slug} href={`/${city.slug}/${product.slug}`} className={styles.machineLink}>
                        <span>{product.title} in {city.name}</span><ArrowRight size={13} />
                      </Link>
                    ))}
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.serviceBand}`}>
        <div className="container">
          <div className={styles.serviceGrid}>
            {[
              { icon: <Factory size={22} />, title: 'Indian manufacturing', text: 'Factory-backed design, fabrication, testing, and dispatch coordination.' },
              { icon: <Settings size={22} />, title: 'Machine configuration', text: 'Guidance based on product, speed, dimensions, and packaging format.' },
              { icon: <PackageCheck size={22} />, title: `Supply to ${city.name}`, text: `Dispatch planning for customer locations in ${city.name} and nearby industrial areas.` },
              { icon: <Headphones size={22} />, title: 'Support after dispatch', text: 'Installation guidance, troubleshooting, service, and spare assistance.' },
            ].map((item) => (
              <div key={item.title} className={styles.serviceItem}>{item.icon}<strong>{item.title}</strong><p>{item.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <AnimatedSection className={styles.ctaInner}>
            <h2>Get a Packaging Machine Quote for {city.name}</h2>
            <p>Tell us what you pack and the output you need. We will help shortlist the right machine before preparing your quotation.</p>
            <div className={styles.ctaActions}>
              <Link href="/contact" className="btn btn-primary btn-lg">Request Quotation</Link>
              <a href={`https://wa.me/${COMPANY_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">WhatsApp Our Team</a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
