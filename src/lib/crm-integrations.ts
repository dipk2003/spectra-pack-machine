import 'server-only';
import { getSupabaseAdmin } from './supabase';
import { fetchAds, integrationConnections } from './ad-connectors';
import { reportRange, type AdMetric, type AdProvider, type IntegrationReport, type ProviderEvent } from './integration-types';

export async function syncAdReports(since?: string, until?: string) {
  const range = reportRange(since, until);
  const db = getSupabaseAdmin();
  const results = [];
  for (const provider of ['google', 'meta'] as AdProvider[]) {
    if (!integrationConnections().find(item => item.name === provider)?.configured) {
      results.push({ provider, status: 'not_connected', message: 'Provider credentials are not configured.' });
      continue;
    }
    try {
      const report = await fetchAds(provider, range.since, range.until);
      const { error } = await db.rpc('crm_replace_ad_report', { p_provider: provider, p_account: report.account, p_since: range.since, p_until: range.until, p_rows: report.rows });
      if (error) throw new Error('Could not save report. Check the integration migration.');
      results.push({ provider, status: 'ok', rows: report.rows.length });
    } catch (error) {
      // Internal errors are not logged with URLs/tokens or provider payloads.
      const message = error instanceof Error && !/fetch failed|timeout/i.test(error.message) ? error.message : 'Provider connection failed; previous report retained.';
      await db.from('crm_integration_syncs').upsert({ provider, status: 'error', message: message.slice(0, 300), range_start: range.since, range_end: range.until, completed_at: new Date().toISOString() });
      results.push({ provider, status: 'error', message });
    }
  }
  return results;
}

export async function readIntegrationReport(since?: string, until?: string): Promise<IntegrationReport> {
  const range = reportRange(since, until);
  const db = getSupabaseAdmin();
  const [events, syncs] = await Promise.all([
    db.from('crm_provider_events').select('*').order('received_at', { ascending: false }).limit(100),
    db.from('crm_integration_syncs').select('*'),
  ]);
  const rows: AdMetric[] = [];
  let databaseReady = !events.error && !syncs.error;
  for (let offset = 0; databaseReady; offset += 1000) {
    const page = await db.from('crm_ad_daily').select('*').gte('day', range.since).lte('day', range.until)
      .order('provider').order('account_id').order('campaign_id').order('day').range(offset, offset + 999);
    if (page.error) { databaseReady = false; break; }
    rows.push(...(page.data || []).map(row => ({ ...row, spend: Number(row.spend), impressions: Number(row.impressions), clicks: Number(row.clicks), conversions: Number(row.conversions), conversion_value: Number(row.conversion_value) })) as AdMetric[]);
    if ((page.data || []).length < 1000) break;
    if (offset >= 99000) throw new Error('Report too large; choose a shorter period.');
  }
  return { ...range, connections: integrationConnections(), databaseReady, metrics: databaseReady ? rows : [], events: events.data || [], syncs: syncs.data || [] };
}

export async function ingestProviderEvents(events: ProviderEvent[]) {
  const db = getSupabaseAdmin();
  for (const event of events) {
    const { error } = await db.rpc('crm_ingest_provider_event', { p_event: event });
    if (error) throw new Error('Provider event persistence failed.');
  }
}
