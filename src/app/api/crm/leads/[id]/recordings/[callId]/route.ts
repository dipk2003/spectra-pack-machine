import { NextRequest, NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-auth';
import { listCrmLeadActivities } from '@/lib/crm';
import { CRM_PRIVATE_HEADERS, crmErrorResponse, crmUnauthorizedResponse } from '@/lib/crm-http';
import { isCrmUuid } from '@/lib/crm-policy';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string; callId: string } }) {
  const viewer = await getAdminRequestContext(req);
  if (!viewer) return crmUnauthorizedResponse();
  if (!isCrmUuid(params.id) || !isCrmUuid(params.callId)) {
    return new NextResponse('Recording not found', { status: 404, headers: CRM_PRIVATE_HEADERS });
  }

  try {
    const activities = await listCrmLeadActivities(viewer, params.id);
    const linked = activities.some(activity => activity.activityType === 'call_recording'
      && activity.metadata.callRequestId === params.callId);
    if (!linked) return new NextResponse('Recording not found', { status: 404, headers: CRM_PRIVATE_HEADERS });

    const db = getSupabaseAdmin();
    const { data: call, error } = await db.from('crm_call_requests')
      .select('recording_url').eq('id', params.callId).eq('lead_id', params.id).maybeSingle();
    if (error || !call?.recording_url) return new NextResponse('Recording not found', { status: 404, headers: CRM_PRIVATE_HEADERS });

    let recordingUrl: URL;
    try { recordingUrl = new URL(call.recording_url); } catch {
      return new NextResponse('Recording not found', { status: 404, headers: CRM_PRIVATE_HEADERS });
    }
    if (recordingUrl.protocol !== 'https:' || recordingUrl.username || recordingUrl.password
      || !['media.plivo.com', 'api.plivo.com'].includes(recordingUrl.hostname.toLowerCase())) {
      return new NextResponse('Recording not found', { status: 404, headers: CRM_PRIVATE_HEADERS });
    }

    const authId = process.env.PLIVO_AUTH_ID?.trim() || '';
    const authToken = process.env.PLIVO_AUTH_TOKEN?.trim() || '';
    if (!authId || !authToken) return new NextResponse('Recording provider is not configured', { status: 503, headers: CRM_PRIVATE_HEADERS });
    const headers = new Headers();
    headers.set('Authorization', `Basic ${Buffer.from(`${authId}:${authToken}`).toString('base64')}`);
    const range = req.headers.get('range');
    if (range && /^bytes=\d*-\d*(,\d*-\d*)*$/.test(range)) headers.set('Range', range);
    const upstream = await fetch(recordingUrl, { headers, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20_000) });
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    if (!upstream.ok || !upstream.body || !(contentType.startsWith('audio/') || contentType === 'application/octet-stream')) {
      return new NextResponse('Recording is unavailable from the provider', { status: upstream.status === 404 ? 404 : 502, headers: CRM_PRIVATE_HEADERS });
    }
    const responseHeaders = new Headers(CRM_PRIVATE_HEADERS);
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
    for (const name of ['content-range', 'content-length']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
