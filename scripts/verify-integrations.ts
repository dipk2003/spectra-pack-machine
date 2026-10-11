import assert from 'node:assert/strict';
import Module from 'node:module';
import { createHmac } from 'node:crypto';
import twilio from 'twilio';
import { reportRange, summarizeAds } from '../src/lib/integration-types';
import { parseTwilioEvent, parseWhatsAppEvents, verifyMetaSignature, readWebhookBody } from '../src/lib/provider-webhooks';

async function main() {
  assert.throws(() => reportRange('2026-02-30', '2026-03-01'));
  assert.throws(() => reportRange('2026-01-01', '2026-09-01'));
  assert.throws(() => reportRange("2026-01-01' OR 1=1", '2026-09-01'));
  const loader = Module as unknown as { _load: (id: string, ...args: unknown[]) => unknown };
  const original = loader._load;
  loader._load = function (id, ...args) { return id === 'server-only' ? {} : original.call(this, id, ...args); };
  const connectors = await import('../src/lib/ad-connectors');
  const since = '2026-09-01', until = '2026-09-02';
  const google = connectors.mapGoogleRows([{ customer: { currencyCode: 'INR' }, campaign: { id: '123', name: 'Machine sales' }, segments: { date: since }, metrics: { costMicros: '12500000', impressions: '100', clicks: '4', conversions: 2, conversionsValue: 50 } }], '1221470972', since, until);
  assert.equal(google[0].spend, 12.5);
  const meta = connectors.mapMetaRows([{ account_currency: 'USD', campaign_id: '12', date_start: since, spend: '5', impressions: '20', clicks: '2', actions: [{ action_type: 'lead', value: '2' }, { action_type: 'offsite_conversion.fb_pixel_lead', value: '2' }], action_values: [{ action_type: 'purchase', value: '10' }, { action_type: 'omni_purchase', value: '10' }] }], '123', since, until);
  assert.equal(meta[0].conversions, 2, 'Overlapping Meta aliases must not double count leads');
  assert.equal(meta[0].conversion_value, 10);
  assert.equal(summarizeAds([...google, ...meta]).length, 2, 'Never mix provider currencies');
  assert.equal(summarizeAds([{ ...google[0], spend: 0 }])[0].valuePerSpend, null);
  const payload = { object: 'whatsapp_business_account', entry: [{ changes: [{ value: { metadata: { phone_number_id: '1234' }, messages: [{ id: 'wamid.test', from: '919876543210', timestamp: '1790000000', type: 'text', text: { body: 'Need a sealing machine' } }], statuses: [{ id: 'wamid.sent', recipient_id: '919876543210', timestamp: '1790000001', status: 'delivered' }] } }] }] };
  const raw = JSON.stringify(payload), secret = 'test-secret';
  const signature = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`;
  assert.ok(verifyMetaSignature(raw, signature, secret));
  assert.ok(!verifyMetaSignature(raw + ' ', signature, secret));
  assert.ok(!verifyMetaSignature(raw, signature, ''));
  assert.deepEqual(parseWhatsAppEvents(payload, 'wrong-number'), []);
  const messages = parseWhatsAppEvents(payload, '1234');
  assert.equal(messages.length, 2);
  assert.equal(messages[0].phone, '919876543210');
  assert.equal(messages[0].body, 'Need a sealing machine');
  assert.equal(messages[1].kind, 'delivery_status');
  assert.deepEqual(parseWhatsAppEvents(payload, '1234'), messages, 'Retry event keys must be stable');
  const call = { AccountSid: 'AC' + '1'.repeat(32), CallSid: 'CA' + '2'.repeat(32), Direction: 'outbound-api', CallStatus: 'completed', To: '+919876543210', From: '+18005550123', CallDuration: '34' };
  const callback = 'https://example.test/api/webhooks/twilio';
  const callSignature = twilio.getExpectedTwilioSignature(secret, callback, call);
  assert.ok(twilio.validateRequest(secret, callSignature, callback, call));
  assert.ok(!twilio.validateRequest(secret, callSignature, callback, { ...call, CallDuration: '999' }));
  assert.equal(parseTwilioEvent(call)?.metadata.duration_seconds, 34);
  assert.equal(parseTwilioEvent(call)?.phone, '919876543210');
  assert.equal(parseTwilioEvent({ ...call, Direction: '' })?.phone, '', 'Unknown call direction must not attach to the wrong lead');
  await assert.rejects(() => readWebhookBody(new Request('https://example.test', { method: 'POST', body: 'x'.repeat(256001) })));

  // Provider requests are mocked: never send test traffic or credentials to real accounts.
  process.env.META_AD_ACCOUNT_ID = '123'; process.env.META_ADS_ACCESS_TOKEN = 'test'; process.env.META_GRAPH_VERSION = 'v23.0';
  const originalFetch = globalThis.fetch;
  process.env.GOOGLE_ADS_CUSTOMER_ID = '1221470972';
  process.env.GOOGLE_ADS_CLIENT_ID = 'test-client'; process.env.GOOGLE_ADS_CLIENT_SECRET = 'test-secret';
  process.env.GOOGLE_ADS_REFRESH_TOKEN = 'test-refresh'; delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  assert.ok(connectors.integrationConnections().find(item => item.name === 'google')?.configured, 'Legacy developer token is optional after its sunset');
  globalThis.fetch = async (url, init) => {
    if (String(url) === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: 'test-access' });
    assert.ok(String(url).startsWith('https://googleads.googleapis.com/v23/customers/1221470972/'));
    assert.equal((init?.headers as Record<string, string>)['developer-token'], undefined);
    return Response.json([{ results: [] }]);
  };
  assert.equal((await connectors.fetchAds('google', since, until)).rows.length, 0);
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    assert.ok(String(url).startsWith('https://graph.facebook.com/'));
    assert.ok(!String(url).includes('access_token'));
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer test');
    calls++;
    if (calls === 1) return Response.json({ data: [], paging: { next: 'https://attacker.test/token', cursors: { after: 'cursor1' } } });
    assert.ok(String(url).includes('after=cursor1'));
    return Response.json({ data: [] });
  };
  assert.equal((await connectors.fetchAds('meta', since, until)).rows.length, 0);
  assert.equal(calls, 2, 'Follow cursors on trusted host, not arbitrary paging URLs');
  globalThis.fetch = async () => new Response('secret upstream error', { status: 401 });
  await assert.rejects(() => connectors.fetchAds('meta', since, until), error => error instanceof Error && !error.message.includes('secret upstream'));
  globalThis.fetch = originalFetch;
  loader._load = original;
  console.log('Integration checks passed: currency isolation, date validation, metric mapping, paging, signed webhooks, account scoping, stable event keys and body limits. No external traffic sent.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
