import 'server-only';
import { createHash } from 'node:crypto';
import { IMPORT_FIELDS, IMPORT_LIMIT, importContactKeys, validateImportLead, type ImportLead } from './crm-import';

import { getConfiguredEnvAdmin } from './admin-identity';
import { attributionFromRow } from './lead-attribution';
import {
  canAccessCrmLead,
  CRM_CONTACT_STATUSES,
  crmCommunicationUrl,
  isConfirmedCrmContact,
  isCrmUuid,
} from './crm-policy';
import { isEmailConfigured, sendEmail } from './email';
import { classifyEmailFailure } from './email-failure';
import { indiaPhone, plivoConfiguration, requestPlivoCall } from './plivo-calling';
import {
  CRM_ACTIVITY_LABELS,
  isCrmActivityType,
  isCrmManualSource,
  isCrmOwnerRole,
  isCrmPriority,
  type CrmActivity,
  type CrmLead,
  type CrmTeamMember,
  type CrmViewer,
  type CrmWorkspace,
} from './crm-types';
import { isLeadStatus } from './lead-status';
import { normalizeStoredPhone } from './phone';
import { getSupabaseAdmin } from './supabase';

const CRM_LEAD_LIMIT = 750;
const CRM_ACTIVITY_LIMIT = 150;
const MAX_ACTIVE_STAFF = 10;

type CrmLeadRow = {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  product_id: string | null;
  category_id: string | null;
  machine_interest: string | null;
  message: string | null;
  source: string | null;
  origin: string | null;
  read: boolean | null;
  status: string | null;
  priority: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_by_email: string | null;
  next_follow_up_at: string | null;
  first_contacted_at: string | null;
  last_contacted_at: string | null;
  last_activity_at: string | null;
  estimated_value: number | string | null;
  created_at: string;
  updated_at: string;
};

type CrmActivityRow = {
  id: string;
  lead_id: string;
  activity_type: string;
  body: string | null;
  outcome: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  metadata: unknown;
  created_at: string;
  leads?: { name?: string } | null;
};

type CrmTeamRow = {
  user_id: string;
  email: string | null;
  role: string | null;
  display_name: string | null;
  active: boolean | null;
  created_at: string | null;
};

export class CrmValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CrmValidationError';
  }
}

export class CrmAccessError extends Error {
  constructor(message = 'You do not have access to this lead.') {
    super(message);
    this.name = 'CrmAccessError';
  }
}

export class CrmSchemaError extends Error {
  constructor() {
    super('CRM database setup is pending. Apply the sales CRM and 20260906_crm_security_communications.sql migrations.');
    this.name = 'CrmSchemaError';
  }
}

const toText = (value: unknown, maxLength: number) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : '';

const toMultilineText = (value: unknown, maxLength: number) =>
  typeof value === 'string'
    ? value.replace(/\0/g, '').trim().slice(0, maxLength)
    : '';

const normalizeEmail = (value: unknown) => toText(value, 200).toLowerCase();

const isValidEmail = (email: string) =>
  !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isCrmSchemaError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String(error.code || '') : '';
  const message = 'message' in error ? String(error.message || '') : '';
  return (
    code === 'PGRST204' ||
    code === 'PGRST205' ||
    code === 'PGRST202' ||
    code === '42P01' ||
    code === '42703' ||
    message.includes("Could not find the 'origin' column") ||
    message.includes('lead_activities') ||
    message.includes('assigned_to') ||
    message.includes('does not exist')
  );
};

const throwDatabaseError = (error: unknown): never => {
  if (error && typeof error === 'object' && 'code' in error && error.code === '42501') {
    throw new CrmAccessError();
  }
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P0001' && 'message' in error) {
    const message = String(error.message);
    if (message.startsWith('Email sending limit reached.') || message.startsWith('The CRM supports a maximum')) {
      throw new CrmValidationError(message);
    }
  }
  if (isCrmSchemaError(error)) throw new CrmSchemaError();
  throw error;
};

const mapTeamRow = (row: CrmTeamRow, viewerId: string): CrmTeamMember => ({
  userId: row.user_id,
  email: row.email || '',
  displayName: row.display_name || row.email || 'Team member',
  role: row.role || 'staff',
  active: Boolean(row.active),
  isCurrentUser: row.user_id === viewerId,
  createdAt: row.created_at,
});

