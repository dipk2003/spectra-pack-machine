'use client';

import { useEffect, useState } from 'react';
import type { LeadRecord } from '@/lib/cms';
import { Eye, Trash2, Mail, Phone, Building, Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const getLeadSourceGroup = (source: string) => {
  const normalized = source.toLowerCase();

  if (normalized === 'contact') return 'contact';
  if (normalized.includes('lead-magnet') || normalized.includes('popup')) return 'popup';
  if (normalized.startsWith('product-')) return 'product';
  return 'other';
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads');
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setLeads([]);
        setError(typeof data?.error === 'string' ? data.error : 'Failed to load leads.');
        return;
      }

      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        setLeads([]);
        setError('Failed to load leads.');
      }
    } catch {
      setLeads([]);
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    const res = await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(typeof data?.error === 'string' ? data.error : 'Failed to update lead');
      return;
    }
    toast.success('Marked as read');
    void fetchLeads();
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(typeof data?.error === 'string' ? data.error : 'Failed to delete lead');
      return;
    }
    toast.success('Lead deleted');
    void fetchLeads();
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Message', 'Source', 'Date'];
    const rows = leads.map((lead) => [lead.name, lead.email, lead.phone, lead.company, lead.message, lead.source, new Date(lead.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map((row) => row.map((cell: string) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads-${Date.now()}.csv`; a.click();
  };

  const filtered = leads.filter((lead) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !lead.read;
    if (filter === 'read') return lead.read;
    return getLeadSourceGroup(lead.source) === filter;
  });

  const filterOptions = [
    { id: 'all', label: 'All', count: leads.length },
    { id: 'unread', label: 'Unread', count: leads.filter((lead) => !lead.read).length },
    { id: 'read', label: 'Read', count: leads.filter((lead) => lead.read).length },
    {
      id: 'popup',
      label: 'Popup Leads',
      count: leads.filter((lead) => getLeadSourceGroup(lead.source) === 'popup').length,
    },
    {
      id: 'contact',
      label: 'Contact Leads',
      count: leads.filter((lead) => getLeadSourceGroup(lead.source) === 'contact').length,
    },
    {
      id: 'product',
      label: 'Product Leads',
      count: leads.filter((lead) => getLeadSourceGroup(lead.source) === 'product').length,
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Leads</h1>
          <p className={styles.pageSubtitle}>{leads.length} total leads</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={exportCSV}><Download size={16} /> Export CSV</button>
      </div>

      <div className={styles.filters}>
        {filterOptions.map((item) => (
          <button
            key={item.id}
            className={`${styles.filterBtn} ${filter === item.id ? styles.filterActive : ''}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Loading leads...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No leads found.</div>
      ) : (
        <div className={styles.leadList}>
          {filtered.map((lead) => (
            <div key={lead.id} className={`${styles.leadCard} ${!lead.read ? styles.leadUnread : ''}`}>
              <div className={styles.leadHeader}>
                <div>
                  <h3 className={styles.leadName}>{lead.name}</h3>
                  <span
                    className={`badge ${
                      getLeadSourceGroup(lead.source) === 'contact'
                        ? 'badge-primary'
                        : getLeadSourceGroup(lead.source) === 'popup'
                          ? 'badge-warning'
                          : 'badge-success'
                    }`}
                  >
                    {lead.source}
                  </span>
                </div>
                <span className={styles.leadDate}><Calendar size={14} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.leadDetails}>
                <span><Mail size={14} /> {lead.email}</span>
                <span><Phone size={14} /> {lead.phone}</span>
                {lead.company && <span><Building size={14} /> {lead.company}</span>}
              </div>
              <p className={styles.leadMessage}>{lead.message}</p>
              <div className={styles.leadActions}>
                {!lead.read && <button className="btn btn-sm btn-outline" onClick={() => markRead(lead.id)}><Eye size={14} /> Mark Read</button>}
                <button className="btn btn-sm" style={{ color: 'var(--error)' }} onClick={() => deleteLead(lead.id)}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
