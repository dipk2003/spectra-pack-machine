import { randomBytes } from 'crypto';
import { COMPANY_INFO } from './data';
import { sendEmail } from './email';
import { getSiteOrigin } from './runtime-config';

const SITE_ORIGIN = getSiteOrigin();
const MEETING_BASE_URL = (process.env.MEETING_BASE_URL || 'https://meet.jit.si').replace(/\/$/, '');
const OWNER_NOTIFICATION_EMAIL =
  (process.env.OWNER_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || COMPANY_INFO.email[0] || '').trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeMultilineHtml = (value: string) => escapeHtml(value).replace(/\n/g, '<br />');

const safeHref = (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return '#';
  }

  if (
    normalized.startsWith('/') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  ) {
    return escapeHtml(normalized);
  }

  return '#';
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const toAbsoluteUrl = (value: string) =>
  value.startsWith('http') ? value : `${SITE_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;

type DetailRow = {
  label: string;
  value?: string;
  valueHtml?: string;
};

const buildDetailRows = (rows: DetailRow[]) => {
  const visibleRows = rows.filter((row) => row.valueHtml || row.value);

  if (visibleRows.length === 0) {
    return '';
  }

  return `
    <div style="margin:20px 0;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#ffffff;">
      ${visibleRows
        .map(
          (row, index) => `
            <div style="padding:14px 18px;${index > 0 ? 'border-top:1px solid #e2e8f0;' : ''}">
              <div style="margin:0 0 6px;font-size:11px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-weight:700;">${escapeHtml(row.label)}</div>
              <div style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;font-weight:600;">${row.valueHtml || escapeMultilineHtml(row.value || '')}</div>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
};

const buildPlainDetails = (rows: Array<{ label: string; value: string }>) =>
  rows
    .filter((row) => row.value)
    .map((row) => `${row.label}: ${row.value}`)
    .join('\n');

const formatLeadSourceLabel = (source: string) => {
  const normalized = source.trim().toLowerCase();

  if (normalized === 'homepage-lead-magnet') return 'Homepage popup';
  if (normalized === 'contact') return 'Contact form';
  if (normalized === 'chatbot') return 'Chatbot';
  if (normalized.startsWith('product-')) return 'Product enquiry';

  return source
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const wrapEmail = (title: string, intro: string, body: string, cta?: { label: string; href: string }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#f8fafc;padding:24px;">
    <div style="width:min(100%,calc(20rem + 22.222vw));margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
      <div style="padding:28px 28px 18px;background:#0a1628;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#f59e0b;font-weight:700;">Spectra Pack Machines</div>
        <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px;">${escapeHtml(intro)}</p>
        ${body}
        ${
          cta
            ? `<p style="margin:24px 0 0;"><a href="${safeHref(cta.href)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(cta.label)}</a></p>`
            : ''
        }
        <p style="margin:24px 0 0;color:#475569;">Regards,<br />${escapeHtml(COMPANY_INFO.name)}<br />${escapeHtml(COMPANY_INFO.phone[0])} | ${escapeHtml(COMPANY_INFO.email[0])}</p>
      </div>
    </div>
  </div>
`;

export function buildMeetingLink(input: {
  name: string;
  date: string;
  time: string;
}) {
  const roomName = [
    'spectra-pack',
    input.date.replace(/[^0-9]/g, ''),
    input.time.toLowerCase().replace(/[^a-z0-9]/g, ''),
    slugify(input.name).slice(0, 20),
    randomBytes(3).toString('hex'),
  ]
    .filter(Boolean)
    .join('-');

  return `${MEETING_BASE_URL}/${roomName}`;
}

export async function sendCatalogEmail(input: {
  email: string;
  name: string;
  machineInterest?: string;
  catalogPath: string;
}) {
  const catalogUrl = toAbsoluteUrl(input.catalogPath);
  const safeCatalogUrl = escapeHtml(catalogUrl);
  const machineLine = input.machineInterest
    ? `<p style="margin:0 0 16px;">Requested machine interest: <strong>${escapeHtml(input.machineInterest)}</strong></p>`
    : '';

  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: 'Your Spectra Pack catalog is ready',
    text: `Hi ${input.name}, your Spectra Pack catalog is ready: ${catalogUrl}`,
    html: wrapEmail(
      'Your catalog is ready',
      `Hi ${input.name}, thanks for sharing your requirement. We have sent the Spectra Pack catalog link below and our team will get back to you shortly.`,
      `
        ${machineLine}
        <p style="margin:0 0 16px;">Use the catalog to review machine families, then reply to this email or call our team for the right recommendation.</p>
        <p style="margin:0 0 16px;">We have also shared your enquiry with the Spectra Pack team so they can follow up with the right machine guidance.</p>
        <p style="margin:0;"><strong>Catalog link:</strong><br /><a href="${safeHref(catalogUrl)}" style="color:#2563eb;">${safeCatalogUrl}</a></p>
      `,
      { label: 'Open Catalog', href: catalogUrl },
    ),
  });
}

export async function sendLeadThankYouEmail(input: {
  email: string;
  name: string;
  machineInterest?: string;
}) {
  const machineLine = input.machineInterest
    ? `<p style="margin:0 0 16px;">We have noted your interest in <strong>${escapeHtml(input.machineInterest)}</strong>.</p>`
    : '';

  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: 'Thank you for contacting Spectra Pack Machines',
    text: `Hi ${input.name}, thank you for contacting Spectra Pack Machines. Our team will get back to you soon.`,
    html: wrapEmail(
      'Thank you for contacting us',
      `Hi ${input.name}, we have received your enquiry and our team will get back to you shortly.`,
      `
        ${machineLine}
        <p style="margin:0 0 16px;">If your requirement is urgent, you can also call us directly on <strong>${COMPANY_INFO.phone[0]}</strong>.</p>
        <p style="margin:0;">We usually respond with the next steps, catalog guidance, or a machine recommendation within business hours.</p>
      `,
      { label: 'Call Our Team', href: `tel:${COMPANY_INFO.phone[0].replace(/\s+/g, '')}` },
    ),
  });
}

export async function sendContactThankYouEmail(input: {
  email: string;
  name: string;
}) {
  return sendLeadThankYouEmail(input);
}

export async function sendLeadOwnerNotificationEmail(input: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  machineInterest?: string;
  message: string;
  source: string;
}) {
  const sourceLabel = formatLeadSourceLabel(input.source);
  const detailRows = buildDetailRows([
    { label: 'Source', value: sourceLabel },
    { label: 'Customer Name', value: input.name },
    { label: 'Email', value: input.email },
    { label: 'Phone', value: input.phone },
    { label: 'Company', value: input.company || '' },
    { label: 'Machine Interest', value: input.machineInterest || '' },
  ]);

  return sendEmail({
    to: OWNER_NOTIFICATION_EMAIL,
    replyTo: input.email,
    subject: `New website enquiry from ${input.name} | ${sourceLabel}`,
    text: `A new website enquiry has been submitted.\n\n${buildPlainDetails([
      { label: 'Source', value: sourceLabel },
      { label: 'Customer Name', value: input.name },
      { label: 'Email', value: input.email },
      { label: 'Phone', value: input.phone },
      { label: 'Company', value: input.company || '' },
      { label: 'Machine Interest', value: input.machineInterest || '' },
      { label: 'Customer Message', value: input.message },
    ])}`,
    html: wrapEmail(
      'New website enquiry received',
      `A new enquiry has been submitted on the website via ${sourceLabel}.`,
      `
        ${detailRows}
        <div style="margin:0;border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#f8fafc;">
          <div style="margin:0 0 8px;font-size:11px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-weight:700;">Customer Message</div>
          <div style="margin:0;font-size:15px;line-height:1.7;color:#0f172a;">${escapeMultilineHtml(input.message)}</div>
        </div>
      `,
      { label: 'Reply to Customer', href: `mailto:${input.email}` },
    ),
  });
}

export async function sendMeetingScheduledEmail(input: {
  email: string;
  name: string;
  date: string;
  time: string;
  meetingLink: string;
}) {
  const safeDate = escapeHtml(input.date);
  const safeTime = escapeHtml(input.time);
  const safeMeetingLink = escapeHtml(input.meetingLink);

  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: 'Your Spectra Pack meeting link',
    text: `Hi ${input.name}, your meeting is scheduled for ${input.date} at ${input.time}. Join here: ${input.meetingLink}`,
    html: wrapEmail(
      'Your meeting has been scheduled',
      `Hi ${input.name}, your Spectra Pack meeting request has been scheduled.`,
      `
        <p style="margin:0 0 16px;"><strong>Date:</strong> ${safeDate}<br /><strong>Time:</strong> ${safeTime}</p>
        <p style="margin:0 0 16px;">Use the meeting link below at the scheduled time. The same link is available to our admin team as well.</p>
        <p style="margin:0;"><strong>Meeting link:</strong><br /><a href="${safeHref(input.meetingLink)}" style="color:#2563eb;">${safeMeetingLink}</a></p>
      `,
      { label: 'Join Meeting', href: input.meetingLink },
    ),
  });
}

export async function sendMeetingOwnerNotificationEmail(input: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  machineInterest?: string;
  date: string;
  time: string;
  message?: string;
  meetingLink: string;
}) {
  const detailRows = buildDetailRows([
    { label: 'Customer Name', value: input.name },
    { label: 'Email', value: input.email },
    { label: 'Phone', value: input.phone },
    { label: 'Company', value: input.company || '' },
    { label: 'Machine Interest', value: input.machineInterest || '' },
    { label: 'Meeting Date', value: input.date },
    { label: 'Meeting Time', value: input.time },
    {
      label: 'Meeting Link',
      valueHtml: `<a href="${safeHref(input.meetingLink)}" style="color:#2563eb;">${escapeHtml(input.meetingLink)}</a>`,
    },
  ]);
  const message = input.message?.trim() || 'No additional message provided.';

  return sendEmail({
    to: OWNER_NOTIFICATION_EMAIL,
    replyTo: input.email,
    subject: `New meeting request from ${input.name} | ${input.date} ${input.time}`,
    text: `A new meeting request has been submitted.\n\n${buildPlainDetails([
      { label: 'Customer Name', value: input.name },
      { label: 'Email', value: input.email },
      { label: 'Phone', value: input.phone },
      { label: 'Company', value: input.company || '' },
      { label: 'Machine Interest', value: input.machineInterest || '' },
      { label: 'Meeting Date', value: input.date },
      { label: 'Meeting Time', value: input.time },
      { label: 'Meeting Link', value: input.meetingLink },
      { label: 'Discussion Notes', value: message },
    ])}`,
    html: wrapEmail(
      'New meeting request received',
      `A customer has scheduled a meeting on the website.`,
      `
        ${detailRows}
        <div style="margin:0;border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#f8fafc;">
          <div style="margin:0 0 8px;font-size:11px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-weight:700;">Discussion Notes</div>
          <div style="margin:0;font-size:15px;line-height:1.7;color:#0f172a;">${escapeMultilineHtml(message)}</div>
        </div>
      `,
      { label: 'Reply to Customer', href: `mailto:${input.email}` },
    ),
  });
}

export async function sendMeetingUpdateEmail(input: {
  email: string;
  name: string;
  date: string;
  time: string;
  meetingLink: string;
  status: string;
  adminNotes?: string;
}) {
  const noteBlock = input.adminNotes
    ? `<p style="margin:16px 0 0;"><strong>Admin note:</strong><br />${escapeHtml(input.adminNotes)}</p>`
    : '';
  const statusLabel = input.status.charAt(0).toUpperCase() + input.status.slice(1);
  const safeStatusLabel = escapeHtml(statusLabel);
  const safeMeetingLink = escapeHtml(input.meetingLink);

  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: `Meeting ${statusLabel} | Spectra Pack Machines`,
    text: `Hi ${input.name}, your meeting status is now ${statusLabel}. Join here if applicable: ${input.meetingLink}`,
    html: wrapEmail(
      `Meeting ${statusLabel}`,
      `Hi ${input.name}, your meeting request for ${input.date} at ${input.time} has been updated.`,
      `
        <p style="margin:0 0 16px;"><strong>Status:</strong> ${safeStatusLabel}</p>
        <p style="margin:0 0 16px;"><strong>Meeting link:</strong><br /><a href="${safeHref(input.meetingLink)}" style="color:#2563eb;">${safeMeetingLink}</a></p>
        ${noteBlock}
      `,
      { label: 'Open Meeting Link', href: input.meetingLink },
    ),
  });
}
