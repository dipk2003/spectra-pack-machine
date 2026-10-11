import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { indiaPhone, plivoConfiguration, verifyPlivoGet } from '@/lib/plivo-calling';
import { isCrmUuid } from '@/lib/crm-policy';

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const config = plivoConfiguration('');
  const deny = () => new NextResponse('<Response><Hangup/></Response>', { status: 403, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'no-store' } });
  if (!isCrmUuid(params.id) || !config.origin) return deny();
  // Use the configured public origin, never an untrusted forwarded host.
  const publicUrl = `${config.origin}${req.nextUrl.pathname}${req.nextUrl.search}`;
  if (!verifyPlivoGet(publicUrl, req.headers, config.authToken)) return deny();
  const db = getSupabaseAdmin();
  const { data: call, error } = await db.from('crm_call_requests').select('*').eq('id', params.id).maybeSingle();
  const uuid = req.nextUrl.searchParams.get('CallUUID') || '';
  if (error || !call || !isCrmUuid(uuid) || call.status === 'failed' || Date.now() - Date.parse(call.created_at) > 10 * 60_000
    || indiaPhone(req.nextUrl.searchParams.get('To')) !== call.agent_phone
    || (call.provider_id && req.nextUrl.searchParams.get('RequestUUID') !== call.provider_id)
    || (call.call_uuid && call.call_uuid !== uuid)) return deny();
  if (!call.call_uuid) {
    const { data: bound, error: bindError } = await db.from('crm_call_requests').update({ call_uuid: uuid }).eq('id', call.id).is('call_uuid', null).select('call_uuid').maybeSingle();
    if (bindError) return deny();
    if (!bound) {
      const { data: existing } = await db.from('crm_call_requests').select('call_uuid').eq('id', call.id).maybeSingle();
      if (existing?.call_uuid !== uuid) return deny();
    }
  }
  const customer = indiaPhone(call.customer_phone);
  const caller = indiaPhone(call.caller_id);
  if (!customer || !caller) return deny();
  return new NextResponse(`<Response><Speak>Connecting you to the customer.</Speak><Dial callerId="${caller}" timeout="30" timeLimit="1800"><Number>${customer}</Number></Dial></Response>`, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'no-store' } });
}
