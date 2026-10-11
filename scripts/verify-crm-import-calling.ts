import assert from 'node:assert/strict';
import Module from 'node:module';
import { createHmac } from 'node:crypto';
import ExcelJS from 'exceljs';
import { importContactKeys, parseImportCsv, suggestImportField, validateImportLead, type ImportLead } from '../src/lib/crm-import';
import { classifyEmailFailure } from '../src/lib/email-failure';
import type { CrmViewer } from '../src/lib/crm-types';

const staff: CrmViewer = { userId: 'staff-test', email: 'staff@example.test', displayName: 'Staff', role: 'staff', canViewAllLeads: false, canManageTeam: false };
const leadId = '17c92484-d7ef-43a3-88f1-6e9bd168c11e';
const requestId = '3b03f67c-972b-4468-a751-1b241cd067f1';
const leads: Record<string, unknown>[] = [{ id: leadId, assigned_to: staff.userId, name: 'Existing', email: 'existing@example.test', phone: '+91 9876543210' }];
const calls: Record<string, unknown>[] = [];
let outboundCalls = 0;
let nextProviderStatus = 201;
let providerTimeout = false;
const seed = { name: 'New customer', phone: '9123456789', email: 'new@example.test', company: 'Example', machineInterest: 'Sealer', message: 'Requirement' } satisfies ImportLead;

class Query {
  filters: Array<[string, unknown]> = [];
  operation = 'select';
  payload: Record<string, unknown>[] = [];
  singular = false;
  offset = 0;
  end = 999;
  constructor(readonly table: string) {}
  select() { return this; }
  eq(key: string, value: unknown) { this.filters.push([key, value]); return this; }
  is(key: string, value: unknown) { return this.eq(key, value); }
  order() { return this; }
  range(start: number, end: number) { this.offset = start; this.end = end; return this; }
  insert(value: Record<string, unknown>) { this.operation = 'insert'; this.payload = [value]; return this; }
  upsert(value: Record<string, unknown>[]) { this.operation = 'upsert'; this.payload = value; return this; }
  update(value: Record<string, unknown>) { this.operation = 'update'; this.payload = [value]; return this; }
  maybeSingle() { this.singular = true; return this; }
  async execute() {
    const source = this.table === 'leads' ? leads : this.table === 'crm_call_requests' ? calls : [{ user_id: staff.userId, email: staff.email, display_name: 'Staff', role: 'staff', active: true }];
    let rows = source.filter(row => this.filters.every(([key, value]) => (row[key] ?? null) === value));
    if (this.operation === 'insert' || this.operation === 'upsert') {
      rows = [];
      for (const value of this.payload) {
        if (source.some(row => row.id === value.id)) {
          if (this.operation === 'insert') return { data: null, error: { code: '23505' } };
          continue;
        }
        const row = { ...value, created_at: new Date().toISOString(), call_uuid: null };
        source.push(row); rows.push(row);
      }
    }
    if (this.operation === 'update') rows.forEach(row => Object.assign(row, this.payload[0]));
    rows = rows.slice(this.offset, this.end + 1);
    return { data: this.singular ? rows[0] || null : rows, error: null };
  }
  then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) { return this.execute().then(resolve, reject); }
}
const db = {
  from: (table: string) => new Query(table),
  rpc: async (_name: string, input: Record<string, unknown>) => ({ data: { id: requestId, lead_id: leadId, activity_type: input.p_activity_type, body: input.p_body, metadata: input.p_metadata, created_at: new Date().toISOString() }, error: null }),
};
const loader = Module as unknown as { _load: (name: string, ...rest: unknown[]) => unknown };
const originalLoad = loader._load;
loader._load = function (name: string, ...rest: unknown[]) {
  if (name === 'server-only') return {};
  if (name === './supabase' || name === '@/lib/supabase') return { getSupabaseAdmin: () => db };
  return originalLoad.call(this, name, ...rest);
};
const originalFetch = global.fetch;
global.fetch = async (_url, init) => {
  outboundCalls++;
  const body = JSON.parse(String(init?.body));
  assert.equal(body.to, '+919111111111', 'Only the server-configured employee mobile may be called first.');
  assert.equal(body.answer_method, 'GET');
  assert.equal(body.time_limit, 1800);
  if (providerTimeout) throw new Error('network timeout');
  return new Response(JSON.stringify({ request_uuid: 'provider-request' }), { status: nextProviderStatus });
};

