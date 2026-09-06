import {
  captureAttribution,
  clearStoredAttribution,
  getAttributionPayload,
} from './attribution';

export const ANALYTICS_EVENT_NAMES = [
  'page_view',
  'generate_lead',
  'meeting_booked',
  'whatsapp_click',
  'phone_click',
  'email_click',
  'catalog_download',
  'chat_open',
  'chat_message',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsConsentState = 'granted' | 'denied' | 'unset';
export type AnalyticsMetadataValue = string | number | boolean;
export type AnalyticsMetadata = Record<string, AnalyticsMetadataValue>;

export type TrackAnalyticsOptions = {
  surface?: string;
  path?: string;
  metadata?: AnalyticsMetadata;
};

type DataLayerValue = Record<string, unknown> | IArguments;
type UetQueue = {
  push: (...args: unknown[]) => unknown;
};

declare global {
  interface Window {
    dataLayer?: DataLayerValue[];
    gtag?: (...args: unknown[]) => void;
    uetq?: UetQueue;
    __spectraAnalyticsInitialized?: boolean;
    __spectraGoogleTagJsInitialized?: boolean;
    __spectraGoogleAnalyticsConfigured?: boolean;
    __spectraGoogleAdsConfigured?: boolean;
  }
}

export const ANALYTICS_CONSENT_STORAGE_KEY = 'spectra-analytics-consent-v1';

const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() ||
  process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim() ||
  '';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || '';
const BING_UET_ID = process.env.NEXT_PUBLIC_BING_UET_TAG_ID?.trim() || '187271989';

const GOOGLE_ADS_LABELS: Partial<Record<AnalyticsEventName, string>> = {
  generate_lead:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_CONVERSION_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL?.trim() ||
    '',
  meeting_booked:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_MEETING_CONVERSION_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_MEETING_LABEL?.trim() ||
    '',
  whatsapp_click:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL?.trim() ||
    '',
  phone_click:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_LABEL?.trim() ||
    '',
  email_click:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CONVERSION_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_EMAIL_LABEL?.trim() ||
    '',
  catalog_download:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CATALOG_CONVERSION_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CATALOG_LABEL?.trim() ||
    '',
  chat_open:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CHAT_CONVERSION_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CHAT_LABEL?.trim() ||
    '',
};

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const GA_ID_PATTERN = /^G-[A-Z0-9]+$/i;
const ADS_ID_PATTERN = /^AW-\d+$/i;
const SESSION_STORAGE_KEY = 'spectra-analytics-session-v1';
const MAX_PATH_LENGTH = 300;

let inMemorySessionId = '';
let inMemoryConsent: AnalyticsConsentState | null = null;
const trackedConversions = new Set<string>();

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }
  return window.dataLayer;
};

const safePath = (value?: string) => {
  if (typeof window === 'undefined') return '/';
  const candidate = value || window.location.pathname || '/';
  try {
    const pathname = new URL(candidate, window.location.origin).pathname;
    return pathname.startsWith('/') && !pathname.startsWith('//')
      ? pathname.slice(0, MAX_PATH_LENGTH)
      : '/';
  } catch {
    return '/';
  }
};

const isPublicAnalyticsPath = (path: string) =>
  !/^\/(?:admin|api)(?:\/|$)/i.test(path);

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
};

export function getAnalyticsSessionId() {
  if (typeof window === 'undefined') return '';
  if (inMemorySessionId) return inMemorySessionId;

  try {
    const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY) || '';
    if (/^[a-z0-9_-]{8,64}$/i.test(stored)) {
      inMemorySessionId = stored;
      return stored;
    }

    inMemorySessionId = createSessionId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, inMemorySessionId);
  } catch {
    inMemorySessionId = createSessionId();
  }

  return inMemorySessionId;
}

export function readAnalyticsConsent(): AnalyticsConsentState {
  if (typeof window === 'undefined') return 'unset';
  if (inMemoryConsent !== null) return inMemoryConsent;

  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

const googleConsentPayload = (state: Exclude<AnalyticsConsentState, 'unset'>) => {
  const value = state === 'granted' ? 'granted' : 'denied';
  return {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    functionality_storage: 'granted',
    security_storage: 'granted',
  };
};

const updateBingConsent = (state: Exclude<AnalyticsConsentState, 'unset'>) => {
  window.uetq?.push('consent', 'update', {
    ad_storage: state === 'granted' ? 'granted' : 'denied',
  });
};

export function setAnalyticsConsent(state: Exclude<AnalyticsConsentState, 'unset'>) {
  if (typeof window === 'undefined') return;
  ensureDataLayer();
  inMemoryConsent = state;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, state);
  } catch {
    // Consent still applies for this page when persistent storage is blocked.
  }

  window.gtag?.('consent', 'update', googleConsentPayload(state));
  updateBingConsent(state);

  if (state === 'granted') {
    captureAttribution();
    initializeAnalytics();
    return;
  }

  clearStoredAttribution();
  inMemorySessionId = '';
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Consent is still denied when browser storage is unavailable.
  }
}

