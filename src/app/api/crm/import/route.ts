import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { importCrmLeads } from '@/lib/crm';
import { crmErrorResponse, crmHeaders, crmOriginResponse, crmUnauthorizedResponse, isTrustedCrmMutation, readCrmInput } from '@/lib/crm-http';
import { enforceMappedRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  if (!isTrustedCrmMutation(req)) return crmOriginResponse();
  const rateLimit = await enforceMappedRateLimit(req, 'adminWrites');
  if (rateLimit.limitedResponse) return rateLimit.limitedResponse;
  try {
    const result = await importCrmLeads(viewer, await readCrmInput(req, 750_000));
    return NextResponse.json(result, { headers: crmHeaders(rateLimit.headers) });
  } catch (error) { return crmErrorResponse(error, rateLimit.headers); }
}
