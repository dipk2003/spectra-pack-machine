'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { categoryToSlug } from '@/lib/categories';
import { ProductData, COMPANY_INFO } from '@/lib/data';
import SpamShieldFields from '@/components/forms/SpamShieldFields';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { createSpamShieldPayload } from '@/lib/spam-shield';
import { getAttributionPayload } from '@/lib/attribution';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { CheckCircle, ChevronDown, ChevronUp, ArrowRight, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function ProductPageClient({
  product,
  allProducts,
}: {
  product: ProductData;
  allProducts: ProductData[];
}) {
  const categoryHref = `/products/category/${product.categorySlug || categoryToSlug(product.category)}`;
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    productToPack: '',
    requiredOutput: '',
    deliveryLocation: '',
    purchaseTimeline: '',
    message: `I'm interested in ${product.title}. Please share pricing details.`,
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [spamShield, setSpamShield] = useState(createSpamShieldPayload);

  const relatedProducts = allProducts.filter(p => p.slug !== product.slug && p.category === product.category).slice(0, 3);
  if (relatedProducts.length === 0) {
    relatedProducts.push(...allProducts.filter(p => p.slug !== product.slug).slice(0, 3));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const qualifiedMessage = [
        `Machine interest: ${product.title}`,
        form.productToPack.trim() ? `Product to pack: ${form.productToPack.trim()}` : '',
        form.requiredOutput.trim() ? `Required output: ${form.requiredOutput.trim()}` : '',
        form.deliveryLocation.trim() ? `Delivery location: ${form.deliveryLocation.trim()}` : '',
        form.purchaseTimeline ? `Purchase timeline: ${form.purchaseTimeline}` : '',
        form.message.trim() ? `Additional requirement: ${form.message.trim()}` : '',
        `Landing page: /products/${product.slug}`,
      ].filter(Boolean).join('\n');
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message: qualifiedMessage,
          source: `product-${product.slug}`,
          machineInterest: product.title,
          productSlug: product.slug,
          categorySlug: product.categorySlug || categoryToSlug(product.category),
          attribution: getAttributionPayload(),
          website: spamShield.website,
          formStartedAt: spamShield.formStartedAt,
          turnstileToken: spamShield.turnstileToken,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        const recordId = typeof data?.id === 'string' ? data.id.trim() : '';
        if (recordId) {
          trackAnalyticsEvent('generate_lead', {
            surface: 'product-page',
            metadata: {
              record_id: recordId,
              lead_source: `product-${product.slug}`,
              product_slug: product.slug,
              category_slug: product.categorySlug || categoryToSlug(product.category),
              email_sent: Boolean(data?.emailSent),
              owner_email_sent: Boolean(data?.ownerEmailSent),
            },
          });
        }
        setSent(true);
        setSpamShield(createSpamShieldPayload());
        toast.success('Enquiry sent! We\'ll contact you soon.');
      }
      else toast.error(typeof data?.error === 'string' ? data.error : 'Something went wrong.');
    } catch { toast.error('Network error.'); }
    setLoading(false);
  };

  return (
    <>
      {/* Breadcrumb + Hero */}
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link> / <Link href={categoryHref}>{product.category}</Link> / <span>{product.title}</span>
            </div>
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <div className={styles.heroBadges}>
                  <span className="badge badge-primary">{product.category}</span>
                  <span className={styles.modelTag}>{product.modelNo}</span>
                </div>
                <h1 className={styles.heroTitle}>{product.title}</h1>
                <p className={styles.heroLead}>{product.shortDesc}</p>
                <p className={styles.heroDesc}>{product.description}</p>
                <div className={styles.heroActions}>
                  <a href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${product.title}. Please share details.`)}`}
                    className="btn btn-accent btn-lg" target="_blank" rel="noopener noreferrer">
                    Get Quote on WhatsApp
                  </a>
                  <Link href="/schedule-meeting" className="btn btn-outline btn-lg">
                    Schedule Demo
                  </Link>
                </div>
              </div>
              <div className={styles.heroImage}>
                <div className={styles.imageCard}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      className={styles.heroProductImage}
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>Image managed from admin</div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">Key Features</span>
              <h2 className="section-title">Why Choose This Machine</h2>
            </div>
          </AnimatedSection>
          <div className={styles.featuresGrid}>
            {product.features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className={styles.featureItem}>
                  <CheckCircle size={20} className={styles.featureCheck} />
                  <span>{f}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="section section-alt">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-label">Specifications</span>
              <h2 className="section-title">Technical Details</h2>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div className={styles.specsTable}>
              {Object.entries(product.specs).map(([key, value], i) => (
                <div key={i} className={styles.specRow}>
                  <span className={styles.specKey}>{key}</span>
                  <span className={styles.specVal}>{value}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQs */}
      {product.faqs.length > 0 && (
        <section className="section">
          <div className="container">
            <AnimatedSection>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <span className="section-label">FAQ</span>
                <h2 className="section-title">Common Questions</h2>
              </div>
            </AnimatedSection>
            <div className={styles.faqList}>
              {product.faqs.map((faq, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className={`${styles.faqItem} ${activeFaq === i ? styles.faqActive : ''}`}>
                    <button className={styles.faqQ} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                      <span>{faq.q}</span>
                      {activeFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {activeFaq === i && <div className={styles.faqA}>{faq.a}</div>}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enquiry Form */}
      <section className="section section-dark">
        <div className="container">
          <div className={styles.enquiryGrid}>
            <AnimatedSection direction="left">
              <span className="section-label" style={{ color: 'var(--accent)' }}>Get a Quote</span>
              <h2 className="section-title">Interested in {product.title}?</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Fill out the form and our team will get back to you with pricing details, customization options, and delivery timeline within 24 hours.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                <Phone size={18} color="var(--accent)" />
                <span>Or call us directly: <a href={`tel:${COMPANY_INFO.phone[0]}`} style={{ color: 'var(--accent)' }}>{COMPANY_INFO.phone[0]}</a></span>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              {sent ? (
                <div className={styles.sentMsg}>
                  <CheckCircle size={48} color="var(--success)" />
                  <h3 style={{ color: '#fff' }}>Thank You!</h3>
                  <p style={{ color: '#94a3b8' }}>We&apos;ll contact you within 24 hours with pricing details.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.enquiryForm}>
                  <SpamShieldFields
                    honeypotValue={spamShield.website}
                    formStartedAt={spamShield.formStartedAt}
                    turnstileToken={spamShield.turnstileToken}
                    onHoneypotChange={(value) =>
                      setSpamShield((current) => ({ ...current, website: value }))
                    }
                    onTurnstileTokenChange={(value) =>
                      setSpamShield((current) => ({ ...current, turnstileToken: value }))
                    }
                  />
                  <input type="text" className="form-input" placeholder="Your Name *" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <div className={styles.formRow}>
                    <input type="email" className="form-input" placeholder="Email *" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input type="tel" className="form-input" placeholder="Phone *" required value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <input type="text" className="form-input" placeholder="Company Name" value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  <div className={styles.formRow}>
                    <input type="text" className="form-input" placeholder="Product to pack *" required value={form.productToPack}
                      onChange={(e) => setForm({ ...form, productToPack: e.target.value })} />
                    <input type="text" className="form-input" placeholder="Required output (e.g. 20 packs/min)" value={form.requiredOutput}
                      onChange={(e) => setForm({ ...form, requiredOutput: e.target.value })} />
                  </div>
                  <div className={styles.formRow}>
                    <input type="text" className="form-input" placeholder="Delivery city & state *" required value={form.deliveryLocation}
                      onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })} />
                    <select className="form-input" value={form.purchaseTimeline}
                      onChange={(e) => setForm({ ...form, purchaseTimeline: e.target.value })}>
                      <option value="">Purchase timeline</option>
                      <option value="Immediately">Immediately</option>
                      <option value="Within 1 month">Within 1 month</option>
                      <option value="Within 1-3 months">Within 1–3 months</option>
                      <option value="Researching options">Researching options</option>
                    </select>
                  </div>
                  <textarea className="form-input form-textarea" placeholder="Your Message" value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <button type="submit" className="btn btn-accent btn-lg" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="section-label">More Machines</span>
              <h2 className="section-title">Related Products</h2>
            </div>
          </AnimatedSection>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((rp, i) => (
              <AnimatedSection key={rp.slug} delay={i * 0.1}>
                <Link href={`/products/${rp.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImage}>
                    {rp.image ? (
                      <Image
                        src={rp.image}
                        alt={rp.imageAlt}
                        fill
                        className={styles.relatedThumb}
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>Image managed from admin</div>
                    )}
                  </div>
                  <span className={styles.relatedModel}>{rp.modelNo}</span>
                  <h3>{rp.title}</h3>
                  <p>{rp.shortDesc}</p>
                  <span className={styles.relatedLink}>View Details <ArrowRight size={14} /></span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
