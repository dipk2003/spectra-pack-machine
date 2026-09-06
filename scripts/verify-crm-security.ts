import assert from 'node:assert/strict';
import Module from 'node:module';
import {
  canAccessCrmLead,
  crmCommunicationUrl,
  isConfirmedCrmContact,
  isTrustedCrmRequest,
} from '../src/lib/crm-policy';
import type { CrmViewer } from '../src/lib/crm-types';

const staff: CrmViewer = {
  userId: '4a06f9a4-ea04-4e9c-b2b8-5b2be458d311', email: 'staff@example.test',
  displayName: 'Test employee', role: 'staff', canViewAllLeads: false, canManageTeam: false,
};
const owner: CrmViewer = { ...staff, userId: 'env-admin:owner@example.test', role: 'owner', canManageTeam: true, canViewAllLeads: true };
const leadId = '17c92484-d7ef-43a3-88f1-6e9bd168c11e';
const requestId = '3b03f67c-972b-4468-a751-1b241cd067f1';
const now = '2026-09-06T10:00:00Z';
const lead = {
  id: leadId, name: 'Test customer', email: 'customer@example.test', phone: '+91 9876543210',
  assigned_to: staff.userId, status: 'new', created_at: now, updated_at: now,
  first_contacted_at: null, last_contacted_at: null,
};
let sendCalls = 0;
let denyReservation = false;
let failFinalize = false;
let raceReassignment = false;
let updateWasScoped = false;
let lastUpdate: Record<string, unknown> = {};
let reservation: { status: string; activity: Record<string, unknown> } | null = null;
const activities: Record<string, unknown>[] = [];

const makeActivity = (activityType: string, metadata: unknown = {}) => ({
  id: requestId, lead_id: leadId, actor_id: staff.userId, actor_name: staff.displayName,
  actor_email: staff.email, activity_type: activityType, body: '', outcome: '', metadata, created_at: now,
});

class FakeQuery {
  filters: Array<[string, unknown]> = [];
  payload: Record<string, unknown> | null = null;
  constructor(readonly table: string) {}
  select() { return this; }
  eq(column: string, value: unknown) { this.filters.push([column, value]); return this; }
  order() { return this; }
  update(payload: Record<string, unknown>) { this.payload = payload; return this; }
  async maybeSingle() {
    if (this.payload) {
      lastUpdate = this.payload;
      updateWasScoped = this.filters.some(([column, value]) => column === 'assigned_to' && value === staff.userId);
      if (raceReassignment && updateWasScoped) return { data: null, error: null };
    }
    return { data: { ...lead, ...this.payload }, error: null };
  }
  then<TResult1 = unknown, TResult2 = never>(
    resolve?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve({
      data: this.table === 'admin_users' ? [{ user_id: staff.userId, email: staff.email, display_name: staff.displayName, role: 'staff', active: true }] : [],
      error: null,
    }).then(resolve, reject);
  }
}

const database = {
  from: (table: string) => new FakeQuery(table),
  async rpc(name: string, args: Record<string, unknown>) {
    if (name === 'crm_record_activity') {
      const activity = makeActivity(String(args.p_activity_type), args.p_metadata);
      activities.push(activity);
      return { data: activity, error: null };
    }
    if (name === 'crm_reserve_email') {
      if (denyReservation) return { data: null, error: { code: '42501' } };
      if (reservation) return { data: { ...reservation, created: false }, error: null };
      reservation = { status: 'pending', activity: makeActivity('email_pending') };
      return { data: { ...reservation, created: true }, error: null };
    }
    if (name === 'crm_finish_email') {
      if (failFinalize) return { data: null, error: { code: '08006' } };
      reservation = { status: String(args.p_status), activity: makeActivity(`email_${args.p_status}`) };
      return { data: reservation.activity, error: null };
    }
    throw new Error(`Unexpected RPC: ${name}`);
  },
};

// Override at the module boundary before loading server code: this test cannot
// access Supabase or SMTP, even when a developer has production env configured.
const loader = Module as unknown as { _load: (name: string, ...rest: unknown[]) => unknown };
const originalLoad = loader._load;
loader._load = function (name: string, ...rest: unknown[]) {
  if (name === 'server-only') return {};
  if (name === './supabase') return { getSupabaseAdmin: () => database };
  if (name === './email') return {
    isEmailConfigured: () => true,
    sendEmail: async () => { sendCalls += 1; return { sent: true }; },
  };
  return originalLoad.call(this, name, ...rest);
};

