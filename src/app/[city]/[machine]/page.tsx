import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, SEO_CITIES, COMPANY_INFO } from '@/lib/data';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { CheckCircle, ArrowRight, Phone } from 'lucide-react';
import styles from './page.module.css';

interface Props {
  params: { city: string; machine: string };
}

export function generateStaticParams() {
  const params: { city: string; machine: string }[] = [];
  for (const city of SEO_CITIES) {
    for (const product of PRODUCTS) {
      params.push({ city, machine: product.slug });
    }
  }
  return params;
}

function capitalize(s: string) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function generateMetadata({ params }: Props): Metadata {
  const city = capitalize(params.city);
  const product = PRODUCTS.find(p => p.slug === params.machine);
  if (!product) return {};
  return {
    title: `${product.title} in ${city} | Spectra Pack Machines`,
    description: `Looking for ${product.title} in ${city}? Spectra Pack Machines is a leading manufacturer & supplier of ${product.title} in ${city}, India. Get the best price, free installation & after-sales support.`,
    openGraph: {
      title: `${product.title} in ${city}`,
      description: `Best ${product.title} manufacturer in ${city}. Quality machines with after-sales support.`,
      images: [{ url: product.image, alt: product.title }],
    },
  };
}

export default function SEOLandingPage({ params }: Props) {
  const city = capitalize(params.city);
  const product = PRODUCTS.find(p => p.slug === params.machine);

  if (!product || !SEO_CITIES.includes(params.city)) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.title} in ${city}`,
    description: `Leading ${product.title} manufacturer & supplier in ${city}, India.`,
    manufacturer: { '@type': 'Organization', name: 'Spectra Pack Machines' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      areaServed: { '@type': 'City', name: city },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link> / <Link href={`/products/${product.slug}`}>{product.title}</Link> / <span>{city}</span>
            </div>
            <h1 className={styles.heroTitle}>
              Best <span className="text-gradient">{product.title}</span> in {city}
            </h1>
            <p className={styles.heroDesc}>
              Looking for a reliable {product.title} in {city}? Spectra Pack Machines is a leading manufacturer and supplier,
              delivering high-quality {product.category.toLowerCase()} with free installation and comprehensive after-sales support across {city} and surrounding areas.
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
                Spectra Pack Machines has been serving businesses in {city} for over 25 years. We are a trusted manufacturer
                of {product.title} with a proven track record of delivering reliable, high-performance packaging machines.
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
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    className={styles.cardThumb}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
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
              Get the Best {product.title} Price in {city}
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '550px', margin: '0 auto 2rem' }}>
              Contact us today for a free consultation and competitive quotation delivered within 24 hours.
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
