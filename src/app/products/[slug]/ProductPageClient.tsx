'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { ProductData, COMPANY_INFO } from '@/lib/data';
import AnimatedSection from '@/components/ui/AnimatedSection';
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: `I'm interested in ${product.title}. Please share pricing details.` });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const relatedProducts = allProducts.filter(p => p.slug !== product.slug && p.category === product.category).slice(0, 3);
  if (relatedProducts.length === 0) {
    relatedProducts.push(...allProducts.filter(p => p.slug !== product.slug).slice(0, 3));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: `product-${product.slug}` }),
      });
      if (res.ok) { setSent(true); toast.success('Enquiry sent! We\'ll contact you soon.'); }
      else toast.error('Something went wrong.');
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
              <Link href="/">Home</Link> / <Link href="/#products">Products</Link> / <span>{product.title}</span>
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
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    className={styles.heroProductImage}
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                  />
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
                  <p style={{ color: '#94a3b8' }}>We'll contact you within 24 hours with pricing details.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.enquiryForm}>
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
                    <Image
                      src={rp.image}
                      alt={rp.imageAlt}
                      fill
                      className={styles.relatedThumb}
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>
                  <span className={styles.relatedModel}>{rp.modelNo}</span>
                  <h4>{rp.title}</h4>
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