const teamName = (teamById: Map<string, CrmTeamMember>, userId: string | null) =>
  userId ? teamById.get(userId)?.displayName || 'Team member' : 'Unassigned';

const mapLeadRow = (
  row: CrmLeadRow,
  teamById: Map<string, CrmTeamMember>,
): CrmLead => {
  const numericValue = row.estimated_value === null ? null : Number(row.estimated_value);
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || '',
    productId: row.product_id || '',
    categoryId: row.category_id || '',
    machineInterest: row.machine_interest || '',
    message: row.message || '',
    source: row.source || 'contact',
    origin:
      row.origin === 'manual' || row.origin === 'import' ? row.origin : 'website',
    read: Boolean(row.read),
    status: isLeadStatus(row.status) ? row.status : 'new',
    priority: isCrmPriority(row.priority) ? row.priority : 'medium',
    assignedTo: row.assigned_to || '',
    assigneeName: teamName(teamById, row.assigned_to),
    createdBy: row.created_by || '',
    creatorName: row.created_by
      ? row.created_by_name || teamName(teamById, row.created_by)
      : 'Website',
    nextFollowUpAt: row.next_follow_up_at,
    firstContactedAt: row.first_contacted_at,
    lastContactedAt: row.last_contacted_at,
    lastActivityAt: row.last_activity_at,
    estimatedValue: Number.isFinite(numericValue) ? numericValue : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attribution: attributionFromRow(row),
  };
};

const mapActivityRow = (
  row: CrmActivityRow,
  leadNames: Map<string, string>,
): CrmActivity => ({
  id: row.id,
  leadId: row.lead_id,
  leadName: row.leads?.name || leadNames.get(row.lead_id) || 'Lead',
  activityType: row.activity_type,
  body: row.body || '',
  outcome: row.outcome || '',
  actorId: row.actor_id || '',
  actorName: row.actor_name || 'System',
  actorEmail: row.actor_email || '',
  metadata:
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {},
  createdAt: row.created_at,
});

export async function listCrmTeam(viewer: CrmViewer) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, role, display_name, active, created_at')
    .order('active', { ascending: false })
    .order('display_name', { ascending: true });

  if (error) throwDatabaseError(error);

  const team = ((data || []) as CrmTeamRow[]).map((row) => mapTeamRow(row, viewer.userId));
  const environmentOwner = getConfiguredEnvAdmin();

  if (environmentOwner && !team.some((member) => member.userId === environmentOwner.id)) {
    team.unshift({
      userId: environmentOwner.id,
      email: environmentOwner.email,
      displayName: environmentOwner.displayName,
      role: 'owner',
      active: true,
      isCurrentUser: viewer.userId === environmentOwner.id,
      isEnvironmentOwner: true,
      createdAt: null,
    });
  }

  return team;
}

const applyViewerLeadScope = <T extends { eq: (column: string, value: string) => T }>(
  query: T,
  viewer: CrmViewer,
) => {
  if (viewer.canViewAllLeads) return query;
  return query.eq('assigned_to', viewer.userId);
};

async function listScopedLeadRows(viewer: CrmViewer, offset: number) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('next_follow_up_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(offset, offset + CRM_LEAD_LIMIT - 1);

  query = applyViewerLeadScope(query, viewer);
  const { data, error, count } = await query;
  if (error) throwDatabaseError(error);
  return { rows: (data || []) as CrmLeadRow[], total: count || 0 };
}

async function listScopedActivities(
  viewer: CrmViewer,
  leads: CrmLead[],
  limit = CRM_ACTIVITY_LIMIT,
) {
  if (leads.length === 0) return [] as CrmActivity[];

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('lead_activities')
    .select('*, leads!inner(name, assigned_to)')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Scope in this database read too: ownership may have changed since the
  // lead list was loaded. A relation filter also avoids a huge ID-list URL.
  if (!viewer.canViewAllLeads) query = query.eq('leads.assigned_to', viewer.userId);

  const { data, error } = await query;
  if (error) throwDatabaseError(error);
  const leadNames = new Map(leads.map((lead) => [lead.id, lead.name]));
  return ((data || []) as CrmActivityRow[]).map((row) => mapActivityRow(row, leadNames));
}

