'use client';

import MachineBuildVisual from '@/components/home/MachineBuildVisual';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Counter from '@/components/ui/Counter';
import { COMPANY_INFO, FAQS, INDUSTRIES, PRODUCTS, SERVICES } from '@/lib/data';
import {
  ArrowRight,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Factory,
  Package,
  Phone,
  Settings,
  Shield,
  Wrench,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import styles from './page.module.css';

const BUILD_STAGES = [
  {
    title: 'Frame & Base Alignment',
    description:
      'The welded frame, feet, and support members land first so the machine has a stable industrial base before the working modules are mounted.',
  },
  {
    title: 'Shrink Tunnel Placement',
    description:
      'The tunnel housing drops into position next, locking in the heat zone and giving the machine its core shrink-wrapping structure.',
  },
  {
    title: 'Sealing Bridge & Conveyor',
    description:
      'The sealing arm, loading table, and conveyor geometry slide into place to create the full product path from sealing to shrink finish.',
  },
  {
    title: 'Controls & Film Handling',
    description:
      'The control stack and film-handling section complete the build, finishing the machine with operating controls and wrapping readiness.',
  },
] as const;

const HERO_SPOTLIGHTS = [
  {
    title: 'L-Sealer with Tunnel',
    description: 'Neat shrink wrapping for cartons, boxes, and retail-ready packs.',
    label: 'Shrink Wrapping',
    image: '/images/products/l-sealer-with-shrink-tunnel-machine-indian.png',
    imageAlt: 'L-sealer with shrink tunnel machine',
    href: '/products/l-sealer-with-shrink-tunnel-machine-indian',
  },
  {
    title: 'Band Sealer Range',
    description: 'Continuous pouch sealing for food, pharma, and general packaging lines.',
    label: 'Sealing Machines',
    image: '/images/products/band-sealer-machine.jpg',
    imageAlt: 'Band sealer machine',
    href: '/products/band-sealer-machine',
  },
  {
    title: 'Pallet Wrapper',
    description: 'Load stabilization for dispatch, warehousing, and end-of-line handling.',
    label: 'End-of-Line',
    image: '/images/products/pallet-stretch-wrapping-machine.jpg',
    imageAlt: 'Pallet stretch wrapping machine',
    href: '/products/pallet-stretch-wrapping-machine',
  },
] as const;

const CLIENT_LOGOS = [
  { src: '/images/clients/2016-02-12-20-28-itclogo-cropped-80.png', alt: 'ITC logo' },
  { src: '/images/clients/alexion-pharmaceuticals-logo-png-seeklogo-314011.png', alt: 'Alexion Pharmaceuticals logo' },
  { src: '/images/clients/alkem-laboratories-logo-png-seeklogo-386943-removebg-preview.png', alt: 'Alkem Laboratories logo' },
  { src: '/images/clients/amul-logo-png-seeklogo-304699.png', alt: 'Amul logo' },
  { src: '/images/clients/britannia-industries6604.jpg', alt: 'Britannia logo' },
  { src: '/images/clients/cadbury.png', alt: 'Cadbury logo' },
  { src: '/images/clients/cipla-logo-png-seeklogo-305328-removebg-preview.png', alt: 'Cipla logo' },
  { src: '/images/clients/coca-cola-logo-png-seeklogo-32896.png', alt: 'Coca-Cola logo' },
  { src: '/images/clients/ferring-pharmaceuticals-logo-png-seeklogo-261240.png', alt: 'Ferring Pharmaceuticals logo' },
  { src: '/images/clients/glenmark-pharmaceuticals-logo-png-seeklogo-449848-removebg-preview-1.png', alt: 'Glenmark logo' },
  { src: '/images/clients/godrej-logo-png-seeklogo-61760.png', alt: 'Godrej logo' },
  { src: '/images/clients/haldiram-nagpur-logo-png-seeklogo-425265.png', alt: 'Haldirams logo' },
  { src: '/images/clients/hindustan-uniliver-limited-logo-png-seeklogo-304694.png', alt: 'Hindustan Unilever logo' },
  { src: '/images/clients/intas.png', alt: 'Intas logo' },
  { src: '/images/clients/johnson-johnson-merck-consumer-pharmaceuticals-logo-png-seeklogo-75898.png', alt: 'Johnson & Johnson logo' },
  { src: '/images/clients/lupin-logo-png-seeklogo-386957-removebg-preview.png', alt: 'Lupin logo' },
  { src: '/images/clients/marico.png', alt: 'Marico logo' },
  { src: '/images/clients/mother-dairy-logo-vector.png', alt: 'Mother Dairy logo' },
  { src: '/images/clients/parle-products-logo-wine.png', alt: 'Parle Products logo' },
  { src: '/images/clients/sun-pharma-logo-png-seeklogo-314019-removebg-preview.png', alt: 'Sun Pharma logo' },
  { src: '/images/clients/torrent-pharmaceuticals-logo-png-seeklogo-386954-removebg-preview.png', alt: 'Torrent Pharmaceuticals logo' },
] as const;

const LEAD_MAGNET_POINTS = [
  'Indicative machine pricing and configuration guidance.',
  'Recommended machine shortlist based on your pack style.',
  'Callback from the Spectra Pack team during business hours.',
] as const;

const MACHINE_INTEREST_OPTIONS = [
  'L-Sealer with Shrink Tunnel',
  'Band Sealer Machine',
  'Pallet Stretch Wrapping Machine',
  'Shrink Wrapping Machine',
  'Vacuum Packaging Machine',
  'Conveyor System',
  'Other Packaging Machine',
] as const;

const LEAD_POPUP_STORAGE_KEY = 'spectra-homepage-lead-popup';

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [products, setProducts] = useState(PRODUCTS);
  const [assemblyStep, setAssemblyStep] = useState(0);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const activeBuildStage = BUILD_STAGES[assemblyStep];
  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch {
        // Keep static products as fallback until Supabase is connected.
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    const rotate = setInterval(() => {
      setAssemblyStep((prev) => (prev + 1) % BUILD_STAGES.length);
    }, 3800);
    return () => clearInterval(rotate);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const popupState = window.localStorage.getItem(LEAD_POPUP_STORAGE_KEY);
    if (popupState === 'dismissed' || popupState === 'submitted') {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowLeadPopup(true);
    }, 6500);

    return () => window.clearTimeout(timer);
  }, []);

  const closeLeadPopup = (reason: 'dismissed' | 'submitted' = 'dismissed') => {
    setShowLeadPopup(false);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LEAD_POPUP_STORAGE_KEY, reason);
    }
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const machineInterest = String(formData.get('machineInterest') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const leadData = {
      name: String(formData.get('name') ?? '').trim(),
      company: String(formData.get('company') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      message:
        message ||
        `Need quotation and machine recommendation for ${machineInterest || 'a packaging machine'}.`,
      source: 'homepage-lead-magnet',
    };

    if (!leadData.name || !leadData.email || !leadData.phone) {
      setLeadStatus('error');
      return;
    }

    setLeadStatus('saving');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (res.ok) {
        setLeadStatus('success');
        form.reset();

        window.setTimeout(() => {
          closeLeadPopup('submitted');
        }, 1800);
      } else {
        setLeadStatus('error');
      }
    } catch {
      setLeadStatus('error');
    }
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div className={styles.heroOrb3} />
        <div className={styles.heroGrid} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <AnimatedSection direction="up" delay={0.1}>
                <div className={styles.heroBadge}>
                  <span className={styles.heroBadgeDot} />
                  Vasai, Maharashtra | Since {COMPANY_INFO.foundedYear}
                </div>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.2}>
                <h1 className={styles.heroTitle}>
                  <span className={styles.heroHighlight}>Shrink Wrapping, Sealing</span>
                  <br />
                  &amp; Packaging Machines for Indian Manufacturers
                </h1>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.3}>
                <p className={styles.heroDesc}>
                  From bottle bundle wrapping and pouch sealing to conveyors, vacuum systems, and pallet
                  wrapping, Spectra Pack Machines builds application-focused equipment for production lines
                  across India.
                </p>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.4}>
                <div className={styles.heroActions}>
                  <Link href="/schedule-meeting" className="btn btn-accent btn-lg">
                    Enquire with Our Team <ArrowRight size={18} />
                  </Link>
                  <a href={COMPANY_INFO.catalogPath} target="_blank" rel="noopener noreferrer" className="btn btn-white btn-lg">
                    Download Catalog
                  </a>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.5}>
                <div className={styles.heroStats}>
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatNum}>
                      <Counter end={COMPANY_INFO.yearsOfExperience} suffix="+" />
                    </span>
                    <span className={styles.heroStatLabel}>Years Experience</span>
                  </div>
                  <div className={styles.heroStatDivider} />
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatNum}>
                      <Counter end={products.length} suffix="+" />
                    </span>
                    <span className={styles.heroStatLabel}>Machine Solutions</span>
                  </div>
                  <div className={styles.heroStatDivider} />
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatNum}>
                      <Counter end={SERVICES.length} />
                    </span>
                    <span className={styles.heroStatLabel}>Core Services</span>
                  </div>
                  <div className={styles.heroStatDivider} />
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatNum}>
                      <Counter end={2} />
                    </span>
                    <span className={styles.heroStatLabel}>Office & Factory</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection direction="left" delay={0.25} className={styles.heroVisualColumn}>
              <div className={styles.heroBuildCard}>
                <div className={styles.heroBuildHeader}>
                  <span>Machine Build Preview</span>
                  <strong>
                    Stage {assemblyStep + 1} / {BUILD_STAGES.length}
                  </strong>
                </div>
                <MachineBuildVisual activeStage={assemblyStep} variant="hero" />
                <div className={styles.heroBuildCaption}>
                  <span className={styles.heroBuildEyebrow}>3D HTML + CSS animation</span>
                  <h3>{activeBuildStage.title}</h3>
                  <p>{activeBuildStage.description}</p>
                </div>
              </div>

              <div className={styles.heroSpotlightGrid}>
                {HERO_SPOTLIGHTS.map((machine) => (
                  <Link key={machine.title} href={machine.href} className={styles.heroSpotlightCard}>
                    <div className={styles.heroSpotlightImageWrap}>
                      <Image
                        src={machine.image}
                        alt={machine.imageAlt}
                        fill
                        sizes="(max-width: 768px) 120px, 160px"
                        className={styles.heroSpotlightImage}
                      />
                    </div>
                    <div>
                      <span className={styles.heroSpotlightLabel}>{machine.label}</span>
                      <h3>{machine.title}</h3>
                      <p>{machine.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className={`section ${styles.assemblySection}`} id="machine-assembly">
        <div className="container">
          <AnimatedSection>
            <div className={styles.assemblyIntro}>
              <span className="section-label">Build in Motion</span>
              <h2
                className="section-title"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Machine Build Sequence Visible from the First Scroll
              </h2>
              <p className="section-subtitle" style={{ margin: '0 auto', maxWidth: '760px', color: '#b6c2d9' }}>
                The L-sealer now assembles part by part with layered 3D motion using crawlable HTML, CSS,
                and real machine imagery instead of a canvas-only effect.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.assemblyGrid}>
            <AnimatedSection direction="right" className={styles.assemblySceneCard}>
              <MachineBuildVisual activeStage={assemblyStep} variant="section" />
            </AnimatedSection>

            <div className={styles.assemblyContent}>
              <div className={styles.assemblySteps}>
                {BUILD_STAGES.map((stage, idx) => (
                  <button
                    key={stage.title}
                    className={`${styles.assemblyStepButton} ${idx === assemblyStep ? styles.currentStep : ''}`}
                    onClick={() => setAssemblyStep(idx)}
                    type="button"
                  >
                    <span className={styles.assemblyStepCount}>{String(idx + 1).padStart(2, '0')}</span>
                    <span className={styles.assemblyStepText}>
                      <strong>{stage.title}</strong>
                      <p>{stage.description}</p>
                    </span>
                    <span className={styles.assemblyStepIndicator}>
                      {idx === assemblyStep ? 'Live' : 'Preview'}
                    </span>
                  </button>
                ))}
              </div>

              <div className={styles.assemblyProofGrid}>
                {[
                  { value: '3D', label: 'Layered visual depth built with crawlable DOM content.' },
                  { value: '4', label: 'Assembly milestones cycling automatically on page load.' },
                  { value: '24+', label: 'Years of packaging machine manufacturing experience.' },
                ].map((item) => (
                  <div key={item.value} className={styles.assemblyProofCard}>
                    <span className={styles.assemblyProofValue}>{item.value}</span>
                    <p>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="products">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">Our Products</span>
              <h2 className="section-title">Machine Families from the Spectra Pack Catalog</h2>
              <p className="section-subtitle" style={{ margin: '0 auto' }}>
                Explore shrink wrapping, sealing, vacuum packaging, conveyor, and pallet handling solutions
                built around real production requirements.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.productGrid}>
            {products.map((product, i) => (
              <AnimatedSection key={product.slug} delay={i * 0.05}>
                <Link href={`/products/${product.slug}`} className={styles.productCard}>
                  <div className={styles.productImageWrap}>
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      className={styles.productImage}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={styles.productCategory}>{product.category}</div>
                  </div>
                  <div className={styles.productInfo}>
                    <span className={styles.productModel}>{product.modelNo}</span>
                    <h3 className={styles.productName}>{product.title}</h3>
                    <p className={styles.productDesc}>{product.shortDesc}</p>
                    <span className={styles.productLink}>
                      View Details <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label" style={{ color: 'var(--accent)' }}>
                Why Choose Us
              </span>
              <h2 className="section-title">The Spectra Pack Advantage</h2>
              <p className="section-subtitle" style={{ margin: '0 auto' }}>
                Practical machine selection, direct factory access, and packaging-focused support from enquiry to dispatch.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid-4">
            {[
              { icon: <Award size={28} />, title: 'Since 2001', desc: 'Established packaging machine manufacturing experience built over more than two decades.' },
              { icon: <Factory size={28} />, title: 'Factory-Backed Supply', desc: 'Office and factory presence in Vasai-Palghar for direct technical coordination.' },
              { icon: <Shield size={28} />, title: 'Application-Focused Machines', desc: 'Bottle packs, cartons, pouches, vacuum packs, conveyors, and pallet handling solutions.' },
              { icon: <Clock size={28} />, title: 'Fast Technical Response', desc: 'Direct call, WhatsApp, and enquiry support for machine selection and quotations.' },
              { icon: <Wrench size={28} />, title: 'Installation Support', desc: 'Assistance for commissioning, trial runs, and machine handover after dispatch.' },
              { icon: <Settings size={28} />, title: 'Custom Configurations', desc: 'Machine dimensions and line setup adapted to product size and production flow.' },
              { icon: <Package size={28} />, title: 'Catalog-Driven Range', desc: 'Web sealers, L-sealers, band sealers, vacuum machines, conveyors, and stretch wrappers.' },
              { icon: <Phone size={28} />, title: 'Easy Enquiry Access', desc: 'Download the catalog, call the team, or book a meeting from the site.' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.05}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>{item.icon}</div>
                  <h3 className={styles.featureTitle}>{item.title}</h3>
                  <p className={styles.featureDesc}>{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.aboutSection}>
            <AnimatedSection direction="left" className={styles.aboutContent}>
              <span className="section-label">About Us</span>
              <h2 className="section-title">Packaging Equipment Built in India</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.8 }}>
                Spectra Pack Machines manufactures packaging equipment for bottle bundles, cartons, pouches,
                vacuum packs, conveyors, and palletized dispatch operations. The current catalog covers both
                semi-automatic and automatic machine formats.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.8 }}>
                With office support in Vasai West and manufacturing operations in Palghar, the company focuses
                on practical machine selection, custom layouts, commissioning support, and post-sale service.
              </p>
              <Link href="/about" className="btn btn-primary">
                Learn More About Us <ArrowRight size={16} />
              </Link>
            </AnimatedSection>

            <AnimatedSection direction="right" className={styles.aboutVisual}>
              <div className={styles.aboutCard}>
                <div className={styles.aboutCardInner}>
                  <div className={styles.aboutStatGrid}>
                    <div className={styles.aboutStatItem}>
                      <Counter end={COMPANY_INFO.yearsOfExperience} suffix="+" className={styles.aboutStatNum} />
                      <span>Years</span>
                    </div>
                    <div className={styles.aboutStatItem}>
                      <Counter end={products.length} className={styles.aboutStatNum} />
                      <span>Solutions</span>
                    </div>
                    <div className={styles.aboutStatItem}>
                      <Counter end={INDUSTRIES.length} className={styles.aboutStatNum} />
                      <span>Industries</span>
                    </div>
                    <div className={styles.aboutStatItem}>
                      <Counter end={2} className={styles.aboutStatNum} />
                      <span>Locations</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">Industries We Support</span>
              <h2 className="section-title">Built for Real Packaging Applications</h2>
            </div>
          </AnimatedSection>

          <div className={styles.testimonialGrid}>
            {INDUSTRIES.map((industry, i) => (
              <AnimatedSection key={industry.title} delay={i * 0.1}>
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialAuthor} style={{ marginBottom: '1rem' }}>
                    <div className={styles.testimonialAvatar}>{industry.title[0]}</div>
                    <div>
                      <strong>{industry.title}</strong>
                      <span className={styles.testimonialCompany}>Packaging Applications</span>
                    </div>
                  </div>
                  <p className={styles.testimonialText} style={{ marginBottom: 0, fontStyle: 'normal' }}>
                    {industry.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.clientSection}`} id="clients">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="section-label">Our Clients</span>
              <h2 className="section-title">Trusted by Manufacturing Brands Across India</h2>
            </div>
          </AnimatedSection>

          <div className={styles.clientRail}>
            <div className={styles.clientTrack}>
              {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, idx) => (
                <div key={`${logo.src}-${idx}`} className={styles.logoCard} aria-hidden={idx >= CLIENT_LOGOS.length}>
                  <Image
                    src={logo.src}
                    alt={idx < CLIENT_LOGOS.length ? logo.alt : ''}
                    width={150}
                    height={72}
                    className={styles.clientLogoImage}
                  />
                </div>
              ))}
            </div>
          </div>

          <p className={styles.clientSupportLine}>
            Brands from pharma, dairy, FMCG, food, and industrial packaging trust Spectra Pack for practical machine supply and line support.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">FAQ</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
          </AnimatedSection>

          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <AnimatedSection key={faq.q} delay={i * 0.05}>
                <div className={`${styles.faqItem} ${activeFaq === i ? styles.faqItemActive : ''}`}>
                  <button
                    className={styles.faqQuestion}
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    type="button"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {activeFaq === i && <div className={styles.faqAnswer}>{faq.a}</div>}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Need the Right Machine for Your Product?</h2>
              <p className={styles.ctaDesc}>
                Share your product, pack style, and expected output. Our team can recommend the right
                Spectra Pack machine and help you review the catalog with you.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/schedule-meeting" className="btn btn-accent btn-lg">
                  Schedule a Meeting <ArrowRight size={18} />
                </Link>
                <a href={`tel:${primaryPhone}`} className="btn btn-white btn-lg">
                  <Phone size={18} /> Call Now
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {showLeadPopup && (
        <div className={styles.leadPopupOverlay} onClick={() => closeLeadPopup()}>
          <div className={styles.leadPopup} onClick={(event) => event.stopPropagation()}>
            <button
              className={styles.leadPopupClose}
              onClick={() => closeLeadPopup()}
              type="button"
              aria-label="Close inquiry popup"
            >
              ✕
            </button>

            <div className={styles.leadPopupIntro}>
              <span className={styles.leadPopupBadge}>Free Quote Magnet</span>
              <h3>Get pricing guidance, a machine shortlist, and a fast callback.</h3>
              <p>
                Share your machine type and requirement. We will recommend the right Spectra Pack setup for
                your line and get back to you quickly.
              </p>

              <div className={styles.leadMagnetList}>
                {LEAD_MAGNET_POINTS.map((point) => (
                  <div key={point} className={styles.leadMagnetItem}>
                    <span className={styles.leadMagnetDot} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={submitLead} className={styles.leadForm}>
              <label>
                Name *
                <input type="text" name="name" placeholder="Your name" required />
              </label>
              <label>
                Company
                <input type="text" name="company" placeholder="Company name" />
              </label>
              <label>
                Phone *
                <input type="tel" name="phone" placeholder="+919xxxxxxxxx" required />
              </label>
              <label>
                Email *
                <input type="email" name="email" placeholder="you@example.com" required />
              </label>
              <label>
                Machine Type *
                <select name="machineInterest" defaultValue={MACHINE_INTEREST_OPTIONS[0]} required>
                  {MACHINE_INTEREST_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Brief requirement
                <textarea
                  name="message"
                  placeholder="Product type, pack size, output, or any specific machine requirement"
                  rows={4}
                />
              </label>
              <button className="btn btn-accent btn-lg" type="submit" disabled={leadStatus === 'saving'}>
                {leadStatus === 'saving' ? 'Submitting...' : 'Get Quote + Callback'}
              </button>
              <p className={styles.leadFormNote}>
                We use these details only for quotation and machine consultation.
              </p>
              {leadStatus === 'success' && <p className={styles.leadSuccess}>Thank you. Our team will contact you shortly.</p>}
              {leadStatus === 'error' && <p className={styles.leadError}>Please complete required details or retry.</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
