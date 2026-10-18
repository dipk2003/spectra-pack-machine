'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AdminDashboardData } from '@/lib/admin-dashboard';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Inbox,
  Megaphone,
  Plus,
  Users,
} from 'lucide-react';
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
          throw new Error(typeof data?.error === 'string' ? data.error : 'Failed to load CRM overview.');
        }
        setDashboard(data as AdminDashboardData);
        setRequestError('');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRequestError(error instanceof Error ? error.message : 'Failed to load CRM overview.');
      }
    };
    void fetchDashboard();
    return () => controller.abort();
  }, []);

  const stats = dashboard?.stats || {
    leads: 0, meetings: 0, blogs: 0, products: 0, unreadLeads: 0, pendingMeetings: 0,
  };
  const recentLeads = dashboard?.recentLeads || [];
  const recentMeetings = dashboard?.recentMeetings || [];
  const notices = [requestError, ...(dashboard?.notices || [])].filter(Boolean);

  return (
    <main className={styles.dashboard}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>SALES WORKSPACE</span>
          <h1 className={styles.pageTitle}>CRM overview</h1>
          <p className={styles.pageSubtitle}>Track incoming enquiries, follow-ups and customer conversations in one place.</p>
        </div>
        <Link className={styles.primaryAction} href="/admin/leads?new=1"><Plus size={17} /> Add lead</Link>
      </header>

      {notices.length > 0 && <div className={styles.noticeList}>
        {notices.map((notice) => <div key={notice} className={styles.noticeCard}>{notice}</div>)}
      </div>}

      <section className={styles.statsGrid} aria-label="CRM summary">
        <Link href="/admin/leads" className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.blue}`}><Users size={19} /></span>
          <span className={styles.statCopy}><span className={styles.statLabel}>All leads</span><strong className={styles.statValue}>{stats.leads}</strong><span className={styles.statHint}>Customer enquiries</span></span>
          <ArrowUpRight className={styles.statArrow} size={17} />
        </Link>
        <Link href="/admin/leads?view=unassigned" className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.violet}`}><Inbox size={19} /></span>
          <span className={styles.statCopy}><span className={styles.statLabel}>Unread leads</span><strong className={styles.statValue}>{stats.unreadLeads}</strong><span className={styles.statHint}>Need a first response</span></span>
          <ArrowUpRight className={styles.statArrow} size={17} />
        </Link>
        <Link href="/admin/meetings" className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.green}`}><CalendarDays size={19} /></span>
          <span className={styles.statCopy}><span className={styles.statLabel}>Meeting requests</span><strong className={styles.statValue}>{stats.meetings}</strong><span className={styles.statHint}>{stats.pendingMeetings} awaiting confirmation</span></span>
          <ArrowUpRight className={styles.statArrow} size={17} />
        </Link>
        <Link href="/admin/integrations" className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.orange}`}><Megaphone size={19} /></span>
          <span className={styles.statCopy}><span className={styles.statLabel}>Lead sources</span><strong className={styles.statValue}>4</strong><span className={styles.statHint}>Website · Google · Meta · WhatsApp</span></span>
          <ArrowUpRight className={styles.statArrow} size={17} />
        </Link>
      </section>

      <section className={styles.workspaceGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><h2>Recent leads</h2><p>Latest people who entered your sales pipeline</p></div>
            <Link href="/admin/leads" className={styles.textLink}>View all <ArrowRight size={15} /></Link>
          </div>
          {recentLeads.length === 0 ? <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Users size={20} /></span><strong>No leads yet</strong>
            <span>Website enquiries and manually added leads will appear here.</span>
            <Link href="/admin/leads?new=1" className={styles.emptyLink}>Create your first lead <ArrowRight size={14} /></Link>
          </div> : <div className={styles.tableWrap}><table className={styles.table}>
            <thead><tr><th>Contact</th><th>Source</th><th>Stage</th><th>Received</th><th aria-label="Open" /></tr></thead>
            <tbody>{recentLeads.map((lead) => <tr key={lead.id}>
              <td><span className={styles.contactName}>{lead.name}</span><span className={styles.contactEmail}>{lead.email || 'No email provided'}</span></td>
              <td><span className={styles.sourceTag}>{lead.source.replace(/[-_]+/g, ' ')}</span></td>
              <td><span className={`${styles.status} ${lead.status === 'won' ? styles.statusWon : lead.status === 'lost' || lead.status === 'spam' ? styles.statusClosed : styles.statusOpen}`}><i />{lead.status.replace(/[-_]+/g, ' ')}</span></td>
              <td className={styles.dateCell}>{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
              <td><Link href="/admin/leads" className={styles.rowOpen} aria-label={`Open ${lead.name}`}><ArrowRight size={16} /></Link></td>
            </tr>)}</tbody>
          </table></div>}
        </div>

        <aside className={styles.sideColumn}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><div><h2>Work queue</h2><p>Items to keep moving</p></div><Activity size={18} className={styles.mutedIcon} /></div>
            <Link href="/admin/leads?view=due-today" className={styles.queueItem}>
              <span className={`${styles.queueIcon} ${styles.queueBlue}`}><CheckCircle2 size={17} /></span><span><strong>Follow-ups</strong><small>Review today&apos;s and overdue tasks</small></span><ArrowRight size={15} />
            </Link>
            <Link href="/admin/meetings" className={styles.queueItem}>
              <span className={`${styles.queueIcon} ${styles.queueGreen}`}><CalendarDays size={17} /></span><span><strong>Meeting requests</strong><small>{stats.pendingMeetings} waiting for confirmation</small></span><ArrowRight size={15} />
            </Link>
            <Link href="/admin/integrations" className={styles.queueItem}>
              <span className={`${styles.queueIcon} ${styles.queueOrange}`}><Megaphone size={17} /></span><span><strong>Lead sources</strong><small>Check ad attribution and connections</small></span><ArrowRight size={15} />
            </Link>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><div><h2>Recent meetings</h2><p>Latest customer bookings</p></div><Link href="/admin/meetings" className={styles.textLink}>All <ArrowRight size={14} /></Link></div>
            {recentMeetings.length === 0 ? <p className={styles.meetingEmpty}>No meeting requests yet.</p> : <div className={styles.meetingList}>
              {recentMeetings.slice(0, 4).map((meeting) => <Link href="/admin/meetings" key={meeting.id} className={styles.meetingRow}>
                <span className={styles.meetingDate}><strong>{new Date(meeting.date).toLocaleDateString('en-IN', { day: '2-digit' })}</strong><small>{new Date(meeting.date).toLocaleDateString('en-IN', { month: 'short' })}</small></span>
                <span className={styles.meetingCopy}><strong>{meeting.name}</strong><small>{meeting.time}</small></span>
                <span className={`${styles.status} ${meeting.status === 'confirmed' ? styles.statusWon : meeting.status === 'cancelled' ? styles.statusClosed : styles.statusOpen}`}><i />{meeting.status}</span>
              </Link>)}
            </div>}
          </div>
        </aside>
      </section>

      <section className={styles.siteMetrics} aria-label="Website content summary">
        <span>Website content</span><span>{stats.products} products</span><span>{stats.blogs} articles</span><Link href="/admin/products">Manage website <ArrowDownRight size={14} /></Link>
      </section>
    </main>
  );
}