export async function getCrmWorkspace(viewer: CrmViewer, offset = 0): Promise<CrmWorkspace> {
  if (!Number.isSafeInteger(offset) || offset < 0) throw new CrmValidationError('Invalid lead offset.');
  const team = await listCrmTeam(viewer);
  const teamById = new Map(team.map((member) => [member.userId, member]));
  const { rows: leadRows, total } = await listScopedLeadRows(viewer, offset);
  const leads = leadRows.map((row) => mapLeadRow(row, teamById));
  const recentActivities = await listScopedActivities(viewer, leads);

  return {
    viewer,
    leads,
    team: viewer.canManageTeam
      ? team
      : team
          .filter((member) => member.active)
          .map((member) => ({
            ...member,
            email: member.isCurrentUser ? member.email : '',
          })),
    recentActivities: viewer.canViewAllLeads
      ? recentActivities
      : recentActivities.map((activity) => ({ ...activity, actorEmail: '' })),
    migrationReady: true,
    capabilities: { emailSending: isEmailConfigured(), whatsappSending: false, phoneCalling: plivoConfiguration(viewer.email).configured },
    totalLeadCount: total,
    leadLimit: CRM_LEAD_LIMIT,
    hasMoreLeads: offset + leads.length < total,
    nextOffset: offset + leads.length < total ? offset + leads.length : null,
  };
}

const getActiveAssignee = async (assigneeId: string, team: CrmTeamMember[]) => {
  const member = team.find((candidate) => candidate.userId === assigneeId && candidate.active);
  if (!member) throw new CrmValidationError('Select an active team member.');
  return member;
};

const normalizeManualLeadInput = (input: Record<string, unknown>) => {
  const name = toText(input.name, 200);
  const email = normalizeEmail(input.email);
  let phone = '';

  try {
    phone = normalizeStoredPhone(input.phone);
  } catch {
    throw new CrmValidationError('Enter a valid phone number.');
  }

  if (!name) throw new CrmValidationError('Customer name is required.');
  if (!email && !phone) {
    throw new CrmValidationError('Add at least a phone number or email address.');
  }
  if (!isValidEmail(email)) throw new CrmValidationError('Enter a valid email address.');

  const source = isCrmManualSource(input.source) ? input.source : 'staff-other';
  const priority = isCrmPriority(input.priority) ? input.priority : 'medium';
  const estimatedValue = input.estimatedValue === '' || input.estimatedValue == null
    ? null
    : Number(input.estimatedValue);

  if (estimatedValue !== null && (!Number.isFinite(estimatedValue) || estimatedValue < 0 || estimatedValue > 999_999_999_999.99)) {
    throw new CrmValidationError('Estimated value must be between 0 and 999999999999.99.');
  }

  return {
    name,
    email,
    phone,
    company: toText(input.company, 200),
    machine_interest: toText(input.machineInterest, 200),
    message: toMultilineText(input.message, 2000) || 'Manual sales enquiry.',
    source,
    priority,
    estimated_value: estimatedValue,
  };
};

export async function createManualCrmLead(
  viewer: CrmViewer,
  input: Record<string, unknown>,
) {
  const normalized = normalizeManualLeadInput(input);
  const team = await listCrmTeam(viewer);
  const requestedAssignee = toText(input.assignedTo, 300);
  const assignedTo = viewer.canViewAllLeads
    ? requestedAssignee || viewer.userId
    : viewer.userId;
  const assignee = await getActiveAssignee(assignedTo, team);
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...normalized,
      origin: 'manual',
      assigned_to: assignee.userId,
      created_by: viewer.userId,
      created_by_name: viewer.displayName,
      created_by_email: viewer.email,
      last_modified_by: viewer.userId,
      last_modified_name: viewer.displayName,
      last_modified_email: viewer.email,
      last_activity_at: now,
      read: true,
      status: 'new',
    })
    .select('*')
    .single();

  if (error) throwDatabaseError(error);
  const teamById = new Map(team.map((member) => [member.userId, member]));
  return mapLeadRow(data as CrmLeadRow, teamById);
}

