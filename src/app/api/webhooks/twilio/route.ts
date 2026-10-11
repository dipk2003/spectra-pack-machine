import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { ingestProviderEvents } from '@/lib/crm-integrations';
import { parseTwilioEvent, readWebhookBody } from '@/lib/provider-webhooks';
import { CRM_PRIVATE_HEADERS } from '@/lib/crm-http';

export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const secret = process.env.TWILIO_AUTH_TOKEN;
  const account = process.env.TWILIO_ACCOUNT_SID;
  const callback = process.env.TWILIO_WEBHOOK_URL;
  if (!secret || !account || !callback) return new NextResponse('Integration not configured', { status: 503, headers: CRM_PRIVATE_HEADERS });
  if (!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return new NextResponse('Unsupported payload', { status: 415, headers: CRM_PRIVATE_HEADERS });
  let raw: string;
  try { raw = await readWebhookBody(req); }
  catch { return new NextResponse('Payload too large', { status: 413, headers: CRM_PRIVATE_HEADERS }); }
  const form = new URLSearchParams(raw);
  if (Array.from(form.keys()).some(key => form.getAll(key).length !== 1)) return new NextResponse('Ambiguous payload', { status: 400, headers: CRM_PRIVATE_HEADERS });
  const params = Object.fromEntries(form);
  // Use the configured public URL, not an untrusted Host/Forwarded header.
  if (!twilio.validateRequest(secret, req.headers.get('x-twilio-signature') || '', callback, params) || params.AccountSid !== account) {
    return new NextResponse('Signature rejected', { status: 403, headers: CRM_PRIVATE_HEADERS });
  }
  const event = parseTwilioEvent(params);
  try {
    if (event) await ingestProviderEvents([event]);
    return new NextResponse(null, { status: 204, headers: CRM_PRIVATE_HEADERS });
  } catch { return new NextResponse('Storage unavailable; retry delivery', { status: 503, headers: CRM_PRIVATE_HEADERS }); }
}
