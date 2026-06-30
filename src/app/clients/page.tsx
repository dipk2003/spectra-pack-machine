import type { Metadata } from 'next';
import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { INDUSTRIES, PRODUCTS } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Industries We Serve',
  description:
    'Explore the industries and packaging applications supported by Spectra Pack Machines across shrink wrapping, sealing, conveyors, and vacuum packaging.',
  alternates: { canonical: '/clients' },
  openGraph: { title: 'Industries We Serve', url: '/clients' },
};

export default function ClientsPage() {
  const featuredSolutions = PRODUCTS.slice(0, 6);

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <span className="section-label" style={{ color: 'var(--accent)' }}>
              Industries We Serve
            </span>
            <h1 className={styles.heroTitle}>Packaging Applications We Work With</h1>
            <p className={styles.heroDesc}>
              Spectra Pack Machines supports manufacturers packaging bottles, cartons, pouches, tube
              products, vacuum packs, and dispatch-ready pallet loads.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">Application Coverage</span>
              <h2 className="section-title">Machine Families Matched to Product Flow</h2>
            </div>
          </AnimatedSection>

          <div className={styles.marqueeWrap}>
            <div className={styles.marquee}>
              {[...INDUSTRIES, ...INDUSTRIES].map((industry, i) => (
                <div key={`${industry.title}-${i}`} className={styles.clientLogo}>
                  <span>{industry.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.clientGrid}>
            {INDUSTRIES.map((industry, i) => (
              <AnimatedSection key={industry.title} delay={i * 0.04}>
                <div className={styles.clientCard}>
                  <div className={styles.clientInitial}>{industry.title[0]}</div>
                  <span className={styles.clientName}>{industry.title}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">Representative Solutions</span>
              <h2 className="section-title">Machines Commonly Chosen for These Applications</h2>
            </div>
          </AnimatedSection>

          <div className={styles.testimonialGrid}>
            {featuredSolutions.map((product, i) => (
              <AnimatedSection key={product.slug} delay={i * 0.08}>
                <Link href={`/products/${product.slug}`} className={styles.testimonialCard}>
                  <div className={styles.testimonialAuthor} style={{ marginBottom: '1rem' }}>
                    <div className={styles.avatar}>{product.title[0]}</div>
                    <div>
                      <strong>{product.title}</strong>
                      <span>{product.category}</span>
                    </div>
                  </div>
                  <p className={styles.testimonialText} style={{ marginBottom: '1rem', fontStyle: 'normal' }}>
                    {product.shortDesc}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 600 }}>
                    View Details <ArrowRight size={14} />
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