async function main() {
  assert.deepEqual(parseImportCsv('\uFEFFName,Notes\r\n"A, B","First\nsecond ""quoted"""\r\n'), [['Name', 'Notes'], ['A, B', 'First\nsecond "quoted"']]);
  assert.throws(() => parseImportCsv('Name\n"unfinished'));
  assert.equal(suggestImportField('Mobile Number'), 'phone');
  assert.equal(suggestImportField('Machine Interest'), 'machineInterest');
  assert.equal(validateImportLead(seed), '');
  assert.match(validateImportLead({ ...seed, email: 'a@b.com?bcc=bad' }), /Invalid email/);
  assert.match(validateImportLead({ ...seed, phone: '9.12E+09' }), /Invalid phone/);
  assert.deepEqual(importContactKeys({ phone: '9876543210' }), importContactKeys({ phone: '+91 98765 43210' }));
  assert.equal(classifyEmailFailure({ code: 'EAUTH', responseCode: 535 }).status, 'failed');
  assert.equal(classifyEmailFailure({ code: 'ETIMEDOUT', command: 'DATA' }).status, 'uncertain');
  assert.equal(classifyEmailFailure({ code: 'ECONNECTION', command: 'DATA' }).status, 'uncertain');
  assert.equal(classifyEmailFailure({ code: 'ETIMEDOUT', command: 'CONN' }).status, 'failed');
  assert.doesNotMatch(classifyEmailFailure({ code: 'EAUTH', response: 'secret password' }).notice, /secret password/);

  const workbook = new ExcelJS.Workbook(); workbook.addWorksheet('Leads').addRows([['Name', 'Phone'], ['Test', '9876543210']]);
  const loaded = new ExcelJS.Workbook(); await loaded.xlsx.load(await workbook.xlsx.writeBuffer());
  assert.equal(loaded.worksheets[0].getCell('B2').text, '9876543210');

  const crm = await import('../src/lib/crm');
  const calling = await import('../src/lib/plivo-calling');
  const initialCount = leads.length;
  await assert.rejects(crm.importCrmLeads(staff, { rows: [seed, { ...seed, name: '' }] }), /Row 3/);
  assert.equal(leads.length, initialCount, 'Validation must finish before writes.');
  await assert.rejects(crm.importCrmLeads(staff, { rows: Array(201).fill(seed) }), /200/);
  const result = await crm.importCrmLeads(staff, { assignedTo: 'attacker', rows: [seed, seed, { ...seed, email: 'existing@example.test' }] });
  assert.deepEqual(result, { imported: 1, skipped: 2 });
  assert.equal(leads.at(-1)?.assigned_to, staff.userId);
  assert.deepEqual(await crm.importCrmLeads(staff, { rows: [seed] }), { imported: 0, skipped: 1 });

  process.env.PLIVO_AUTH_ID = 'test-id'; process.env.PLIVO_AUTH_TOKEN = 'test-token';
  process.env.PLIVO_CALLER_ID = '+912233334444'; process.env.CRM_CALL_PUBLIC_URL = 'https://crm.example.test';
  process.env.CRM_CALL_AGENT_PHONES = JSON.stringify({ [staff.email]: '+919111111111' });
  assert.equal(calling.plivoConfiguration(staff.email).configured, true);
  assert.equal(calling.plivoConfiguration('another@example.test').configured, false);
  const callInput = { channel: 'call', action: 'send', requestId };
  const firstCall = await crm.createCrmCommunication(staff, leadId, callInput);
  assert.equal(firstCall.status, 'queued');
  assert.equal(firstCall.activity?.metadata.contactConfirmed, false);
  await crm.createCrmCommunication(staff, leadId, callInput);
  assert.equal(outboundCalls, 1, 'Retry must not create a second paid call.');
  nextProviderStatus = 401;
  assert.equal((await crm.createCrmCommunication(staff, leadId, { ...callInput, requestId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })).status, 'failed');
  providerTimeout = true;
  const uncertain = { ...callInput, requestId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' };
  assert.equal((await crm.createCrmCommunication(staff, leadId, uncertain)).status, 'uncertain');
  await crm.createCrmCommunication(staff, leadId, uncertain);
  assert.equal(outboundCalls, 3);

  const { GET } = await import('../src/app/api/webhooks/plivo/[id]/route');
  const { NextRequest } = await import('next/server');
  const uuid = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  const url = `https://crm.example.test/api/webhooks/plivo/${requestId}?To=%2B919111111111&RequestUUID=provider-request&CallUUID=${uuid}`;
  const nonce = 'test-nonce';
  const canonical = `https://crm.example.test/api/webhooks/plivo/${requestId}?CallUUID=${uuid}&RequestUUID=provider-request&To=+919111111111.${nonce}`;
  const signature = createHmac('sha256', 'test-token').update(canonical).digest('base64');
  const headers = new Headers({ 'x-plivo-signature-v3': signature, 'x-plivo-signature-v3-nonce': nonce });
  assert.equal(calling.verifyPlivoGet(url, headers, 'test-token'), true);
  assert.equal(calling.verifyPlivoGet(url.replace('919111111111', '919222222222'), headers, 'test-token'), false);
  assert.equal((await GET(new NextRequest(url), { params: { id: requestId } })).status, 403);
  const answer = await GET(new NextRequest(url, { headers }), { params: { id: requestId } });
  assert.equal(answer.status, 200);
  assert.match(await answer.text(), /<Number>\+919876543210<\/Number>/);
  calls[0].created_at = new Date(Date.now() - 11 * 60_000).toISOString();
  assert.equal((await GET(new NextRequest(url, { headers }), { params: { id: requestId } })).status, 403);
  console.log('CRM import/calling checks passed: CSV/XLSX, validation before writes, duplicates, staff assignment, SMTP classification, durable call retries, signed and expired webhooks. No real calls, emails or database writes.');
}
main().finally(() => { loader._load = originalLoad; global.fetch = originalFetch; }).catch(error => { console.error(error); process.exitCode = 1; });
