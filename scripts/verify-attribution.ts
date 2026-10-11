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
  assert.equal(normalizeLeadAttribution({ utm_source: 'instagram', utm_medium: 'paid_social' }).channel, 'meta-ads');
  assert.equal(normalizeLeadAttribution({ utm_source: 'fb', utm_medium: 'cpc' }).channel, 'meta-ads');
  assert.equal(normalizeLeadAttribution({ referrer: 'chatgpt.com' }).channel, 'ai-referral');
  assert.equal(normalizeLeadAttribution({ referrer: 'chatgpt.com.attacker.test' }).channel, 'referral');
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
  process.env.NEXT_PUBLIC_GOOGLE_ADS_MEETING_LABEL = 'meeting_label';
  process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL = 'whatsapp_label';
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_LABEL = 'phone_label';
  process.env.NEXT_PUBLIC_GOOGLE_ADS_EMAIL_LABEL = 'email_label';
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CATALOG_LABEL = 'catalog_label';
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CHAT_LABEL = 'chat_label';
  process.env.NEXT_PUBLIC_META_PIXEL_ID = '123456789012345';
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
  assert.equal(scripts.length, 3, 'Exactly one Google, Bing and Meta script load');
  const record_id = '93cb1e83-605d-4e85-989f-60005e877ed1';
  analytics.trackAnalyticsEvent('generate_lead', { metadata: { record_id } });
  analytics.trackAnalyticsEvent('generate_lead', { metadata: { record_id } });
  analytics.trackAnalyticsEvent('generate_lead', { metadata: { record_id: '' } });
  assert.equal(requests.length, 1, 'Confirmed conversion is emitted once; fake success emits none');
  const commands = browser.dataLayer.map(command => Array.from(command as ArrayLike<unknown>));
  const conversion = commands.find(command => command[0] === 'event' && command[1] === 'conversion');
  assert.equal((conversion?.[2] as Record<string, unknown>).transaction_id, record_id);
  assert.equal((conversion?.[2] as Record<string, unknown>).send_to, 'AW-123456/test_label');
  assert.equal(commands.filter(command => command[0] === 'event' && command[1] === 'conversion').length, 1);
  const pixelCommands = window.fbq!.queue;
  const leads = pixelCommands.filter(command => command[0] === 'trackSingle' && command[2] === 'Lead');
  assert.equal(leads.length, 1, 'Meta counts only one confirmed lead');
  assert.deepEqual(leads[0][4], { eventID: `generate_lead:${record_id}` });
  analytics.trackAnalyticsEvent('whatsapp_click');
  assert.equal(pixelCommands.filter(command => command[2] === 'Lead').length, 1, 'WhatsApp is not a Lead');
  const meetingId = '6b71062d-56b0-492c-abfa-44c5e8e071c0';
  analytics.trackAnalyticsEvent('meeting_booked', { metadata: { record_id: meetingId } });
  analytics.trackAnalyticsEvent('phone_click');
  analytics.trackAnalyticsEvent('email_click');
  analytics.trackAnalyticsEvent('catalog_download');
  analytics.trackAnalyticsEvent('chat_open');
  const allCommands = browser.dataLayer.map(command => Array.from(command as ArrayLike<unknown>));
  const gaEvents = allCommands.filter(command => command[0] === 'event' && command[1] !== 'conversion');
  assert.ok(gaEvents.length >= 7);
  assert.ok(gaEvents.every(command => (command[2] as { send_to?: string }).send_to === 'G-TEST123'),
    'Site events must target GA4 without generating extra Ads page views');
  const destinations = allCommands
    .filter(command => command[0] === 'event' && command[1] === 'conversion')
    .map(command => (command[2] as { send_to: string }).send_to);
  assert.deepEqual(destinations, [
    'AW-123456/test_label',
    'AW-123456/whatsapp_label',
    'AW-123456/meeting_label',
    'AW-123456/phone_label',
    'AW-123456/email_label',
    'AW-123456/catalog_label',
    'AW-123456/chat_label',
  ], 'Each configured action must use its own Ads destination');
  assert.equal(requests.length, 7, 'Every consented public action reaches first-party reporting');
  const requestCount = requests.length;
  analytics.setAnalyticsConsent('denied');
  assert.deepEqual(pixelCommands.at(-1), ['consent', 'revoke']);
  const pixelCount = pixelCommands.length;
  analytics.trackAnalyticsEvent('page_view');
  assert.equal(requests.length, requestCount, 'Revoking consent stops event reporting');
  assert.equal(pixelCommands.length, pixelCount, 'No Meta events after withdrawal');
  browser.location.pathname = '/admin/leads';
  analytics.setAnalyticsConsent('granted');
  analytics.trackAnalyticsEvent('page_view');
  assert.equal(requests.length, requestCount, 'Private CRM pages must never report analytics');
  console.log('Attribution, campaign classification, public normalization and consent checks passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
