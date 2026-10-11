// Isolated PostgreSQL engine: npm install --prefix .tmp/integration-sql @electric-sql/pglite
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '../.tmp/integration-sql/node_modules/@electric-sql/pglite/dist/index.js';
const db = new PGlite();
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create table public.leads (id uuid primary key, phone text);
    create table public.lead_activities (id uuid default gen_random_uuid(), lead_id uuid, activity_type text, body text, outcome text, actor_id text, actor_name text, metadata jsonb, created_at timestamptz default now());
    create function public.crm_assert_actor_access(actor text, owner_access boolean) returns void language plpgsql as $$ begin if actor <> 'test-owner' then raise exception 'Access denied'; end if; end $$;
  `);
  const migration = await readFile(new URL('../supabase/migrations/20260926_crm_integrations.sql', import.meta.url), 'utf8');
  await db.exec(migration);
  await db.exec(migration); // repeatable migration
  const lead = '11111111-1111-4111-8111-111111111111';
  await db.query('insert into leads values ($1,$2)', [lead, '+91 9876543210']);
  const event = { provider: 'whatsapp', event_key: 'message:123', external_id: '123', phone: '919876543210', direction: 'inbound', kind: 'message', status: 'received', body: 'Test only', occurred_at: '2026-09-26T01:00:00Z', metadata: {} };
  await db.query('select crm_ingest_provider_event($1::jsonb)', [JSON.stringify(event)]);
  await db.query('select crm_ingest_provider_event($1::jsonb)', [JSON.stringify(event)]);
  assert.equal((await db.query('select * from crm_provider_events')).rows.length, 1);
  assert.equal((await db.query('select * from lead_activities')).rows.length, 1);
  assert.equal((await db.query('select lead_id from crm_provider_events')).rows[0].lead_id, lead);
  await db.query('insert into leads values ($1,$2)', ['22222222-2222-4222-8222-222222222222', '919876543210']);
  await db.query('select crm_ingest_provider_event($1::jsonb)', [JSON.stringify({ ...event, event_key: 'message:456', external_id: '456' })]);
  const unmatched = (await db.query("select * from crm_provider_events where event_key='message:456'")).rows[0];
  assert.equal(unmatched.lead_id, null, 'Ambiguous phone match stays unassigned');
  await assert.rejects(() => db.query('select crm_link_provider_event($1,$2,$3,$4)', [unmatched.id, lead, 'staff', 'Staff']));
  await db.query('select crm_link_provider_event($1,$2,$3,$4)', [unmatched.id, lead, 'test-owner', 'Owner']);
  await db.query('select crm_link_provider_event($1,$2,$3,$4)', [unmatched.id, lead, 'test-owner', 'Owner']);
  assert.equal((await db.query('select * from lead_activities')).rows.length, 2);
  const row = { provider: 'google', account_id: '123', campaign_id: '456', campaign_name: 'Test', day: '2026-09-01', currency: 'INR', impressions: 100, clicks: 4, spend: 10, conversions: 1, conversion_value: 0 };
  const replace = rows => db.query('select crm_replace_ad_report($1,$2,$3,$4,$5::jsonb)', ['google', '123', '2026-09-01', '2026-09-02', JSON.stringify(rows)]);
  await replace([row]); await replace([{ ...row, spend: 15 }]);
  assert.equal((await db.query('select spend from crm_ad_daily')).rows[0].spend, '15');
  await assert.rejects(() => replace([{ ...row, account_id: 'wrong' }]));
  assert.equal((await db.query('select spend from crm_ad_daily')).rows[0].spend, '15', 'Invalid report cannot erase previous data');
  await replace([]);
  assert.equal((await db.query('select * from crm_ad_daily')).rows.length, 0, 'Successful empty response clears stale slice');
  await db.exec('set role anon');
  await assert.rejects(() => db.query('select * from crm_provider_events'));
  await assert.rejects(() => db.query('select crm_ingest_provider_event($1::jsonb)', [JSON.stringify(event)]));
  await db.exec('reset role');
  console.log('PostgreSQL integration migration passed: replay, deduplication, matching, owner linking, atomic replacement, rollback and anonymous access denial. Production database was not touched.');
} finally { await db.close(); }
