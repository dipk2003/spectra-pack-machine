export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'quoted',
  'won',
  'lost',
  'spam',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
  spam: 'Spam',
};

export const isLeadStatus = (value: unknown): value is LeadStatus =>
  typeof value === 'string' && LEAD_STATUSES.includes(value as LeadStatus);

export class LeadUpdateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadUpdateValidationError';
  }
}
