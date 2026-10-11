import { NextRequest, NextResponse } from 'next/server';
import { syncAdReports } from '@/lib/crm-integrations';
import { secureEqual } from '@/lib/provider-webhooks';
import { CRM_PRIVATE_HEADERS } from '@/lib/crm-http';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !secureEqual(req.headers.get('authorization') || '', `Bearer ${secret}`)) return new NextResponse('Unauthorized', { status: 401, headers: CRM_PRIVATE_HEADERS });
  try {
    const results = await syncAdReports();
    return NextResponse.json({ results }, { status: results.some(result => result.status === 'error') ? 502 : 200, headers: CRM_PRIVATE_HEADERS });
  } catch { return new NextResponse('Sync unavailable', { status: 503, headers: CRM_PRIVATE_HEADERS }); }
}
