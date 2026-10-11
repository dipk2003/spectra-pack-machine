export type AdProvider = 'google' | 'meta';
export type AdMetric = {
  provider: AdProvider; account_id: string; campaign_id: string; campaign_name: string;
  day: string; currency: string; impressions: number; clicks: number; spend: number;
  conversions: number; conversion_value: number;
};
export type ProviderEvent = {
  provider: 'whatsapp' | 'twilio'; event_key: string; external_id: string;
  phone: string; direction: 'inbound' | 'outbound' | 'unknown';
  kind: string; status: string; body: string; occurred_at: string;
  metadata: Record<string, string | number>;
};
export type StoredProviderEvent = ProviderEvent & { id: string; lead_id: string | null; received_at: string };
export type IntegrationConnection = { name: string; configured: boolean; missing: string[] };
export type IntegrationReport = {
  connections: IntegrationConnection[]; databaseReady: boolean;
  metrics: AdMetric[]; events: StoredProviderEvent[];
  syncs: { provider: string; status: string; message: string; completed_at: string; range_start: string; range_end: string }[];
  since: string; until: string;
};

export function reportRange(since?: string, until?: string) {
  const end = until || new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const start = since || new Date(Date.parse(end) - 29 * 86400000).toISOString().slice(0, 10);
  for (const value of [start, end]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
      throw new Error('Use valid YYYY-MM-DD report dates.');
    }
  }
  const days = (Date.parse(end) - Date.parse(start)) / 86400000;
  if (days < 0 || days > 89) throw new Error('Choose a report period of 1–90 days.');
  if (end > new Date().toISOString().slice(0, 10)) throw new Error('Report dates cannot be in the future.');
  return { since: start, until: end };
}

export function summarizeAds(rows: AdMetric[]) {
  const groups = new Map<string, { provider: string; currency: string; spend: number; impressions: number; clicks: number; conversions: number; conversionValue: number; valuePerSpend: number | null }>();
  for (const row of rows) {
    const key = `${row.provider}:${row.currency}`;
    const group = groups.get(key) || { provider: row.provider, currency: row.currency, spend: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0, valuePerSpend: null };
    group.spend += row.spend; group.impressions += row.impressions; group.clicks += row.clicks;
    group.conversions += row.conversions; group.conversionValue += row.conversion_value;
    group.valuePerSpend = group.spend > 0 ? group.conversionValue / group.spend : null;
    groups.set(key, group);
  }
  return Array.from(groups.values());
}
