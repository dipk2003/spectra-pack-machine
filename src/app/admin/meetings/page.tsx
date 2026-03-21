'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Check, X, Clock, Phone, Mail, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (Array.isArray(data)) setMeetings(data);
    } catch { }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/meetings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    toast.success(`Meeting ${status}`);
    fetchMeetings();
  };

  const statusColor = (s: string) => s === 'confirmed' ? 'badge-success' : s === 'cancelled' ? 'badge-error' : 'badge-warning';

  return (
    <div>
      <h1 className={styles.pageTitle}>Meeting Requests</h1>
      <p className={styles.pageSubtitle}>{meetings.length} total meetings · {meetings.filter(m => m.status === 'pending').length} pending</p>

      {meetings.length === 0 ? (
        <div className={styles.empty}>No meetings scheduled yet.</div>
      ) : (
        <div className={styles.meetingList}>
          {meetings.map((m) => (
            <div key={m.id} className={styles.meetingCard}>
              <div className={styles.meetingHeader}>
                <div>
                  <h3>{m.name}</h3>
                  <span className={`badge ${statusColor(m.status)}`}>{m.status}</span>
                </div>
                <div className={styles.meetingDateTime}>
                  <span><CalendarDays size={14} /> {m.date}</span>
                  <span><Clock size={14} /> {m.time}</span>
                </div>
              </div>
              <div className={styles.meetingDetails}>
                <span><Mail size={14} /> {m.email}</span>
                <span><Phone size={14} /> {m.phone}</span>
                {m.company && <span><Building size={14} /> {m.company}</span>}
              </div>
              {m.message && <p className={styles.meetingMessage}>{m.message}</p>}
              {m.status === 'pending' && (
                <div className={styles.meetingActions}>
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(m.id, 'confirmed')}>
                    <Check size={14} /> Confirm
                  </button>
                  <button className="btn btn-sm" style={{ color: 'var(--error)', border: '1px solid var(--error)' }} onClick={() => updateStatus(m.id, 'cancelled')}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
