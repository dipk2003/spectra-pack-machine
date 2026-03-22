'use client';

import { useEffect, useState } from 'react';
import type { BlogRecord, LeadRecord, MeetingRecord, ProductRecord } from '@/lib/cms';
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
  const [recentLeads, setRecentLeads] = useState<LeadRecord[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingRecord[]>([]);
  const [notices, setNotices] = useState<string[]>([]);

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
      const [leads, meetings, blogs, products] = await Promise.all([
        leadsRes.json().catch(() => null),
        meetingsRes.json().catch(() => null),
        blogsRes.json().catch(() => null),
        productsRes.json().catch(() => null),
      ]);

      const nextNotices = [
        !leadsRes.ok && typeof leads?.error === 'string' ? leads.error : '',
        !meetingsRes.ok && typeof meetings?.error === 'string' ? meetings.error : '',
        !blogsRes.ok && typeof blogs?.error === 'string' ? blogs.error : '',
        !productsRes.ok && typeof products?.error === 'string' ? products.error : '',
      ].filter((message, index, all) => Boolean(message) && all.indexOf(message) === index);

      const typedLeads = Array.isArray(leads) ? (leads as LeadRecord[]) : [];
      const typedMeetings = Array.isArray(meetings) ? (meetings as MeetingRecord[]) : [];
      const typedBlogs = Array.isArray(blogs) ? (blogs as BlogRecord[]) : [];
      const typedProducts = Array.isArray(products) ? (products as ProductRecord[]) : [];

      setStats({
        leads: typedLeads.length,
        meetings: typedMeetings.length,
        blogs: typedBlogs.length,
        products: typedProducts.length,
        unreadLeads: typedLeads.filter((lead) => !lead.read).length,
        pendingMeetings: typedMeetings.filter((meeting) => meeting.status === 'pending').length,
      });
      setRecentLeads(typedLeads.slice(0, 5));
      setRecentMeetings(typedMeetings.slice(0, 5));
      setNotices(nextNotices as string[]);
    } catch {
      setNotices(['Failed to load dashboard data.']);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>Welcome back! Here&apos;s an overview of your website activity.</p>

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
                <tr><th>Name</th><th>Date</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentMeetings.map((meeting) => (
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
