import type { Metadata } from 'next';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Counter from '@/components/ui/Counter';
import { COMPANY_INFO } from '@/lib/data';
import { Building2, Eye, Factory, Globe, Leaf, Target, Users } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Spectra Pack Machines, its Mumbai-region office and factory infrastructure, leadership, and packaging machine manufacturing journey.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About Spectra Pack Machines', url: '/about' },
};

export default function AboutPage() {
  const timeline = [
    {
      year: 'Origins',
      event: 'Spectra Pack Machines began with a focus on dependable packaging equipment built around real manufacturing needs.',
    },
    {
      year: 'Expansion',
      event: 'The company expanded across shrink wrapping, sealing, vacuum packaging, conveyors, and end-of-line packaging applications.',
    },
    {
      year: 'Leadership',
      event: 'Under the guidance of Mr. Mata Prasad Pandey and Mr. Shubham J. Mishra, the business continued scaling its capabilities and market reach.',
    },
    {
      year: 'Today',
      event: 'Our Vasai West head office and Chinchoti manufacturing facility support domestic and international customers with reliable machine execution.',
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
            </h1>
            <p className={styles.heroDesc}>
              {COMPANY_INFO.companyDescription[0]}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              {
                num: COMPANY_INFO.yearsOfExperience,
                suffix: '+',
                label: 'Years in Industry',
              },
              {
                num: COMPANY_INFO.machineSolutions,
                suffix: '+',
                label: 'Machine Solutions',
              },
              {
                num: COMPANY_INFO.industryApplications,
                suffix: '+',
                label: 'Industry Applications',
              },
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
              <span className="section-label">Company Description</span>
              <h2 className="section-title">
                Built Around Reliable
                <br />
                Packaging Solutions
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                {COMPANY_INFO.companyDescription[1]}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                {COMPANY_INFO.companyDescription[2]}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {COMPANY_INFO.companyDescription[4]}
              </p>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className={styles.valuesGrid}>
                {[
                  {
                    icon: <Target size={24} />,
                    title: 'Quality Focus',
                    desc: 'Every machine build is shaped around precision, durability, and dependable long-term use.',
                  },
                  {
                    icon: <Leaf size={24} />,
                    title: 'Practical Engineering',
                    desc: 'Solutions are planned around actual production flow, efficiency, and usable layouts.',
                  },
                  {
                    icon: <Globe size={24} />,
                    title: 'Industry Coverage',
                    desc: 'The machine range supports FMCG, pharma, food, logistics, retail, and manufacturing lines.',
                  },
                  {
                    icon: <Users size={24} />,
                    title: 'Leadership & Support',
                    desc: 'Technical execution stays close to customer needs through responsive guidance and service.',
                  },
                ].map((v, i) => (
                  <div key={i} className={styles.valueCard}>
                    <div className={styles.valueIcon}>{v.icon}</div>
                    <h3>{v.title}</h3>
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
                  To remain one of India&apos;s trusted packaging machine partners by combining quality,
                  innovation, and practical engineering in every solution we deliver.
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
                  To help businesses improve packaging performance through reliable machines, custom-fit
                  solutions, sustainable thinking, and strong after-sales support.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div className={styles.infrastructureIntro}>
              <span className="section-label">Infrastructure</span>
              <h2 className="section-title">Office and Manufacturing Backbone</h2>
              <p className="section-subtitle" style={{ margin: '0 auto' }}>
                {COMPANY_INFO.infrastructure.summary}
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.infrastructureGrid}>
            <AnimatedSection delay={0.05}>
              <div className={styles.infrastructureCard}>
                <div className={styles.infrastructureIcon}>
                  <Building2 size={24} />
                </div>
                <h3>{COMPANY_INFO.infrastructure.officeTitle}</h3>
                {COMPANY_INFO.infrastructure.officeDescription.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className={styles.infrastructureCard}>
                <div className={styles.infrastructureIcon}>
                  <Factory size={24} />
                </div>
                <h3>{COMPANY_INFO.infrastructure.factoryTitle}</h3>
                {COMPANY_INFO.infrastructure.factoryDescription.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className={`${styles.infrastructureCard} ${styles.leadershipCard}`}>
                <div className={styles.infrastructureIcon}>
                  <Users size={24} />
                </div>
                <h3>Leadership</h3>
                <p>{COMPANY_INFO.companyDescription[3]}</p>
                <div className={styles.leadershipList}>
                  {COMPANY_INFO.leadership.map((leader) => (
                    <div key={leader.name} className={styles.leadershipItem}>
                      <strong>{leader.name}</strong>
                      <span>{leader.role}</span>
                    </div>
                  ))}
                </div>
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
