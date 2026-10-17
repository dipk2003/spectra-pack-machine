import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { plivoConfiguration, verifyPlivoGet } from '@/lib/plivo-calling';
import { isCrmUuid } from '@/lib/crm-policy';
import { CRM_PRIVATE_HEADERS } from '@/lib/crm-http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const unavailable = () => new NextResponse('Recording callback unavailable', { status: 404, headers: CRM_PRIVATE_HEADERS });
  const config = plivoConfiguration('');
  if (process.env.CRM_CALL_RECORDING_ENABLED !== 'true' || !config.origin || !isCrmUuid(params.id)) return unavailable();

  const publicUrl = `${config.origin}${req.nextUrl.pathname}${req.nextUrl.search}`;
  if (!verifyPlivoGet(publicUrl, req.headers, config.authToken)) {
    return new NextResponse('Signature rejected', { status: 403, headers: CRM_PRIVATE_HEADERS });
  }

  const recordingUrl = req.nextUrl.searchParams.get('RecordUrl') || '';
  const recordingId = req.nextUrl.searchParams.get('RecordingID') || '';
  const duration = Number(req.nextUrl.searchParams.get('RecordingDuration'));
  let parsedUrl: URL;
  try { parsedUrl = new URL(recordingUrl); } catch { return unavailable(); }
  if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password || recordingUrl.length > 2048
    || !recordingId || recordingId.length > 200 || !Number.isInteger(duration) || duration < 0 || duration > 10800) {
    return unavailable();
  }

  const db = getSupabaseAdmin();
  const { data: call, error: callError } = await db.from('crm_call_requests')
    .select('id, lead_id, actor_id, call_uuid, created_at, recording_received_at')
    .eq('id', params.id).maybeSingle();
  const callbackCallUuid = req.nextUrl.searchParams.get('CallUUID');
  if (callError || !call || Date.now() - Date.parse(call.created_at) > 24 * 60 * 60_000
    || (callbackCallUuid && call.call_uuid !== callbackCallUuid)) return unavailable();

  const { error: saveError } = await db.rpc('crm_save_call_recording', {
    p_call_id: params.id,
    p_recording_url: recordingUrl,
    p_recording_id: recordingId,
    p_duration_seconds: duration,
  });
  if (saveError) return new NextResponse('Storage unavailable; retry delivery', { status: 503, headers: CRM_PRIVATE_HEADERS });

  return new NextResponse(null, { status: 204, headers: CRM_PRIVATE_HEADERS });
}
