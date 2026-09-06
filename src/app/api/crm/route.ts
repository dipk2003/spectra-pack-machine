import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { createManualCrmLead, getCrmWorkspace } from '@/lib/crm';
import {
  CRM_PRIVATE_HEADERS,
  crmErrorResponse,
  crmHeaders,
  crmOriginResponse,
  crmUnauthorizedResponse,
  isTrustedCrmMutation,
  readCrmInput,
} from '@/lib/crm-http';
import { enforceMappedRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();

  try {
    const workspace = await getCrmWorkspace(viewer, Number(req.nextUrl.searchParams.get('offset') || '0'));
    return NextResponse.json(workspace, { headers: CRM_PRIVATE_HEADERS });
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  if (!isTrustedCrmMutation(req)) return crmOriginResponse();

  const rateLimit = await enforceMappedRateLimit(req, 'adminWrites');
  if (rateLimit.limitedResponse) return rateLimit.limitedResponse;

  try {
    const input = await readCrmInput(req);
    const lead = await createManualCrmLead(viewer, input);
    return NextResponse.json(
      { lead },
      { status: 201, headers: crmHeaders(rateLimit.headers) },
    );
  } catch (error) {
    return crmErrorResponse(error, rateLimit.headers);
  }
}
