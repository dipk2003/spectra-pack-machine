import { NextRequest, NextResponse } from 'next/server';
import {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventName,
} from '@/lib/analytics';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
} from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 8 * 1024;
const MAX_PATH_LENGTH = 300;
const MAX_METADATA_KEYS = 14;

const EVENT_NAME_SET = new Set<string>(ANALYTICS_EVENT_NAMES);
const EVENT_CATEGORIES: Record<AnalyticsEventName, string> = {
  page_view: 'engagement',
  generate_lead: 'conversion',
  meeting_booked: 'conversion',
  whatsapp_click: 'contact',
  phone_click: 'contact',
  email_click: 'contact',
  catalog_download: 'engagement',
  chat_open: 'engagement',
  chat_message: 'engagement',
};

const ALLOWED_METADATA: Record<
  string,
  { type: 'string' | 'number' | 'boolean'; maxLength?: number }
> = {
  surface: { type: 'string', maxLength: 80 },
  product_slug: { type: 'string', maxLength: 120 },
  category_slug: { type: 'string', maxLength: 120 },
  lead_source: { type: 'string', maxLength: 100 },
  link_type: { type: 'string', maxLength: 30 },
  chat_intent: { type: 'string', maxLength: 60 },
  record_id: { type: 'string', maxLength: 64 },
  consent_state: { type: 'string', maxLength: 10 },
  email_sent: { type: 'boolean' },
  owner_email_sent: { type: 'boolean' },
  meeting_link_available: { type: 'boolean' },
  message_length: { type: 'number' },
  first_referrer_host: { type: 'string', maxLength: 120 },
  last_referrer_host: { type: 'string', maxLength: 120 },
  utm_term: { type: 'string', maxLength: 160 },
  utm_content: { type: 'string', maxLength: 160 },
};

type AnalyticsRequestBody = {
  event_name?: unknown;
  path?: unknown;
  session_id?: unknown;
  surface?: unknown;
  metadata?: unknown;
  attribution?: unknown;
};

let hasLoggedStorageWarning = false;

const warnStorageOnce = (message: string) => {
  if (hasLoggedStorageWarning) return;
  hasLoggedStorageWarning = true;
  console.warn('Analytics event storage is unavailable:', message);
};

const noStoreHeaders = (headers: Record<string, string> = {}) => ({
  ...headers,
  'Cache-Control': 'no-store, max-age=0',
});

const jsonResponse = (
  payload: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = {},
) => NextResponse.json(payload, { status, headers: noStoreHeaders(headers) });

const cleanString = (value: unknown, maxLength: number) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
    : '';

const cleanSlugLike = (value: string) =>
  /^[a-z0-9][a-z0-9._:/ -]*$/i.test(value) ? value : '';

const containsPotentialPii = (value: string) =>
  /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value) || /\d{7,}/.test(value.replace(/[\s()+.-]/g, ''));

const cleanPath = (value: unknown) => {
  const candidate = cleanString(value, MAX_PATH_LENGTH);
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return '';

  try {
    return new URL(candidate, 'https://spectrapackmachines.invalid').pathname.slice(
      0,
      MAX_PATH_LENGTH,
    );
  } catch {
    return '';
  }
};

const cleanSessionId = (value: unknown) => {
  const candidate = cleanString(value, 64);
  return /^[a-z0-9_-]{8,64}$/i.test(candidate) ? candidate : '';
};

const cleanMetadata = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {} as Record<string, string | number | boolean>;
  }

  const result: Record<string, string | number | boolean> = {};
  for (const [key, rawValue] of Object.entries(value).slice(0, MAX_METADATA_KEYS)) {
    const rule = ALLOWED_METADATA[key];
    if (!rule || typeof rawValue !== rule.type) continue;

    if (rule.type === 'string') {
      const cleaned = cleanString(rawValue, rule.maxLength || 120);
      if (!cleaned || containsPotentialPii(cleaned)) continue;

      if (
        ['surface', 'product_slug', 'category_slug', 'lead_source', 'link_type', 'chat_intent'].includes(key) &&
        !cleanSlugLike(cleaned)
      ) {
        continue;
      }
      if (
        (key === 'first_referrer_host' || key === 'last_referrer_host') &&
        !/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(cleaned)
      ) {
        continue;
      }
      if (key === 'record_id' && !/^[a-z0-9_-]{1,64}$/i.test(cleaned)) continue;
      if (key === 'consent_state' && !/^(?:granted|denied|unset)$/.test(cleaned)) continue;
      result[key] = cleaned;
      continue;
    }

    if (rule.type === 'number') {
      const numeric = Number(rawValue);
      if (Number.isFinite(numeric) && numeric >= 0 && numeric <= 100000) {
        result[key] = Math.round(numeric);
      }
      continue;
    }

    result[key] = Boolean(rawValue);
  }

  return result;
};

