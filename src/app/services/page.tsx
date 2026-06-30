import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalogPath, listServices } from '@/lib/cms';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Factory, PencilRuler, Wrench, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore Spectra Pack Machines services including machine manufacturing, consultation, custom design, installation, and after-sales support.',
  alternates: { canonical: '/services' },
  openGraph: { title: 'Packaging Machine Services', url: '/services' },
};

const iconMap: Record<string, React.ReactNode> = {
  factory: <Factory size={28} />,
  'pencil-ruler': <PencilRuler size={28} />,
  wrench: <Wrench size={28} />,
  'shield-check': <ShieldCheck size={28} />,
  headphones: <Headphones size={28} />,
};

export default async function ServicesPage() {
  const [catalogPath, services] = await Promise.all([
    getCatalogPath(),
    listServices({ publishedOnly: true }),
  ]);

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <span className="section-label" style={{ color: 'var(--accent)' }}>Our Services</span>
            <h1 className={styles.heroTitle}>Packaging Support Beyond Machine Supply</h1>
            <p className={styles.heroDesc}>
              From machine selection and customization to commissioning and spares support, Spectra Pack
              Machines helps you move from enquiry to production with fewer gaps.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.serviceGrid}>
            {services.map((service, i) => (
              <AnimatedSection key={service.slug} delay={i * 0.1}>
                <div className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>
                    {iconMap[service.icon] || <Factory size={28} />}
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDesc}>{service.description}</p>
                  <p className={styles.serviceContent}>{service.content}</p>
                  <Link href="/contact" className={styles.serviceLink}>
                    Enquire Now <ArrowRight size={14} />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container" style={{ textAlign: 'center' }}>
          <AnimatedSection>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
              Need Help Reviewing the Catalog?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', width: 'min(100%, calc(20rem + 12.5vw))', margin: '0 auto 2rem' }}>
              Share your product details with the team and we can help shortlist the right web sealer,
              shrink tunnel, vacuum machine, conveyor, or sealing setup.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/schedule-meeting" className="btn btn-accent btn-lg">
                Schedule a Meeting <ArrowRight size={18} />
              </Link>
              <a href={catalogPath} target="_blank" rel="noopener noreferrer" className="btn btn-white btn-lg">
                Download Catalog
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
