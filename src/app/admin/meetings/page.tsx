'use client';

import { useEffect, useState } from 'react';
import type { MeetingRecord } from '@/lib/cms';
import {
  CalendarDays,
  Check,
  X,
  Clock,
  Phone,
  Mail,
  Building,
  Copy,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

type MeetingDraft = {
  meetingLink: string;
  adminNotes: string;
};

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, MeetingDraft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/meetings');
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMeetings([]);
        setError(typeof data?.error === 'string' ? data.error : 'Failed to load meetings.');
        return;
      }

      if (Array.isArray(data)) {
        setMeetings(data);
        setDrafts(
          data.reduce<Record<string, MeetingDraft>>((acc, meeting) => {
            acc[meeting.id] = {
              meetingLink: meeting.meetingLink || '',
              adminNotes: meeting.adminNotes || '',
            };
            return acc;
          }, {}),
        );
      } else {
        setMeetings([]);
        setError('Failed to load meetings.');
      }
    } catch {
      setMeetings([]);
      setError('Failed to load meetings.');
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = (id: string, patch: Partial<MeetingDraft>) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        meetingLink: current[id]?.meetingLink || '',
        adminNotes: current[id]?.adminNotes || '',
        ...patch,
      },
    }));
  };

  const saveMeeting = async (
    meeting: MeetingRecord,
    patch: Partial<MeetingDraft & { status: string }>,
    successMessage: string,
  ) => {
    const draft = drafts[meeting.id] || {
      meetingLink: meeting.meetingLink || '',
      adminNotes: meeting.adminNotes || '',
    };
    const res = await fetch(`/api/meetings/${meeting.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingLink: draft.meetingLink,
        adminNotes: draft.adminNotes,
        sendEmailNotification: true,
        ...patch,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(typeof data?.error === 'string' ? data.error : 'Failed to update meeting');
      return;
    }

    toast.success(successMessage);
    void fetchMeetings();
  };

  const copyMeetingLink = async (meetingLink: string) => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      toast.success('Meeting link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const statusColor = (status: MeetingRecord['status']) =>
    status === 'confirmed' ? 'badge-success' : status === 'cancelled' ? 'badge-error' : 'badge-warning';

  return (
    <div>
      <h1 className={styles.pageTitle}>Meeting Requests</h1>
      <p className={styles.pageSubtitle}>{meetings.length} total meetings · {meetings.filter((meeting) => meeting.status === 'pending').length} pending</p>

      {loading ? (
        <div className={styles.empty}>Loading meetings...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : meetings.length === 0 ? (
        <div className={styles.empty}>No meetings scheduled yet.</div>
      ) : (
        <div className={styles.meetingList}>
          {meetings.map((meeting) => {
            const draft = drafts[meeting.id] || {
              meetingLink: meeting.meetingLink || '',
              adminNotes: meeting.adminNotes || '',
            };

            return (
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
              {meeting.machineInterest && <p className={styles.meetingMessage}><strong>Machine:</strong> {meeting.machineInterest}</p>}
              {meeting.message && <p className={styles.meetingMessage}>{meeting.message}</p>}
              <div className={styles.meetingLinkBlock}>
                <div className={styles.meetingLinkHeader}>
                  <span><LinkIcon size={14} /> Meeting Link</span>
                  {draft.meetingLink ? (
                    <div className={styles.linkActions}>
                      <button className="btn btn-sm btn-outline" onClick={() => copyMeetingLink(draft.meetingLink)}>
                        <Copy size={14} /> Copy Link
                      </button>
                      <a
                        href={draft.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                      >
                        <ExternalLink size={14} /> Open Link
                      </a>
                    </div>
                  ) : null}
                </div>
                <input
                  type="url"
                  className="form-input"
                  value={draft.meetingLink}
                  onChange={(event) => updateDraft(meeting.id, { meetingLink: event.target.value })}
                  placeholder="https://meet.jit.si/your-room"
                />
              </div>

              <div className={styles.adminNotesBlock}>
                <label className={styles.notesLabel}>Admin Notes</label>
                <textarea
                  className="form-input form-textarea"
                  value={draft.adminNotes}
                  onChange={(event) => updateDraft(meeting.id, { adminNotes: event.target.value })}
                  placeholder="Internal note or a note that should go to the customer."
                />
              </div>

              <div className={styles.meetingActions}>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => saveMeeting(meeting, {}, 'Meeting details updated')}
                >
                  Save + Email
                </button>
                {meeting.status !== 'confirmed' && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => saveMeeting(meeting, { status: 'confirmed' }, 'Meeting confirmed')}
                  >
                    <Check size={14} /> Confirm
                  </button>
                )}
                {meeting.status !== 'cancelled' && (
                  <button
                    className="btn btn-sm"
                    style={{ color: 'var(--error)', border: '1px solid var(--error)' }}
                    onClick={() => saveMeeting(meeting, { status: 'cancelled' }, 'Meeting cancelled')}
                  >
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
