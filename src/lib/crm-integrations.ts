import 'server-only';
import { getSupabaseAdmin } from './supabase';
import { fetchAds, fetchAdCampaigns, integrationConnections } from './ad-connectors';
import { reportRange, type AdCampaign, type AdMetric, type AdProvider, type IntegrationReport, type ProviderEvent } from './integration-types';

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
      const inventory = await fetchAdCampaigns(provider);
      const { error } = await db.rpc('crm_replace_ad_report', { p_provider: provider, p_account: report.account, p_since: range.since, p_until: range.until, p_rows: report.rows });
      if (error) throw new Error('Could not save report. Check the integration migration.');
      const { error: campaignError } = await db.rpc('crm_replace_ad_campaigns', { p_provider: provider, p_account: inventory.account, p_campaigns: inventory.campaigns });
      if (campaignError) throw new Error('Could not save campaign inventory. Apply the campaign catalog migration.');
      results.push({ provider, status: 'ok', rows: report.rows.length, campaigns: inventory.campaigns.length });
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
  const campaignResult = await db.from('crm_ad_campaigns').select('*').order('provider').order('campaign_name').limit(10000);
  let databaseReady = !events.error && !syncs.error && !campaignResult.error;
  const campaigns: AdCampaign[] = databaseReady ? (campaignResult.data || []).map(row => ({
    provider: row.provider as AdProvider, account_id: row.account_id, campaign_id: row.campaign_id,
    campaign_name: row.campaign_name, status: row.status, objective: row.objective,
    channel: row.channel, start_date: row.start_date || '', end_date: row.end_date || '',
  })) : [];
  for (let offset = 0; databaseReady; offset += 1000) {
    const page = await db.from('crm_ad_daily').select('*').gte('day', range.since).lte('day', range.until)
      .order('provider').order('account_id').order('campaign_id').order('day').range(offset, offset + 999);
    if (page.error) { databaseReady = false; break; }
    rows.push(...(page.data || []).map(row => ({ ...row, spend: Number(row.spend), impressions: Number(row.impressions), clicks: Number(row.clicks), conversions: Number(row.conversions), conversion_value: Number(row.conversion_value) })) as AdMetric[]);
    if ((page.data || []).length < 1000) break;
    if (offset >= 99000) throw new Error('Report too large; choose a shorter period.');
  }
  return { ...range, connections: integrationConnections(), databaseReady, metrics: databaseReady ? rows : [], campaigns, events: events.data || [], syncs: syncs.data || [] };
}

export async function ingestProviderEvents(events: ProviderEvent[]) {
  const db = getSupabaseAdmin();
  for (const event of events) {
    const { error } = await db.rpc('crm_ingest_provider_event', { p_event: event });
    if (error) throw new Error('Provider event persistence failed.');
  }
}