export async function importCrmLeads(viewer: CrmViewer, input: Record<string, unknown>) {
  if (!Array.isArray(input.rows) || !input.rows.length || input.rows.length > IMPORT_LIMIT) {
    throw new CrmValidationError(`Import between 1 and ${IMPORT_LIMIT} rows at a time.`);
  }
  const rows = input.rows.map((value, index) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CrmValidationError(`Row ${index + 2}: invalid data.`);
    const row = Object.fromEntries(IMPORT_FIELDS.map(field => [field, typeof value[field] === 'string' ? value[field].trim() : ''])) as ImportLead;
    const error = validateImportLead(row);
    if (error) throw new CrmValidationError(`Row ${index + 2}: ${error}`);
    return normalizeManualLeadInput({ ...row, source: 'staff-other' });
  });
  const team = await listCrmTeam(viewer);
  await getActiveAssignee(viewer.userId, team);
  const db = getSupabaseAdmin();
  const seen = new Set<string>();
  // Respect lead visibility; importing never reveals or modifies another employee's leads.
  for (let offset = 0; ; offset += 1000) {
    const query = db.from('leads').select('id,email,phone').order('id').range(offset, offset + 999);
    const { data, error } = await applyViewerLeadScope(query, viewer);
    if (error) throwDatabaseError(error);
    for (const lead of data || []) importContactKeys(lead).forEach(key => seen.add(key));
    if (!data || data.length < 1000) break;
  }
  const now = new Date().toISOString();
  const payload = [];
  for (const row of rows) {
    const keys = importContactKeys(row);
    if (keys.some(key => seen.has(key))) continue;
    keys.forEach(key => seen.add(key));
    // A stable UUID protects a retry after a lost response, without overwriting existing leads.
    const hash = createHash('sha256').update(JSON.stringify([viewer.userId, row])).digest('hex');
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    payload.push({ ...row, id, origin: 'manual', assigned_to: viewer.userId,
      created_by: viewer.userId, created_by_name: viewer.displayName, created_by_email: viewer.email,
      last_modified_by: viewer.userId, last_modified_name: viewer.displayName, last_modified_email: viewer.email,
      last_activity_at: now, read: true, status: 'new' });
  }
  if (!payload.length) return { imported: 0, skipped: rows.length };
  const { data, error } = await db.from('leads').upsert(payload, { onConflict: 'id', ignoreDuplicates: true }).select('id');
  if (error) throwDatabaseError(error);
  return { imported: data?.length || 0, skipped: rows.length - (data?.length || 0) };
}

async function getScopedLeadRow(viewer: CrmViewer, leadId: string) {
  if (!isCrmUuid(leadId)) throw new CrmValidationError('Lead not found.');
  const supabase = getSupabaseAdmin();
  const query = supabase
    .from('leads')
    .select('*')
    .eq('id', leadId);
  const { data, error } = await applyViewerLeadScope(query, viewer).maybeSingle();

  if (error) throwDatabaseError(error);
  if (!data) throw new CrmValidationError('Lead not found.');

  const row = data as CrmLeadRow;
  if (!canAccessCrmLead(viewer, row)) {
    throw new CrmAccessError();
  }

  return row;
}

const normalizeFollowUp = (value: unknown) => {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new CrmValidationError('Invalid follow-up date.');
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new CrmValidationError('Invalid follow-up date.');
  return parsed.toISOString();
};

