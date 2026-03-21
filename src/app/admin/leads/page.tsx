'use client';

import { useEffect, useState } from 'react';
import type { LeadRecord } from '@/lib/cms';
import { Eye, Trash2, Mail, Phone, Building, Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
    } catch { }
  };

  const markRead = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) });
    toast.success('Marked as read');
    fetchLeads();
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    toast.success('Lead deleted');
    fetchLeads();
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

  const filtered = filter === 'all' ? leads : filter === 'unread' ? leads.filter((lead) => !lead.read) : leads.filter((lead) => lead.read);

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
        {['all', 'unread', 'read'].map((f) => (
          <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? leads.length : f === 'unread' ? leads.filter((lead) => !lead.read).length : leads.filter((lead) => lead.read).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No leads found.</div>
      ) : (
        <div className={styles.leadList}>
          {filtered.map((lead) => (
            <div key={lead.id} className={`${styles.leadCard} ${!lead.read ? styles.leadUnread : ''}`}>
              <div className={styles.leadHeader}>
                <div>
                  <h3 className={styles.leadName}>{lead.name}</h3>
                  <span className={`badge ${lead.source === 'contact' ? 'badge-primary' : 'badge-warning'}`}>{lead.source}</span>
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
