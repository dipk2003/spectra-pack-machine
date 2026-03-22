'use client';

import PhoneField from '@/components/forms/PhoneField';
import CategoryHeroCarousel from '@/components/home/CategoryHeroCarousel';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Counter from '@/components/ui/Counter';
import type { CategoryRecord } from '@/lib/cms';
import {
  COMPANY_INFO,
  FAQS,
  INDUSTRIES,
  PRODUCTS,
  groupProductsByCategory,
} from '@/lib/data';
import {
  DEFAULT_PHONE_COUNTRY,
  buildPhoneValue,
  getPhoneValidationMessage,
} from '@/lib/phone';
import {
  buildCategoryCards,
  buildHeroSlides,
  parseHeroCarouselOverrideMap,
  type HeroCarouselOverrideMap,
} from '@/lib/home-hero';
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
  X,
  Wrench,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import styles from './page.module.css';

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

type LeadPopupForm = {
  name: string;
  company: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
  machineInterest: string;
  message: string;
};

const createInitialLeadForm = (): LeadPopupForm => ({
  name: '',
  company: '',
  email: '',
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  phoneNumber: '',
  machineInterest: MACHINE_INTEREST_OPTIONS[0],
  message: '',
});

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [products, setProducts] = useState(PRODUCTS);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [heroOverrides, setHeroOverrides] = useState<HeroCarouselOverrideMap>({});
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadPopupForm>(createInitialLeadForm);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [leadErrorMessage, setLeadErrorMessage] = useState('');

  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');
  const productGroups = groupProductsByCategory(products);
  const categoryCards = buildCategoryCards(productGroups, categories);
  const heroSlides = buildHeroSlides(productGroups, categoryCards, heroOverrides);
  const leadPhoneError = leadForm.phoneNumber
    ? getPhoneValidationMessage(leadForm.phoneCountry, leadForm.phoneNumber)
    : '';

  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/site-settings'),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const settingsData = await settingsRes.json();

        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        setHeroOverrides(parseHeroCarouselOverrideMap(settingsData?.heroCarouselOverrides));
      } catch {
        // Keep static fallback only when the API call itself fails.
      }
    };

    void loadSiteData();
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

  const updateLeadForm = <K extends keyof LeadPopupForm>(
    field: K,
    value: LeadPopupForm[K],
  ) => {
    setLeadStatus('idle');
    setLeadErrorMessage('');
    setLeadForm((current) => ({ ...current, [field]: value }));
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const machineInterest = leadForm.machineInterest.trim();
    const message = leadForm.message.trim();
    const validationMessage = getPhoneValidationMessage(
      leadForm.phoneCountry,
      leadForm.phoneNumber,
    );

    if (validationMessage) {
      setLeadStatus('error');
      setLeadErrorMessage(validationMessage);
      return;
    }

    const leadData = {
      name: leadForm.name.trim(),
      company: leadForm.company.trim(),
      email: leadForm.email.trim(),
      phone: buildPhoneValue(leadForm.phoneCountry, leadForm.phoneNumber),
      machineInterest,
      message:
        message ||
        `Need quotation and machine recommendation for ${machineInterest || 'a packaging machine'}.`,
      source: 'homepage-lead-magnet',
    };

    if (!leadData.name || !leadData.email || !leadData.phone) {
      setLeadStatus('error');
      setLeadErrorMessage('Please complete all required details.');
      return;
    }

    setLeadStatus('saving');
    setLeadErrorMessage('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        setLeadStatus('success');
        setLeadForm(createInitialLeadForm());
        setLeadErrorMessage('');

        window.setTimeout(() => {
          closeLeadPopup('submitted');
        }, 1800);
      } else {
        setLeadStatus('error');
        setLeadErrorMessage(
          typeof data?.error === 'string'
            ? data.error
            : 'Please complete required details or retry.',
        );
      }
    } catch {
      setLeadStatus('error');
      setLeadErrorMessage('Network error. Please try again.');
    }
  };

  return (
    <>
      <CategoryHeroCarousel slides={heroSlides} />

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

          <div className={styles.categorySpotlightGrid}>
            {categoryCards.map((category, groupIndex) => {
              const categoryHref = `/products/category/${category.slug}`;
              return (
                <AnimatedSection key={`${category.slug}-spotlight`} delay={groupIndex * 0.04}>
                  <Link href={categoryHref} className={styles.categorySpotlightCard}>
                    <div className={styles.categorySpotlightVisual}>
                      <div className={styles.categorySpotlightGlow} />
                      <Image
                        src={category.image}
                        alt={`${category.name} category`}
                        fill
                        className={styles.categorySpotlightImage}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className={styles.categorySpotlightContent}>
                      <span className={styles.categorySpotlightEyebrow}>{category.accent}</span>
                      <h3 className={styles.categorySpotlightTitle}>{category.name}</h3>
                      <p className={styles.categorySpotlightDesc}>{category.description}</p>
                      <span className={styles.categorySpotlightMeta}>
                        {category.machineCount} {category.machineCount === 1 ? 'Machine' : 'Machines'}
                      </span>
                      <span className={styles.categorySpotlightAction}>
                        View Category <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
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
              <h2 className="section-title">Packaging Solutions Businesses Can Rely On</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.8 }}>
                {COMPANY_INFO.companyDescription[0]}
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.8 }}>
                {COMPANY_INFO.companyDescription[1]}
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.8 }}>
                {COMPANY_INFO.infrastructure.summary}
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
              <X size={18} strokeWidth={2.4} />
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
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  value={leadForm.name}
                  onChange={(event) => updateLeadForm('name', event.target.value)}
                />
              </label>
              <label>
                Company
                <input
                  type="text"
                  name="company"
                  placeholder="Company name"
                  value={leadForm.company}
                  onChange={(event) => updateLeadForm('company', event.target.value)}
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={leadForm.email}
                  onChange={(event) => updateLeadForm('email', event.target.value)}
                />
              </label>
              <PhoneField
                label="Phone *"
                countryCode={leadForm.phoneCountry}
                phoneNumber={leadForm.phoneNumber}
                onCountryCodeChange={(value) => updateLeadForm('phoneCountry', value)}
                onPhoneNumberChange={(value) => updateLeadForm('phoneNumber', value)}
                required
                error={leadPhoneError}
                idPrefix="homepage-popup-phone"
              />
              <label>
                Machine Type *
                <select
                  name="machineInterest"
                  value={leadForm.machineInterest}
                  onChange={(event) => updateLeadForm('machineInterest', event.target.value)}
                  required
                >
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
                  value={leadForm.message}
                  onChange={(event) => updateLeadForm('message', event.target.value)}
                />
              </label>
              <button className="btn btn-accent btn-lg" type="submit" disabled={leadStatus === 'saving'}>
                {leadStatus === 'saving' ? 'Submitting...' : 'Get Quote + Callback'}
              </button>
              <p className={styles.leadFormNote}>
                We use these details only for quotation and machine consultation.
              </p>
              {leadStatus === 'success' && <p className={styles.leadSuccess}>Thank you. The catalog link has been sent to your email.</p>}
              {leadStatus === 'error' && <p className={styles.leadError}>{leadErrorMessage || 'Please complete required details or retry.'}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
