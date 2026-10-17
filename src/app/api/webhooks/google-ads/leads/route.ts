import { NextRequest, NextResponse } from 'next/server';
import { secureEqual, readWebhookBody } from '@/lib/provider-webhooks';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CRM_PRIVATE_HEADERS } from '@/lib/crm-http';

export const dynamic = 'force-dynamic';

const text = (value: unknown, limit = 500) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit) : '';
const fail = (status: number, message: string) => new NextResponse(message, { status, headers: CRM_PRIVATE_HEADERS });

export async function POST(req: NextRequest) {
  const expectedKey = process.env.GOOGLE_ADS_LEAD_WEBHOOK_KEY || '';
  if (!expectedKey) return fail(503, 'Google Ads lead webhook is not configured');
  if (!req.headers.get('content-type')?.includes('application/json')) return fail(415, 'Unsupported payload');

  let payload: Record<string, unknown>;
  let raw: string;
  try { raw = await readWebhookBody(req); }
  catch { return fail(413, 'Payload too large'); }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(400, 'Invalid JSON payload');
    payload = parsed as Record<string, unknown>;
  } catch { return fail(400, 'Invalid JSON payload'); }
  if (!secureEqual(text(payload.google_key, 500), expectedKey)) return fail(403, 'Webhook key rejected');
  const externalId = text(payload.lead_id, 200);
  if (!externalId) return fail(400, 'Lead ID is required');
  if (payload.is_test === true) return NextResponse.json({ received: true, test: true }, { headers: CRM_PRIVATE_HEADERS });

  const columns = Array.isArray(payload.user_column_data) ? payload.user_column_data : [];
  const values = new Map<string, string>();
  for (const raw of columns) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const item = raw as Record<string, unknown>;
    const key = text(item.column_id || item.column_name, 120).toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const value = text(item.string_value || item.column_value, 1000);
    if (key && value) values.set(key, value);
  }
  const fullName = values.get('full_name') || [values.get('first_name'), values.get('last_name')].filter(Boolean).join(' ');
  const email = values.get('email') || '';
  const phone = values.get('phone_number') || values.get('phone') || '';
  if (!fullName || (!email && !phone)) return fail(400, 'Lead must include a name and an email or phone number');
  const excluded = new Set(['full_name', 'first_name', 'last_name', 'email', 'phone', 'phone_number', 'company_name', 'company', 'machine_interest']);
  const extra = Array.from(values.entries()).filter(([key]) => !excluded.has(key)).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`);
  const { data, error } = await getSupabaseAdmin().rpc('crm_ingest_external_lead', {
    p_provider: 'google-ads', p_external_id: externalId,
    p_lead: {
      name: fullName, email, phone,
      company: values.get('company_name') || values.get('company') || '',
      machineInterest: values.get('machine_interest') || '',
      campaignId: text(payload.campaign_id, 160), formId: text(payload.form_id, 160),
      message: [`Google Ads lead form ${text(payload.form_id, 100)}; campaign ${text(payload.campaign_id, 100)}.`, ...extra].join('\n').slice(0, 4000),
    },
  });
  if (error || !data) return fail(503, 'Lead storage unavailable; retry delivery');
  return NextResponse.json({ received: true }, { headers: CRM_PRIVATE_HEADERS });
}
