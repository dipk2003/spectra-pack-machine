import { randomBytes } from 'crypto';
import { COMPANY_INFO } from './data';
import { sendEmail } from './email';

const SITE_ORIGIN = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
const MEETING_BASE_URL = (process.env.MEETING_BASE_URL || 'https://meet.jit.si').replace(/\/$/, '');

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const toAbsoluteUrl = (value: string) =>
  value.startsWith('http') ? value : `${SITE_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;

const wrapEmail = (title: string, intro: string, body: string, cta?: { label: string; href: string }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#f8fafc;padding:24px;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
      <div style="padding:28px 28px 18px;background:#0a1628;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#f59e0b;font-weight:700;">Spectra Pack Machines</div>
        <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">${title}</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px;">${intro}</p>
        ${body}
        ${
          cta
            ? `<p style="margin:24px 0 0;"><a href="${cta.href}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;">${cta.label}</a></p>`
            : ''
        }
        <p style="margin:24px 0 0;color:#475569;">Regards,<br />${COMPANY_INFO.name}<br />${COMPANY_INFO.phone[0]} | ${COMPANY_INFO.email[0]}</p>
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
  const machineLine = input.machineInterest
    ? `<p style="margin:0 0 16px;">Requested machine interest: <strong>${input.machineInterest}</strong></p>`
    : '';

  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: 'Your Spectra Pack catalog is ready',
    text: `Hi ${input.name}, your Spectra Pack catalog is ready: ${catalogUrl}`,
    html: wrapEmail(
      'Your catalog is ready',
      `Hi ${input.name}, thanks for sharing your requirement. We have sent the Spectra Pack catalog link below.`,
      `
        ${machineLine}
        <p style="margin:0 0 16px;">Use the catalog to review machine families, then reply to this email or call our team for the right recommendation.</p>
        <p style="margin:0;"><strong>Catalog link:</strong><br /><a href="${catalogUrl}" style="color:#2563eb;">${catalogUrl}</a></p>
      `,
      { label: 'Open Catalog', href: catalogUrl },
    ),
  });
}

export async function sendContactThankYouEmail(input: {
  email: string;
  name: string;
}) {
  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: 'Thank you for contacting Spectra Pack Machines',
    text: `Hi ${input.name}, thank you for contacting Spectra Pack Machines. Our team will get back to you soon.`,
    html: wrapEmail(
      'Thank you for contacting us',
      `Hi ${input.name}, we have received your message and our team will get back to you shortly.`,
      `
        <p style="margin:0 0 16px;">If your requirement is urgent, you can also call us directly on <strong>${COMPANY_INFO.phone[0]}</strong>.</p>
        <p style="margin:0;">We usually respond with the next steps, catalog guidance, or a machine recommendation within business hours.</p>
      `,
      { label: 'Call Our Team', href: `tel:${COMPANY_INFO.phone[0].replace(/\s+/g, '')}` },
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
  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: 'Your Spectra Pack meeting link',
    text: `Hi ${input.name}, your meeting is scheduled for ${input.date} at ${input.time}. Join here: ${input.meetingLink}`,
    html: wrapEmail(
      'Your meeting has been scheduled',
      `Hi ${input.name}, your Spectra Pack meeting request has been scheduled.`,
      `
        <p style="margin:0 0 16px;"><strong>Date:</strong> ${input.date}<br /><strong>Time:</strong> ${input.time}</p>
        <p style="margin:0 0 16px;">Use the meeting link below at the scheduled time. The same link is available to our admin team as well.</p>
        <p style="margin:0;"><strong>Meeting link:</strong><br /><a href="${input.meetingLink}" style="color:#2563eb;">${input.meetingLink}</a></p>
      `,
      { label: 'Join Meeting', href: input.meetingLink },
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
    ? `<p style="margin:16px 0 0;"><strong>Admin note:</strong><br />${input.adminNotes}</p>`
    : '';
  const statusLabel = input.status.charAt(0).toUpperCase() + input.status.slice(1);

  return sendEmail({
    to: input.email,
    replyTo: COMPANY_INFO.email[0],
    subject: `Meeting ${statusLabel} | Spectra Pack Machines`,
    text: `Hi ${input.name}, your meeting status is now ${statusLabel}. Join here if applicable: ${input.meetingLink}`,
    html: wrapEmail(
      `Meeting ${statusLabel}`,
      `Hi ${input.name}, your meeting request for ${input.date} at ${input.time} has been updated.`,
      `
        <p style="margin:0 0 16px;"><strong>Status:</strong> ${statusLabel}</p>
        <p style="margin:0 0 16px;"><strong>Meeting link:</strong><br /><a href="${input.meetingLink}" style="color:#2563eb;">${input.meetingLink}</a></p>
        ${noteBlock}
      `,
      { label: 'Open Meeting Link', href: input.meetingLink },
    ),
  });
}