const appendGoogleScript = (id: string, src: string) => {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

const initializeBing = () => {
  if (!/^\d{1,20}$/.test(BING_UET_ID) || document.getElementById('spectra-bing-uet')) return;
  const queue: UetQueue = window.uetq || ([] as unknown[]);
  window.uetq = queue;
  queue.push('consent', 'default', { ad_storage: 'denied' });
  const script = document.createElement('script');
  script.id = 'spectra-bing-uet';
  script.async = true;
  script.src = `https://bat.bing.net/bat.js?ti=${BING_UET_ID}`;
  script.onload = () => {
    const UET = (window as unknown as { UET?: new (options: Record<string, unknown>) => UetQueue }).UET;
    if (!UET) return;
    window.uetq = new UET({ ti: BING_UET_ID, q: window.uetq, enableAutoSpaTracking: true, enableAutoConsent: false });
    updateBingConsent(readAnalyticsConsent() === 'granted' ? 'granted' : 'denied');
    if (readAnalyticsConsent() === 'granted') window.uetq.push('pageLoad');
  };
  document.head.appendChild(script);
};

export function initializeAnalytics() {
  if (typeof window === 'undefined') return;
  if (!isPublicAnalyticsPath(window.location.pathname)) return;

  const dataLayer = ensureDataLayer();
  if (!window.__spectraAnalyticsInitialized) {
    window.__spectraAnalyticsInitialized = true;
    window.gtag?.('consent', 'default', {
      ...googleConsentPayload('denied'),
      wait_for_update: 500,
    });
    window.gtag?.('set', 'ads_data_redaction', true);
    window.gtag?.('set', 'url_passthrough', true);
  }

  const consent = readAnalyticsConsent();
  if (consent !== 'unset') {
    window.gtag?.('consent', 'update', googleConsentPayload(consent));
    updateBingConsent(consent);
  }
  if (consent !== 'granted') return;
  initializeBing();

  if (GTM_ID_PATTERN.test(GTM_ID)) {
    if (!document.getElementById('spectra-google-tag-manager')) {
      dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      appendGoogleScript(
        'spectra-google-tag-manager',
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`,
      );
    }
    // In GTM mode, the container owns GA/Ads configuration and conversions.
    return;
  }

  const directTagId = GA_ID_PATTERN.test(GA_MEASUREMENT_ID)
    ? GA_MEASUREMENT_ID
    : ADS_ID_PATTERN.test(GOOGLE_ADS_ID)
      ? GOOGLE_ADS_ID
      : '';

  if (!directTagId) return;
  appendGoogleScript(
    'spectra-google-tag',
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(directTagId)}`,
  );
  if (!window.__spectraGoogleTagJsInitialized) {
    window.gtag?.('js', new Date());
    window.__spectraGoogleTagJsInitialized = true;
  }

  if (
    GA_ID_PATTERN.test(GA_MEASUREMENT_ID) &&
    !window.__spectraGoogleAnalyticsConfigured
  ) {
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
    window.__spectraGoogleAnalyticsConfigured = true;
  }
  if (ADS_ID_PATTERN.test(GOOGLE_ADS_ID) && !window.__spectraGoogleAdsConfigured) {
    window.gtag?.('config', GOOGLE_ADS_ID);
    window.__spectraGoogleAdsConfigured = true;
  }
}

const sendFirstPartyEvent = (payload: Record<string, unknown>) => {
  const body = JSON.stringify(payload);
  void fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    credentials: 'same-origin',
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt a public conversion flow.
  });
};

const sendGoogleEvent = (
  eventName: AnalyticsEventName,
  path: string,
  metadata: AnalyticsMetadata,
) => {
  const params = {
    page_path: path,
    page_location:
      typeof window === 'undefined' ? path : `${window.location.origin}${path}`,
    ...metadata,
  };

  if (GTM_ID_PATTERN.test(GTM_ID)) {
    ensureDataLayer().push({ event: eventName, ...params });
  } else {
    window.gtag?.('event', eventName, params);
  }

  const conversionLabel = GOOGLE_ADS_LABELS[eventName];
  if (
    !GTM_ID_PATTERN.test(GTM_ID) &&
    conversionLabel &&
    ADS_ID_PATTERN.test(GOOGLE_ADS_ID) &&
    /^[A-Za-z0-9_-]{2,100}$/.test(conversionLabel)
  ) {
    window.gtag?.('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
      page_path: path,
      ...(metadata.record_id ? { transaction_id: metadata.record_id } : {}),
    });
  }
};

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  options: TrackAnalyticsOptions = {},
) {
  if (typeof window === 'undefined') return;

  const path = safePath(options.path);
  if (!isPublicAnalyticsPath(path)) return;
  initializeAnalytics();
  const consentState = readAnalyticsConsent();
  if (consentState !== 'granted') return;

  if (eventName === 'generate_lead' || eventName === 'meeting_booked') {
    const recordId = options.metadata?.record_id;
    if (typeof recordId !== 'string' || !/^[a-z0-9_-]{8,64}$/i.test(recordId)) return;
    const key = `${eventName}:${recordId}`;
    if (trackedConversions.has(key)) return;
    trackedConversions.add(key);
  }

  const attribution = getAttributionPayload();
  const metadata: AnalyticsMetadata = {
    ...(options.metadata || {}),
    ...(options.surface ? { surface: options.surface } : {}),
    consent_state: consentState,
  };

  sendGoogleEvent(eventName, path, metadata);
  sendFirstPartyEvent({
    event_name: eventName,
    path,
    session_id: getAnalyticsSessionId(),
    surface: options.surface || '',
    metadata,
    attribution,
  });
}
