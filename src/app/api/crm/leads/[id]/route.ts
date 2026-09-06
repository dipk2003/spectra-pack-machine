import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { updateCrmLead } from '@/lib/crm';
import {
  crmErrorResponse,
  crmHeaders,
  crmOriginResponse,
  crmUnauthorizedResponse,
  isTrustedCrmMutation,
  readCrmInput,
} from '@/lib/crm-http';
import { enforceMappedRateLimit } from '@/lib/rate-limit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  if (!isTrustedCrmMutation(req)) return crmOriginResponse();

  const rateLimit = await enforceMappedRateLimit(req, 'adminWrites');
  if (rateLimit.limitedResponse) return rateLimit.limitedResponse;

  try {
    const input = await readCrmInput(req);
    const lead = await updateCrmLead(viewer, params.id, input);
    return NextResponse.json({ lead }, { headers: crmHeaders(rateLimit.headers) });
  } catch (error) {
    return crmErrorResponse(error, rateLimit.headers);
  }
}
