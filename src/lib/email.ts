import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_FROM_EMAIL =
  process.env.SMTP_FROM_EMAIL || process.env.ADMIN_EMAIL || '';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Spectra Pack Machines';

export const EMAIL_CONFIG_MESSAGE =
  'Email delivery is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL to enable automatic emails.';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export function isEmailConfigured() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM_EMAIL);
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      }),
    );
  }

  return transporterPromise;
}

export async function sendEmail(input: SendEmailInput) {
  if (!isEmailConfigured()) {
    console.warn(EMAIL_CONFIG_MESSAGE);
    return { sent: false, reason: EMAIL_CONFIG_MESSAGE } as const;
  }

  const transporter = await getTransporter();
  await transporter.sendMail({
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });

  return { sent: true } as const;
}
