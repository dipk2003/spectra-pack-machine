import type { LeadStatus } from './lead-status';
import type { LeadAttribution } from './lead-attribution';

export const CRM_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type CrmPriority = (typeof CRM_PRIORITIES)[number];

export const CRM_PRIORITY_LABELS: Record<CrmPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const CRM_ACTIVITY_TYPES = [
  'note',
  'call',
  'whatsapp',
  'email',
  'meeting',
  'site_visit',
  'quote',
] as const;
export type CrmActivityType = (typeof CRM_ACTIVITY_TYPES)[number];

export const CRM_ACTIVITY_LABELS: Record<CrmActivityType, string> = {
  note: 'Note',
  call: 'Phone call',
  whatsapp: 'WhatsApp',
  email: 'Email',
  meeting: 'Meeting',
  site_visit: 'Site visit',
  quote: 'Quotation',
};

export const CRM_MANUAL_SOURCES = [
  'staff-phone',
  'staff-whatsapp',
  'staff-referral',
  'staff-indiamart',
  'staff-tradeindia',
  'staff-exhibition',
  'staff-walk-in',
  'staff-other',
] as const;
export type CrmManualSource = (typeof CRM_MANUAL_SOURCES)[number];

export const CRM_MANUAL_SOURCE_LABELS: Record<CrmManualSource, string> = {
  'staff-phone': 'Phone enquiry',
  'staff-whatsapp': 'WhatsApp enquiry',
  'staff-referral': 'Referral',
  'staff-indiamart': 'IndiaMART',
  'staff-tradeindia': 'TradeIndia',
  'staff-exhibition': 'Exhibition',
  'staff-walk-in': 'Walk-in',
  'staff-other': 'Other',
};

export const CRM_OWNER_ROLES = ['owner', 'admin', 'superadmin'] as const;
export const CRM_STAFF_ROLES = ['staff', 'sales', 'employee'] as const;

export const isCrmOwnerRole = (role: unknown) =>
  typeof role === 'string' &&
  CRM_OWNER_ROLES.includes(role.trim().toLowerCase() as (typeof CRM_OWNER_ROLES)[number]);

export const isCrmStaffRole = (role: unknown) =>
  typeof role === 'string' &&
  CRM_STAFF_ROLES.includes(role.trim().toLowerCase() as (typeof CRM_STAFF_ROLES)[number]);

export const isCrmAccessRole = (role: unknown) =>
  isCrmOwnerRole(role) || isCrmStaffRole(role);

export const isCrmPriority = (value: unknown): value is CrmPriority =>
  typeof value === 'string' && CRM_PRIORITIES.includes(value as CrmPriority);

export const isCrmActivityType = (value: unknown): value is CrmActivityType =>
  typeof value === 'string' && CRM_ACTIVITY_TYPES.includes(value as CrmActivityType);

export const isCrmManualSource = (value: unknown): value is CrmManualSource =>
  typeof value === 'string' && CRM_MANUAL_SOURCES.includes(value as CrmManualSource);

export type CrmViewer = {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  canViewAllLeads: boolean;
  canManageTeam: boolean;
};

export type CrmTeamMember = {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  active: boolean;
  isCurrentUser: boolean;
  isEnvironmentOwner?: boolean;
  createdAt?: string | null;
};

export type CrmLead = {
  attribution: LeadAttribution;
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productId: string;
  categoryId: string;
  machineInterest: string;
  message: string;
  source: string;
  origin: 'website' | 'manual' | 'import';
  read: boolean;
  status: LeadStatus;
  priority: CrmPriority;
  assignedTo: string;
  assigneeName: string;
  createdBy: string;
  creatorName: string;
  nextFollowUpAt: string | null;
  firstContactedAt: string | null;
  lastContactedAt: string | null;
  lastActivityAt: string | null;
  estimatedValue: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CrmActivity = {
  id: string;
  leadId: string;
  leadName: string;
  activityType: string;
  body: string;
  outcome: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CrmWorkspace = {
  viewer: CrmViewer;
  leads: CrmLead[];
  team: CrmTeamMember[];
  recentActivities: CrmActivity[];
  migrationReady: boolean;
  capabilities: {
    emailSending: boolean;
    whatsappSending: boolean;
    phoneCalling: boolean;
  };
  totalLeadCount: number;
  leadLimit: number;
  hasMoreLeads: boolean;
  nextOffset: number | null;
};
