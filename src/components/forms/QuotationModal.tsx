'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProductData } from '@/lib/data';
import PhoneField from '@/components/forms/PhoneField';
import SpamShieldFields from '@/components/forms/SpamShieldFields';
import { DEFAULT_PHONE_COUNTRY, buildPhoneValue, getPhoneValidationMessage } from '@/lib/phone';
import { createSpamShieldPayload } from '@/lib/spam-shield';
import { getAttributionPayload } from '@/lib/attribution';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { X } from 'lucide-react';

type Props = { products: ProductData[]; open: boolean; onClose: () => void };

export default function QuotationModal({ products, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [spam, setSpam] = useState(createSpamShieldPayload);
  const selectedProduct = products.find((product) => product.slug === selectedSlug);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    setSent(false);
    onClose();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phoneError = getPhoneValidationMessage(phoneCountry, phoneNumber);
    if (phoneError) {
      window.alert(phoneError);
      return;
    }
    setLoading(true);
    const dimensions = ['width', 'height', 'depth'].map((key) => [key, String(form.get(key) || '').trim()]).filter(([, value]) => value);
    const dimensionUnit = String(form.get('dimensionUnit') || 'mm');
    const notes = String(form.get('notes') || '').trim();
    const message = [
      selectedProduct ? `Machine interest: ${selectedProduct.title}` : 'Machine interest: Help me choose a machine',
      String(form.get('product') || '').trim() ? `Product to pack: ${String(form.get('product')).trim()}` : '',
      dimensions.length ? `Product dimensions: ${dimensions.map(([key, value]) => `${key} ${value} ${dimensionUnit}`).join(', ')}` : '',
      String(form.get('output') || '').trim() ? `Required output: ${String(form.get('output')).trim()}` : '',
      String(form.get('location') || '').trim() ? `Delivery location: ${String(form.get('location')).trim()}` : '',
      notes ? `Additional requirements: ${notes}` : '',
      `Landing page: ${window.location.pathname}`,
    ].filter(Boolean).join('\n');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(form.get('name') || ''), email: String(form.get('email') || ''),
          phone: buildPhoneValue(phoneCountry, phoneNumber), company: String(form.get('company') || ''),
          machineInterest: selectedProduct?.title || 'Help me choose a machine', productSlug: selectedProduct?.slug || '',
          categorySlug: selectedProduct?.categorySlug || '', message, source: 'header-quotation-modal',
          attribution: getAttributionPayload(), website: spam.website, formStartedAt: spam.formStartedAt,
          turnstileToken: spam.turnstileToken,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'Could not send enquiry. Please try again.');
      if (result?.id) trackAnalyticsEvent('generate_lead', { surface: 'quotation-modal', metadata: { product_slug: selectedProduct?.slug || '' } });
      setSent(true);
      setSpam(createSpamShieldPayload());
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="quotation-dialog" aria-labelledby="quotation-dialog-title" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === dialogRef.current) close(); }}>
      <div className="quotation-dialog__panel">
        <button type="button" className="quotation-dialog__close" onClick={close} aria-label="Close quotation form"><X size={20} /></button>
        {sent ? <div role="status"><h2 id="quotation-dialog-title">Enquiry received</h2><p>Our team will review your machine and product details, then contact you to discuss a suitable configuration and quotation.</p><button type="button" className="btn btn-primary" onClick={close}>Done</button></div> : <>
          <h2 id="quotation-dialog-title">Request a machine quotation</h2>
          <p>Choose a machine or ask us to recommend one. Product dimensions are optional; our team can discuss them with you.</p>
          <form className="quotation-dialog__form" onSubmit={submit}>
            <SpamShieldFields honeypotValue={spam.website} formStartedAt={spam.formStartedAt} turnstileToken={spam.turnstileToken} onHoneypotChange={(website) => setSpam((current) => ({ ...current, website }))} onTurnstileTokenChange={(turnstileToken) => setSpam((current) => ({ ...current, turnstileToken }))} />
            <label>Name *<input className="form-input" name="name" autoComplete="name" required maxLength={120} /></label>
            <label>Email *<input className="form-input" name="email" type="email" autoComplete="email" required maxLength={200} /></label>
            <PhoneField label="Phone *" countryCode={phoneCountry} phoneNumber={phoneNumber} required onCountryCodeChange={setPhoneCountry} onPhoneNumberChange={setPhoneNumber} />
            <label>Company<input className="form-input" name="company" autoComplete="organization" maxLength={160} /></label>
            <label>Machine *<select className="form-input" required value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)}><option value="" disabled>Select a machine</option><option value="__help__">Help me choose a machine</option>{products.map((product) => <option key={product.slug} value={product.slug}>{product.title}</option>)}</select></label>
            <label>Product to pack<input className="form-input" name="product" placeholder="e.g. bottles, pouches, cartons" maxLength={200} /></label>
            <fieldset className="quotation-dialog__dimensions"><legend>Product dimensions (optional)</legend><div className="quotation-dialog__dimension-fields"><input className="form-input" name="width" type="number" min="0.01" step="any" inputMode="decimal" placeholder="Width" aria-label="Product width" /><input className="form-input" name="height" type="number" min="0.01" step="any" inputMode="decimal" placeholder="Height" aria-label="Product height" /><input className="form-input" name="depth" type="number" min="0.01" step="any" inputMode="decimal" placeholder="Length/depth" aria-label="Product length or depth" /><select className="form-input" name="dimensionUnit" aria-label="Dimension unit"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inches</option></select></div></fieldset>
            <label>Required output<input className="form-input" name="output" placeholder="e.g. packs per minute" maxLength={100} /></label>
            <label>Delivery city/state *<input className="form-input" name="location" autoComplete="address-level2" required maxLength={200} /></label>
            <label>Additional requirements<textarea className="form-input" name="notes" rows={3} maxLength={3000} placeholder="Packaging material, pack style, or other details" /></label>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send enquiry'}</button>
            <small>We use your details to respond to this enquiry. See our <a href="/privacy-policy">Privacy Policy</a>.</small>
          </form>
        </>}
      </div>
    </dialog>
  );
}
