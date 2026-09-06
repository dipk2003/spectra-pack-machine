import type { CrmViewer } from './crm-types';

export const CRM_CONTACT_STATUSES = ['completed', 'attempted', 'not_applicable'] as const;
export type CrmContactStatus = (typeof CRM_CONTACT_STATUSES)[number];

export const canAccessCrmLead = (
  viewer: Pick<CrmViewer, 'userId' | 'canViewAllLeads'>,
  lead: { assigned_to: string | null },
) => viewer.canViewAllLeads || lead.assigned_to === viewer.userId;

export const isConfirmedCrmContact = (activityType: string, contactStatus: unknown) =>
  contactStatus === 'completed' &&
  ['call', 'whatsapp', 'email', 'meeting', 'site_visit'].includes(activityType);

export const isCrmUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

/** Browser cookie mutations need positive same-origin evidence and JSON. */
export const isTrustedCrmRequest = (headers: Headers, requestOrigin: string) => {
  if (headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return false;
  }
  const fetchSite = headers.get('sec-fetch-site')?.toLowerCase();
  if (fetchSite === 'cross-site' || fetchSite === 'same-site') return false;
  const origin = headers.get('origin');
  if (!origin) return fetchSite === 'same-origin';
  try {
    return new URL(origin).origin === requestOrigin;
  } catch {
    return false;
  }
};

export const crmCommunicationUrl = (
  channel: 'call' | 'whatsapp' | 'email',
  lead: { phone: string | null; email: string | null },
  subject: string,
  body: string,
) => {
  if (channel === 'email') {
    const email = lead.email?.trim() || '';
    if (!/^[^\s@<>;,?&#]+@[^\s@<>;,?&#]+\.[^\s@<>;,?&#]+$/.test(email)) {
      throw new Error('Add a valid email address to this lead first.');
    }
    return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  const rawPhone = lead.phone?.trim() || '';
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10 && !rawPhone.startsWith('+')) digits = `91${digits}`;
  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    throw new Error('Add a valid phone number with country code to this lead first.');
  }
  return channel === 'call'
    ? `tel:+${digits}`
    : `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
};
