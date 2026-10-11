'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  Flame,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  StickyNote,
  UserPlus,
  UserRound,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  CRM_ACTIVITY_LABELS,
  CRM_ACTIVITY_TYPES,
  CRM_MANUAL_SOURCE_LABELS,
  CRM_MANUAL_SOURCES,
  CRM_PRIORITIES,
  CRM_PRIORITY_LABELS,
  isCrmOwnerRole,
  type CrmActivity,
  type CrmActivityType,
  type CrmLead,
  type CrmManualSource,
  type CrmPriority,
  type CrmTeamMember,
  type CrmWorkspace,
} from '@/lib/crm-types';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from '@/lib/lead-status';
import styles from './page.module.css';
import CrmCommunications from './CrmCommunications';
import CrmImport from './CrmImport';

type LeadView = 'all' | 'mine' | 'unassigned' | 'due-today' | 'overdue' | 'no-follow-up';
const EMPTY_LEADS: CrmLead[] = [];

const CHANNEL_LABELS: Record<string, string> = {
  'google-ads': 'Google Ads',
  'google-organic': 'Google Search',
  'microsoft-ads': 'Microsoft Ads',
  'meta-ads': 'Meta Ads',
  'ai-referral': 'AI Search / ChatGPT',
  'organic-search': 'Organic search',
  'paid-search': 'Paid search',
  referral: 'Referral website',
  direct: 'Direct / unattributed',
  campaign: 'Campaign',
};

const channelLabel = (lead: CrmLead) => lead.origin === 'manual'
  ? 'Staff enquiry'
  : CHANNEL_LABELS[lead.attribution?.channel] || 'Unattributed';

const contactActivityTypes = new Set(['call', 'whatsapp', 'email', 'meeting', 'site_visit']);

const mergeActivities = (current: CrmActivity[], incoming: CrmActivity[]) => {
  const activities = new Map(current.map((activity) => [activity.id, activity]));
  incoming.forEach((activity) => activities.set(activity.id, activity));
  return Array.from(activities.values()).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
};

const activityEvidence = (activity: CrmActivity) => {
  if (activity.activityType === 'communication_launch') return 'App launch requested';
  if (activity.metadata.status === 'accepted') return 'Email server accepted';
  if (activity.metadata.status === 'pending') return 'Email request pending';
  if (activity.metadata.status === 'uncertain') return 'Email result uncertain';
  if (activity.metadata.status === 'failed') return 'Email submission failed';
  if (activity.metadata.contactStatus === 'completed') return 'Contact reported by employee';
  if (activity.metadata.contactStatus === 'attempted') return 'Contact attempted';
  return '';
};

type ManualLeadForm = {
  name: string;
  phone: string;
  email: string;
  company: string;
  machineInterest: string;
  message: string;
  source: CrmManualSource;
  priority: CrmPriority;
  estimatedValue: string;
  assignedTo: string;
};

type LeadDraft = {
  name: string;
  phone: string;
  email: string;
  company: string;
  machineInterest: string;
  message: string;
  status: LeadStatus;
  priority: CrmPriority;
  assignedTo: string;
  nextFollowUpAt: string;
  estimatedValue: string;
};

const newManualLead = (): ManualLeadForm => ({
  name: '',
  phone: '',
  email: '',
  company: '',
  machineInterest: '',
  message: '',
  source: 'staff-phone',
  priority: 'medium',
  estimatedValue: '',
  assignedTo: '',
});

const toLocalDateTimeValue = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

const toLeadDraft = (lead: CrmLead): LeadDraft => ({
  name: lead.name,
  phone: lead.phone,
  email: lead.email,
  company: lead.company,
  machineInterest: lead.machineInterest,
  message: lead.message,
  status: lead.status,
  priority: lead.priority,
  assignedTo: lead.assignedTo,
  nextFollowUpAt: toLocalDateTimeValue(lead.nextFollowUpAt),
  estimatedValue: lead.estimatedValue === null ? '' : String(lead.estimatedValue),
});

const formatDateTime = (value: string | null) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatMoney = (value: number | null) =>
  value === null
    ? 'Value not set'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(value);

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const isClosedLead = (lead: CrmLead) =>
  lead.status === 'won' || lead.status === 'lost' || lead.status === 'spam';

const isOverdue = (lead: CrmLead) =>
  Boolean(
    lead.nextFollowUpAt &&
      !isClosedLead(lead) &&
      new Date(lead.nextFollowUpAt).getTime() < Date.now(),
  );

const isDueToday = (lead: CrmLead) =>
  Boolean(
    lead.nextFollowUpAt &&
      !isClosedLead(lead) &&
      dateKey(new Date(lead.nextFollowUpAt)) === dateKey(new Date()),
  );