export async function updateCrmLead(
  viewer: CrmViewer,
  leadId: string,
  input: Record<string, unknown>,
) {
  const current = await getScopedLeadRow(viewer, leadId);
  const payload: Record<string, unknown> = {
    last_modified_by: viewer.userId,
    last_modified_name: viewer.displayName,
    last_modified_email: viewer.email,
  };

  if (input.status !== undefined) {
    if (!isLeadStatus(input.status)) throw new CrmValidationError('Select a valid stage.');
    payload.status = input.status;
    if (input.status !== 'new') payload.read = true;
  }

  if (input.priority !== undefined) {
    if (!isCrmPriority(input.priority)) throw new CrmValidationError('Select a valid priority.');
    payload.priority = input.priority;
  }

  if (input.nextFollowUpAt !== undefined) {
    payload.next_follow_up_at = normalizeFollowUp(input.nextFollowUpAt);
  }

  if (input.estimatedValue !== undefined) {
    const estimatedValue = input.estimatedValue === null || input.estimatedValue === ''
      ? null
      : Number(input.estimatedValue);
    if (estimatedValue !== null && (!Number.isFinite(estimatedValue) || estimatedValue < 0 || estimatedValue > 999_999_999_999.99)) {
      throw new CrmValidationError('Estimated value must be between 0 and 999999999999.99.');
    }
    payload.estimated_value = estimatedValue;
  }

  if (typeof input.read === 'boolean') payload.read = input.read;

  if (input.assignedTo !== undefined) {
    if (!viewer.canManageTeam) throw new CrmAccessError('Only the owner can reassign leads.');
    const assignedTo = toText(input.assignedTo, 300);
    if (assignedTo) {
      const team = await listCrmTeam(viewer);
      await getActiveAssignee(assignedTo, team);
      payload.assigned_to = assignedTo;
    } else {
      payload.assigned_to = null;
    }
  }

  const editableTextFields = {
    name: ['name', 200],
    email: ['email', 200],
    company: ['company', 200],
    machineInterest: ['machine_interest', 200],
    message: ['message', 2000],
  } as const;

  Object.entries(editableTextFields).forEach(([inputKey, [column, maxLength]]) => {
    if (input[inputKey] !== undefined) payload[column] =
      column === 'message'
        ? toMultilineText(input[inputKey], maxLength)
        : toText(input[inputKey], maxLength);
  });

  if (input.phone !== undefined) {
    try {
      payload.phone = normalizeStoredPhone(input.phone);
    } catch {
      throw new CrmValidationError('Enter a valid phone number.');
    }
  }

  if (typeof payload.name === 'string' && !payload.name) {
    throw new CrmValidationError('Customer name is required.');
  }
  if (typeof payload.email === 'string' && !isValidEmail(payload.email)) {
    throw new CrmValidationError('Enter a valid email address.');
  }
  if (typeof payload.email === 'string') payload.email = payload.email.toLowerCase();
  if (!(payload.email ?? current.email) && !(payload.phone ?? current.phone)) {
    throw new CrmValidationError('Keep at least a phone number or email address.');
  }

  if (Object.keys(payload).length === 3) {
    throw new CrmValidationError('No lead changes were provided.');
  }

  const supabase = getSupabaseAdmin();
  const query = supabase
    .from('leads')
    .update(payload)
    .eq('id', leadId);
  // Repeat ownership in the write predicate: reassignment can happen after the read.
  const { data, error } = await applyViewerLeadScope(query, viewer).select('*').maybeSingle();

  if (error) throwDatabaseError(error);
  if (!data) throw new CrmAccessError();
  const team = await listCrmTeam(viewer);
  return mapLeadRow(data as CrmLeadRow, new Map(team.map((member) => [member.userId, member])));
}

