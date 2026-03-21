'use client';

import { useEffect, useState } from 'react';
import { Users, CalendarDays, FileText, Package } from 'lucide-react';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    leads: 0,
    meetings: 0,
    blogs: 0,
    products: 0,
    unreadLeads: 0,
    pendingMeetings: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, meetingsRes, blogsRes, productsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/meetings'),
        fetch('/api/blogs'),
        fetch('/api/products'),
      ]);
      const leads = await leadsRes.json();
      const meetings = await meetingsRes.json();
      const blogs = await blogsRes.json();
      const products = await productsRes.json();

      if (
        Array.isArray(leads) &&
        Array.isArray(meetings) &&
        Array.isArray(blogs) &&
        Array.isArray(products)
      ) {
        setStats({
          leads: leads.length,
          meetings: meetings.length,
          blogs: blogs.length,
          products: products.length,
          unreadLeads: leads.filter((l: any) => !l.read).length,
          pendingMeetings: meetings.filter((m: any) => m.status === 'pending').length,
        });
        setRecentLeads(leads.slice(0, 5));
        setRecentMeetings(meetings.slice(0, 5));
      }
    } catch { }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>Welcome back! Here&apos;s an overview of your website activity.</p>

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
            <p className={styles.emptyMsg}>No leads yet. They'll appear here when visitors submit the contact form.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Source</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentLeads.map((lead: any) => (
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
            <p className={styles.emptyMsg}>No meetings yet. They'll appear here when visitors book meetings.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Date</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentMeetings.map((meeting: any) => (
                  <tr key={meeting.id}>
                    <td><strong>{meeting.name}</strong></td>
                    <td>{meeting.date}</td>
                    <td>{meeting.time}</td>
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
