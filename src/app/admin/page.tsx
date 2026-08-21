'use client';

import { useEffect, useState } from 'react';
import type { AdminDashboardData } from '@/lib/admin-dashboard';
import { Users, CalendarDays, FileText, Package, ExternalLink } from 'lucide-react';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data || typeof data !== 'object' || !('stats' in data)) {
          throw new Error(
            typeof data?.error === 'string'
              ? data.error
              : 'Failed to load dashboard data.',
          );
        }

        setDashboard(data as AdminDashboardData);
        setRequestError('');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRequestError(
          error instanceof Error ? error.message : 'Failed to load dashboard data.',
        );
      }
    };

    void fetchDashboard();
    return () => controller.abort();
  }, []);

  const stats = dashboard?.stats || {
    leads: 0,
    meetings: 0,
    blogs: 0,
    products: 0,
    unreadLeads: 0,
    pendingMeetings: 0,
  };
  const recentLeads = dashboard?.recentLeads || [];
  const recentMeetings = dashboard?.recentMeetings || [];
  const notices = [requestError, ...(dashboard?.notices || [])].filter(Boolean);

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>
        {dashboard
          ? 'A fast overview of your latest website enquiries.'
          : 'Loading the latest website activity…'}
      </p>

      {notices.length > 0 && (
        <div className={styles.noticeList}>
          {notices.map((notice) => (
            <div key={notice} className={styles.noticeCard}>
              {notice}
            </div>
          ))}
        </div>
      )}

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        {[
          { icon: <Users size={24} />, label: 'Total Leads', value: stats.leads, sub: `${stats.unreadLeads} unread`, color: '#2563eb' },
          { icon: <CalendarDays size={24} />, label: 'Meeting Requests', value: stats.meetings, sub: `${stats.pendingMeetings} pending`, color: '#f59e0b' },
          { icon: <Package size={24} />, label: 'Products', value: stats.products, sub: 'catalog items', color: '#10b981' },
          { icon: <FileText size={24} />, label: 'Blog Posts', value: stats.blogs, sub: 'drafts + published', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tablesGrid}>
        {/* Recent Leads */}
        <div className={styles.tableCard}>
          <h3 className={styles.tableTitle}><Users size={18} /> Recent Leads</h3>
          {recentLeads.length === 0 ? (
            <p className={styles.emptyMsg}>No leads yet. They&apos;ll appear here when visitors submit the contact form.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Source</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td><strong>{lead.name}</strong></td>
                    <td>{lead.email}</td>
                    <td><span className="badge badge-primary">{lead.source}</span></td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Meetings */}
        <div className={styles.tableCard}>
          <h3 className={styles.tableTitle}><CalendarDays size={18} /> Recent Meetings</h3>
          {recentMeetings.length === 0 ? (
            <p className={styles.emptyMsg}>No meetings yet. They&apos;ll appear here when visitors book meetings.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Schedule</th><th>Link</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentMeetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td><strong>{meeting.name}</strong></td>
                    <td>{meeting.date} · {meeting.time}</td>
                    <td>
                      {meeting.meetingLink ? (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.meetingLink}
                        >
                          Join Link <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span className={styles.pendingLink}>Pending setup</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${meeting.status === 'confirmed' ? 'badge-success' : meeting.status === 'cancelled' ? 'badge-error' : 'badge-warning'}`}>
                        {meeting.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