export async function listCrmLeadActivities(viewer: CrmViewer, leadId: string) {
  const lead = await getScopedLeadRow(viewer, leadId);
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('lead_activities')
    .select('*, leads!inner(name, assigned_to)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(250);
  if (!viewer.canViewAllLeads) query = query.eq('leads.assigned_to', viewer.userId);
  const { data, error } = await query;

  if (error) throwDatabaseError(error);
  const leadNames = new Map([[leadId, lead.name]]);
  const activities = ((data || []) as CrmActivityRow[]).map((row) =>
    mapActivityRow(row, leadNames),
  );
  return viewer.canViewAllLeads
    ? activities
    : activities.map((activity) => ({ ...activity, actorEmail: '' }));
}

export async function addCrmLeadActivity(
  viewer: CrmViewer,
  leadId: string,
  input: Record<string, unknown>,
) {
  const lead = await getScopedLeadRow(viewer, leadId);
  if (!isCrmActivityType(input.activityType)) {
    throw new CrmValidationError('Select a valid activity type.');
  }

  const body = toMultilineText(input.body, 4000);
  const outcome = toText(input.outcome, 500);
  if (!body) throw new CrmValidationError('Write a short work update.');
  const contactStatus = input.contactStatus ?? 'not_applicable';
  if (!(CRM_CONTACT_STATUSES as readonly unknown[]).includes(contactStatus)) {
    throw new CrmValidationError('Select a valid contact result.');
  }
  const activity = await recordCrmActivity(viewer, leadId, {
    activityType: input.activityType,
    body,
    outcome,
    metadata: {
      label: CRM_ACTIVITY_LABELS[input.activityType],
      source: 'employee_report',
      contactStatus,
      contactConfirmed: isConfirmedCrmContact(input.activityType, contactStatus),
    },
  });
  return mapActivityRow(activity, new Map([[leadId, lead.name]]));
}

async function recordCrmActivity(
  viewer: CrmViewer,
  leadId: string,
  input: { activityType: string; body: string; outcome?: string; metadata: Record<string, unknown> },
) {
  const { data, error } = await getSupabaseAdmin().rpc('crm_record_activity', {
    p_lead_id: leadId,
    p_actor_id: viewer.userId,
    p_actor_name: viewer.displayName,
    p_actor_email: viewer.email,
    p_owner_access: viewer.canViewAllLeads,
    p_activity_type: input.activityType,
    p_body: input.body,
    p_outcome: input.outcome || '',
    p_metadata: input.metadata,
  });
  if (error) throwDatabaseError(error);
  return data as CrmActivityRow;
}

const escapeEmailHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

/** A server-recorded launch is intent to open a client; it is never a sent message. */
export async function createCrmCommunication(
  viewer: CrmViewer,
  leadId: string,
  input: Record<string, unknown>,
) {
  const lead = await getScopedLeadRow(viewer, leadId);
  if (input.channel !== 'call' && input.channel !== 'whatsapp' && input.channel !== 'email') {
    throw new CrmValidationError('Select a supported communication channel.');
  }
  if (input.action !== 'launch' && input.action !== 'send') {
    throw new CrmValidationError('Select a communication action.');
  }
  const subject = toText(input.subject, 160);
  const body = toMultilineText(input.body, 4000);
  if (typeof input.body === 'string' && input.body.length > 4000) {
    throw new CrmValidationError('Messages must be 4000 characters or fewer.');
  }
  let launchUrl: string;
  try {
    launchUrl = crmCommunicationUrl(input.channel, lead, subject, body);
  } catch (error) {
    throw new CrmValidationError(error instanceof Error ? error.message : 'Invalid contact details.');
  }
  const leadNames = new Map([[leadId, lead.name]]);
  if (input.action === 'send' && input.channel === 'call') {
    const config = plivoConfiguration(viewer.email);
    if (!config.configured) throw new CrmValidationError('CRM calling is not connected. Ask the administrator to configure Plivo and your callback mobile number.');
    const customerPhone = indiaPhone(lead.phone);
    if (!customerPhone) throw new CrmValidationError('CRM calling currently supports Indian phone numbers only.');
    if (customerPhone === config.agentPhone) throw new CrmValidationError('Customer and employee phone numbers must be different.');
    if (!isCrmUuid(input.requestId)) throw new CrmValidationError('A valid call request ID is required.');
    const db = getSupabaseAdmin();
    const { error: reserveError } = await db.from('crm_call_requests').insert({ id: input.requestId, lead_id: leadId, actor_id: viewer.userId, agent_phone: config.agentPhone, customer_phone: customerPhone, caller_id: config.callerId });
    if (reserveError) {
      if (reserveError.code !== '23505') throw new CrmValidationError('Calling database setup is pending. Apply the 20260930_crm_phone_calls.sql migration.');
      const { data: prior, error } = await db.from('crm_call_requests').select('status').eq('id', input.requestId).eq('actor_id', viewer.userId).eq('lead_id', leadId).eq('customer_phone', customerPhone).maybeSingle();
      if (error || !prior) throw new CrmAccessError();
      return { status: prior.status, notice: 'This call request was already recorded. Check your phone and call history before starting another call.' };
    }
    // Audit and reserve before contacting the provider. Never retry an ambiguous submission.
    const activity = await recordCrmActivity(viewer, leadId, { activityType: 'call', body: 'CRM callback requested through Plivo. Customer connection is not yet confirmed.', metadata: { channel: 'call', provider: 'plivo', status: 'call_requested', requestId: input.requestId, contactConfirmed: false } });
    let result: { status: 'queued' | 'failed' | 'uncertain'; providerId: string } = { status: 'uncertain', providerId: '' };
    try { result = await requestPlivoCall(config, input.requestId); } catch { /* A timeout may follow provider acceptance. */ }
    const { error: saveError } = await db.from('crm_call_requests').update({ status: result.status, provider_id: result.providerId || null }).eq('id', input.requestId);
    return { activity: mapActivityRow(activity, leadNames), status: saveError ? 'uncertain' : result.status,
      notice: saveError || result.status === 'uncertain' ? 'Call result is uncertain. Check your phone and Plivo before trying another call.'
        : result.status === 'failed' ? 'The calling provider rejected the request. Check account credentials, balance and caller number activation.'
          : 'Calling your registered mobile. Answer it to connect to the customer. Both call legs are billed by the provider.' };
  }
  if (input.action === 'launch') {
    const activity = await recordCrmActivity(viewer, leadId, {
      activityType: 'communication_launch',
      body: `${CRM_ACTIVITY_LABELS[input.channel]} client launch requested. Delivery and connection are not confirmed.`,
      metadata: { channel: input.channel, status: 'launched', contactConfirmed: false },
    });
    return {
      activity: mapActivityRow(activity, leadNames),
      launchUrl,
      status: 'launched' as const,
      notice: 'Client launch recorded. Save the contact result after the conversation.',
    };
  }
  if (input.channel !== 'email') {
    throw new CrmValidationError('Use the launch action for WhatsApp and phone calls.');
  }
  if (!isEmailConfigured()) {
    throw new CrmValidationError('Email sending is not configured. Contact the administrator or use your email app.');
  }
  if (!subject || !body) throw new CrmValidationError('Add an email subject and message.');
  if (!isCrmUuid(input.requestId)) {
    throw new CrmValidationError('A valid request ID is required to prevent duplicate email sends.');
  }

  const supabase = getSupabaseAdmin();
  const { data: reservation, error: reserveError } = await supabase.rpc('crm_reserve_email', {
    p_request_id: input.requestId,
    p_lead_id: leadId,
    p_actor_id: viewer.userId,
    p_actor_name: viewer.displayName,
    p_actor_email: viewer.email,
    p_owner_access: viewer.canViewAllLeads,
    p_recipient: lead.email!.trim(),
    p_subject: subject,
    p_body: body,
  });
  if (reserveError) throwDatabaseError(reserveError);
  const reserved = reservation as {
    created: boolean;
    status: 'pending' | 'accepted' | 'uncertain' | 'failed';
    activity: CrmActivityRow;
  };
  if (!reserved?.activity) throw new Error('Email reservation returned an invalid result.');
  if (!reserved.created) {
    return {
      status: reserved.status,
      activity: mapActivityRow(reserved.activity, leadNames),
      notice: reserved.status === 'accepted'
        ? 'This email was already accepted by the email server. Delivery is not confirmed.'
        : 'This request was already recorded. Check its timeline and your email provider before starting another send.',
    };
  }

  // Reserve and audit first. A timeout is ambiguous: never automatically retry SMTP.
  let status: 'accepted' | 'uncertain' | 'failed' = 'uncertain';
  let failureNotice = 'The email was not submitted. Check the email configuration.';
  try {
    const result = await sendEmail({
      to: lead.email!.trim(),
      subject,
      text: body,
      html: `<div style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeEmailHtml(body)}</div>`,
      ...(isValidEmail(viewer.email) && viewer.email ? { replyTo: viewer.email } : {}),
    });
    status = result.sent ? 'accepted' : 'failed';
  } catch (error) {
    const failure = classifyEmailFailure(error);
    status = failure.status;
    failureNotice = failure.notice;
  }
  const { data: finalized, error: finalizeError } = await supabase.rpc('crm_finish_email', {
    p_request_id: input.requestId,
    p_actor_id: viewer.userId,
    p_status: status,
  });
  if (finalizeError) {
    // The pending reservation survives failures and blocks duplicate retries.
    return {
      status: 'uncertain' as const,
      activity: mapActivityRow(reserved.activity, leadNames),
      notice: 'The send result could not be saved. Check your email provider before sending again.',
    };
  }
  return {
    status,
    activity: mapActivityRow(finalized as CrmActivityRow, leadNames),
    notice: status === 'accepted'
      ? 'Accepted by the email server; delivery is not confirmed.'
      : failureNotice,
  };
}

const countActiveStaff = (team: CrmTeamMember[]) =>
  team.filter((member) => member.active && !isCrmOwnerRole(member.role)).length;

export async function createCrmTeamMember(
  viewer: CrmViewer,
  input: Record<string, unknown>,
) {
  if (!viewer.canManageTeam) throw new CrmAccessError('Only the owner can add employees.');

  const displayName = toText(input.displayName, 120);
  const email = normalizeEmail(input.email);
  const password = typeof input.password === 'string' ? input.password : '';
  if (!displayName) throw new CrmValidationError('Employee name is required.');
  if (!email || !isValidEmail(email)) throw new CrmValidationError('Enter a valid employee email.');
  if (password.length < 10 || password.length > 128) {
    throw new CrmValidationError('Temporary password must contain 10 to 128 characters.');
  }

  const team = await listCrmTeam(viewer);
  if (countActiveStaff(team) >= MAX_ACTIVE_STAFF) {
    throw new CrmValidationError('The CRM supports a maximum of 10 active employees.');
  }
  if (team.some((member) => member.email.toLowerCase() === email)) {
    throw new CrmValidationError('A team member with this email already exists.');
  }

  const supabase = getSupabaseAdmin();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });
  if (authError || !authData.user) {
    throw new CrmValidationError(authError?.message || 'Could not create the employee login.');
  }

  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      user_id: authData.user.id,
      email,
      display_name: displayName,
      role: 'staff',
      active: true,
    })
    .select('user_id, email, role, display_name, active, created_at')
    .single();

  if (error) {
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => undefined);
    throwDatabaseError(error);
  }

  return mapTeamRow(data as CrmTeamRow, viewer.userId);
}