async function main() {
  assert.equal(canAccessCrmLead(staff, { assigned_to: staff.userId }), true);
  assert.equal(canAccessCrmLead(staff, { assigned_to: 'another-employee' }), false);
  assert.equal(canAccessCrmLead(staff, { assigned_to: null }), false);
  assert.equal(canAccessCrmLead(owner, { assigned_to: null }), true);
  const origin = 'https://crm.example.test';
  const json = { 'content-type': 'application/json' };
  assert.equal(isTrustedCrmRequest(new Headers({ ...json, origin }), origin), true);
  assert.equal(isTrustedCrmRequest(new Headers({ ...json, origin: 'https://evil.example.test' }), origin), false);
  assert.equal(isTrustedCrmRequest(new Headers({ ...json, 'sec-fetch-site': 'same-site', origin }), origin), false);
  assert.equal(isTrustedCrmRequest(new Headers(json), origin), false);
  assert.equal(isTrustedCrmRequest(new Headers({ ...json, 'sec-fetch-site': 'same-origin' }), origin), true);
  assert.equal(isTrustedCrmRequest(new Headers({ origin, 'content-type': 'text/plain' }), origin), false);
  assert.equal(isConfirmedCrmContact('call', 'attempted'), false);
  assert.equal(isConfirmedCrmContact('communication_launch', 'completed'), false);
  assert.equal(isConfirmedCrmContact('email_accepted', 'completed'), false);
  assert.equal(isConfirmedCrmContact('call', 'completed'), true);
  assert.equal(crmCommunicationUrl('call', lead, '', ''), 'tel:+919876543210');
  assert.match(crmCommunicationUrl('whatsapp', lead, '', 'Hello & thanks'), /^https:\/\/wa\.me\/919876543210\?text=Hello%20%26%20thanks$/);
  assert.throws(() => crmCommunicationUrl('email', { ...lead, email: 'a@test.com?bcc=other@test.com' }, '', ''));

  const crm = await import('../src/lib/crm');
  await assert.rejects(crm.updateCrmLead(staff, leadId, { assignedTo: owner.userId }), crm.CrmAccessError);
  await crm.updateCrmLead(staff, leadId, { status: 'qualified' });
  assert.equal(updateWasScoped, true, 'Employee updates must include ownership in the write predicate.');
  assert.equal('first_contacted_at' in lastUpdate, false, 'Moving a stage must not invent a conversation.');
  raceReassignment = true;
  await assert.rejects(crm.updateCrmLead(staff, leadId, { status: 'won' }), crm.CrmAccessError);
  raceReassignment = false;
  await crm.addCrmLeadActivity(staff, leadId, { activityType: 'call', body: 'No answer', contactStatus: 'attempted' });
  assert.equal((activities.at(-1)?.metadata as Record<string, unknown>).contactConfirmed, false);
  const launched = await crm.createCrmCommunication(staff, leadId, { channel: 'whatsapp', action: 'launch', body: 'Hello' });
  assert.equal(launched.status, 'launched');
  assert.equal(launched.activity.activityType, 'communication_launch');
  assert.equal(launched.activity.metadata.contactConfirmed, false);
  const draft = { channel: 'email', action: 'send', requestId, subject: 'Machine enquiry', body: 'Details follow.' };
  denyReservation = true;
  await assert.rejects(crm.createCrmCommunication(staff, leadId, draft), crm.CrmAccessError);
  assert.equal(sendCalls, 0, 'No SMTP request may happen when durable authorization/audit fails.');
  denyReservation = false;
  const sent = await crm.createCrmCommunication(staff, leadId, draft);
  assert.equal(sent.status, 'accepted');
  await crm.createCrmCommunication(staff, leadId, draft);
  assert.equal(sendCalls, 1, 'Retrying a reserved email must never submit SMTP twice.');
  reservation = null;
  failFinalize = true;
  const uncertain = await crm.createCrmCommunication(staff, leadId, draft);
  assert.equal(uncertain.status, 'uncertain');
  await crm.createCrmCommunication(staff, leadId, draft);
  assert.equal(sendCalls, 2, 'A failed outcome audit must leave the reservation blocking duplicate sends.');
  console.log('CRM security verification passed: scope, reassignment race, CSRF, contact accuracy, durable send idempotency. No network or email used.');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { loader._load = originalLoad; });
