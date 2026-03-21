import type { Metadata } from 'next';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Counter from '@/components/ui/Counter';
import { COMPANY_INFO, PRODUCTS, INDUSTRIES } from '@/lib/data';
import { Target, Eye, Heart, Globe, Leaf } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Spectra Pack Machines, its Maharashtra office and factory presence, and its packaging machine manufacturing focus since 2001.',
};

export default function AboutPage() {
  const timeline = [
    {
      year: '2001',
      event: 'Spectra Pack Machines began with a focus on practical packaging equipment for Indian manufacturers.',
    },
    {
      year: 'Growth',
      event: 'The product range expanded across shrink wrapping, sealing, vacuum packaging, conveyor, and dispatch-handling applications.',
    },
    {
      year: 'Today',
      event: 'The current catalog covers bottle bundles, boxes, pouches, vacuum packs, and pallet stabilization requirements.',
    },
    {
      year: 'Support',
      event: 'Office support in Vasai West and manufacturing presence in Palghar keep technical discussion and machine execution closely connected.',
    },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <span className="section-label" style={{ color: 'var(--accent)' }}>
              About Spectra Pack Machines
            </span>
            <h1 className={styles.heroTitle}>
              Packaging Machine Manufacturing
              <br />
              Since {COMPANY_INFO.foundedYear}
            </h1>
            <p className={styles.heroDesc}>
              Spectra Pack Machines builds packaging equipment for Indian production lines, backed by
              office support in Vasai West and manufacturing operations in Palghar, Maharashtra.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { num: COMPANY_INFO.yearsOfExperience, suffix: '+', label: 'Years Since Foundation' },
              { num: PRODUCTS.length, suffix: '+', label: 'Machine Solutions' },
              { num: 2, suffix: '', label: 'Office & Factory Locations' },
              { num: INDUSTRIES.length, suffix: '', label: 'Industry Applications' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className={styles.statCard}>
                  <Counter end={s.num} suffix={s.suffix} className={styles.statNum} />
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.storyGrid}>
            <AnimatedSection direction="left">
              <span className="section-label">Our Approach</span>
              <h2 className="section-title">
                Built Around Practical
                <br />
                Packaging Needs
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                Spectra Pack Machines focuses on machinery that solves actual packaging problems on the
                shop floor: bottle bundle wrapping, carton shrink wrapping, pouch sealing, vacuum
                packaging, conveyors, and pallet stabilization.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                Instead of pushing a one-size-fits-all setup, the business is organized around
                understanding product type, pack style, output requirement, and available layout before
                recommending a machine.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                The catalog and website reflect that same approach: clear machine families, direct
                contact details, and straightforward ways to discuss quotations, factory visits, and
                technical requirements.
              </p>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className={styles.valuesGrid}>
                {[
                  {
                    icon: <Target size={24} />,
                    title: 'Application Fit',
                    desc: 'Machine selection matched to actual product and pack format.',
                  },
                  {
                    icon: <Heart size={24} />,
                    title: 'Direct Support',
                    desc: 'Easy coordination by call, WhatsApp, enquiry form, or meeting.',
                  },
                  {
                    icon: <Leaf size={24} />,
                    title: 'Practical Build',
                    desc: 'Layouts planned around available floor space and workflow.',
                  },
                  {
                    icon: <Globe size={24} />,
                    title: 'Made in India',
                    desc: 'Machines built and supported from Maharashtra for Indian manufacturers.',
                  },
                ].map((v, i) => (
                  <div key={i} className={styles.valueCard}>
                    <div className={styles.valueIcon}>{v.icon}</div>
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="grid-2">
            <AnimatedSection delay={0.1}>
              <div className={styles.vmCard}>
                <div className={styles.vmIcon}>
                  <Eye size={28} />
                </div>
                <h3>Our Vision</h3>
                <p>
                  To be a trusted packaging machine partner for Indian manufacturers looking for
                  practical, application-ready equipment and responsive technical support.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className={styles.vmCard}>
                <div className={styles.vmIcon}>
                  <Target size={28} />
                </div>
                <h3>Our Mission</h3>
                <p>
                  To manufacture and support machine solutions that help businesses seal, wrap, move,
                  and dispatch products more reliably from the first enquiry onward.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">How We Have Evolved</span>
              <h2 className="section-title">Company Snapshot</h2>
            </div>
          </AnimatedSection>

          <div className={styles.timeline}>
            {timeline.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineYear}>{item.year}</div>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>{item.event}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
