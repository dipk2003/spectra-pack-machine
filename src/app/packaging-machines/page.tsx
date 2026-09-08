import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Factory, Headphones, MapPin, PackageCheck, Settings } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { listProducts } from '@/lib/cms';
import {
  COMPANY_INFO,
  PRODUCTS,
  SEO_CITY_MARKETS,
  groupProductsByCategory,
  type ProductData,
} from '@/lib/data';
import styles from './locations.module.css';
import { INDIA_STATE_MARKETS } from '@/lib/india-markets';

export const metadata: Metadata = {
  title: 'Packaging Machines Across India | City-wise Machine Supply',
  description:
    'Explore Spectra Pack packaging machines across major Indian cities. Compare shrink wrapping, sealing, vacuum packing, conveyor and pallet wrapping solutions.',
  keywords: [
    'packaging machines in India',
    'packing machine manufacturer India',
    'Spectra Pack Machines India',
    'shrink wrapping machine supplier',
    'sealing machine supplier',
  ],
  alternates: { canonical: '/packaging-machines' },
};

async function getProducts(): Promise<ProductData[]> {
  try {
    const products = await listProducts({ publishedOnly: true });
    return products.length > 0 ? products : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export default async function PackagingMachinesIndiaPage() {
  const products = await getProducts();
  const categories = groupProductsByCategory(products);
  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Packaging Machines Across India',
    url: `${COMPANY_INFO.website}/packaging-machines`,
    description: 'City-wise packaging machine supply, application guidance, and support from Spectra Pack Machines.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: INDIA_STATE_MARKETS.map((state, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `Packaging Machines in ${state.name}`,
        url: `${COMPANY_INFO.website}/packaging-machines/india/${state.slug}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection className={styles.heroInner}>
            <div className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><span>Packaging Machines Across India</span></div>
            <span className={styles.eyebrow}><MapPin size={15} /> Pan-India Machine Supply</span>
            <h1>Packaging Machines for <span>Production Teams Across India</span></h1>
            <p className={styles.heroDescription}>
              Spectra Pack Machines manufactures shrink wrapping, sealing, vacuum packaging, conveyor,
              and pallet stretch wrapping systems in Maharashtra and supplies them to industrial markets nationwide.
            </p>
            <div className={styles.heroActions}>
              <Link href="/schedule-meeting" className="btn btn-accent btn-lg">Get Machine Recommendation <ArrowRight size={17} /></Link>
              <Link href="/packaging-machines/international" className="btn btn-white btn-lg">International Enquiries <ArrowRight size={17} /></Link>
              <a href={`tel:${primaryPhone}`} className="btn btn-white btn-lg">Call {COMPANY_INFO.phone[0]}</a>
            </div>
            <div className={styles.proofStrip}>
              <div><strong>Made in Maharashtra</strong><span>Factory-backed machine supply</span></div>
              <div><strong>{SEO_CITY_MARKETS.length}+ city markets</strong><span>Location-specific enquiry pages</span></div>
              <div><strong>{COMPANY_INFO.yearsOfExperience}+ years</strong><span>Packaging machinery experience</span></div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection className={styles.sectionHeader}>
            <span className="section-label">All-India Coverage Directory</span>
            <h2>Packaging Machine Supply by State & Union Territory</h2>
            <p>Choose a state or union territory for major industrial markets, application guidance and direct quotation options.</p>
          </AnimatedSection>
          <div className={styles.cityGrid}>
            {INDIA_STATE_MARKETS.map((state, index) => (
              <AnimatedSection key={state.slug} delay={index * 0.012}>
                <Link href={`/packaging-machines/india/${state.slug}`} className={styles.cityCard}>
                  <MapPin size={18} />
                  <span><strong>{state.name}</strong><small>{state.kind}</small></span>
                  <ArrowRight size={15} />
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <AnimatedSection className={styles.sectionHeader}>
            <span className="section-label">Major Industrial Markets</span>
            <h2>Packaging Machine Supply by City</h2>
            <p>These focused city pages connect machine specifications with delivery and support planning for major industrial markets.</p>
          </AnimatedSection>
          <div className={styles.cityGrid}>
            {SEO_CITY_MARKETS.map((city, index) => (
              <AnimatedSection key={city.slug} delay={index * 0.025}>
                <Link href={`/packaging-machines/${city.slug}`} className={styles.cityCard}>
                  <MapPin size={18} />
                  <span><strong>{city.name}</strong><small>{city.region}</small></span>
                  <ArrowRight size={15} />
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection className={styles.sectionHeader}>
            <span className="section-label">Machine Range</span>
            <h2>Solutions for Complete Packaging Lines</h2>
            <p>Explore core machine families, then share your product, pack size, and expected output for a suitable configuration.</p>
          </AnimatedSection>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <AnimatedSection key={category.slug} delay={index * 0.04}>
                <div className={styles.categoryCard}>
                  <h3>{category.category}</h3>
                  <p>{category.items.length} machine options available in this family.</p>
                  <div className={styles.machineLinks}>
                    {category.items.slice(0, 5).map((product) => (
                      <Link key={product.slug} href={`/products/${product.slug}`} className={styles.machineLink}>
                        <span>{product.title}</span><ArrowRight size={13} />
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.serviceBand}`}>
        <div className="container">
          <div className={styles.serviceGrid}>
            {[
              { icon: <Factory size={22} />, title: 'Factory-backed supply', text: 'Direct coordination from machine selection through testing and dispatch.' },
              { icon: <Settings size={22} />, title: 'Application matching', text: 'Recommendations based on product, pack format, output, and available space.' },
              { icon: <PackageCheck size={22} />, title: 'Pan-India dispatch', text: 'Dispatch planning for manufacturers and production teams across India.' },
              { icon: <Headphones size={22} />, title: 'After-sales support', text: 'Installation guidance, service coordination, and spare-part assistance.' },
            ].map((item) => (
              <div key={item.title} className={styles.serviceItem}>{item.icon}<strong>{item.title}</strong><p>{item.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <AnimatedSection className={styles.ctaInner}>
            <h2>Tell Us What You Need to Pack</h2>
            <p>Share your product, dimensions, output target, and city. Our team will help shortlist the right packing machine and configuration.</p>
            <div className={styles.ctaActions}>
              <Link href="/contact" className="btn btn-primary btn-lg">Request a Quotation</Link>
              <Link href="/schedule-meeting" className="btn btn-outline btn-lg">Schedule a Meeting</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
