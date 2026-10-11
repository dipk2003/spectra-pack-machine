import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export function indiaPhone(value: unknown) {
  let digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (digits.length === 10) digits = `91${digits}`;
  return /^91\d{10}$/.test(digits) ? `+${digits}` : '';
}

export function plivoConfiguration(email: string) {
  const authId = process.env.PLIVO_AUTH_ID?.trim() || '';
  const authToken = process.env.PLIVO_AUTH_TOKEN?.trim() || '';
  const callerId = indiaPhone(process.env.PLIVO_CALLER_ID);
  let agentPhone = '';
  try {
    const agents = JSON.parse(process.env.CRM_CALL_AGENT_PHONES || '{}');
    agentPhone = indiaPhone(agents[email.toLowerCase()]);
  } catch { /* Configuration is incomplete. */ }
  let origin = '';
  try {
    const url = new URL(process.env.CRM_CALL_PUBLIC_URL || '');
    if (url.protocol === 'https:' && !url.username && !url.password) origin = url.origin;
  } catch { /* A public HTTPS callback is required. */ }
  return { authId, authToken, callerId, agentPhone, origin, configured: Boolean(authId && authToken && callerId && agentPhone && origin) };
}

/** Plivo V3 GET canonicalization: decoded, sorted query pairs followed by .nonce. */
export function verifyPlivoGet(url: string, headers: Headers, authToken: string) {
  const nonce = headers.get('x-plivo-signature-v3-nonce') || '';
  const signatures = headers.get('x-plivo-signature-v3') || '';
  if (!authToken || !nonce || nonce.length > 200 || !signatures || signatures.length > 1000) return false;
  const parsed = new URL(url);
  const query = Array.from(parsed.searchParams.entries()).sort(([a, av], [b, bv]) => a < b ? -1 : a > b ? 1 : av < bv ? -1 : av > bv ? 1 : 0).map(([key, value]) => `${key}=${value}`).join('&');
  const canonical = `${parsed.origin}${parsed.pathname}${query ? `?${query}` : ''}.${nonce}`;
  const expected = Buffer.from(createHmac('sha256', authToken).update(canonical).digest('base64'));
  return signatures.split(',').some(signature => {
    const candidate = Buffer.from(signature.trim());
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

export async function requestPlivoCall(config: ReturnType<typeof plivoConfiguration>, requestId: string) {
  const response = await fetch(`https://api.plivo.com/v1/Account/${encodeURIComponent(config.authId)}/Call/`, {
    method: 'POST', signal: AbortSignal.timeout(12_000), cache: 'no-store',
    headers: { Authorization: `Basic ${Buffer.from(`${config.authId}:${config.authToken}`).toString('base64')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.callerId, to: config.agentPhone,
      answer_url: `${config.origin}/api/webhooks/plivo/${requestId}`, answer_method: 'GET',
      ring_timeout: 30, time_limit: 1800 }),
  });
  if (!response.ok) return { status: response.status >= 500 ? 'uncertain' as const : 'failed' as const, providerId: '' };
  const result = await response.json();
  return typeof result.request_uuid === 'string'
    ? { status: 'queued' as const, providerId: result.request_uuid }
    : { status: 'uncertain' as const, providerId: '' };
}