const readAttribution = (value: unknown) => {
  const raw = value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const source = cleanString(raw.last_utm_source || raw.first_utm_source, 100);
  const medium = cleanString(raw.last_utm_medium || raw.first_utm_medium, 100);
  const campaign = cleanString(raw.last_utm_campaign || raw.first_utm_campaign, 160);
  const firstReferrerHost = cleanString(raw.first_referrer_host, 120).toLowerCase();
  const lastReferrerHost = cleanString(raw.last_referrer_host, 120).toLowerCase();
  const referrerHost = lastReferrerHost || firstReferrerHost;
  const safeReferrer = /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(referrerHost)
    ? referrerHost
    : '';

  return {
    source: cleanSlugLike(source) && !containsPotentialPii(source) ? source : safeReferrer || 'direct',
    medium: cleanSlugLike(medium) && !containsPotentialPii(medium) ? medium : safeReferrer ? 'referral' : 'none',
    campaign: cleanSlugLike(campaign) && !containsPotentialPii(campaign) ? campaign : '',
    metadata: {
      ...(firstReferrerHost && /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(firstReferrerHost)
        ? { first_referrer_host: firstReferrerHost }
        : {}),
      ...(lastReferrerHost && /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(lastReferrerHost)
        ? { last_referrer_host: lastReferrerHost }
        : {}),
      ...(cleanString(raw.last_utm_term || raw.first_utm_term, 160) &&
      !containsPotentialPii(cleanString(raw.last_utm_term || raw.first_utm_term, 160))
        ? { utm_term: cleanString(raw.last_utm_term || raw.first_utm_term, 160) }
        : {}),
      ...(cleanString(raw.last_utm_content || raw.first_utm_content, 160) &&
      !containsPotentialPii(cleanString(raw.last_utm_content || raw.first_utm_content, 160))
        ? { utm_content: cleanString(raw.last_utm_content || raw.first_utm_content, 160) }
        : {}),
    },
  };
};

const parseBody = async (req: NextRequest): Promise<AnalyticsRequestBody | null> => {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) return null;

  const contentLength = Number(req.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return null;

  const rawBody = await req.text();
  if (!rawBody || Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) return null;

  try {
    const parsed = JSON.parse(rawBody) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as AnalyticsRequestBody)
      : null;
  } catch {
    return null;
  }
};

export async function POST(req: NextRequest) {
  const rateLimit = await enforceMappedRateLimit(req);
  if (rateLimit.limitedResponse) return rateLimit.limitedResponse;

  const fetchSite = req.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    return jsonResponse({ error: 'Cross-site analytics requests are not accepted.' }, 403, rateLimit.headers);
  }

  const body = await parseBody(req);
  if (!body) {
    return jsonResponse({ error: 'Invalid analytics payload.' }, 400, rateLimit.headers);
  }

  const eventName = cleanString(body.event_name, 40);
  const path = cleanPath(body.path);
  const sessionId = cleanSessionId(body.session_id);
  if (!EVENT_NAME_SET.has(eventName) || !path || !sessionId) {
    return jsonResponse({ error: 'Invalid analytics event.' }, 400, rateLimit.headers);
  }

  const typedEventName = eventName as AnalyticsEventName;
  if (/^\/(?:admin|api)(?:\/|$)/i.test(path)) {
    return jsonResponse({ error: 'Only public website paths can be tracked.' }, 400, rateLimit.headers);
  }
  const attribution = readAttribution(body.attribution);
  const metadata: Record<string, string | number | boolean> = {
    ...cleanMetadata(body.metadata),
    ...attribution.metadata,
  };
  const surface = cleanString(body.surface, 80);
  if (surface && cleanSlugLike(surface)) metadata.surface = surface;

  if (!isSupabaseConfigured()) {
    return jsonResponse(
      { accepted: true, persisted: false },
      202,
      rateLimit.headers,
    );
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from('analytics_events')
      .insert({
        event_name: typedEventName,
        event_category: EVENT_CATEGORIES[typedEventName],
        path,
        session_id: sessionId,
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        metadata,
      });

    if (error) {
      warnStorageOnce(error.code || error.message);
      return jsonResponse(
        { accepted: true, persisted: false },
        202,
        rateLimit.headers,
      );
    }

    return jsonResponse({ accepted: true, persisted: true }, 202, rateLimit.headers);
  } catch (error) {
    warnStorageOnce(error instanceof Error ? error.message : 'unknown storage error');
    return jsonResponse(
      { accepted: true, persisted: false },
      202,
      rateLimit.headers,
    );
  }
}
