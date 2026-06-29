import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, listProducts } from '@/lib/cms';
import { SEO_CITIES, SEO_CITY_MARKETS, COMPANY_INFO } from '@/lib/data';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { CheckCircle, ArrowRight, Phone } from 'lucide-react';
import styles from './page.module.css';

interface Props {
  params: { city: string; machine: string };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await listProducts({ publishedOnly: true });
  const params: { city: string; machine: string }[] = [];

  for (const city of SEO_CITIES) {
    for (const product of products) {
      params.push({ city, machine: product.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cityMarket = SEO_CITY_MARKETS.find((market) => market.slug === params.city);
  const product = await getProductBySlug(params.machine, { publishedOnly: true });
  if (!product || !cityMarket) return {};

  const city = cityMarket.name;
  return {
    title: `${product.title} Manufacturer & Supplier in ${city}`,
    description: `Explore ${product.title} for businesses in ${city}. Get model details, application guidance, quotation support, pan-India dispatch and after-sales coordination from Spectra Pack Machines.`,
    keywords: [
      `${product.title} in ${city}`,
      `${product.title} manufacturer in ${city}`,
      `packing machine supplier in ${city}`,
      `Spectra Pack Machines ${city}`,
    ],
    alternates: { canonical: `/${params.city}/${product.slug}` },
    openGraph: {
      title: `${product.title} for Businesses in ${city}`,
      description: `Factory-backed ${product.title} supply, quotation guidance, and support for ${city}.`,
      url: `/${params.city}/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.title }] : [],
    },
  };
}

export default async function SEOLandingPage({ params }: Props) {
  const cityMarket = SEO_CITY_MARKETS.find((market) => market.slug === params.city);
  const product = await getProductBySlug(params.machine, { publishedOnly: true });

  if (!product || !cityMarket || !SEO_CITIES.includes(params.city)) notFound();

  const city = cityMarket.name;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.title} in ${city}`,
    description: `${product.title} manufactured by Spectra Pack Machines and supplied for packaging applications in ${city}, India.`,
    url: `${COMPANY_INFO.website}/${params.city}/${product.slug}`,
    category: product.category,
    brand: { '@type': 'Brand', name: COMPANY_INFO.name },
    manufacturer: { '@type': 'Organization', name: COMPANY_INFO.name, url: COMPANY_INFO.website },
    image: product.image || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link> / <Link href={`/packaging-machines/${params.city}`}>{city}</Link> / <span>{product.title}</span>
            </div>
            <h1 className={styles.heroTitle}>
              <span className="text-gradient">{product.title}</span> for Businesses in {city}
            </h1>
            <p className={styles.heroDesc}>
              Looking for a reliable {product.title} in {city}? Spectra Pack Machines manufactures
              {` ${product.category.toLowerCase()}`} at its Vasai facility and supports customers with machine selection,
              pan-India dispatch coordination, installation guidance, and after-sales assistance.
            </p>
            <div className={styles.heroActions}>
              <Link href="/schedule-meeting" className="btn btn-accent btn-lg">
                Get Free Quote <ArrowRight size={18} />
              </Link>
              <a href={`tel:${COMPANY_INFO.phone[0]}`} className="btn btn-white btn-lg">
                <Phone size={18} /> Call Us Now
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.contentGrid}>
            <AnimatedSection direction="left">
              <h2>Why Choose Our {product.title} in {city}?</h2>
              <p className={styles.para}>
                With {COMPANY_INFO.yearsOfExperience}+ years of packaging machinery experience, Spectra Pack Machines helps businesses in {city}
                compare the right {product.title} configuration for their product, pack size, output, and production layout.
              </p>
              <p className={styles.para}>
                Our {product.title} is designed for {product.category.toLowerCase()} applications and comes with features like:
              </p>
              <ul className={styles.featureList}>
                {product.features.map((f, i) => (
                  <li key={i}><CheckCircle size={18} /> {f}</li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className={styles.infoCard}>
                <div className={styles.cardImage}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      className={styles.cardThumb}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>Image managed from admin</div>
                  )}
                </div>
                <span className={styles.modelTag}>{product.modelNo}</span>
                <h3>{product.title}</h3>
                <p>{product.shortDesc}</p>
                <div className={styles.specsList}>
                  {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                    <div key={k} className={styles.specItem}>
                      <span className={styles.specKey}>{k}</span>
                      <span className={styles.specVal}>{v}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/products/${product.slug}`} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  View Full Details <ArrowRight size={16} />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <AnimatedSection>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
              Request a {product.title} Quote for {city}
            </h2>
            <p style={{ color: '#94a3b8', width: 'min(100%, calc(20rem + 15.972vw))', margin: '0 auto 2rem' }}>
              Share your product details, pack size, expected output, and delivery location for a practical recommendation and current quotation.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-accent btn-lg">Request Quotation</Link>
              <Link href="/schedule-meeting" className="btn btn-white btn-lg">Schedule Meeting</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
