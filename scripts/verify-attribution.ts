import assert from 'node:assert/strict';
import { normalizeLeadAttribution, attributionFromRow } from '../src/lib/lead-attribution';
import { normalizeLeadInput, normalizeMeetingInput } from '../src/lib/cms';

async function main() {
  const journey = {
    first_landing_page: '/products/band-sealer-machine?email=private@example.test',
    first_utm_source: 'google', first_utm_medium: 'cpc', first_utm_campaign: 'seal-machines',
    first_gclid: 'paid-click-example', first_referrer_host: 'www.google.com',
    last_landing_page: '/blog/sealing-guide', last_referrer_host: 'www.google.co.in',
    last_utm_source: '', last_utm_medium: '', last_gclid: '',
  };
  const organic = normalizeLeadAttribution(journey);
  assert.equal(organic.channel, 'google-organic');
  assert.equal(organic.gclid, '', 'An old paid click must not override the latest organic visit');
  assert.equal(organic.firstTouch?.gclid, 'paid-click-example');
  assert.equal(organic.firstTouch?.landingPath, '/products/band-sealer-machine');
  assert.deepEqual(normalizeLeadAttribution(organic), organic, 'Normalization must be idempotent');
  assert.equal(normalizeLeadAttribution({ gbraid: 'braid' }).channel, 'google-ads');
  assert.equal(normalizeLeadAttribution({ msclkid: 'ms-click' }).channel, 'microsoft-ads');
  assert.equal(normalizeLeadAttribution({ referrer: 'google.com.attacker.test' }).channel, 'referral');
  assert.equal(normalizeLeadAttribution({ landingPath: '//attacker.test/path' }).landingPath, '');
  assert.equal(normalizeLeadAttribution({ landingPath: '/\\attacker.test/path' }).landingPath, '');
  assert.equal(attributionFromRow({ utm_source: 'google', utm_medium: 'cpc' }).channel, 'google-ads');
  assert.deepEqual(attributionFromRow({ attribution: organic, gclid: 'stale' }), organic);

  const lead = { name: 'Test', email: 'test@example.test', phone: '+919876543210', message: 'Machine enquiry', attribution: journey };
  assert.deepEqual(normalizeLeadInput(normalizeLeadInput(lead)).attribution, organic);
  assert.deepEqual(normalizeMeetingInput({ ...lead, date: '2026-10-01', time: '10:00' }).attribution, organic);
  assert.throws(() => normalizeLeadInput({ ...lead, email: 'a@test.test,b@test.test' }));

  // An isolated browser simulation: all network and script insertion is intercepted.
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = 'AW-123456';
  process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL = 'test_label';
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
  const scripts: Array<{ id: string }> = [];
  const requests: Array<unknown> = [];
  const browser = { location: { pathname: '/contact', search: '?gclid=initial-click', origin: 'https://example.test', host: 'example.test' }, localStorage: storage, sessionStorage: storage, dataLayer: [] as unknown[] };
  Object.assign(globalThis, {
    window: browser,
    document: { referrer: 'https://www.google.com/search?q=machine', getElementById: (id: string) => scripts.find(script => script.id === id), createElement: () => ({}), head: { appendChild: (script: { id: string }) => scripts.push(script) } },
    fetch: async (_url: unknown, options: unknown) => { requests.push(options); return { ok: true }; },
  });
  const analytics = await import('../src/lib/analytics');
  const attribution = await import('../src/lib/attribution');
  analytics.initializeAnalytics();
  assert.equal(scripts.length, 0, 'Third-party tags must wait for consent');
  analytics.trackAnalyticsEvent('page_view');
  assert.equal(requests.length, 0);
  attribution.captureAttribution();
  browser.location.pathname = '/blog/example';
  browser.location.search = '';
  attribution.captureAttribution();
  assert.equal(attribution.getAttributionPayload()?.last_landing_page, '/contact', 'Internal navigation must preserve the inbound landing page');
  analytics.setAnalyticsConsent('granted');
  assert.equal(scripts.length, 2, 'Exactly one Google script and one Bing script load');
  const record_id = '93cb1e83-605d-4e85-989f-60005e877ed1';
  analytics.trackAnalyticsEvent('generate_lead', { metadata: { record_id } });
  analytics.trackAnalyticsEvent('generate_lead', { metadata: { record_id } });
  analytics.trackAnalyticsEvent('generate_lead', { metadata: { record_id: '' } });
  assert.equal(requests.length, 1, 'Confirmed conversion is emitted once; fake success emits none');
  const commands = browser.dataLayer.map(command => Array.from(command as ArrayLike<unknown>));
  const conversion = commands.find(command => command[0] === 'event' && command[1] === 'conversion');
  assert.equal((conversion?.[2] as Record<string, unknown>).transaction_id, record_id);
  analytics.setAnalyticsConsent('denied');
  analytics.trackAnalyticsEvent('page_view');
  assert.equal(requests.length, 1, 'Revoking consent stops event reporting');
  browser.location.pathname = '/admin/leads';
  analytics.setAnalyticsConsent('granted');
  analytics.trackAnalyticsEvent('page_view');
  assert.equal(requests.length, 1, 'Private CRM pages must never report analytics');
  console.log('Attribution, campaign classification, public normalization and consent checks passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
