import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { CrmAccessError, CrmValidationError } from '@/lib/crm';
import { crmErrorResponse, crmHeaders, crmOriginResponse, crmUnauthorizedResponse, isTrustedCrmMutation, readCrmInput } from '@/lib/crm-http';
import { readIntegrationReport, syncAdReports } from '@/lib/crm-integrations';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isCrmUuid } from '@/lib/crm-policy';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import { reportRange } from '@/lib/integration-types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
function range(since?: string, until?: string) {
  try { return reportRange(since, until); }
  catch (error) { throw new CrmValidationError(error instanceof Error ? error.message : 'Invalid period.'); }
}
export async function GET(req: NextRequest) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  try {
    if (!viewer.canManageTeam) throw new CrmAccessError('Only owners can view advertising and the unmatched conversation inbox.');
    const dates = range(req.nextUrl.searchParams.get('since') || undefined, req.nextUrl.searchParams.get('until') || undefined);
    return NextResponse.json(await readIntegrationReport(dates.since, dates.until), { headers: crmHeaders() });
  } catch (error) { return crmErrorResponse(error); }
}
export async function POST(req: NextRequest) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  if (!isTrustedCrmMutation(req)) return crmOriginResponse();
  try {
    if (!viewer.canManageTeam) throw new CrmAccessError();
    const limit = await enforceMappedRateLimit(req, 'adminWrites');
    if (limit.limitedResponse) return limit.limitedResponse;
    const input = await readCrmInput(req);
    if (input.action === 'link') {
      if (!isCrmUuid(input.eventId) || !isCrmUuid(input.leadId)) throw new CrmValidationError('Choose a valid event and lead.');
      const { error } = await getSupabaseAdmin().rpc('crm_link_provider_event', { p_event_id: input.eventId, p_lead_id: input.leadId, p_actor_id: viewer.userId, p_actor_name: viewer.displayName });
      if (error) throw new CrmValidationError('Could not link this event. Check that it is unmatched and the lead exists.');
      return NextResponse.json({ linked: true }, { headers: crmHeaders() });
    }
    if (input.action !== 'sync') throw new CrmValidationError('Unknown action.');
    const dates = range(typeof input.since === 'string' ? input.since : undefined, typeof input.until === 'string' ? input.until : undefined);
    return NextResponse.json({ results: await syncAdReports(dates.since, dates.until) }, { headers: crmHeaders() });
  } catch (error) { return crmErrorResponse(error); }
}
