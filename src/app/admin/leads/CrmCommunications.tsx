'use client';

import { FormEvent, useState } from 'react';
import { ExternalLink, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CrmActivity, CrmLead } from '@/lib/crm-types';
import { crmCommunicationUrl } from '@/lib/crm-policy';
import styles from './page.module.css';

type Channel = 'call' | 'whatsapp' | 'email';
type CommunicationResult = {
  activity?: CrmActivity;
  launchUrl?: string;
  status: string;
  notice?: string;
};

export default function CrmCommunications({
  lead,
  emailSending,
  phoneCalling,
  onActivity,
  requestIds,
}: {
  lead: CrmLead;
  emailSending: boolean;
  phoneCalling: boolean;
  onActivity: (activity: CrmActivity) => void;
  requestIds: Map<string, string>;
}) {
  const [channel, setChannel] = useState<Channel>(lead.phone ? 'whatsapp' : 'email');
  const [subject, setSubject] = useState(`Your ${lead.machineInterest || 'packaging machine'} enquiry — Spectra Pack`);
  const [body, setBody] = useState(`Hello ${lead.name}, thank you for your enquiry about ${lead.machineInterest || 'packaging machines'}. Could you share your product, pack size and required production capacity so we can help you choose a suitable machine?`);
  const [emailMode, setEmailMode] = useState<'app' | 'crm' | 'gmail' | 'outlook'>(emailSending ? 'crm' : 'gmail');
  const [template, setTemplate] = useState('requirements');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [launchUrl, setLaunchUrl] = useState('');
  const [callMode, setCallMode] = useState<'device' | 'crm'>(phoneCalling ? 'crm' : 'device');
  const [callRequested, setCallRequested] = useState(false);
  const callFingerprint = JSON.stringify({ leadId: lead.id, recipient: lead.phone, channel: 'call', action: 'send' });

  const applyTemplate = (template: string) => {
    setTemplate(template);
    if (template === 'requirements') {
      setSubject(`Your ${lead.machineInterest || 'packaging machine'} enquiry — Spectra Pack`);
      setBody(`Hello ${lead.name}, thank you for your enquiry about ${lead.machineInterest || 'packaging machines'}. Could you share your product, pack size and required production capacity so we can help you choose a suitable machine?`);
    } else if (template === 'quotation') {
      setSubject(`Following up on your machine enquiry — Spectra Pack`);
      setBody(`Hello ${lead.name}, I am following up on your ${lead.machineInterest || 'packaging machine'} enquiry. Do you have any questions about the specification, quotation or installation requirements? Please let me know a convenient time to discuss.`);
    } else if (template === 'demo') {
      setSubject(`Arrange a machine discussion — Spectra Pack`);
      setBody(`Hello ${lead.name}, would you like to arrange a discussion about ${lead.machineInterest || 'your packaging requirement'}? Please share a convenient date and time, your location and any product samples you would like us to review.`);
    }
    setNotice('');
    setLaunchUrl('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const action = (channel === 'email' && emailMode === 'crm') || (channel === 'call' && callMode === 'crm') ? 'send' : 'launch';
    const fingerprint = channel === 'call' && action === 'send' ? callFingerprint : JSON.stringify({ leadId: lead.id, recipient: channel === 'email' ? lead.email : lead.phone, channel, action, subject, body });
    // The page owns these IDs so switching channels or reopening a lead cannot
    // turn a retry of an uncertain email into a second SMTP submission.
    let requestId = action === 'send' ? requestIds.get(fingerprint) : undefined;
    if (!requestId) {
      requestId = crypto.randomUUID();
      if (action === 'send') requestIds.set(fingerprint, requestId);
    }
    // Reserve a browsing context during the click so the provider launch is not blocked after the API response.
    const webmail = channel === 'email' && (emailMode === 'gmail' || emailMode === 'outlook');
    const popup = channel === 'whatsapp' || webmail ? window.open('about:blank', '_blank') : null;
    if (popup) popup.opener = null;
    setBusy(true);
    setNotice('');
    setLaunchUrl('');
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}/communications`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, action, subject, body, requestId }),
      });
      const result = await response.json().catch(() => null) as (CommunicationResult & { error?: string }) | null;
      if (response.status === 401) {
        window.location.assign('/admin/login?callbackUrl=/admin/leads');
        throw new Error('Please sign in again.');
      }
      if (!response.ok || !result) throw new Error(result?.error || 'Could not prepare this communication.');
      if (result.activity) onActivity(result.activity);
      if (action === 'send' && channel === 'call') {
        setCallRequested(true);
        setNotice(result.notice || 'Call requested. Check your registered mobile.');
        if (result.status === 'queued') toast.success('Calling your mobile');
        else if (result.status === 'failed') toast.error('Call request rejected');
      } else if (action === 'send') {
        setNotice(result.notice || (result.status === 'accepted' ? 'Accepted by the email server. Delivery is not confirmed.' : 'The email result is not confirmed. Check the activity history before starting another email.'));
        if (result.status === 'accepted') toast.success('Email accepted by server');
        else if (result.status === 'failed') { requestIds.delete(fingerprint); toast.error('Email submission failed'); }
        else toast('Email result needs checking', { icon: 'ℹ️' });
        // Keep the request ID for this exact message so a second click cannot send it twice.
      } else if (result.launchUrl) {
        const valid = channel === 'whatsapp'
          ? /^https:\/\/wa\.me\/\d+\?/.test(result.launchUrl)
          : channel === 'call' ? /^tel:\+?\d+$/.test(result.launchUrl) : /^mailto:[^\r\n]+$/.test(result.launchUrl);
        if (!valid) throw new Error('The contact link is invalid. Please check the customer details.');
        const destination = webmail
          ? emailMode === 'gmail'
            ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
            : `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(lead.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
          : result.launchUrl;
        setLaunchUrl(destination);
        setNotice(channel === 'call'
          ? 'If no calling app opened, use the direct dial link below or call this number from your mobile. A call connection has not been confirmed.'
          : 'App launch requested. Complete the message in the app, then record the result below.');
        if (channel === 'whatsapp' || webmail) {
          if (popup) popup.location.replace(destination);
        } else {
          window.location.assign(result.launchUrl);
        }
      }
    } catch (error) {
      popup?.close();
      toast.error(error instanceof Error ? error.message : 'Communication failed.');
    } finally {
      setBusy(false);
    }
  };

  const missingContact = channel === 'email' ? !lead.email : !lead.phone;
  let directPhoneUrl = '';
  try { directPhoneUrl = crmCommunicationUrl('call', lead, '', ''); } catch { /* Invalid contacts are handled by the server. */ }

  return (
    <section className={styles.communications} aria-labelledby="communication-title">
      <div className={styles.drawerSectionTitle}><MessageCircle size={17} /><strong id="communication-title">Contact customer</strong></div>
      <div className={styles.quickActions} aria-label="Contact channel">
        {([{ value: 'call', label: 'Phone', icon: Phone }, { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }, { value: 'email', label: 'Email', icon: Mail }] as const).map(({ value, label, icon: Icon }) => (
          <button key={value} type="button" aria-pressed={channel === value} disabled={busy} onClick={() => { setChannel(value); setNotice(''); setLaunchUrl(''); }}><Icon size={17} /> {label}</button>
        ))}
      </div>
      <form onSubmit={submit} className={styles.communicationForm}>
        <p className={styles.contactRecipient}>To: <strong>{channel === 'email' ? lead.email || 'Email not added' : lead.phone || 'Phone not added'}</strong></p>
        {channel === 'call' && <>
          <label><span>Call using</span><select value={callMode} disabled={busy} onChange={event => { setCallMode(event.target.value as 'device' | 'crm'); setNotice(''); setLaunchUrl(''); }}><option value="device">My device dialer</option><option value="crm" disabled={!phoneCalling}>CRM callback (Plivo){!phoneCalling ? ' — setup required' : ''}</option></select></label>
          {!phoneCalling && <p className={styles.inlineWarning}>CRM calling needs a connected Plivo account and your registered callback mobile. Contact the administrator to activate it.</p>}
        </>}
        {channel !== 'call' && <>
          <label><span>Message template</span><select value={template} onChange={(event) => applyTemplate(event.target.value)} disabled={busy}><option value="requirements">Ask about requirements</option><option value="quotation">Enquiry follow-up</option><option value="demo">Arrange a discussion</option><option value="custom">Custom message</option></select></label>
          {channel === 'email' && <>
            <label><span>Send using</span><select value={emailMode} onChange={(event) => { setEmailMode(event.target.value as typeof emailMode); setNotice(''); setLaunchUrl(''); }} disabled={busy}><option value="gmail">Gmail in browser</option><option value="outlook">Outlook in browser</option><option value="app">My email app</option>{emailSending && <option value="crm">CRM email server</option>}</select></label>
            <label><span>Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} required disabled={busy} /></label>
          </>}
          <label><span>Message</span><textarea rows={5} value={body} onChange={(event) => { setBody(event.target.value); setTemplate('custom'); }} maxLength={4000} required disabled={busy} /></label>
        </>}
        <p className={styles.communicationHint}>{channel === 'call'
          ? callMode === 'crm' ? 'The CRM calls your registered mobile first. Answer to connect to this customer; provider call charges apply.' : 'Use your mobile or an installed calling app. On a desktop without a calling app, the dialer cannot place a call.'
          : channel === 'whatsapp'
            ? 'Opens WhatsApp with your draft. Review and send the message in WhatsApp.'
            : emailMode === 'crm'
              ? 'Sends this email through the configured company email server. Server acceptance does not confirm delivery.'
              : `Opens ${emailMode === 'gmail' ? 'Gmail' : emailMode === 'outlook' ? 'Outlook' : 'your email app'} with this draft. Review and send it there.`}</p>
        {channel === 'call' && directPhoneUrl && <div className={styles.quickActions}><a className="btn btn-outline btn-sm" href={directPhoneUrl}>Dial directly</a><button type="button" onClick={() => void navigator.clipboard.writeText(directPhoneUrl.slice(4)).then(() => toast.success('Phone number copied')).catch(() => toast.error('Please copy the number shown above.'))}>Copy number</button></div>}
        {missingContact && <p className={styles.inlineWarning}>Add and save the customer’s {channel === 'email' ? 'email address' : 'phone number with country code'} first.</p>}
        <button className="btn btn-primary btn-sm" disabled={busy || missingContact}>{channel === 'email' && emailMode === 'crm' ? <Send size={15} /> : <ExternalLink size={15} />}{busy ? 'Preparing…' : channel === 'call' ? callMode === 'crm' ? 'Call from CRM' : 'Open dialer' : channel === 'whatsapp' ? 'Open WhatsApp' : emailMode === 'crm' ? 'Send email from CRM' : emailMode === 'gmail' ? 'Open Gmail draft' : emailMode === 'outlook' ? 'Open Outlook draft' : 'Open email app'}</button>
        {channel === 'call' && callMode === 'crm' && callRequested && <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => { requestIds.delete(callFingerprint); setCallRequested(false); setNotice('Ready for a new call. Make sure the previous call has ended before clicking Call from CRM.'); }}>Prepare a new call</button>}
        {notice && <p className={styles.communicationNotice} role="status">{notice}</p>}
        {launchUrl && <a className={styles.continueLink} href={launchUrl} target={launchUrl.startsWith('https:') ? '_blank' : undefined} rel="noopener noreferrer">{channel === 'call' ? 'Open dialer again' : channel === 'whatsapp' ? 'Continue to WhatsApp' : 'Continue to email'} <ExternalLink size={13} /></a>}
      </form>
    </section>
  );
}
