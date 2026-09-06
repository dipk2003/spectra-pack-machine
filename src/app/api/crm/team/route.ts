import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { createCrmTeamMember } from '@/lib/crm';
import {
  crmErrorResponse,
  crmHeaders,
  crmOriginResponse,
  crmUnauthorizedResponse,
  isTrustedCrmMutation,
  readCrmInput,
} from '@/lib/crm-http';
import { enforceMappedRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  if (!isTrustedCrmMutation(req)) return crmOriginResponse();

  const rateLimit = await enforceMappedRateLimit(req, 'adminWrites');
  if (rateLimit.limitedResponse) return rateLimit.limitedResponse;

  try {
    const input = await readCrmInput(req);
    const member = await createCrmTeamMember(viewer, input);
    return NextResponse.json(
      { member },
      { status: 201, headers: crmHeaders(rateLimit.headers) },
    );
  } catch (error) {
    return crmErrorResponse(error, rateLimit.headers);
  }
}
