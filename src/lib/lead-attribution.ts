/** Campaign context is reported by the browser; it is not an Ads billing report. */
export type AttributionDetails = {
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  gclid: string;
  gbraid: string;
  wbraid: string;
  msclkid: string;
};

export type LeadAttribution = AttributionDetails & {
  firstTouch: AttributionDetails | null;
  lastTouch: AttributionDetails | null;
  channel: string;
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
const clean = (value: unknown, limit = 160) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, limit) : '';

const safePath = (value: unknown) => {
  const path = clean(value, 300);
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '';
  try { return new URL(path, 'https://attribution.invalid').pathname; } catch { return ''; }
};
const safeHost = (value: unknown) => {
  const host = clean(value, 120).toLowerCase();
  return /^[a-z0-9.-]+(?::\d{1,5})?$/.test(host) ? host : '';
};

function details(raw: Record<string, unknown>, prefix = ''): AttributionDetails {
  const value = (camel: string, snake: string) => prefix ? raw[`${prefix}_${snake}`] : raw[camel] ?? raw[snake];
  return {
    landingPath: safePath(value('landingPath', prefix ? 'landing_page' : 'landing_path')),
    referrer: safeHost(value('referrer', prefix ? 'referrer_host' : 'referrer')),
    utmSource: clean(value('utmSource', 'utm_source'), 100),
    utmMedium: clean(value('utmMedium', 'utm_medium'), 100),
    utmCampaign: clean(value('utmCampaign', 'utm_campaign')),
    utmTerm: clean(value('utmTerm', 'utm_term')),
    utmContent: clean(value('utmContent', 'utm_content')),
    gclid: clean(value('gclid', 'gclid')),
    gbraid: clean(value('gbraid', 'gbraid')),
    wbraid: clean(value('wbraid', 'wbraid')),
    msclkid: clean(value('msclkid', 'msclkid')),
  };
}

export function classifyAttribution(touch: AttributionDetails): string {
  const source = touch.utmSource.toLowerCase();
  const medium = touch.utmMedium.toLowerCase();
  const paid = /^(cpc|ppc|paid|paidsearch|paid-search|paid_social|paid-social|paidsocial|display|cpm)$/.test(medium);
  if (touch.gclid || touch.gbraid || touch.wbraid || (/^google(?:-ads)?$/.test(source) && paid)) return 'google-ads';
  if (touch.msclkid || (/^(bing|microsoft(?:-ads)?)$/.test(source) && paid)) return 'microsoft-ads';
  if (/^(facebook|instagram|meta|fb|ig)$/.test(source) && paid) return 'meta-ads';
  if (paid) return 'paid-search';
  if (/^(chatgpt|perplexity|claude|gemini|copilot)(?:\.com|\.ai)?$/.test(source)) return 'ai-referral';
  if (source) {
    if (source === 'google' && medium === 'organic') return 'google-organic';
    return medium === 'organic' ? 'organic-search' : 'campaign';
  }
  if (/(^|\.)google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(touch.referrer)) return 'google-organic';
  if (/(^|\.)(bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(touch.referrer)) return 'organic-search';
  if (/(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/.test(touch.referrer)) return 'ai-referral';
  return touch.referrer ? 'referral' : 'direct';
}

export function normalizeLeadAttribution(value: unknown): LeadAttribution {
  const raw = record(value);
  const isBrowserPayload = Object.keys(raw).some(key => key.startsWith('first_') || key.startsWith('last_'));
  const firstTouch = isBrowserPayload ? details(raw, 'first')
    : raw.firstTouch ? details(record(raw.firstTouch)) : null;
  const lastTouch = isBrowserPayload ? details(raw, 'last')
    : raw.lastTouch ? details(record(raw.lastTouch)) : null;
  // Select one complete touch. Mixing old click IDs into a later organic visit
  // would incorrectly report that organic enquiry as another paid conversion.
  const current = lastTouch || firstTouch || details(raw);
  return { ...current, firstTouch, lastTouch, channel: classifyAttribution(current) };
}

export function attributionFromRow(value: unknown): LeadAttribution {
  const row = record(value);
  const stored = record(row.attribution);
  return normalizeLeadAttribution(Object.keys(stored).length ? stored : row);
}
