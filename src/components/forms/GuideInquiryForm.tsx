'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import PhoneField from './PhoneField';
import SpamShieldFields from './SpamShieldFields';
import { DEFAULT_PHONE_COUNTRY, buildPhoneValue, getPhoneValidationMessage } from '@/lib/phone';
import { createSpamShieldPayload } from '@/lib/spam-shield';
import { getAttributionPayload } from '@/lib/attribution';
import { trackAnalyticsEvent } from '@/lib/analytics';
import styles from './GuideInquiryForm.module.css';

type Props = {
  guideSlug: string;
  guideTitle: string;
  productSlug?: string;
  source?: 'blog-guide' | 'export-guide' | 'category-page';
};

export default function GuideInquiryForm({ guideSlug, guideTitle, productSlug = '', source = 'blog-guide' }: Props) {
  const id = useId();
  const submitting = useRef(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phoneCountry: DEFAULT_PHONE_COUNTRY, phoneNumber: '', location: '', message: '' });
  const [spamShield, setSpamShield] = useState(createSpamShieldPayload);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const phoneError = form.phoneNumber ? getPhoneValidationMessage(form.phoneCountry, form.phoneNumber) : '';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const validation = getPhoneValidationMessage(form.phoneCountry, form.phoneNumber);
    if (validation) { setError(validation); return; }
    submitting.current = true;
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), email: form.email.trim(), company: form.company.trim(),
          phone: buildPhoneValue(form.phoneCountry, form.phoneNumber), productSlug,
          message: `${source === 'category-page' ? 'Machine category' : 'Guide'}: ${guideTitle}\nDelivery city/country: ${form.location.trim()}\n\n${form.message.trim()}`,
          source, attribution: getAttributionPayload(), ...spamShield,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'Your enquiry could not be sent. Please try again.');
      setStatus('sent');
      if (typeof result?.id === 'string' && result.id.trim()) {
        trackAnalyticsEvent('generate_lead', {
          surface: source,
          metadata: { record_id: result.id, lead_source: source, product_slug: productSlug, ...(source === 'category-page' ? { category_slug: guideSlug } : { blog_slug: guideSlug }) },
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Connection error. Please try again.');
      setStatus('idle');
      // A challenge token can be consumed on a failed request. Let the user retry.
      setSpamShield(createSpamShieldPayload());
    } finally {
      submitting.current = false;
    }
  }

  return (
    <section id="inquiry" className={styles.section} aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.intro}>
            <span className="section-label">Discuss your application</span>
            <h2 id={`${id}-title`}>Request a machine recommendation</h2>
            <p>Tell us what you pack, your pack size, required output and delivery location. The team can review the application and confirm a suitable machine or service scope.</p>
            <p className={styles.context}>About: {guideTitle}</p>
            <Link href="/schedule-meeting" className="btn btn-outline">Prefer a scheduled discussion?</Link>
          </div>
          {status === 'sent' ? (
            <div className={styles.success} role="status">
              <h3>Thank you for your enquiry</h3>
              <p>Your requirement has been received. Our team will review it and contact you using the details provided.</p>
            </div>
          ) : (
            <form onSubmit={submit} className={styles.form}>
              <SpamShieldFields
                honeypotValue={spamShield.website} formStartedAt={spamShield.formStartedAt} turnstileToken={spamShield.turnstileToken}
                onHoneypotChange={(value) => setSpamShield((current) => ({ ...current, website: value }))}
                onTurnstileTokenChange={(value) => setSpamShield((current) => ({ ...current, turnstileToken: value }))}
              />
              <div className={styles.row}>
                <label className="form-group"><span className="form-label">Name *</span><input className="form-input" name="name" autoComplete="name" required maxLength={120} value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} /></label>
                <label className="form-group"><span className="form-label">Work email *</span><input className="form-input" type="email" name="email" autoComplete="email" required maxLength={200} value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} /></label>
              </div>
              <PhoneField label="Phone *" idPrefix={`${id}-phone`} countryCode={form.phoneCountry} phoneNumber={form.phoneNumber} required error={phoneError}
                onCountryCodeChange={(value) => setForm((current) => ({ ...current, phoneCountry: value }))}
                onPhoneNumberChange={(value) => setForm((current) => ({ ...current, phoneNumber: value }))} />
              <div className={styles.row}>
                <label className="form-group"><span className="form-label">Company</span><input className="form-input" name="company" autoComplete="organization" maxLength={160} value={form.company} onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))} /></label>
                <label className="form-group"><span className="form-label">Delivery city and country *</span><input className="form-input" name="location" required maxLength={200} placeholder="e.g. Pune, India" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} /></label>
              </div>
              <label className="form-group"><span className="form-label">Your requirement *</span><textarea className="form-input" name="message" required minLength={10} maxLength={3000} rows={4} placeholder="Product, pack dimensions, packaging material and output per hour" value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} /></label>
              <p className={styles.privacy}>We use these details to respond to your enquiry. Read our <Link href="/privacy-policy">privacy policy</Link>.</p>
              {error ? <p className={styles.error} role="alert">{error}</p> : null}
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>{status === 'sending' ? 'Sending enquiry…' : 'Send Enquiry'}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
