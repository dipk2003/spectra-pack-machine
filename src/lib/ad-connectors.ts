import 'server-only';
import type { AdCampaign, AdMetric, AdProvider, IntegrationConnection } from './integration-types';

const REQUIRED = {
  google: ['GOOGLE_ADS_CUSTOMER_ID', 'GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN'],
  meta: ['META_AD_ACCOUNT_ID', 'META_ADS_ACCESS_TOKEN', 'META_GRAPH_VERSION'],
  whatsapp: ['WHATSAPP_APP_SECRET', 'WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
  twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WEBHOOK_URL'],
} as const;

export function integrationConnections(): IntegrationConnection[] {
  return Object.entries(REQUIRED).map(([name, keys]) => {
    const missing = keys.filter(key => !process.env[key]?.trim());
    return { name, configured: missing.length === 0, missing };
  });
}

async function providerJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20000) });
  // Do not surface upstream bodies: they may contain request credentials or customer data.
  if (!response.ok) throw new Error(`Provider request failed (HTTP ${response.status}). Check account permissions, credentials and API version.`);
  return response.json();
}

const number = (value: unknown) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) throw new Error('Provider returned an invalid metric.');
  return n;
};
const nonnegative = (value: unknown) => {
  const n = number(value);
  if (n < 0) throw new Error('Provider returned a negative count or spend.');
  return n;
};
const validCurrency = (value: unknown) => {
  if (typeof value !== 'string' || !/^[A-Z]{3}$/.test(value)) throw new Error('Provider account currency is missing.');
  return value;
};
const validDay = (value: unknown, since: string, until: string) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < since || value > until) throw new Error('Provider returned a date outside the requested period.');
  return value;
};

type GoogleRow = { customer: { currencyCode: string }; campaign: { id: string; name?: string }; segments: { date: string }; metrics: { costMicros?: string; impressions?: string; clicks?: string; conversions?: number; conversionsValue?: number } };
type MetaRow = { account_currency: string; campaign_id: string; campaign_name?: string; date_start: string; spend?: string; impressions?: string; clicks?: string; actions?: Array<{ action_type: string; value: string }>; action_values?: Array<{ action_type: string; value: string }> };
type GoogleCampaignRow = { campaign: { id: string; name?: string; status?: string; primaryStatus?: string; advertisingChannelType?: string; startDate?: string; endDate?: string } };
type MetaCampaignRow = { id: string; name?: string; status?: string; effective_status?: string; objective?: string; start_time?: string; stop_time?: string };

const campaignDate = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';

async function googleAccessToken() {
  const auth = await providerJson('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', client_id: process.env.GOOGLE_ADS_CLIENT_ID!, client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN! }),
  });
  if (typeof auth.access_token !== 'string') throw new Error('Google did not return an access token.');
  return auth.access_token as string;
}

function googleHeaders(accessToken: string) {
  const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  // Google sunset developer tokens on 2026-09-09; Cloud project access now applies.
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim()) headers['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN.trim();
  const loginId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, '');
  if (loginId) headers['login-customer-id'] = loginId;
  return headers;
}
export function mapGoogleRows(rows: GoogleRow[], accountId: string, since: string, until: string): AdMetric[] {
  return rows.map(row => ({
    provider: 'google', account_id: accountId, campaign_id: String(row.campaign.id), campaign_name: String(row.campaign.name || row.campaign.id).slice(0, 300),
    day: validDay(row.segments.date, since, until), currency: validCurrency(row.customer.currencyCode),
    spend: nonnegative(row.metrics.costMicros) / 1e6, impressions: nonnegative(row.metrics.impressions), clicks: nonnegative(row.metrics.clicks),
    conversions: number(row.metrics.conversions), conversion_value: number(row.metrics.conversionsValue),
  }));
}

