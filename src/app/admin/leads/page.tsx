'use client';

import { useEffect, useState } from 'react';
import type { LeadRecord } from '@/lib/cms';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from '@/lib/lead-status';
import { Eye, Trash2, Mail, Phone, Building, Calendar, Download, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const getLeadSourceGroup = (source: string) => {
  const normalized = source.toLowerCase();

  if (normalized === 'contact') return 'contact';
  if (normalized.includes('lead-magnet') || normalized.includes('popup')) return 'popup';
  if (normalized.startsWith('product-')) return 'product';
  if (normalized.startsWith('seo-')) return 'seo';
  if (normalized.startsWith('chatbot')) return 'chatbot';
  return 'other';
};

const escapeCSVCell = (value: unknown) => {
  let cell = String(value ?? '').replace(/\0/g, '');

  // Spreadsheet applications can execute cells beginning with formula control
  // characters. Prefix those values as text before applying normal CSV escaping.
  if (/^[\s]*[=+\-@]/.test(cell)) {
    cell = `'${cell}`;
  }

  return `"${cell.replace(/"/g, '""')}"`;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [filter, setFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState<'all' | LeadStatus>('all');
  const [updatingLeadId, setUpdatingLeadId] = useState('');
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

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    setUpdatingLeadId(id);

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(typeof data?.error === 'string' ? data.error : 'Failed to update lead stage');
        return;
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === id ? (data as LeadRecord) : lead)),
      );
      toast.success(`Lead moved to ${LEAD_STATUS_LABELS[status]}`);
    } catch {
      toast.error('Failed to update lead stage');
    } finally {
      setUpdatingLeadId('');
    }
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
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'Machine Interest',
      'Message',
      'Source',
      'Status',
      'First Contacted',
      'Last Contacted',
      'Date',
    ];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.machineInterest,
      lead.message,
      lead.source,
      LEAD_STATUS_LABELS[lead.status],
      lead.firstContactedAt ? new Date(lead.firstContactedAt).toLocaleString() : '',
      lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString() : '',
      new Date(lead.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSVCell).join(','))
      .join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter((lead) => {
    const matchesStage = stageFilter === 'all' || lead.status === stageFilter;
    if (!matchesStage) return false;
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
    {
      id: 'seo',
      label: 'Location SEO',
      count: leads.filter((lead) => getLeadSourceGroup(lead.source) === 'seo').length,
    },
    {
      id: 'chatbot',
      label: 'Chatbot',
      count: leads.filter((lead) => getLeadSourceGroup(lead.source) === 'chatbot').length,
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
        <div className={styles.filterButtons}>
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
        <label className={styles.stageFilter}>
          <Workflow size={15} aria-hidden="true" />
          <span>Pipeline stage</span>
          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value as 'all' | LeadStatus)}
          >
            <option value="all">All stages ({leads.length})</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]} ({leads.filter((lead) => lead.status === status).length})
              </option>
            ))}
          </select>
        </label>
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
                  <div className={styles.badges}>
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
                    <span className={`${styles.statusBadge} ${styles[`status_${lead.status}`]}`}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                </div>
                <span className={styles.leadDate}><Calendar size={14} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.leadDetails}>
                <span><Mail size={14} /> {lead.email}</span>
                <span><Phone size={14} /> {lead.phone}</span>
                {lead.company && <span><Building size={14} /> {lead.company}</span>}
              </div>
              {lead.machineInterest && <p className={styles.leadMessage}><strong>Machine:</strong> {lead.machineInterest}</p>}
              <p className={styles.leadMessage}>{lead.message}</p>
              {lead.lastContactedAt && (
                <p className={styles.contactHistory}>
                  Last pipeline update: {new Date(lead.lastContactedAt).toLocaleString()}
                </p>
              )}
              <div className={styles.leadActions}>
                <label className={styles.statusControl}>
                  <span>Stage</span>
                  <select
                    value={lead.status}
                    disabled={updatingLeadId === lead.id}
                    onChange={(event) =>
                      void updateLeadStatus(lead.id, event.target.value as LeadStatus)
                    }
                    aria-label={`Pipeline stage for ${lead.name}`}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {LEAD_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
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