const sourceLabel = (source: string) => {
  if (source in CRM_MANUAL_SOURCE_LABELS) {
    return CRM_MANUAL_SOURCE_LABELS[source as CrmManualSource];
  }
  if (source === 'contact') return 'Website contact';
  if (source === 'meeting-page') return 'Website meeting';
  if (source.includes('lead-magnet')) return 'Website popup';
  if (source.startsWith('product-')) return 'Product page';
  if (source.startsWith('seo-')) return 'Location page';
  if (source.startsWith('chatbot')) return 'Chatbot';
  return source.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const activityLabel = (type: string) => {
  if (type in CRM_ACTIVITY_LABELS) {
    return CRM_ACTIVITY_LABELS[type as CrmActivityType];
  }
  const labels: Record<string, string> = {
    created: 'Lead created',
    updated: 'Lead updated',
    status_change: 'Stage changed',
    assignment: 'Assignment',
    follow_up: 'Follow-up',
    communication_launch: 'Contact app requested',
    email_sent: 'Email accepted by server',
    email_accepted: 'Email accepted by server',
    email_pending: 'Email submission pending',
    email_uncertain: 'Email result uncertain',
    email_failed: 'Email failed',
    email_send: 'Email send request',
    communication_send: 'Email send request',
  };
  return labels[type] || type.replace(/_/g, ' ');
};

const escapeCSVCell = (value: unknown) => {
  let cell = String(value ?? '').replace(/\0/g, '');
  if (/^[\s]*[=+\-@]/.test(cell)) cell = `'${cell}`;
  return `"${cell.replace(/"/g, '""')}"`;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...init.headers }
      : init?.headers,
  });
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    window.location.assign('/admin/login?callbackUrl=/admin/leads');
    throw new Error('Please sign in again.');
  }
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Request failed.');
  }
  return data as T;
}

