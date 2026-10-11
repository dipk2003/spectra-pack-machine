'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Eye,
  FileText,
  Mail,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Phone,
  RefreshCw,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Users,
  XCircle,
} from 'lucide-react';
import type { DeveloperPanelData } from '@/lib/developer-panel';
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/lead-status';
import styles from './page.module.css';

type DeveloperPanelClientProps = {
  initialData: DeveloperPanelData;
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown time'
    : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const humanizeEventName = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

export default function DeveloperPanelClient({ initialData }: DeveloperPanelClientProps) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [locking, setLocking] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    setRefreshError('');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch('/api/admin/developer', {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });
      const nextData = await response.json().catch(() => null);
      if (response.status === 423) {
        window.location.reload();
        return;
      }
      if (!response.ok || !nextData || typeof nextData !== 'object' || !('analytics' in nextData)) {
        throw new Error(
          typeof nextData?.error === 'string'
            ? nextData.error
            : 'Unable to refresh developer diagnostics.',
        );
      }
      setData(nextData as DeveloperPanelData);
    } catch (error) {
      setRefreshError(
        error instanceof DOMException && error.name === 'AbortError'
          ? 'Refresh timed out after 15 seconds. Please retry.'
          : error instanceof Error
            ? error.message
            : 'Unable to refresh developer diagnostics.',
      );
    } finally {
      window.clearTimeout(timeoutId);
      setRefreshing(false);
    }
  };

  const lockDashboard = async () => {
    setLocking(true);
    setRefreshError('');
    try {
      const response = await fetch('/api/admin/developer/pin', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('Developer dashboard lock nahi ho paya.');
      window.location.reload();
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Dashboard lock failed.');
      setLocking(false);
    }
  };

  const analytics = data.analytics;
  const operations = data.operations;
  const advertising = data.advertising;
  const pipeline = data.pipeline;
  const maxDailyActivity = Math.max(
    1,
    ...analytics.dailyActivity.map((day) => day.pageViews),
  );
  const eventCards = [
    { label: 'Page views', value: analytics.totals.pageViews, icon: Eye, color: '#2563eb' },
    {
      label: 'Contact actions',
      value: analytics.totals.contactActions,
      icon: MousePointerClick,
      color: '#7c3aed',
    },
    {
      label: 'WhatsApp clicks',
      value: analytics.totals.whatsappClicks,
      icon: MessageCircle,
      color: '#16a34a',
    },
    { label: 'Phone clicks', value: analytics.totals.phoneClicks, icon: Phone, color: '#0891b2' },
    { label: 'Email clicks', value: analytics.totals.emailClicks, icon: Mail, color: '#ea580c' },
    {
      label: 'Lead submissions',
      value: analytics.totals.leadSubmissions,
      icon: Users,
      color: '#db2777',
    },
    {
      label: 'Meeting bookings',
      value: analytics.totals.meetingBookings,
      icon: CalendarDays,
      color: '#d97706',
    },
    {
      label: 'Catalog downloads',
      value: analytics.totals.catalogDownloads,
      icon: Download,
      color: '#4f46e5',
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <ShieldCheck size={26} aria-hidden="true" />
            <h1 className={styles.pageTitle}>Developer Operations</h1>
          </div>
          <p className={styles.pageSubtitle}>
            Owner-only traffic, conversion, lead response, and configuration health.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.lockButton}
            disabled={locking || refreshing}
            onClick={() => void lockDashboard()}
          >
            <LockKeyhole size={16} aria-hidden="true" />
            {locking ? 'Locking…' : 'Lock'}
          </button>
          <button
            type="button"
            className={styles.refreshButton}
            disabled={refreshing || locking}
            onClick={() => void refresh()}
          >
            <RefreshCw
              size={16}
              className={refreshing ? styles.spinning : ''}
              aria-hidden="true"
            />
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
        </div>
      </div>

      <div className={styles.timestamp}>
        <Clock3 size={14} /> Last generated {formatDateTime(data.generatedAt)}
      </div>

      {data.access.fallbackWarning && (
        <div className={`${styles.notice} ${styles.warningNotice}`}>
          <TriangleAlert size={18} />
          <div>
            <strong>Restricted fallback is active</strong>
            <span>{data.access.fallbackWarning}</span>
          </div>
        </div>
      )}

      {refreshError && (
        <div className={`${styles.notice} ${styles.errorNotice}`} role="alert">
          <XCircle size={18} aria-hidden="true" /> <span>{refreshError}</span>
        </div>
      )}

      {analytics.notice && (
        <div
          className={`${styles.notice} ${
            analytics.status === 'available' ? styles.infoNotice : styles.warningNotice
          }`}
        >
          <Database size={18} /> <span>{analytics.notice}</span>
        </div>
      )}

      {operations.notices.map((notice) => (
        <div key={notice} className={`${styles.notice} ${styles.warningNotice}`}>
          <TriangleAlert size={18} /> <span>{notice}</span>
        </div>
      ))}

      <section className={styles.section} aria-labelledby="ads-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="ads-heading">Google Ads &amp; lead funnel</h2>
            <p>
              Latest {analytics.windowDays}-day website attribution. Paid traffic is detected
              from GCLID/GBRAID/WBRAID and campaign parameters.
            </p>
          </div>
          <span
            className={`${styles.statusPill} ${
              advertising.reportingApiConnected
                ? styles.status_available
                : styles.status_unavailable
            }`}
          >
            {advertising.reportingApiConnected ? 'Ads API connected' : 'Website attribution'}
          </span>
        </div>

        <div className={`${styles.notice} ${styles.infoNotice}`}>
          <Megaphone size={18} aria-hidden="true" />
          <span>{advertising.notice}</span>
        </div>

        <div className={styles.adsMetricGrid}>
          <div className={styles.adsMetric}>
            <Users size={20} />
            <strong>{formatNumber(advertising.websiteAttributed.visitors)}</strong>
            <span>Paid-attributed visitors</span>
          </div>
          <div className={styles.adsMetric}>
            <Eye size={20} />
            <strong>{formatNumber(advertising.websiteAttributed.pageViews)}</strong>
            <span>Paid-attributed page views</span>
          </div>
          <div className={styles.adsMetric}>
            <MousePointerClick size={20} />
            <strong>{formatNumber(advertising.websiteAttributed.contactActions)}</strong>
            <span>Paid contact clicks/actions</span>
          </div>
          <div className={styles.adsMetric}>
            <TrendingUp size={20} />
            <strong>{formatNumber(advertising.websiteAttributed.leads)}</strong>
            <span>Paid-attributed leads</span>
          </div>
          <div className={styles.adsMetric}>
            <BarChart3 size={20} />
            <strong>
              {advertising.websiteAttributed.conversionRate === null
                ? 'N/A'
                : `${advertising.websiteAttributed.conversionRate.toFixed(2)}%`}
            </strong>
            <span>Tracked paid session → lead rate</span>
          </div>
        </div>

        <div className={styles.apiMetrics} aria-label="Google Ads reporting metrics">
          {[
            ['Impressions', advertising.authoritative.impressions],
            ['Ad clicks', advertising.authoritative.clicks],
            ['Spend', advertising.authoritative.spend],
            ['Ads conversions', advertising.authoritative.conversions],
            ['Cost per Ads conversion', advertising.authoritative.costPerLead],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <span>{label}</span>
              <strong>{typeof value === 'number' ? formatNumber(value) : 'Unavailable'}</strong>
            </div>
          ))}
        </div>
        <Link href="/admin/integrations" className="btn btn-outline">Open Ads reporting &amp; conversation connections</Link>
      </section>

      <section className={styles.section} aria-labelledby="traffic-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="traffic-heading">First-party activity</h2>
            <p>
              Latest {analytics.windowDays}-day window. WhatsApp reports website clicks;
              message replies require WhatsApp Business API integration.
            </p>
          </div>
          <span className={`${styles.statusPill} ${styles[`status_${analytics.status}`]}`}>
            {analytics.status}
          </span>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <Users size={20} />
            <span>{formatNumber(analytics.uniqueVisitors)}</span>
            <small>Tracked visitor sessions</small>
          </div>
          <div className={styles.heroStat}>
            <Activity size={20} />
            <span>{formatNumber(analytics.totalEvents)}</span>
            <small>Total events</small>
          </div>
          <div className={styles.heroStat}>
            <Clock3 size={20} />
            <span>{formatNumber(analytics.eventsLast24Hours)}</span>
            <small>Last 24 hours</small>
          </div>
          <div className={styles.heroStat}>
            <Users size={20} />
            <span>{analytics.leadConversionRate.toFixed(2)}%</span>
            <small>Lead / page-view rate</small>
          </div>
        </div>

        <div className={styles.metricGrid}>
          {eventCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={styles.metricCard}>
              <span className={styles.metricIcon} style={{ color, backgroundColor: `${color}14` }}>
                <Icon size={19} />
              </span>
              <span className={styles.metricValue}>{formatNumber(value)}</span>
              <span className={styles.metricLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pipeline-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="pipeline-heading">Lead progress pipeline</h2>
            <p>All-time enquiry stages. Update every lead from the Leads screen after follow-up.</p>
          </div>
          <Link href="/admin/leads" className={styles.sectionLink}>Manage leads →</Link>
        </div>

        {pipeline.notice && (
          <div className={`${styles.notice} ${styles.warningNotice}`}>
            <TriangleAlert size={18} /> <span>{pipeline.notice}</span>
          </div>
        )}

        <div className={styles.pipelineSummary}>
          <div><span>Total leads</span><strong>{formatNumber(pipeline.total)}</strong></div>
          <div><span>Follow-up started</span><strong>{formatNumber(pipeline.progressed)}</strong></div>
          <div><span>Open opportunities</span><strong>{formatNumber(pipeline.openOpportunities)}</strong></div>
          <div><span>Won</span><strong>{formatNumber(pipeline.won)}</strong></div>
          <div><span>Paid attributed (all time)</span><strong>{formatNumber(pipeline.paidAttributed)}</strong></div>
        </div>

        <div className={styles.stageGrid}>
          {LEAD_STATUSES.map((status) => {
            const count = pipeline.stages[status];
            const maximum = Math.max(1, ...Object.values(pipeline.stages));
            return (
              <div key={status} className={`${styles.stageCard} ${styles[`stage_${status}`]}`}>
                <div><span>{LEAD_STATUS_LABELS[status]}</span><strong>{formatNumber(count)}</strong></div>
                <i style={{ width: `${(count / maximum) * 100}%` }} />
              </div>
            );
          })}
        </div>

        {pipeline.topPaidCampaigns.length > 0 && (
          <div className={styles.campaignBlock}>
            <h3>Paid leads by campaign</h3>
            <div className={styles.rankList}>
              {pipeline.topPaidCampaigns.map((campaign) => (
                <div key={campaign.label} className={styles.rankItem}>
                  <span title={campaign.label}>{campaign.label}</span>
                  <b>{formatNumber(campaign.count)}</b>
                  <i
                    style={{
                      width: `${Math.max(
                        4,
                        (campaign.count / pipeline.topPaidCampaigns[0].count) * 100,
                      )}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="operations-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="operations-heading">Lead response overview</h2>
            <p>Current database totals and items still waiting for admin action.</p>
          </div>
        </div>
        <div className={styles.operationGrid}>
          <div className={styles.operationCard}>
            <Users size={22} />
            <div><strong>{formatNumber(operations.stats.leads)}</strong><span>Total leads</span></div>
            <b>{formatNumber(operations.stats.unreadLeads)} unread</b>
          </div>
          <div className={styles.operationCard}>
            <CalendarDays size={22} />
            <div><strong>{formatNumber(operations.stats.meetings)}</strong><span>Meetings</span></div>
            <b>{formatNumber(operations.stats.pendingMeetings)} pending</b>
          </div>
          <div className={styles.operationCard}>
            <Database size={22} />
            <div><strong>{formatNumber(operations.stats.products)}</strong><span>Products</span></div>
            <b>{operations.database.mode}</b>
          </div>
          <div className={styles.operationCard}>
            <FileText size={22} />
            <div><strong>{formatNumber(operations.stats.blogs)}</strong><span>Blog posts</span></div>
            <b>content</b>
          </div>
        </div>
      </section>

      <div className={styles.splitGrid}>
        <section className={styles.section} aria-labelledby="recent-leads-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="recent-leads-heading">Recent lead progress</h2>
              <p>Latest enquiries, pipeline stage and admin review state.</p>
            </div>
            <Link href="/admin/leads" className={styles.sectionLink}>
              Open leads →
            </Link>
          </div>
          {operations.recentLeads.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Lead</th><th>Source</th><th>Stage</th><th>Admin state</th><th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td><strong>{lead.name}</strong></td>
                      <td>{lead.source}</td>
                      <td>
                        <span className={`${styles.responseBadge} ${styles.responseNeutral}`}>
                          {LEAD_STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.responseBadge} ${lead.read ? styles.responseDone : styles.responsePending}`}
                        >
                          {lead.read ? 'Reviewed' : 'Awaiting admin'}
                        </span>
                      </td>
                      <td>{formatDateTime(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.empty}>No leads have been received yet.</p>
          )}
        </section>

        <section className={styles.section} aria-labelledby="recent-meetings-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="recent-meetings-heading">Recent meeting status</h2>
              <p>Latest meeting requests and their current admin status.</p>
            </div>
            <Link href="/admin/meetings" className={styles.sectionLink}>
              Open meetings →
            </Link>
          </div>
          {operations.recentMeetings.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer</th><th>Schedule</th><th>Status</th><th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.recentMeetings.map((meeting) => (
                    <tr key={meeting.id}>
                      <td><strong>{meeting.name}</strong></td>
                      <td>{meeting.date} · {meeting.time}</td>
                      <td>
                        <span
                          className={`${styles.responseBadge} ${
                            meeting.status === 'confirmed'
                              ? styles.responseDone
                              : meeting.status === 'pending'
                                ? styles.responsePending
                                : styles.responseNeutral
                          }`}
                        >
                          {meeting.status}
                        </span>
                      </td>
                      <td>{formatDateTime(meeting.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.empty}>No meeting requests have been received yet.</p>
          )}
        </section>
      </div>

      <div className={styles.splitGrid}>
        <section className={styles.section} aria-labelledby="pages-heading">
          <div className={styles.sectionHeader}>
            <div><h2 id="pages-heading">Top pages</h2><p>Pages producing the most tracked views.</p></div>
          </div>
          {analytics.topPages.length ? (
            <div className={styles.rankList}>
              {analytics.topPages.map((item) => (
                <div key={item.label} className={styles.rankItem}>
                  <span title={item.label}>{item.label}</span>
                  <b>{formatNumber(item.count)}</b>
                  <i style={{ width: `${Math.max(4, (item.count / analytics.topPages[0].count) * 100)}%` }} />
                </div>
              ))}
            </div>
          ) : <p className={styles.empty}>No page-view data collected yet.</p>}
        </section>

        <section className={styles.section} aria-labelledby="sources-heading">
          <div className={styles.sectionHeader}>
            <div><h2 id="sources-heading">Traffic sources</h2><p>UTM or referrer attribution driving tracked activity.</p></div>
          </div>
          {analytics.topSources.length ? (
            <div className={styles.rankList}>
              {analytics.topSources.map((item) => (
                <div key={item.label} className={styles.rankItem}>
                  <span title={item.label}>{item.label}</span>
                  <b>{formatNumber(item.count)}</b>
                  <i style={{ width: `${Math.max(4, (item.count / analytics.topSources[0].count) * 100)}%` }} />
                </div>
              ))}
            </div>
          ) : <p className={styles.empty}>No source data collected yet.</p>}
        </section>
      </div>

      <section className={styles.section} aria-labelledby="trend-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="trend-heading">14-day website reach trend</h2>
            <p>Consented first-party page views and contact actions by day.</p>
          </div>
        </div>
        {analytics.dailyActivity.length ? (
          <div className={styles.trendChart}>
            {analytics.dailyActivity.map((day) => (
              <div key={day.date} className={styles.trendColumn} title={`${day.date}: ${day.pageViews} views, ${day.contactActions} contact actions`}>
                <span>{day.pageViews}</span>
                <div className={styles.trendTrack}>
                  <i style={{ height: `${Math.max(3, (day.pageViews / maxDailyActivity) * 100)}%` }} />
                  {day.contactActions > 0 && <b>{day.contactActions}</b>}
                </div>
                <small>{new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No daily activity has been collected yet.</p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="events-heading">
        <div className={styles.sectionHeader}>
          <div><h2 id="events-heading">Recent events</h2><p>Latest non-PII interactions across the website.</p></div>
        </div>
        {analytics.recentEvents.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Event</th><th>Page</th><th>Source</th><th>Context</th><th>Time</th></tr></thead>
              <tbody>
                {analytics.recentEvents.map((event, index) => (
                  <tr key={`${event.createdAt}-${event.eventName}-${index}`}>
                    <td><strong>{humanizeEventName(event.eventName)}</strong></td>
                    <td>{event.path || '—'}</td>
                    <td>{event.source}</td>
                    <td>{event.context || '—'}</td>
                    <td>{formatDateTime(event.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className={styles.empty}>No analytics events have been recorded yet.</p>}
      </section>

      <section className={styles.section} aria-labelledby="health-heading">
        <div className={styles.sectionHeader}>
          <div><h2 id="health-heading">Configuration health</h2><p>Presence checks only; secret values are never returned.</p></div>
        </div>
        <div className={styles.healthGrid}>
          {data.config.map((item) => (
            <div key={item.key} className={styles.healthItem}>
              {item.healthy
                ? <CheckCircle2 className={styles.healthGood} size={20} />
                : <XCircle className={styles.healthBad} size={20} />}
              <div><strong>{item.label}</strong><span>{item.detail}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
