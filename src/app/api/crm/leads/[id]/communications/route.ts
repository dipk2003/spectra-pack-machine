import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { createCrmCommunication } from '@/lib/crm';
import {
  crmErrorResponse,
  crmHeaders,
  crmOriginResponse,
  crmUnauthorizedResponse,
  isTrustedCrmMutation,
  readCrmInput,
} from '@/lib/crm-http';
import { enforceMappedRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  if (!isTrustedCrmMutation(req)) return crmOriginResponse();
  const rateLimit = await enforceMappedRateLimit(req, 'adminWrites');
  if (rateLimit.limitedResponse) return rateLimit.limitedResponse;
  // Outbound mail fails closed if the distributed quota is unavailable.
  try {
    const input = await readCrmInput(req);
    const communication = await createCrmCommunication(viewer, params.id, input);
    return NextResponse.json(communication, { headers: crmHeaders(rateLimit.headers) });
  } catch (error) {
    return crmErrorResponse(error, rateLimit.headers);
  }
}