export default function SalesCrmPage() {
  const [workspace, setWorkspace] = useState<CrmWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<LeadView>('all');
  const [stageFilter, setStageFilter] = useState<'all' | LeadStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | CrmPriority>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [leadDraft, setLeadDraft] = useState<LeadDraft | null>(null);
  const [leadActivities, setLeadActivities] = useState<CrmActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityType, setActivityType] = useState<CrmActivityType>('note');
  const [activityBody, setActivityBody] = useState('');
  const [activityOutcome, setActivityOutcome] = useState('');
  const [contactStatus, setContactStatus] = useState<'completed' | 'attempted' | 'not_applicable'>('not_applicable');
  const [savingLead, setSavingLead] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [manualLead, setManualLead] = useState<ManualLeadForm>(newManualLead);
  const [addingLead, setAddingLead] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [updatingMember, setUpdatingMember] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const selectedLeadRef = useRef('');
  const activityRequestRef = useRef(0);
  const loadedLeadCountRef = useRef(0);
  const workspaceRequestRef = useRef(false);
  const workspaceMutationRef = useRef(0);
  const communicationRequestIds = useRef(new Map<string, string>());

  const loadWorkspace = useCallback(async (silent = false) => {
    if (workspaceRequestRef.current) return;
    workspaceRequestRef.current = true;
    const mutationVersion = workspaceMutationRef.current;
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      let data = await requestJson<CrmWorkspace>('/api/crm');
      // Refresh every visible page so reassigned or deleted records do not survive in a stale local page.
      const targetCount = silent ? loadedLeadCountRef.current : 0;
      const refreshed = new Map(data.leads.map((lead) => [lead.id, lead]));
      while (data.hasMoreLeads && data.nextOffset !== null && refreshed.size < targetCount) {
        const previousOffset = data.nextOffset;
        const page = await requestJson<CrmWorkspace>(`/api/crm?offset=${previousOffset}`);
        page.leads.forEach((lead) => refreshed.set(lead.id, lead));
        data = { ...data, totalLeadCount: page.totalLeadCount, nextOffset: page.nextOffset, hasMoreLeads: page.hasMoreLeads };
        if (!page.leads.length || page.nextOffset === previousOffset) break;
      }
      if (mutationVersion === workspaceMutationRef.current) setWorkspace({ ...data, leads: Array.from(refreshed.values()) });
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load the CRM.');
    } finally {
      workspaceRequestRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadWorkspace(true);
    }, 30_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadWorkspace(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadWorkspace]);

  useEffect(() => { selectedLeadRef.current = selectedLeadId; }, [selectedLeadId]);
  useEffect(() => { loadedLeadCountRef.current = workspace?.leads.length || 0; }, [workspace]);

  useEffect(() => {
    if (!selectedLeadId && !addOpen && !teamOpen) return;
    const dialogs = document.querySelectorAll<HTMLElement>('[data-crm-dialog]');
    const dialog = dialogs.item(dialogs.length - 1);
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]'));
    (focusable()[0] || dialog).focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener('keydown', trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener('keydown', trapFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [addOpen, selectedLeadId, teamOpen]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (selectedLeadId) setSelectedLeadId('');
      else if (addOpen) setAddOpen(false);
      else if (teamOpen) setTeamOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [addOpen, selectedLeadId, teamOpen]);

  const viewer = workspace?.viewer;
  const ownerAccess = Boolean(viewer?.canViewAllLeads);
  const leads = workspace?.leads || EMPTY_LEADS;
  const team = workspace?.team || [];
  const activeTeam = team.filter((member) => member.active);
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || null;

  useEffect(() => {
    if (!viewer?.userId || ownerAccess) return;
    setView('mine');
  }, [ownerAccess, viewer?.userId]);

  useEffect(() => {
    if (selectedLeadId && workspace && !selectedLead) {
      setSelectedLeadId('');
      setLeadDraft(null);
      setLeadActivities([]);
    }
  }, [selectedLead, selectedLeadId, workspace]);

  const openLead = async (lead: CrmLead) => {
    const requestVersion = ++activityRequestRef.current;
    selectedLeadRef.current = lead.id;
    setSelectedLeadId(lead.id);
    setLeadDraft(toLeadDraft(lead));
    setLeadActivities([]);
    setActivitiesLoading(true);
    setActivityBody('');
    setActivityOutcome('');
    setActivityType('note');
    setContactStatus('not_applicable');
    try {
      const data = await requestJson<{ activities: CrmActivity[] }>(
        `/api/crm/leads/${lead.id}/activities`,
      );
      if (activityRequestRef.current === requestVersion && selectedLeadRef.current === lead.id) setLeadActivities((current) => mergeActivities(current, data.activities));
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Could not load activity.');
    } finally {
      if (activityRequestRef.current === requestVersion) setActivitiesLoading(false);
    }
  };

  const loadMoreLeads = async () => {
    if (!workspace?.hasMoreLeads || workspace.nextOffset == null || loadingMore || workspaceRequestRef.current) return;
    workspaceRequestRef.current = true;
    const mutationVersion = workspaceMutationRef.current;
    setLoadingMore(true);
    try {
      const data = await requestJson<CrmWorkspace>(`/api/crm?offset=${workspace.nextOffset}`);
      if (mutationVersion !== workspaceMutationRef.current) return;
      setWorkspace((current) => {
        if (!current) return data;
        const merged = new Map(current.leads.map((lead) => [lead.id, lead]));
        data.leads.forEach((lead) => merged.set(lead.id, lead));
        return { ...current, leads: Array.from(merged.values()), totalLeadCount: data.totalLeadCount, hasMoreLeads: data.hasMoreLeads, nextOffset: data.nextOffset };
      });
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Could not load more leads.');
    } finally { workspaceRequestRef.current = false; setLoadingMore(false); }
  };

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (view === 'mine' && lead.assignedTo !== viewer?.userId && lead.createdBy !== viewer?.userId) return false;
      if (view === 'unassigned' && lead.assignedTo) return false;
      if (view === 'due-today' && !isDueToday(lead)) return false;
      if (view === 'overdue' && !isOverdue(lead)) return false;
      if (view === 'no-follow-up' && (lead.nextFollowUpAt || isClosedLead(lead))) return false;
      if (stageFilter !== 'all' && lead.status !== stageFilter) return false;
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'all' && lead.assignedTo !== assigneeFilter) return false;
      if (channelFilter !== 'all' && (lead.origin === 'manual' ? 'manual' : lead.attribution?.channel || 'direct') !== channelFilter) return false;
      if (!normalizedSearch) return true;
      return [lead.name, lead.company, lead.email, lead.phone, lead.machineInterest, lead.source, lead.assigneeName, channelLabel(lead), lead.attribution?.utmCampaign || '', lead.attribution?.utmTerm || '']
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    }).sort((left, right) => {
      if (sort === 'follow-up') return (left.nextFollowUpAt ? new Date(left.nextFollowUpAt).getTime() : Infinity) - (right.nextFollowUpAt ? new Date(right.nextFollowUpAt).getTime() : Infinity);
      if (sort === 'value') return (right.estimatedValue || 0) - (left.estimatedValue || 0);
      if (sort === 'priority') return CRM_PRIORITIES.indexOf(right.priority) - CRM_PRIORITIES.indexOf(left.priority);
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [assigneeFilter, channelFilter, leads, priorityFilter, search, sort, stageFilter, view, viewer?.userId]);

  const openLeads = leads.filter((lead) => !isClosedLead(lead));
  const stats = {
    new: leads.filter((lead) => lead.status === 'new').length,
    dueToday: leads.filter(isDueToday).length,
    overdue: leads.filter(isOverdue).length,
    won: leads.filter((lead) => lead.status === 'won').length,
    unassigned: leads.filter((lead) => !lead.assignedTo && !isClosedLead(lead)).length,
    noFollowUp: openLeads.filter((lead) => !lead.nextFollowUpAt).length,
    pipeline: openLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0),
  };

  const updateLeadLocally = (lead: CrmLead) => {
    workspaceMutationRef.current += 1;
    setWorkspace((current) => current
      ? { ...current, leads: current.leads.map((item) => (item.id === lead.id ? lead : item)) }
      : current);
    if (selectedLeadRef.current === lead.id) setLeadDraft(toLeadDraft(lead));
  };

  const saveLead = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedLead || !leadDraft) return;
    setSavingLead(true);
    try {
      const data = await requestJson<{ lead: CrmLead }>(`/api/crm/leads/${selectedLead.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...leadDraft,
          nextFollowUpAt: leadDraft.nextFollowUpAt ? new Date(leadDraft.nextFollowUpAt).toISOString() : null,
        }),
      });
      updateLeadLocally(data.lead);
      toast.success('Lead updated');
      const activityData = await requestJson<{ activities: CrmActivity[] }>(`/api/crm/leads/${selectedLead.id}/activities`);
      if (selectedLeadRef.current === selectedLead.id) setLeadActivities((current) => mergeActivities(current, activityData.activities));
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Could not save lead.');
    } finally {
      setSavingLead(false);
    }
  };

  const addActivity = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedLead) return;
    setSavingActivity(true);
    try {
      const data = await requestJson<{ activity: CrmActivity }>(`/api/crm/leads/${selectedLead.id}/activities`, {
        method: 'POST',
        body: JSON.stringify({ activityType, body: activityBody, outcome: activityOutcome, contactStatus: contactActivityTypes.has(activityType) ? contactStatus : 'not_applicable' }),
      });
      workspaceMutationRef.current += 1;
      if (selectedLeadRef.current === selectedLead.id) {
        setLeadActivities((current) => [data.activity, ...current]);
        setActivityBody('');
        setActivityOutcome('');
        setContactStatus('not_applicable');
      }
      toast.success('Work update added');
      void loadWorkspace(true);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Could not add work update.');
    } finally {
      setSavingActivity(false);
    }
  };

  const submitManualLead = async (event: FormEvent) => {
    event.preventDefault();
    setAddingLead(true);
    try {
      const data = await requestJson<{ lead: CrmLead }>('/api/crm', {
        method: 'POST',
        body: JSON.stringify(manualLead),
      });
      workspaceMutationRef.current += 1;
      setWorkspace((current) => current ? { ...current, leads: [data.lead, ...current.leads], totalLeadCount: current.totalLeadCount + 1, nextOffset: current.nextOffset === null ? null : current.nextOffset + 1 } : current);
      setManualLead(newManualLead());
      setAddOpen(false);
      toast.success('Lead added to CRM');
      void openLead(data.lead);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Could not add lead.');
    } finally {
      setAddingLead(false);
    }
  };

  const openManualLead = () => {
    setManualLead({ ...newManualLead(), assignedTo: viewer?.userId || activeTeam[0]?.userId || '' });
    setAddOpen(true);
  };

  const addEmployee = async (event: FormEvent) => {
    event.preventDefault();
    setAddingEmployee(true);
    try {
      const data = await requestJson<{ member: CrmTeamMember }>('/api/crm/team', {
        method: 'POST',
        body: JSON.stringify({ displayName: employeeName, email: employeeEmail, password: employeePassword }),
      });
      workspaceMutationRef.current += 1;
      setWorkspace((current) => current ? { ...current, team: [...current.team, data.member] } : current);
      setEmployeeName('');
      setEmployeeEmail('');
      setEmployeePassword('');
      toast.success('Employee login created');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Could not add employee.');
    } finally {
      setAddingEmployee(false);
    }
  };

  const toggleMember = async (member: CrmTeamMember) => {
    setUpdatingMember(member.userId);
    try {
      const data = await requestJson<{ member: CrmTeamMember }>(`/api/crm/team/${encodeURIComponent(member.userId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !member.active }),
      });
      workspaceMutationRef.current += 1;
      setWorkspace((current) => current ? {
        ...current,
        team: current.team.map((item) => item.userId === data.member.userId ? data.member : item),
      } : current);
      toast.success(data.member.active ? 'Employee activated' : 'Employee access disabled');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Could not update employee.');
    } finally {
      setUpdatingMember('');
    }
  };

  const exportCSV = () => {
    if (!ownerAccess) return;
    const headers = ['Name', 'Phone', 'Email', 'Company', 'Machine', 'Form Source', 'Origin', 'Marketing Channel', 'Campaign', 'UTM Source', 'UTM Medium', 'Keyword / Term', 'Landing Page', 'Stage', 'Priority', 'Assigned To', 'Next Follow-up', 'Last Activity', 'Estimated Value', 'Added By', 'Created', 'Requirement'];
    const rows = filteredLeads.map((lead) => [
      lead.name, lead.phone, lead.email, lead.company, lead.machineInterest,
      sourceLabel(lead.source), lead.origin, channelLabel(lead), lead.attribution?.utmCampaign || '', lead.attribution?.utmSource || '', lead.attribution?.utmMedium || '', lead.attribution?.utmTerm || '', lead.attribution?.landingPath || '', LEAD_STATUS_LABELS[lead.status],
      CRM_PRIORITY_LABELS[lead.priority], lead.assigneeName,
      lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : '',
      lead.lastActivityAt ? formatDateTime(lead.lastActivityAt) : '',
      lead.estimatedValue ?? '', lead.creatorName, formatDateTime(lead.createdAt), lead.message,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCSVCell).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `spectra-crm-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const staffMembers = team.filter((member) => !isCrmOwnerRole(member.role));
  const activeStaffCount = staffMembers.filter((member) => member.active).length;

  if (loading && !workspace) {
    return <div className={styles.loadingState}><RefreshCw className={styles.spin} /> Loading Sales CRM…</div>;
  }

  if (error && !workspace) {
    return (
      <div className={styles.errorState}>
        <AlertTriangle size={26} />
        <div><h1>CRM needs attention</h1><p>{error}</p></div>
        <button className="btn btn-primary" onClick={() => void loadWorkspace()}>Try again</button>
      </div>
    );
  }

  return (
    <div className={styles.crmPage}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}><ShieldCheck size={14} /> Private team workspace</div>
          <h1>Sales CRM</h1>
          <p>{ownerAccess ? 'Website and team leads, follow-ups and staff activity in one place.' : 'Your assigned leads, follow-ups and work updates.'}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton} onClick={() => void loadWorkspace(true)} disabled={refreshing} title="Refresh CRM"><RefreshCw size={17} className={refreshing ? styles.spin : ''} /></button>
          {ownerAccess && <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={!filteredLeads.length}><Download size={16} /> Export view</button>}
          {ownerAccess && <button className="btn btn-outline btn-sm" onClick={() => setTeamOpen(true)}><Users size={16} /> Team ({activeStaffCount}/10)</button>}
          <button className="btn btn-primary btn-sm" onClick={openManualLead}><Plus size={16} /> Add Lead</button>
          <CrmImport onImported={() => void loadWorkspace(true)} />
        </div>
      </div>

      {error && <div className={styles.inlineWarning}><AlertTriangle size={16} /> {error}</div>}

      {workspace?.hasMoreLeads && <div className={styles.inlineWarning}><AlertTriangle size={16} /> Showing {leads.length} of {workspace.totalLeadCount} leads. Counts, filters and export apply to loaded leads; load more below to include older records.</div>}

      <div className={styles.kpiGrid}>
        <button className={styles.kpiCard} onClick={() => { setView('all'); setStageFilter('new'); }}><span className={`${styles.kpiIcon} ${styles.blue}`}><Workflow size={20} /></span><span><strong>{stats.new}</strong><small>New leads</small></span></button>
        <button className={styles.kpiCard} onClick={() => { setView('due-today'); setStageFilter('all'); }}><span className={`${styles.kpiIcon} ${styles.amber}`}><CalendarClock size={20} /></span><span><strong>{stats.dueToday}</strong><small>Due today</small></span></button>
        <button className={styles.kpiCard} onClick={() => { setView('overdue'); setStageFilter('all'); }}><span className={`${styles.kpiIcon} ${styles.red}`}><Flame size={20} /></span><span><strong>{stats.overdue}</strong><small>Overdue</small></span></button>
        <button className={styles.kpiCard} onClick={() => { setView('all'); setStageFilter('won'); }}><span className={`${styles.kpiIcon} ${styles.green}`}><CheckCircle2 size={20} /></span><span><strong>{stats.won}</strong><small>Won leads</small></span></button>
        {ownerAccess && <button className={styles.kpiCard} onClick={() => { setView('unassigned'); setStageFilter('all'); }}><span className={`${styles.kpiIcon} ${styles.purple}`}><UserRound size={20} /></span><span><strong>{stats.unassigned}</strong><small>Unassigned</small></span></button>}
      </div>

      <div className={styles.pipelineOverview}>
        <div><span>Open pipeline estimate</span><strong>{formatMoney(stats.pipeline)}</strong><small>{openLeads.length} active leads · values entered by your team</small></div>
        <button type="button" onClick={() => { setView('no-follow-up'); setStageFilter('all'); setAssigneeFilter('all'); }}><CalendarClock size={18} /><span><strong>{stats.noFollowUp} need a follow-up date</strong><small>Schedule the next step for every open enquiry</small></span><ChevronRight size={17} /></button>
      </div>

      {ownerAccess && activeTeam.length > 0 && (
        <section className={styles.teamOverview}>
          <div className={styles.sectionHeading}><div><h2>Team workload</h2><p>Live assignment and pending follow-up overview</p></div><span>{openLeads.length} active leads</span></div>
          <div className={styles.teamStrip}>
            {activeTeam.map((member) => {
              const assigned = openLeads.filter((lead) => lead.assignedTo === member.userId);
              const overdue = assigned.filter(isOverdue).length;
              const won = leads.filter((lead) => lead.assignedTo === member.userId && lead.status === 'won').length;
              const latestWork = workspace?.recentActivities.find((activity) => activity.actorId === member.userId);
              return (
                <button key={member.userId} className={styles.teamCard} onClick={() => { setAssigneeFilter(member.userId); setView('all'); }}>
                  <span className={styles.avatar}>{member.displayName.slice(0, 1).toUpperCase()}</span>
                  <span className={styles.teamCardText}><strong>{member.displayName}</strong><small>{assigned.length} active · {overdue} overdue · {won} won</small><small>{latestWork ? `Latest update: ${formatDateTime(latestWork.createdAt)}` : 'No recent work updates'}</small></span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className={styles.leadsSection}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, company or machine…" aria-label="Search CRM leads" /></div>
          <div className={styles.filters}>
            <select value={view} onChange={(event) => setView(event.target.value as LeadView)} aria-label="Lead view">{ownerAccess && <option value="all">All leads</option>}<option value="mine">My leads</option>{ownerAccess && <option value="unassigned">Unassigned</option>}<option value="due-today">Due today</option><option value="overdue">Overdue</option><option value="no-follow-up">No follow-up date</option></select>
            <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as 'all' | LeadStatus)} aria-label="Stage filter"><option value="all">All stages</option>{LEAD_STATUSES.map((status) => <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>)}</select>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | CrmPriority)} aria-label="Priority filter"><option value="all">All priorities</option>{CRM_PRIORITIES.map((priority) => <option key={priority} value={priority}>{CRM_PRIORITY_LABELS[priority]}</option>)}</select>
            {ownerAccess && <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} aria-label="Assignee filter"><option value="all">All team members</option>{activeTeam.map((member) => <option key={member.userId} value={member.userId}>{member.displayName}</option>)}</select>}
            <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} aria-label="Marketing channel filter"><option value="all">All channels</option>{Object.entries(CHANNEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}<option value="manual">Staff enquiry</option></select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort leads"><option value="newest">Newest first</option><option value="follow-up">Follow-up soonest</option><option value="priority">Highest priority</option><option value="value">Highest value</option></select>
            {(search || view !== (ownerAccess ? 'all' : 'mine') || stageFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || channelFilter !== 'all') && <button className={styles.clearFilters} onClick={() => { setSearch(''); setView(ownerAccess ? 'all' : 'mine'); setStageFilter('all'); setPriorityFilter('all'); setAssigneeFilter('all'); setChannelFilter('all'); }}>Clear</button>}
          </div>
        </div>

        <div className={styles.listHeading}><span>{filteredLeads.length} of {leads.length} leads</span><small>Auto-refreshes every 30 seconds</small></div>

        {filteredLeads.length === 0 ? (
          <div className={styles.emptyState}><Users size={30} /><h2>No leads found</h2><p>Adjust the filters or add a staff enquiry to the CRM.</p><button className="btn btn-primary btn-sm" onClick={openManualLead}><Plus size={16} /> Add Lead</button></div>
        ) : (
          <div className={styles.leadTable}>
            <div className={styles.tableHeader}><span>Customer</span><span>Requirement</span><span>Owner</span><span>Stage</span><span>Next follow-up</span><span /></div>
            {filteredLeads.map((lead) => (
              <article key={lead.id} tabIndex={0} role="button" aria-label={`Open lead: ${lead.name}`} className={`${styles.leadRow} ${!lead.read ? styles.unreadLead : ''} ${isOverdue(lead) ? styles.overdueLead : ''}`} onClick={() => void openLead(lead)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void openLead(lead); } }}>
                <div className={styles.customerCell}><div className={styles.rowTitle}><strong>{lead.name}</strong>{!lead.read && <span className={styles.newDot}>New</span>}</div><span>{lead.company || lead.phone || lead.email || 'No company'}</span><small>{channelLabel(lead)} · {sourceLabel(lead.source)}</small>{lead.attribution?.utmCampaign && <small title={lead.attribution.utmCampaign}>Campaign: {lead.attribution.utmCampaign}</small>}</div>
                <div className={styles.requirementCell}><strong>{lead.machineInterest || 'General enquiry'}</strong><span>{formatMoney(lead.estimatedValue)}</span><small className={`${styles.priority} ${styles[`priority_${lead.priority}`]}`}>{CRM_PRIORITY_LABELS[lead.priority]}</small></div>
                <div className={styles.ownerCell}><span className={styles.miniAvatar}>{lead.assigneeName.slice(0, 1).toUpperCase()}</span><span>{lead.assigneeName}</span></div>
                <div><span className={`${styles.statusBadge} ${styles[`status_${lead.status}`]}`}>{LEAD_STATUS_LABELS[lead.status]}</span></div>
                <div className={`${styles.followUpCell} ${isOverdue(lead) ? styles.followUpOverdue : ''}`}><CalendarClock size={15} /><span>{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : 'Not scheduled'}</span></div>
                <ChevronRight size={18} className={styles.rowChevron} />
              </article>
            ))}
          </div>
        )}
        {workspace?.hasMoreLeads && <div className={styles.loadMore}><span>{leads.length} of {workspace.totalLeadCount} available leads loaded</span><button className="btn btn-outline btn-sm" disabled={loadingMore || refreshing} onClick={() => void loadMoreLeads()}>{loadingMore ? 'Loading…' : 'Load more leads'}</button></div>}
      </section>

      {ownerAccess && workspace?.recentActivities.length ? (
        <section className={styles.activityFeed}>
          <div className={styles.sectionHeading}><div><h2>Latest team activity</h2><p>Who worked on which lead</p></div><Activity size={20} /></div>
          <div className={styles.activityGrid}>
            {workspace.recentActivities.slice(0, 12).map((activity) => (
              <button key={activity.id} className={styles.activityCard} onClick={() => { const lead = leads.find((item) => item.id === activity.leadId); if (lead) void openLead(lead); }}>
                <span className={styles.activityMarker} /><span><strong>{activity.actorName}</strong> · {activityLabel(activity.activityType)}<small>{activity.leadName} · {formatDateTime(activity.createdAt)}</small></span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {addOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddOpen(false); }}>
          <section className={styles.modal} data-crm-dialog tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="add-lead-title">
            <div className={styles.modalHeader}><div><h2 id="add-lead-title">Add staff lead</h2><p>Phone, WhatsApp, referral or marketplace enquiry</p></div><button className={styles.closeButton} onClick={() => setAddOpen(false)} aria-label="Close"><X /></button></div>
            <form onSubmit={submitManualLead} className={styles.formGrid}>
              <label><span>Customer name *</span><input autoFocus value={manualLead.name} onChange={(event) => setManualLead({ ...manualLead, name: event.target.value })} required /></label>
              <label><span>Phone</span><input value={manualLead.phone} onChange={(event) => setManualLead({ ...manualLead, phone: event.target.value })} placeholder="+91 98765 43210" /></label>
              <label><span>Email</span><input type="email" value={manualLead.email} onChange={(event) => setManualLead({ ...manualLead, email: event.target.value })} /></label>
              <label><span>Company</span><input value={manualLead.company} onChange={(event) => setManualLead({ ...manualLead, company: event.target.value })} /></label>
              <label className={styles.fullField}><span>Machine / requirement</span><input value={manualLead.machineInterest} onChange={(event) => setManualLead({ ...manualLead, machineInterest: event.target.value })} placeholder="e.g. Band sealer, 500 pouches/hour" /></label>
              <label><span>Lead source</span><select value={manualLead.source} onChange={(event) => setManualLead({ ...manualLead, source: event.target.value as CrmManualSource })}>{CRM_MANUAL_SOURCES.map((source) => <option key={source} value={source}>{CRM_MANUAL_SOURCE_LABELS[source]}</option>)}</select></label>
              <label><span>Priority</span><select value={manualLead.priority} onChange={(event) => setManualLead({ ...manualLead, priority: event.target.value as CrmPriority })}>{CRM_PRIORITIES.map((priority) => <option key={priority} value={priority}>{CRM_PRIORITY_LABELS[priority]}</option>)}</select></label>
              <label><span>Estimated value (₹)</span><input type="number" min="0" step="1000" value={manualLead.estimatedValue} onChange={(event) => setManualLead({ ...manualLead, estimatedValue: event.target.value })} /></label>
              {ownerAccess && <label><span>Assign to</span><select value={manualLead.assignedTo} onChange={(event) => setManualLead({ ...manualLead, assignedTo: event.target.value })}>{activeTeam.map((member) => <option key={member.userId} value={member.userId}>{member.displayName}</option>)}</select></label>}
              <label className={styles.fullField}><span>Customer requirement / first note</span><textarea rows={4} value={manualLead.message} onChange={(event) => setManualLead({ ...manualLead, message: event.target.value })} placeholder="What does the customer need?" /></label>
              <p className={styles.formHint}>Customer name plus phone or email is required.</p>
              <div className={styles.modalActions}><button type="button" className="btn btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={addingLead}>{addingLead ? 'Adding…' : 'Add to CRM'}</button></div>
            </form>
          </section>
        </div>
      )}

      {teamOpen && ownerAccess && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTeamOpen(false); }}>
          <section className={`${styles.modal} ${styles.teamModal}`} data-crm-dialog tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="team-title">
            <div className={styles.modalHeader}><div><h2 id="team-title">CRM team</h2><p>{activeStaffCount} of 10 employee accounts active</p></div><button className={styles.closeButton} onClick={() => setTeamOpen(false)} aria-label="Close"><X /></button></div>
            <form className={styles.employeeForm} onSubmit={addEmployee}>
              <div className={styles.employeeFormTitle}><UserPlus size={18} /><strong>Create employee login</strong></div>
              <label><span>Name</span><input value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} required /></label>
              <label><span>Email</span><input type="email" value={employeeEmail} onChange={(event) => setEmployeeEmail(event.target.value)} required /></label>
              <label><span>Temporary password</span><input type="password" autoComplete="new-password" minLength={10} value={employeePassword} onChange={(event) => setEmployeePassword(event.target.value)} required placeholder="Minimum 10 characters" /></label>
              <button className="btn btn-primary" disabled={addingEmployee || activeStaffCount >= 10}>{addingEmployee ? 'Creating…' : 'Create login'}</button>
              <p>Share the temporary password privately. The employee signs in at <strong>/admin/login</strong>.</p>
            </form>
            <div className={styles.memberList}>
              {team.map((member) => (
                <div key={member.userId} className={styles.memberRow}>
                  <span className={styles.avatar}>{member.displayName.slice(0, 1).toUpperCase()}</span>
                  <span className={styles.memberIdentity}><strong>{member.displayName}</strong><small>{member.email}</small></span>
                  <span className={styles.memberRole}>{!member.active ? 'Disabled' : isCrmOwnerRole(member.role) ? 'Owner' : 'Sales staff'}</span>
                  {!isCrmOwnerRole(member.role) && <button className={member.active ? styles.disableButton : styles.enableButton} disabled={updatingMember === member.userId} onClick={() => void toggleMember(member)}>{updatingMember === member.userId ? 'Saving…' : member.active ? 'Disable' : 'Enable'}</button>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {selectedLead && leadDraft && (
        <div className={styles.drawerBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedLeadId(''); }}>
          <aside className={styles.drawer} data-crm-dialog tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="lead-detail-title">
            <div className={styles.drawerHeader}><div><span className={`${styles.statusBadge} ${styles[`status_${selectedLead.status}`]}`}>{LEAD_STATUS_LABELS[selectedLead.status]}</span><h2 id="lead-detail-title">{selectedLead.name}</h2><p>{selectedLead.company || sourceLabel(selectedLead.source)}</p></div><button className={styles.closeButton} onClick={() => setSelectedLeadId('')} aria-label="Close lead"><X /></button></div>
            <CrmCommunications key={selectedLead.id} lead={selectedLead} emailSending={workspace?.capabilities?.emailSending === true} phoneCalling={workspace?.capabilities?.phoneCalling === true} requestIds={communicationRequestIds.current} onActivity={(activity) => {
              workspaceMutationRef.current += 1;
              if (selectedLeadRef.current === activity.leadId) setLeadActivities((current) => [activity, ...current.filter((item) => item.id !== activity.id)]);
              void loadWorkspace(true);
            }} />

            <section className={styles.attributionPanel} aria-labelledby="lead-attribution-title">
              <div className={styles.sectionHeading}><h2 id="lead-attribution-title">Lead attribution</h2><span>{channelLabel(selectedLead)}</span></div>
              <dl className={styles.attributionGrid}>
                <div><dt>Enquiry form / source</dt><dd>{sourceLabel(selectedLead.source)}</dd></div>
                <div><dt>Campaign</dt><dd>{selectedLead.attribution?.utmCampaign || 'Not supplied'}</dd></div>
                <div><dt>Source / medium</dt><dd>{[selectedLead.attribution?.utmSource, selectedLead.attribution?.utmMedium].filter(Boolean).join(' / ') || 'Not supplied'}</dd></div>
                <div><dt>Keyword / term</dt><dd>{selectedLead.attribution?.utmTerm || 'Not supplied by source'}</dd></div>
                <div><dt>Landing page</dt><dd>{selectedLead.attribution?.landingPath || 'Not captured'}</dd></div>
                <div><dt>Referring website</dt><dd>{selectedLead.attribution?.referrer || 'Not captured'}</dd></div>
                <div><dt>Ad click identifier</dt><dd>{selectedLead.attribution?.gclid ? 'Google click ID captured' : selectedLead.attribution?.gbraid ? 'Google GBRAID captured' : selectedLead.attribution?.wbraid ? 'Google WBRAID captured' : selectedLead.attribution?.msclkid ? 'Microsoft click ID captured' : 'Not captured'}</dd></div>
                {selectedLead.attribution?.firstTouch && <div><dt>First visit campaign</dt><dd>{selectedLead.attribution.firstTouch.utmCampaign || selectedLead.attribution.firstTouch.utmSource || selectedLead.attribution.firstTouch.landingPath || 'Direct visit'}</dd></div>}
              </dl>
            </section>

            <form onSubmit={saveLead} className={styles.drawerForm}>
              <div className={styles.drawerSectionTitle}><Workflow size={17} /><strong>Sales progress</strong></div>
              <div className={styles.formGrid}>
                <label><span>Stage</span><select value={leadDraft.status} onChange={(event) => setLeadDraft({ ...leadDraft, status: event.target.value as LeadStatus })}>{LEAD_STATUSES.map((status) => <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>)}</select></label>
                <label><span>Priority</span><select value={leadDraft.priority} onChange={(event) => setLeadDraft({ ...leadDraft, priority: event.target.value as CrmPriority })}>{CRM_PRIORITIES.map((priority) => <option key={priority} value={priority}>{CRM_PRIORITY_LABELS[priority]}</option>)}</select></label>
                <label className={styles.fullField}><span>Next follow-up (your local time)</span><div className={styles.inlineInput}><input type="datetime-local" value={leadDraft.nextFollowUpAt} onChange={(event) => setLeadDraft({ ...leadDraft, nextFollowUpAt: event.target.value })} />{leadDraft.nextFollowUpAt && <button type="button" onClick={() => setLeadDraft({ ...leadDraft, nextFollowUpAt: '' })}>Clear</button>}</div><span className={styles.followUpShortcuts}>{[1, 3, 7].map((days) => <button key={days} type="button" onClick={() => { const next = new Date(); next.setDate(next.getDate() + days); next.setHours(10, 0, 0, 0); setLeadDraft({ ...leadDraft, nextFollowUpAt: toLocalDateTimeValue(next.toISOString()) }); }}>{days === 1 ? 'Tomorrow, 10 AM' : `In ${days} days, 10 AM`}</button>)}</span></label>
                <label><span>Estimated value (₹)</span><input type="number" min="0" step="1000" value={leadDraft.estimatedValue} onChange={(event) => setLeadDraft({ ...leadDraft, estimatedValue: event.target.value })} /></label>
                {ownerAccess && <label><span>Assigned to</span><select value={leadDraft.assignedTo} onChange={(event) => setLeadDraft({ ...leadDraft, assignedTo: event.target.value })}><option value="">Unassigned</option>{activeTeam.map((member) => <option key={member.userId} value={member.userId}>{member.displayName}</option>)}</select></label>}
              </div>

              <div className={styles.drawerSectionTitle}><UserRound size={17} /><strong>Customer &amp; requirement</strong></div>
              <div className={styles.formGrid}>
                <label><span>Name</span><input value={leadDraft.name} onChange={(event) => setLeadDraft({ ...leadDraft, name: event.target.value })} required /></label>
                <label><span>Company</span><input value={leadDraft.company} onChange={(event) => setLeadDraft({ ...leadDraft, company: event.target.value })} /></label>
                <label><span>Phone</span><input value={leadDraft.phone} onChange={(event) => setLeadDraft({ ...leadDraft, phone: event.target.value })} /></label>
                <label><span>Email</span><input type="email" value={leadDraft.email} onChange={(event) => setLeadDraft({ ...leadDraft, email: event.target.value })} /></label>
                <label className={styles.fullField}><span>Machine / requirement</span><input value={leadDraft.machineInterest} onChange={(event) => setLeadDraft({ ...leadDraft, machineInterest: event.target.value })} /></label>
                <label className={styles.fullField}><span>Original requirement</span><textarea rows={3} value={leadDraft.message} onChange={(event) => setLeadDraft({ ...leadDraft, message: event.target.value })} /></label>
              </div>
              <div className={styles.leadMeta}><span>Source: <strong>{sourceLabel(selectedLead.source)}</strong></span><span>Added by: <strong>{selectedLead.creatorName}</strong></span><span>Created: <strong>{formatDateTime(selectedLead.createdAt)}</strong></span></div>
              <button className="btn btn-primary" disabled={savingLead}>{savingLead ? 'Saving changes…' : 'Save lead changes'}</button>
            </form>

            <section className={styles.workLog}>
              <div className={styles.drawerSectionTitle}><StickyNote size={17} /><strong>Add work update</strong></div>
              <form onSubmit={addActivity} className={styles.activityForm}>
                <select value={activityType} onChange={(event) => { setActivityType(event.target.value as CrmActivityType); setContactStatus('not_applicable'); }} aria-label="Work type">{CRM_ACTIVITY_TYPES.map((type) => <option key={type} value={type}>{CRM_ACTIVITY_LABELS[type]}</option>)}</select>
                {contactActivityTypes.has(activityType) && <select value={contactStatus} onChange={(event) => setContactStatus(event.target.value as typeof contactStatus)} aria-label="Contact result"><option value="not_applicable">No contact result recorded</option><option value="attempted">Attempted / no response</option><option value="completed">Contact completed</option></select>}
                <textarea rows={3} value={activityBody} onChange={(event) => setActivityBody(event.target.value)} required placeholder="What work was done? What did the customer say?" />
                <div className={styles.activityFormFooter}><input value={activityOutcome} onChange={(event) => setActivityOutcome(event.target.value)} placeholder="Outcome (optional)" /><button className="btn btn-primary btn-sm" disabled={savingActivity}><Send size={15} /> {savingActivity ? 'Adding…' : 'Add update'}</button></div>
              </form>
              <div className={styles.timeline}>
                {activitiesLoading ? <p className={styles.muted}>Loading work history…</p> : leadActivities.length === 0 ? <p className={styles.muted}>No work updates yet.</p> : leadActivities.map((activity) => (
                  <div className={styles.timelineItem} key={activity.id}><span className={styles.timelineDot} /><div><div className={styles.timelineTop}><strong>{activityLabel(activity.activityType)}</strong><time>{formatDateTime(activity.createdAt)}</time></div>{activityEvidence(activity) && <span className={styles.activityEvidence}>{activityEvidence(activity)}</span>}<p>{activity.body}</p>{activity.outcome && <span className={styles.outcome}>Outcome: {activity.outcome}</span>}<small>{activity.actorName}</small></div></div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
