'use client';

import { useEffect, useState } from 'react';
import type { MeetingRecord } from '@/lib/cms';
import { CalendarDays, Check, X, Clock, Phone, Mail, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (Array.isArray(data)) setMeetings(data);
    } catch { }
  };

  const updateStatus = async (id: string, status: MeetingRecord['status']) => {
    await fetch(`/api/meetings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    toast.success(`Meeting ${status}`);
    fetchMeetings();
  };

  const statusColor = (status: MeetingRecord['status']) =>
    status === 'confirmed' ? 'badge-success' : status === 'cancelled' ? 'badge-error' : 'badge-warning';

  return (
    <div>
      <h1 className={styles.pageTitle}>Meeting Requests</h1>
      <p className={styles.pageSubtitle}>{meetings.length} total meetings · {meetings.filter((meeting) => meeting.status === 'pending').length} pending</p>

      {meetings.length === 0 ? (
        <div className={styles.empty}>No meetings scheduled yet.</div>
      ) : (
        <div className={styles.meetingList}>
          {meetings.map((meeting) => (
            <div key={meeting.id} className={styles.meetingCard}>
              <div className={styles.meetingHeader}>
                <div>
                  <h3>{meeting.name}</h3>
                  <span className={`badge ${statusColor(meeting.status)}`}>{meeting.status}</span>
                </div>
                <div className={styles.meetingDateTime}>
                  <span><CalendarDays size={14} /> {meeting.date}</span>
                  <span><Clock size={14} /> {meeting.time}</span>
                </div>
              </div>
              <div className={styles.meetingDetails}>
                <span><Mail size={14} /> {meeting.email}</span>
                <span><Phone size={14} /> {meeting.phone}</span>
                {meeting.company && <span><Building size={14} /> {meeting.company}</span>}
              </div>
              {meeting.message && <p className={styles.meetingMessage}>{meeting.message}</p>}
              {meeting.status === 'pending' && (
                <div className={styles.meetingActions}>
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(meeting.id, 'confirmed')}>
                    <Check size={14} /> Confirm
                  </button>
                  <button className="btn btn-sm" style={{ color: 'var(--error)', border: '1px solid var(--error)' }} onClick={() => updateStatus(meeting.id, 'cancelled')}>
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
