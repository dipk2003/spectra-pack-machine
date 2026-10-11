'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { reportRange, summarizeAds, type IntegrationReport } from '@/lib/integration-types';
import styles from './page.module.css';

const names: Record<string, string> = { google: 'Google Ads', meta: 'Meta Ads', whatsapp: 'WhatsApp Business API', twilio: 'Phone provider (Twilio)' };
const setup: Record<string, string> = {
  google: 'Connect OAuth access from a Google Cloud project approved for Google Ads API access. The website AW tag alone cannot read spend.',
  meta: 'Connect an ad account with an access token permitted to read advertising insights. A Pixel ID alone cannot read spend.',
  whatsapp: 'Your WhatsApp Business app is not an API connection. Complete official Business Platform onboarding before webhook sync can begin. Existing app chat history is not imported here.',
  twilio: 'No calling service is connected. This receiver supports provider call status and optional provider-generated transcripts; it does not start calls or record audio.',
};
const format = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function IntegrationPanel() {
  const [dates, setDates] = useState(() => reportRange());
  const [data, setData] = useState<IntegrationReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [leadIds, setLeadIds] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    setError('');
    try {
      const response = await fetch(`/api/crm/integrations?${new URLSearchParams(dates)}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load integrations.');
      setData(result);
    } catch (cause) { setData(null); setError(cause instanceof Error ? cause.message : 'Connection failed.'); }
  }, [dates]);
  useEffect(() => { void load(); }, [load]);

  const act = async (body: Record<string, string>) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/crm/integrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Action failed.');
      setNotice(result.results ? result.results.map((item: { provider: string; status: string; message?: string }) => `${names[item.provider]}: ${item.status}${item.message ? ` — ${item.message}` : ''}`).join(' • ') : 'Event linked to lead.');
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Connection failed.'); }
    finally { setBusy(false); }
  };

  return <div className={styles.page}>
    <header className={styles.header}><div><p className={styles.eyebrow}>Sales CRM</p><h1>Ads & Conversations</h1><p>Campaign reports and messages received from connected providers.</p></div><Link href="/admin/leads" className="btn btn-outline">Open sales CRM</Link></header>
    {error && <p className={styles.warning} role="alert">{error}</p>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    {!data && !error && <p role="status">Loading connections…</p>}
    {data && <>
      {!data.databaseReady && <p className={styles.warning}>Database setup pending. Apply the CRM integration migration before syncing reports or receiving conversations. Existing website enquiries remain available in Sales CRM.</p>}
      <section className={styles.connections} aria-label="Provider connections">{data.connections.map(connection => <article className={styles.card} key={connection.name}>
        <div className={styles.cardTitle}><h2>{names[connection.name]}</h2><span className={connection.configured ? styles.ready : styles.pending}>{connection.configured ? 'Configured • verification needed' : 'Not connected'}</span></div>
        <p>{setup[connection.name]}</p>
        {connection.missing.length > 0 && <details><summary>Connection requirements</summary><p>Set these server credentials in hosting environment settings; do not paste secrets into messages.</p><ul>{connection.missing.map(key => <li key={key}><code>{key}</code></li>)}</ul></details>}
        {connection.name === 'whatsapp' && <p className={styles.endpoint}>Webhook: <code>/api/webhooks/whatsapp</code></p>}
      </article>)}</section>
      <section className={styles.card}>
        <h2>Advertising performance</h2>
        <div className={styles.controls}><label>From<input type="date" value={dates.since} onChange={event => setDates({ ...dates, since: event.target.value })} /></label><label>To<input type="date" value={dates.until} onChange={event => setDates({ ...dates, until: event.target.value })} /></label>
          <button className="btn btn-primary" disabled={busy || !data.databaseReady || !data.connections.some(item => ['google', 'meta'].includes(item.name) && item.configured)} onClick={() => void act({ action: 'sync', ...dates })}>{busy ? 'Syncing…' : 'Sync reports'}</button>
          <button className="btn btn-outline" disabled={busy} onClick={() => void load()}>Refresh saved data</button></div>
        <p>Daily sync refreshes the previous 30 completed days when credentials and the scheduler are configured. Dates follow each ad account&apos;s reporting timezone. Today&apos;s data may be incomplete.</p>
        <p><strong>Value / spend is platform-reported, not verified sales ROAS.</strong> Google uses its configured conversion values; Meta uses reported purchase value. Lead estimates are not counted as revenue. Platforms may credit the same sale, so currencies and providers stay separate.</p>
        {data.syncs.map(sync => <p key={sync.provider} className={sync.status === 'error' ? styles.warning : styles.muted}>{names[sync.provider]} · {sync.status} · {new Date(sync.completed_at).toLocaleString()} · {sync.range_start}–{sync.range_end} · {sync.message}</p>)}
        {!data.metrics.length ? <p className={styles.empty}>No saved report for this period. Connect an ad account and run a successful sync; missing data is not zero spend.</p> : <>
          <div className={styles.totals}>{summarizeAds(data.metrics).map(group => <article key={`${group.provider}:${group.currency}`}><h3>{names[group.provider]} · {group.currency}</h3><dl><dt>Spend</dt><dd>{format(group.spend)}</dd><dt>Impressions</dt><dd>{format(group.impressions)}</dd><dt>Clicks</dt><dd>{format(group.clicks)}</dd><dt>{group.provider === 'meta' ? 'Reported leads' : 'Reported conversions'}</dt><dd>{format(group.conversions)}</dd><dt>Reported value</dt><dd>{format(group.conversionValue)}</dd><dt>Value / spend</dt><dd>{group.valuePerSpend === null ? '—' : `${format(group.valuePerSpend)}×`}</dd></dl></article>)}</div>
          <div className={styles.tableWrap}><table><caption>Daily campaign reporting</caption><thead><tr><th>Date</th><th>Campaign</th><th>Platform / account</th><th>Currency</th><th>Spend</th><th>Impressions</th><th>Clicks</th><th>Conversions / leads</th><th>Reported value</th></tr></thead><tbody>{data.metrics.map(row => <tr key={`${row.provider}:${row.account_id}:${row.campaign_id}:${row.day}`}><td>{row.day}</td><td>{row.campaign_name}<small>{row.campaign_id}</small></td><td>{names[row.provider]}<small>{row.account_id}</small></td><td>{row.currency}</td><td>{format(row.spend)}</td><td>{format(row.impressions)}</td><td>{format(row.clicks)}</td><td>{format(row.conversions)}</td><td>{format(row.conversion_value)}</td></tr>)}</tbody></table></div>
        </>}
      </section>
      <section className={styles.card}><h2>Conversation inbox</h2><p>Latest 100 received events, across all dates. Exact, unique international phone matches are linked to CRM leads automatically; ambiguous matches stay here for owner review. Delivery status is not a completed conversation. WhatsApp outbound message bodies and old app history are not supplied by delivery callbacks.</p>
        {!data.events.length && <p className={styles.empty}>No provider events received. Connect WhatsApp Business API or a supported phone provider to start automatic sync.</p>}
        {data.events.map(event => <article className={styles.event} key={event.id}><div className={styles.cardTitle}><strong>{names[event.provider]} · {event.direction} · {event.kind.replace(/_/g, ' ')}</strong><span>{event.status}</span></div><p className={styles.muted}>{event.phone ? `+${event.phone}` : 'Phone not supplied'} · {new Date(event.occurred_at).toLocaleString()}</p><p className={styles.body}>{event.body}</p>
          {event.lead_id ? <p>Linked lead: <Link href="/admin/leads">{event.lead_id}</Link></p> : <div className={styles.controls}><label>Link to an existing lead ID<input placeholder="CRM lead UUID" value={leadIds[event.id] || ''} onChange={e => setLeadIds({ ...leadIds, [event.id]: e.target.value })} /></label><button className="btn btn-outline" disabled={busy || !leadIds[event.id]} onClick={() => void act({ action: 'link', eventId: event.id, leadId: leadIds[event.id] })}>Link event</button></div>}
        </article>)}
      </section>
    </>}
  </div>;
}
