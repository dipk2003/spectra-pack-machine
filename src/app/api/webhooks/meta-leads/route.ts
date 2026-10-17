import { NextRequest, NextResponse } from 'next/server';
import { readWebhookBody, secureEqual, verifyMetaSignature } from '@/lib/provider-webhooks';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CRM_PRIVATE_HEADERS } from '@/lib/crm-http';

export const dynamic = 'force-dynamic';

type MetaField = { name?: unknown; values?: unknown };
const text = (value: unknown, limit = 500) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit) : '';
const fail = (status: number, message: string) => new NextResponse(message, { status, headers: CRM_PRIVATE_HEADERS });

function fieldMap(input: unknown) {
  const fields = new Map<string, string>();
  if (!Array.isArray(input)) return fields;
  for (const raw of input as MetaField[]) {
    const name = text(raw?.name, 100).toLowerCase();
    const value = Array.isArray(raw?.values) ? text(raw.values[0], 1000) : '';
    if (name && value) fields.set(name, value);
  }
  return fields;
}

async function fetchMetaLead(leadgenId: string, token: string, version: string) {
  const url = new URL(`https://graph.facebook.com/${version}/${encodeURIComponent(leadgenId)}`);
  url.searchParams.set('fields', 'id,form_id,ad_id,field_data');
  url.searchParams.set('access_token', token);
  const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Meta could not return the lead.');
  return response.json() as Promise<Record<string, unknown>>;
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode') || '';
  const token = req.nextUrl.searchParams.get('hub.verify_token') || '';
  const challenge = req.nextUrl.searchParams.get('hub.challenge') || '';
  const expected = process.env.META_LEAD_WEBHOOK_VERIFY_TOKEN || '';
  if (mode !== 'subscribe' || !expected || !secureEqual(token, expected) || !challenge || challenge.length > 500) return fail(403, 'Webhook verification rejected');
  return new NextResponse(challenge, { status: 200, headers: { ...CRM_PRIVATE_HEADERS, 'Content-Type': 'text/plain' } });
}

export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET || '';
  const accessToken = process.env.META_LEADS_ACCESS_TOKEN || '';
  const version = process.env.META_GRAPH_VERSION || '';
  if (!appSecret || !accessToken || !/^v\d+\.\d+$/.test(version)) return fail(503, 'Meta lead webhook is not configured');

  let raw: string;
  try { raw = await readWebhookBody(req); }
  catch { return fail(413, 'Payload too large'); }
  if (!verifyMetaSignature(raw, req.headers.get('x-hub-signature-256') || '', appSecret)) return fail(403, 'Signature rejected');

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(400, 'Invalid JSON payload');
    payload = parsed as Record<string, unknown>;
  } catch { return fail(400, 'Invalid JSON payload'); }
  if (payload.object !== 'page') return NextResponse.json({ received: true }, { headers: CRM_PRIVATE_HEADERS });

  try {
    const db = getSupabaseAdmin();
    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const changes = Array.isArray((entry as Record<string, unknown>).changes) ? (entry as Record<string, unknown>).changes as unknown[] : [];
      for (const change of changes) {
        if (!change || typeof change !== 'object' || Array.isArray(change)) continue;
        const value = (change as Record<string, unknown>).value;
        if ((change as Record<string, unknown>).field !== 'leadgen' || !value || typeof value !== 'object' || Array.isArray(value)) continue;
        const leadgenId = text((value as Record<string, unknown>).leadgen_id, 200);
        if (!leadgenId) continue;
        const lead = await fetchMetaLead(leadgenId, accessToken, version);
        const fields = fieldMap(lead.field_data);
        const name = fields.get('full_name') || [fields.get('first_name'), fields.get('last_name')].filter(Boolean).join(' ');
        const email = fields.get('email') || '';
        const phone = fields.get('phone_number') || fields.get('phone') || '';
        if (!name || (!email && !phone)) throw new Error('Meta lead did not include a name and contact method.');
        const excluded = new Set(['full_name', 'first_name', 'last_name', 'email', 'phone', 'phone_number', 'company_name', 'company', 'machine_interest']);
        const extra = Array.from(fields.entries()).filter(([key]) => !excluded.has(key)).map(([key, fieldValue]) => `${key.replace(/_/g, ' ')}: ${fieldValue}`);
        const { error } = await db.rpc('crm_ingest_external_lead', {
          p_provider: 'meta-ads', p_external_id: leadgenId,
          p_lead: {
            name, email, phone, company: fields.get('company_name') || fields.get('company') || '',
            machineInterest: fields.get('machine_interest') || '',
            campaignId: '', formId: text(lead.form_id, 160),
            message: [`Meta lead form ${text(lead.form_id, 100)}; ad ${text(lead.ad_id, 100)}.`, ...extra].join('\n').slice(0, 4000),
          },
        });
        if (error) throw new Error('Lead storage unavailable.');
      }
    }
    return NextResponse.json({ received: true }, { headers: CRM_PRIVATE_HEADERS });
  } catch {
    return fail(503, 'Lead processing failed; retry delivery');
  }
}
