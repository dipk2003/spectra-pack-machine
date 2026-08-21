'use client';

import { useState } from 'react';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Eye,
  FileText,
  Mail,
  MessageCircle,
  MousePointerClick,
  Phone,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Users,
  XCircle,
} from 'lucide-react';
import type { DeveloperPanelData } from '@/lib/developer-panel';
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

  const refresh = async () => {
    setRefreshing(true);
    setRefreshError('');

    try {
      const response = await fetch('/api/admin/developer', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const nextData = await response.json().catch(() => null);
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
        error instanceof Error ? error.message : 'Unable to refresh developer diagnostics.',
      );
    } finally {
      setRefreshing(false);
    }
  };

  const analytics = data.analytics;
  const operations = data.operations;
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
        <button
          type="button"
          className={styles.refreshButton}
          disabled={refreshing}
          onClick={() => void refresh()}
        >
          <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh data'}
        </button>
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
        <div className={`${styles.notice} ${styles.errorNotice}`}>
          <XCircle size={18} /> <span>{refreshError}</span>
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

      <section className={styles.section} aria-labelledby="traffic-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="traffic-heading">First-party activity</h2>
            <p>Latest {analytics.windowDays}-day window, collected without exposing visitor PII.</p>
          </div>
          <span className={`${styles.statusPill} ${styles[`status_${analytics.status}`]}`}>
            {analytics.status}
          </span>
        </div>

        <div className={styles.heroStats}>
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
