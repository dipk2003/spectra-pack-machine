'use client';

import { useState } from 'react';
import PhoneField from '@/components/forms/PhoneField';
import { COMPANY_INFO } from '@/lib/data';
import {
  DEFAULT_PHONE_COUNTRY,
  buildPhoneValue,
  getPhoneValidationMessage,
} from '@/lib/phone';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { MapPin, Phone, Mail, Send, CheckCircle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    phoneNumber: '',
    company: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const headOfficeMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_INFO.headOffice)}`;
  const factoryMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_INFO.factory)}`;
  const phoneError = form.phoneNumber
    ? getPhoneValidationMessage(form.phoneCountry, form.phoneNumber)
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationMessage = getPhoneValidationMessage(
      form.phoneCountry,
      form.phoneNumber,
    );

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: buildPhoneValue(form.phoneCountry, form.phoneNumber),
          company: form.company,
          message: form.message,
          source: 'contact',
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        setSent(true);
        toast.success('Message sent successfully!');
        setForm({
          name: '',
          email: '',
          phoneCountry: DEFAULT_PHONE_COUNTRY,
          phoneNumber: '',
          company: '',
          message: '',
        });
      } else {
        toast.error(typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <span className="section-label" style={{ color: 'var(--accent)' }}>Contact Us</span>
            <h1 className={styles.heroTitle}>Talk to the Spectra Pack Team</h1>
            <p className={styles.heroDesc}>
              Need a quotation, machine recommendation, catalog review, or factory discussion? Reach out
              by form, phone, email, or WhatsApp.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Form */}
            <AnimatedSection direction="left">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Send us a Message</h2>
                {sent ? (
                  <div className={styles.successMsg}>
                    <CheckCircle size={48} />
                    <h3>Thank You!</h3>
                    <p>We&apos;ve received your message and will get back to you within 24 hours.</p>
                    <button className="btn btn-primary" onClick={() => setSent(false)}>Send Another Message</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-input" required value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Your name" />
                    </div>
                    <div className={styles.formRow}>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-input" required value={form.email}
                          onChange={(e) => setForm({...form, email: e.target.value})} placeholder="your@email.com" />
                      </div>
                      <PhoneField
                        label="Phone *"
                        countryCode={form.phoneCountry}
                        phoneNumber={form.phoneNumber}
                        onCountryCodeChange={(value) => setForm({ ...form, phoneCountry: value })}
                        onPhoneNumberChange={(value) => setForm({ ...form, phoneNumber: value })}
                        required
                        error={phoneError}
                        idPrefix="contact-phone"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input type="text" className="form-input" value={form.company}
                        onChange={(e) => setForm({...form, company: e.target.value})} placeholder="Your company name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className="form-input form-textarea" required value={form.message}
                        onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Tell us about your packaging needs..." />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                      {loading ? 'Sending...' : <>Send Message <Send size={16} /></>}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* Info */}
            <AnimatedSection direction="right">
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><MapPin size={22} /></div>
                  <div>
                    <h4>Head Office</h4>
                    <p>{COMPANY_INFO.headOffice}</p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><MapPin size={22} /></div>
                  <div>
                    <h4>Factory Address</h4>
                    <p>{COMPANY_INFO.factory}</p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><Phone size={22} /></div>
                  <div>
                    <h4>Phone</h4>
                    <p><a href={`tel:${COMPANY_INFO.phone[0].replace(/\s+/g, '')}`}>{COMPANY_INFO.phone[0]}</a></p>
                    <p><a href={`tel:${COMPANY_INFO.phone[1].replace(/\s+/g, '')}`}>{COMPANY_INFO.phone[1]}</a></p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><Mail size={22} /></div>
                  <div>
                    <h4>Email</h4>
                    <p><a href={`mailto:${COMPANY_INFO.email[0]}`}>{COMPANY_INFO.email[0]}</a></p>
                    <p><a href={`mailto:${COMPANY_INFO.email[1]}`}>{COMPANY_INFO.email[1]}</a></p>
                  </div>
                </div>
              </div>

              <div className={styles.mapWrap}>
                <div className={styles.mapHeader}>
                  <h3>Find Us</h3>
                  <p>Open the office or factory address directly in Google Maps.</p>
                </div>
                <div className={styles.mapActions}>
                  <a href={headOfficeMap} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                    Head Office <ArrowUpRight size={16} />
                  </a>
                  <a href={factoryMap} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                    Factory Location <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
