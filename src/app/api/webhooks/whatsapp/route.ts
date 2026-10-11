import { NextRequest, NextResponse } from 'next/server';
import { ingestProviderEvents } from '@/lib/crm-integrations';
import { parseWhatsAppEvents, readWebhookBody, secureEqual, verifyMetaSignature } from '@/lib/provider-webhooks';
import { CRM_PRIVATE_HEADERS } from '@/lib/crm-http';

export const runtime = 'nodejs';
export async function GET(req: NextRequest) {
  const token = process.env.WHATSAPP_VERIFY_TOKEN || '';
  const params = req.nextUrl.searchParams;
  if (token && params.get('hub.mode') === 'subscribe' && secureEqual(params.get('hub.verify_token') || '', token)) {
    return new NextResponse(params.get('hub.challenge') || '', { headers: CRM_PRIVATE_HEADERS });
  }
  return new NextResponse('Verification rejected', { status: 403, headers: CRM_PRIVATE_HEADERS });
}
export async function POST(req: NextRequest) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!secret || !phoneId) return new NextResponse('Integration not configured', { status: 503, headers: CRM_PRIVATE_HEADERS });
  let raw: string;
  try { raw = await readWebhookBody(req); }
  catch { return new NextResponse('Payload too large', { status: 413, headers: CRM_PRIVATE_HEADERS }); }
  if (!verifyMetaSignature(raw, req.headers.get('x-hub-signature-256') || '', secret)) return new NextResponse('Signature rejected', { status: 403, headers: CRM_PRIVATE_HEADERS });
  let events;
  try { events = parseWhatsAppEvents(JSON.parse(raw), phoneId); }
  catch { return new NextResponse('Invalid payload', { status: 400, headers: CRM_PRIVATE_HEADERS }); }
  try {
    await ingestProviderEvents(events);
    return NextResponse.json({ received: true }, { headers: CRM_PRIVATE_HEADERS });
  } catch {
    // Return failure so the provider retries; never acknowledge an event that was lost.
    return new NextResponse('Storage unavailable; retry delivery', { status: 503, headers: CRM_PRIVATE_HEADERS });
  }
}
