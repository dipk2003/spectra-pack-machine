'use client';

import { useState } from 'react';
import PhoneField from '@/components/forms/PhoneField';
import SpamShieldFields from '@/components/forms/SpamShieldFields';
import AnimatedSection from '@/components/ui/AnimatedSection';
import {
  DEFAULT_PHONE_COUNTRY,
  buildPhoneValue,
  getPhoneValidationMessage,
} from '@/lib/phone';
import { createSpamShieldPayload } from '@/lib/spam-shield';
import { getAttributionPayload } from '@/lib/attribution';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { CalendarDays, Clock, User, Building, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const timeSlots = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM'
];

export default function ScheduleMeetingPage() {
  const [scheduledMeetingLink, setScheduledMeetingLink] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    phoneNumber: '',
    company: '',
    date: '',
    time: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [spamShield, setSpamShield] = useState(createSpamShieldPayload);

  const today = new Date().toISOString().split('T')[0];
  const phoneError = form.phoneNumber
    ? getPhoneValidationMessage(form.phoneCountry, form.phoneNumber)
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      toast.error('Please select a date and time.');
      return;
    }

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
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: buildPhoneValue(form.phoneCountry, form.phoneNumber),
          company: form.company,
          date: form.date,
          time: form.time,
          message: form.message,
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
          trackAnalyticsEvent('meeting_booked', {
            surface: 'schedule-meeting',
            metadata: {
              record_id: recordId,
              meeting_link_available: Boolean(data?.meetingLink),
              email_sent: Boolean(data?.emailSent),
              owner_email_sent: Boolean(data?.ownerEmailSent),
            },
          });
        }
        setSent(true);
        setScheduledMeetingLink(typeof data?.meetingLink === 'string' ? data.meetingLink : '');
        toast.success('Meeting scheduled successfully!');
      } else {
        toast.error(typeof data?.error === 'string' ? data.error : 'Failed to schedule. Please try again.');
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
            <span className="section-label" style={{ color: 'var(--accent)' }}>Schedule a Meeting</span>
            <h1 className={styles.heroTitle}>Book a Free Consultation</h1>
            <p className={styles.heroDesc}>
              Schedule a meeting with our packaging experts to discuss your requirements, get a demo, or visit our factory.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {sent ? (
            <AnimatedSection>
              <div className={styles.successCard}>
                <CheckCircle size={64} color="var(--success)" />
                <h2>Meeting Scheduled!</h2>
                <p>We&apos;ve received your booking for <strong>{form.date}</strong> at <strong>{form.time}</strong>.</p>
                <p>Your meeting link has been emailed to you and is also ready below for quick access.</p>
                {scheduledMeetingLink ? (
                  <p>
                    <a href={scheduledMeetingLink} target="_blank" rel="noopener noreferrer">
                      Join Meeting Link
                    </a>
                  </p>
                ) : null}
                <button className="btn btn-primary btn-lg" onClick={() => { setSent(false); setScheduledMeetingLink(''); setForm({ name: '', email: '', phoneCountry: DEFAULT_PHONE_COUNTRY, phoneNumber: '', company: '', date: '', time: '', message: '' }); setSpamShield(createSpamShieldPayload()); }}>
                  Schedule Another Meeting
                </button>
              </div>
            </AnimatedSection>
          ) : (
            <div className={styles.formGrid}>
              <AnimatedSection direction="left">
                <div className={styles.formCard}>
                  <h2 className={styles.formTitle}>Select Date & Time</h2>
                  <form onSubmit={handleSubmit}>
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
                    {/* Date picker */}
                    <div className="form-group">
                      <label className="form-label"><CalendarDays size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />Preferred Date *</label>
                      <input type="date" className="form-input" required min={today}
                        value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>

                    {/* Time slots */}
                    <div className="form-group">
                      <label className="form-label"><Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />Preferred Time *</label>
                      <div className={styles.timeGrid}>
                        {timeSlots.map((slot) => (
                          <button key={slot} type="button"
                            className={`${styles.timeSlot} ${form.time === slot ? styles.timeSlotActive : ''}`}
                            onClick={() => setForm({ ...form, time: slot })}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="form-group">
                      <label className="form-label"><User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />Full Name *</label>
                      <input type="text" className="form-input" required placeholder="Your name"
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div className={styles.formRow}>
                      <div className="form-group">
                        <label className="form-label"><Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />Email *</label>
                        <input type="email" className="form-input" required placeholder="your@email.com"
                          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </div>
                      <PhoneField
                        label={<><Phone size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />Phone *</>}
                        countryCode={form.phoneCountry}
                        phoneNumber={form.phoneNumber}
                        onCountryCodeChange={(value) => setForm({ ...form, phoneCountry: value })}
                        onPhoneNumberChange={(value) => setForm({ ...form, phoneNumber: value })}
                        required
                        error={phoneError}
                        idPrefix="meeting-phone"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label"><Building size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />Company</label>
                      <input type="text" className="form-input" placeholder="Your company name"
                        value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message (Optional)</label>
                      <textarea className="form-input form-textarea" placeholder="Tell us what you&apos;d like to discuss..."
                        value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                      {loading ? 'Scheduling...' : <>Confirm Meeting <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </div>
              </AnimatedSection>

              {/* Side info */}
              <AnimatedSection direction="right">
                <div className={styles.infoPanel}>
                  <h3>What to Expect</h3>
                  <ul className={styles.expectList}>
                    <li><CheckCircle size={18} /> Discuss your packaging requirements</li>
                    <li><CheckCircle size={18} /> Get expert machine recommendations</li>
                    <li><CheckCircle size={18} /> Receive a customized quotation</li>
                    <li><CheckCircle size={18} /> Schedule a factory visit or demo</li>
                    <li><CheckCircle size={18} /> Explore financing options</li>
                  </ul>

                  <div className={styles.meetingTypes}>
                    <h3>Meeting Types</h3>
                    <div className={styles.meetingType}>
                      <strong>📞 Phone Consultation</strong>
                      <p>30-minute call with our sales engineer</p>
                    </div>
                    <div className={styles.meetingType}>
                      <strong>🏭 Factory Visit</strong>
                      <p>See our manufacturing process firsthand</p>
                    </div>
                    <div className={styles.meetingType}>
                      <strong>🎥 Video Demo</strong>
                      <p>Live demo of machines via video call</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
