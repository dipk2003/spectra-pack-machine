const ATTRIBUTION_STORAGE_KEY = 'spectra-attribution-v1';
const ANALYTICS_CONSENT_STORAGE_KEY = 'spectra-analytics-consent-v1';
const ATTRIBUTION_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const VALUE_MAX_LENGTH = 160;

const CAMPAIGN_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
] as const;

type CampaignKey = (typeof CAMPAIGN_KEYS)[number];

export type AttributionTouch = Record<CampaignKey, string> & {
  landing_page: string;
  referrer_host: string;
  captured_at: string;
};

type StoredAttribution = {
  version: 1;
  first: AttributionTouch;
  last: AttributionTouch;
};

let inMemoryAttribution: StoredAttribution | null = null;

export type AttributionPayload = {
  attribution_version: '1';
  first_landing_page: string;
  first_referrer_host: string;
  first_utm_source: string;
  first_utm_medium: string;
  first_utm_campaign: string;
  first_utm_term: string;
  first_utm_content: string;
  first_gclid: string;
  first_gbraid: string;
  first_wbraid: string;
  first_msclkid: string;
  last_landing_page: string;
  last_referrer_host: string;
  last_utm_source: string;
  last_utm_medium: string;
  last_utm_campaign: string;
  last_utm_term: string;
  last_utm_content: string;
  last_gclid: string;
  last_gbraid: string;
  last_wbraid: string;
  last_msclkid: string;
};

const emptyCampaign = (): Record<CampaignKey, string> => ({
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_term: '',
  utm_content: '',
  gclid: '',
  gbraid: '',
  wbraid: '',
  msclkid: '',
});

const trimValue = (value: unknown, maxLength = VALUE_MAX_LENGTH) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
    : '';

const safePath = (value: unknown) => {
  const path = trimValue(value, 300);
  return path.startsWith('/') && !path.startsWith('//') ? path : '/';
};

const safeHost = (value: unknown) => {
  const host = trimValue(value, 120).toLowerCase();
  return /^[a-z0-9.-]+(?::\d{1,5})?$/.test(host) ? host : '';
};

const sanitizeTouch = (value: unknown): AttributionTouch | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const raw = value as Record<string, unknown>;
  const capturedAt = trimValue(raw.captured_at, 40);
  const capturedAtMs = Date.parse(capturedAt);
  if (!Number.isFinite(capturedAtMs)) return null;

  const campaign = emptyCampaign();
  CAMPAIGN_KEYS.forEach((key) => {
    campaign[key] = trimValue(raw[key]);
  });

  return {
    ...campaign,
    landing_page: safePath(raw.landing_page),
    referrer_host: safeHost(raw.referrer_host),
    captured_at: new Date(capturedAtMs).toISOString(),
  };
};

const readStoredAttribution = (): StoredAttribution | null => {
  if (typeof window === 'undefined') return null;

  try {
    if (window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) !== 'granted') {
      return null;
    }

    const raw = JSON.parse(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY) || 'null') as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

    const value = raw as Record<string, unknown>;
    const first = sanitizeTouch(value.first);
    const last = sanitizeTouch(value.last);
    if (value.version !== 1 || !first || !last) return null;

    if (Date.now() - Date.parse(last.captured_at) > ATTRIBUTION_MAX_AGE_MS) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }

    return { version: 1, first, last };
  } catch {
    return null;
  }
};

const readCurrentTouch = (): AttributionTouch => {
  const campaign = emptyCampaign();
  const params = new URLSearchParams(window.location.search);

  CAMPAIGN_KEYS.forEach((key) => {
    campaign[key] = trimValue(params.get(key));
  });

  let referrerHost = '';
  try {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer && referrer.host !== window.location.host) {
      referrerHost = safeHost(referrer.host);
    }
  } catch {
    referrerHost = '';
  }

  return {
    ...campaign,
    landing_page: safePath(window.location.pathname),
    referrer_host: referrerHost,
    captured_at: new Date().toISOString(),
  };
};

const hasInboundSignal = (touch: AttributionTouch) =>
  Boolean(
    touch.referrer_host ||
      CAMPAIGN_KEYS.some((key) => Boolean(touch[key])),
  );

const writeStoredAttribution = (value: StoredAttribution) => {
  try {
    if (window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) !== 'granted') {
      return;
    }
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Attribution remains available for the current call when storage is blocked.
  }
};

export function captureAttribution(): StoredAttribution | null {
  if (typeof window === 'undefined') return null;

  const current = readCurrentTouch();
  const stored = inMemoryAttribution || readStoredAttribution();
  const next: StoredAttribution = stored
    ? {
        ...stored,
        last: hasInboundSignal(current) ? current : stored.last,
      }
    : { version: 1, first: current, last: current };

  inMemoryAttribution = next;
  writeStoredAttribution(next);
  return next;
}

export function getAttributionPayload(): AttributionPayload | null {
  const attribution = inMemoryAttribution || readStoredAttribution() || captureAttribution();
  if (!attribution) return null;

  return {
    attribution_version: '1',
    first_landing_page: attribution.first.landing_page,
    first_referrer_host: attribution.first.referrer_host,
    first_utm_source: attribution.first.utm_source,
    first_utm_medium: attribution.first.utm_medium,
    first_utm_campaign: attribution.first.utm_campaign,
    first_utm_term: attribution.first.utm_term,
    first_utm_content: attribution.first.utm_content,
    first_gclid: attribution.first.gclid,
    first_gbraid: attribution.first.gbraid,
    first_wbraid: attribution.first.wbraid,
    first_msclkid: attribution.first.msclkid,
    last_landing_page: attribution.last.landing_page,
    last_referrer_host: attribution.last.referrer_host,
    last_utm_source: attribution.last.utm_source,
    last_utm_medium: attribution.last.utm_medium,
    last_utm_campaign: attribution.last.utm_campaign,
    last_utm_term: attribution.last.utm_term,
    last_utm_content: attribution.last.utm_content,
    last_gclid: attribution.last.gclid,
    last_gbraid: attribution.last.gbraid,
    last_wbraid: attribution.last.wbraid,
    last_msclkid: attribution.last.msclkid,
  };
}

export function clearStoredAttribution() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    // The current in-memory campaign context can still accompany a submitted lead.
  }
}
