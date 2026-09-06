import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { addCrmLeadActivity, listCrmLeadActivities } from '@/lib/crm';
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();

  try {
    const activities = await listCrmLeadActivities(viewer, params.id);
    return NextResponse.json({ activities }, { headers: CRM_PRIVATE_HEADERS });
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function POST(
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
    const activity = await addCrmLeadActivity(viewer, params.id, input);
    return NextResponse.json(
      { activity },
      { status: 201, headers: crmHeaders(rateLimit.headers) },
    );
  } catch (error) {
    return crmErrorResponse(error, rateLimit.headers);
  }
}
