import assert from 'node:assert/strict';
import Module from 'node:module';
import { NextRequest } from 'next/server';
import type { CrmViewer } from '../src/lib/crm-types';

async function main() {
  let viewer: CrmViewer | null = null;
  let reads = 0, syncs = 0;
  const loader = Module as unknown as { _load: (id: string, ...args: unknown[]) => unknown };
  const original = loader._load;
  loader._load = function (id, ...args) {
    if (id === 'server-only') return {};
    if (id.endsWith('/admin-auth')) return { getAdminRequestContext: async () => viewer };
    if (id.endsWith('/crm-integrations')) return {
      readIntegrationReport: async () => { reads++; return { metrics: [] }; },
      syncAdReports: async () => { syncs++; return []; },
      ingestProviderEvents: async () => { throw new Error('Must not persist unsigned webhooks'); },
    };
    if (id.endsWith('/rate-limit')) return { enforceMappedRateLimit: async () => ({ limitedResponse: null }) };
    return original.call(this, id, ...args);
  };
  const route = await import('../src/app/api/crm/integrations/route');
  const request = () => new NextRequest('https://spectrapackmachines.com/api/crm/integrations');
  assert.equal((await route.GET(request())).status, 401);
  viewer = { userId: 'test', role: 'staff', displayName: 'Staff', email: '', canManageTeam: false, canViewAllLeads: false };
  assert.equal((await route.GET(request())).status, 403);
  assert.equal(reads, 0, 'Unauthenticated and staff requests cannot query owner reports');
  viewer = { ...viewer, role: 'owner', canManageTeam: true, canViewAllLeads: true };
  const allowed = await route.GET(request());
  assert.equal(allowed.status, 200);
  assert.match(allowed.headers.get('cache-control') || '', /no-store/);
  assert.equal((await route.GET(new NextRequest('https://spectrapackmachines.com/api/crm/integrations?since=invalid'))).status, 400);
  assert.equal((await route.POST(new NextRequest(request(), { method: 'POST', headers: { origin: 'https://attacker.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sync' }) }))).status, 403);
  assert.equal(syncs, 0);
  const cron = await import('../src/app/api/cron/ads-sync/route');
  process.env.CRON_SECRET = '';
  assert.equal((await cron.GET(request())).status, 401);
  process.env.CRON_SECRET = 'test-secret';
  assert.equal((await cron.GET(request())).status, 401);
  const whatsapp = await import('../src/app/api/webhooks/whatsapp/route');
  process.env.WHATSAPP_APP_SECRET = 'secret'; process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
  assert.equal((await whatsapp.POST(new NextRequest(request(), { method: 'POST', body: '{}' }))).status, 403);
  loader._load = original;
  console.log('Integration access checks passed: anonymous/staff isolation, no-store, invalid dates, cross-origin mutations, cron authentication and unsigned webhook rejection.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