// These fields overlap; choose one metric, never sum aliases for the same purchase/lead.
export function actionValue(values: Array<{ action_type: string; value: string }> | undefined, types: string[]) {
  for (const type of types) {
    const entry = values?.find(item => item.action_type === type);
    if (entry) return number(entry.value);
  }
  return 0;
}
export function mapMetaRows(rows: MetaRow[], accountId: string, since: string, until: string): AdMetric[] {
  return rows.map(row => ({
    provider: 'meta', account_id: accountId, campaign_id: String(row.campaign_id), campaign_name: String(row.campaign_name || row.campaign_id).slice(0, 300),
    day: validDay(row.date_start, since, until), currency: validCurrency(row.account_currency),
    spend: nonnegative(row.spend), impressions: nonnegative(row.impressions), clicks: nonnegative(row.clicks),
    conversions: actionValue(row.actions, ['lead', 'omni_lead', 'offsite_conversion.fb_pixel_lead']),
    conversion_value: actionValue(row.action_values, ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase']),
  }));
}

export async function fetchAds(provider: AdProvider, since: string, until: string): Promise<{ account: string; rows: AdMetric[] }> {
  const connection = integrationConnections().find(item => item.name === provider)!;
  if (!connection.configured) throw new Error(`Configure ${connection.missing.join(', ')} in hosting environment settings.`);
  if (provider === 'google') {
    const account = process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, '');
    const version = process.env.GOOGLE_ADS_API_VERSION || 'v26';
    if (!/^\d{10}$/.test(account) || !/^v\d+$/.test(version)) throw new Error('Invalid Google Ads account or API version.');
    const accessToken = await googleAccessToken();
    const query = `SELECT customer.currency_code, campaign.id, campaign.name, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '${since}' AND '${until}'`;
    const result = await providerJson(`https://googleads.googleapis.com/${version}/customers/${account}/googleAds:searchStream`, { method: 'POST', headers: googleHeaders(accessToken), body: JSON.stringify({ query }) });
    if (!Array.isArray(result)) throw new Error('Unexpected Google reporting response.');
    const rows = mapGoogleRows(result.flatMap(part => part.results || []), account, since, until);
    if (rows.length > 20000) throw new Error('Report too large; use a shorter date range.');
    return { account, rows };
  }
  const account = process.env.META_AD_ACCOUNT_ID!.replace(/^act_/, '');
  const version = process.env.META_GRAPH_VERSION!;
  if (!/^\d+$/.test(account) || !/^v\d+\.0$/.test(version)) throw new Error('Invalid Meta account or Graph API version.');
  const rows: AdMetric[] = [];
  let after = '';
  const cursors = new Set<string>();
  for (let page = 0; page < 100; page++) {
    const params = new URLSearchParams({ fields: 'campaign_id,campaign_name,date_start,account_currency,spend,impressions,clicks,actions,action_values', level: 'campaign', time_increment: '1', time_range: JSON.stringify({ since, until }), limit: '500', use_unified_attribution_setting: 'true' });
    if (after) params.set('after', after);
    // Only a known host is fetched; never follow upstream paging URLs carrying tokens.
    const result = await providerJson(`https://graph.facebook.com/${version}/act_${account}/insights?${params}`, { headers: { Authorization: `Bearer ${process.env.META_ADS_ACCESS_TOKEN}` } });
    if (!Array.isArray(result.data)) throw new Error('Unexpected Meta reporting response.');
    rows.push(...mapMetaRows(result.data, account, since, until));
    if (rows.length > 20000) throw new Error('Report too large; use a shorter date range.');
    if (!result.paging?.next) return { account, rows };
    after = result.paging?.cursors?.after;
    if (!after || cursors.has(after)) throw new Error('Meta pagination was incomplete; previous data has been retained.');
    cursors.add(after);
  }
  throw new Error('Meta pagination limit reached; use a shorter date range.');
}

export async function fetchAdCampaigns(provider: AdProvider): Promise<{ account: string; campaigns: AdCampaign[] }> {
  const connection = integrationConnections().find(item => item.name === provider)!;
  if (!connection.configured) throw new Error(`Configure ${connection.missing.join(', ')} in hosting environment settings.`);
  if (provider === 'google') {
    const account = process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, '');
    const version = process.env.GOOGLE_ADS_API_VERSION || 'v26';
    if (!/^\d{10}$/.test(account) || !/^v\d+$/.test(version)) throw new Error('Invalid Google Ads account or API version.');
    const accessToken = await googleAccessToken();
    const query = 'SELECT campaign.id, campaign.name, campaign.status, campaign.primary_status, campaign.advertising_channel_type, campaign.start_date, campaign.end_date FROM campaign ORDER BY campaign.id LIMIT 10000';
    const result = await providerJson(`https://googleads.googleapis.com/${version}/customers/${account}/googleAds:searchStream`, { method: 'POST', headers: googleHeaders(accessToken), body: JSON.stringify({ query }) });
    if (!Array.isArray(result)) throw new Error('Unexpected Google campaigns response.');
    const campaigns = result.flatMap(part => part.results || []).map((row: GoogleCampaignRow) => ({
      provider: 'google' as const, account_id: account, campaign_id: String(row.campaign.id),
      campaign_name: String(row.campaign.name || row.campaign.id).slice(0, 300),
      status: String(row.campaign.primaryStatus || row.campaign.status || 'UNKNOWN').slice(0, 80),
      objective: '', channel: String(row.campaign.advertisingChannelType || 'UNKNOWN').slice(0, 80),
      start_date: campaignDate(row.campaign.startDate), end_date: campaignDate(row.campaign.endDate),
    }));
    if (campaigns.length > 10000) throw new Error('Campaign list is too large to sync.');
    return { account, campaigns };
  }

  const account = process.env.META_AD_ACCOUNT_ID!.replace(/^act_/, '');
  const version = process.env.META_GRAPH_VERSION!;
  if (!/^\d+$/.test(account) || !/^v\d+\.0$/.test(version)) throw new Error('Invalid Meta account or Graph API version.');
  const campaigns: AdCampaign[] = [];
  let after = '';
  const cursors = new Set<string>();
  for (let page = 0; page < 100; page++) {
    const params = new URLSearchParams({ fields: 'id,name,status,effective_status,objective,start_time,stop_time', limit: '500' });
    if (after) params.set('after', after);
    const result = await providerJson(`https://graph.facebook.com/${version}/act_${account}/campaigns?${params}`, { headers: { Authorization: `Bearer ${process.env.META_ADS_ACCESS_TOKEN}` } });
    if (!Array.isArray(result.data)) throw new Error('Unexpected Meta campaigns response.');
    campaigns.push(...(result.data as MetaCampaignRow[]).map(row => ({
      provider: 'meta' as const, account_id: account, campaign_id: String(row.id),
      campaign_name: String(row.name || row.id).slice(0, 300),
      status: String(row.effective_status || row.status || 'UNKNOWN').slice(0, 80),
      objective: String(row.objective || 'UNKNOWN').slice(0, 80), channel: '',
      start_date: campaignDate(row.start_time), end_date: campaignDate(row.stop_time),
    })));
    if (campaigns.length > 10000) throw new Error('Campaign list is too large to sync.');
    if (!result.paging?.next) return { account, campaigns };
    after = result.paging?.cursors?.after;
    if (!after || cursors.has(after)) throw new Error('Meta campaign pagination was incomplete.');
    cursors.add(after);
  }
  throw new Error('Meta campaign pagination limit reached.');
}
