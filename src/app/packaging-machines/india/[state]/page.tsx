import DistrictDirectory from '@/components/locations/DistrictDirectory';
import { findDistrictState, DISTRICT_DIRECTORY_DATE } from '@/lib/india-districts';
import { completePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Factory, Headphones, MapPin, PackageCheck, Phone, Settings } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { listProducts } from '@/lib/cms';
import { COMPANY_INFO, PRODUCTS, groupProductsByCategory, type ProductData } from '@/lib/data';
import { INDIA_STATE_MARKETS, findIndiaStateMarket } from '@/lib/india-markets';
import styles from '../../locations.module.css';

type Props = { params: { state: string } };

export function generateStaticParams() {
  return INDIA_STATE_MARKETS.map((market) => ({ state: market.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const market = findIndiaStateMarket(params.state);
  if (!market) return {};

  const canonical = `/packaging-machines/india/${market.slug}`;
  return completePageMetadata({
    title: `Packaging Machines & Services in ${market.name}`,
    description: `Compare shrink wrapping, sealing, vacuum packaging, conveyor and pallet wrapping machines for ${market.name}. Factory supply, quotation and pan-India support from Spectra Pack Machines.`,
    keywords: [
      `packaging machine manufacturer in ${market.name}`,
      `packing machine supplier in ${market.name}`,
      `shrink wrapping machine in ${market.name}`,
      `sealing machine in ${market.name}`,
    ],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `Packaging Machines in ${market.name} | Spectra Pack Machines`,
      description: `Application-based machine selection, dispatch planning and after-sales coordination for production teams across ${market.name}.`,
      url: canonical,
      type: 'website',
      locale: 'en_IN',
      siteName: COMPANY_INFO.name,
      images: [{ url: COMPANY_INFO.logoPath, width: 1632, height: 607, alt: COMPANY_INFO.name }],
    },
  });
}

async function getProducts(): Promise<ProductData[]> {
  try {
    const products = await listProducts({ publishedOnly: true });
    return products.length ? products : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export default async function StatePackagingMachinesPage({ params }: Props) {
  const market = findIndiaStateMarket(params.state);
  if (!market) notFound();

  const districts = findDistrictState(market.slug);
  const products = await getProducts();
  const categories = groupProductsByCategory(products);
  const canonicalUrl = `${COMPANY_INFO.website}/packaging-machines/india/${market.slug}`;
  const quoteHref = `/contact?${new URLSearchParams({
    location: market.name,
    source: 'seo-state-hub',
  }).toString()}`;
  const phone = COMPANY_INFO.phone[0].replace(/\s+/g, '');

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#webpage`,
      name: `Packaging Machines in ${market.name}`,
      url: canonicalUrl,
      description: `Packaging machine selection, supply and support for businesses across ${market.name}.`,
      areaServed: {
        '@type': market.kind === 'State' ? 'State' : 'AdministrativeArea',
        name: market.name,
      },
      provider: { '@type': 'Organization', name: COMPANY_INFO.name, url: COMPANY_INFO.website },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: categories.map((category, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: category.category,
          url: `${COMPANY_INFO.website}/products/category/${category.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        { '@type': 'ListItem', position: 2, name: 'Packaging Machines Across India', item: `${COMPANY_INFO.website}/packaging-machines` },
        { '@type': 'ListItem', position: 3, name: market.name, item: canonicalUrl },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection className={styles.heroInner}>
            <div className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><Link href="/packaging-machines">India Reach</Link><span>/</span><span>{market.name}</span></div>
            <span className={styles.eyebrow}><MapPin size={15} /> {market.kind}: {market.name}</span>
            <h1>Packaging Machine <span>Manufacturer & Supplier in {market.name}</span></h1>
            <p className={styles.heroDescription}>
              Compare shrink wrapping, sealing, vacuum packaging, conveyor and pallet wrapping solutions for
              production requirements across {market.name}. Spectra Pack manufactures in Vasai, Maharashtra,
              and coordinates machine selection, testing, dispatch and support nationwide.
            </p>
            <div className={styles.heroActions}>
              <Link href={quoteHref} className="btn btn-accent btn-lg">Get Price & Recommendation <ArrowRight size={17} /></Link>
              <a href={`tel:${phone}`} className="btn btn-white btn-lg"><Phone size={17} /> {COMPANY_INFO.phone[0]}</a>
            </div>
            <div className={styles.proofStrip}>
              <div><strong>Direct manufacturer</strong><span>Factory in Vasai, Maharashtra</span></div>
              <div><strong>{market.majorMarkets.length} key markets</strong><span>State-wide delivery planning</span></div>
              <div><strong>{COMPANY_INFO.yearsOfExperience}+ years</strong><span>Packaging machine experience</span></div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.introGrid}>
            <AnimatedSection direction="left" className={styles.copy}>
              <span className="section-label">Coverage Across {market.name}</span>
              <h2>Machine Selection for Real Production Requirements</h2>
              <p>
                Enquiries can include {market.majorMarkets.join(', ')} and surrounding districts.
                We use the exact delivery postal code, product format, pack dimensions and target output to
                recommend a configuration and plan freight.
              </p>
              <p>
                Common applications in the state include {market.focusIndustries.join(', ')}. The right machine
                still depends on your actual product and line layout, so our quotation process starts with samples,
                photographs or a short application video.
              </p>
              <p>
                Spectra Pack does not claim a branch in every listed city or district. Manufacturing, trials and
                dispatch are coordinated from our Vasai facility, with support planned for the customer location.
              </p>
            </AnimatedSection>
            <AnimatedSection direction="right">
              <aside className={styles.contactCard}>
                <h3>Prepare a Faster Quotation</h3>
                <div className={styles.contactLine}><PackageCheck size={17} /><span>Product photo, size and pack pattern</span></div>
                <div className={styles.contactLine}><Settings size={17} /><span>Required output and automation preference</span></div>
                <div className={styles.contactLine}><MapPin size={17} /><span>Delivery city, district and postal code in {market.name}</span></div>
                <Link href={quoteHref} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Share Your Requirement</Link>
              </aside>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <AnimatedSection className={styles.sectionHeader}>
            <span className="section-label">Machine Range for {market.name}</span>
            <h2>Explore Packaging Machine Categories</h2>
            <p>Review specifications and shortlist a machine family before requesting an application-based quotation.</p>
          </AnimatedSection>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <AnimatedSection key={category.slug} delay={index * 0.04}>
                <article className={styles.categoryCard}>
                  <h3>{category.category}</h3>
                  <p>{category.items.length} catalog machine options for different product and output requirements.</p>
                  <div className={styles.machineLinks}>
                    {category.items.slice(0, 6).map((product) => (
                      <Link key={product.slug} href={`/products/${product.slug}`} className={styles.machineLink}>
                        <span>{product.title}</span><ArrowRight size={13} />
                      </Link>
                    ))}
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section"><div className="container">
        <h2>District, city and town enquiries in {market.name}</h2>
        <p>Choose your district, compare equipment and add your town or village and delivery PIN code. Installation, travel and service arrangements are confirmed for each enquiry.</p>
        {districts && <DistrictDirectory stateSlug={market.slug} stateName={market.name} districts={districts.districts} />}
        <p className="location-note">District names: <a href={districts?.source || 'https://igod.gov.in/index.php/sg/district/states'} target="_blank" rel="noopener noreferrer">Government of India directory</a>, checked {DISTRICT_DIRECTORY_DATE}.</p>
        <h3>Services for your machine</h3>
        <p><Link href="/services/manufacturing">Manufacturing</Link> · <Link href="/services/consultation">Selection consultation</Link> · <Link href="/services/custom-design">Custom design</Link> · <Link href="/services/installation">Installation</Link> · <Link href="/services/after-sales">After-sales and spares</Link></p>
      </div></section>
      <section className={`section ${styles.serviceBand}`}>
        <div className="container">
          <div className={styles.serviceGrid}>
            {[
              { icon: <Factory size={22} />, title: 'Factory-backed build', text: 'Machine fabrication, assembly and trial coordination from Vasai.' },
              { icon: <Settings size={22} />, title: 'Application matching', text: 'Configuration based on product, pack format, output and line space.' },
              { icon: <PackageCheck size={22} />, title: `Dispatch to ${market.name}`, text: 'Freight planning using the exact city, district and postal code.' },
              { icon: <Headphones size={22} />, title: 'After-sales coordination', text: 'Installation guidance, troubleshooting, service and spare assistance.' },
            ].map((item) => <div key={item.title} className={styles.serviceItem}>{item.icon}<strong>{item.title}</strong><p>{item.text}</p></div>)}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <AnimatedSection className={styles.ctaInner}>
            <h2>Request a Packaging Machine Quote for {market.name}</h2>
            <p>Tell us what you pack, the target output and exact delivery district. We will help shortlist the right machine.</p>
            <div className={styles.ctaActions}>
              <Link href={quoteHref} className="btn btn-primary btn-lg">Request Quotation</Link>
              <Link href="/schedule-meeting" className="btn btn-outline btn-lg">Schedule a Technical Call</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