export async function updateCrmTeamMember(
  viewer: CrmViewer,
  userId: string,
  input: Record<string, unknown>,
) {
  if (!viewer.canManageTeam) throw new CrmAccessError('Only the owner can manage employees.');
  if (userId === viewer.userId) {
    throw new CrmValidationError('Your own owner access cannot be changed here.');
  }

  const team = await listCrmTeam(viewer);
  const existing = team.find((member) => member.userId === userId && !member.isEnvironmentOwner);
  if (!existing) throw new CrmValidationError('Team member not found.');
  if (isCrmOwnerRole(existing.role)) {
    throw new CrmAccessError('Owner accounts cannot be changed from employee management.');
  }

  const payload: Record<string, unknown> = {};
  if (input.displayName !== undefined) {
    const displayName = toText(input.displayName, 120);
    if (!displayName) throw new CrmValidationError('Employee name is required.');
    payload.display_name = displayName;
  }
  if (typeof input.active === 'boolean') {
    if (input.active && !existing.active && countActiveStaff(team) >= MAX_ACTIVE_STAFF) {
      throw new CrmValidationError('The CRM supports a maximum of 10 active employees.');
    }
    payload.active = input.active;
  }

  const password = typeof input.password === 'string' ? input.password : '';
  if (password && (password.length < 10 || password.length > 128)) {
    throw new CrmValidationError('New password must contain 10 to 128 characters.');
  }
  if (Object.keys(payload).length === 0 && !password) {
    throw new CrmValidationError('No employee changes were provided.');
  }

  const supabase = getSupabaseAdmin();
  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('admin_users').update(payload).eq('user_id', userId);
    if (error) throwDatabaseError(error);
  }
  if (password) {
    const { error } = await supabase.auth.admin.updateUserById(userId, { password });
    if (error) throw new CrmValidationError(error.message);
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, role, display_name, active, created_at')
    .eq('user_id', userId)
    .single();
  if (error) throwDatabaseError(error);
  return mapTeamRow(data as CrmTeamRow, viewer.userId);
}
