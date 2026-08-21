import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getAdminDashboardData } from '@/lib/admin-dashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  Vary: 'Cookie',
};

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: PRIVATE_HEADERS },
      );
    }

    const dashboard = await getAdminDashboardData();
    return NextResponse.json(dashboard, { headers: PRIVATE_HEADERS });
  } catch (error) {
    console.error('Admin dashboard summary failed:', error);
    return NextResponse.json(
      { error: 'Dashboard summary is temporarily unavailable.' },
      { status: 500, headers: PRIVATE_HEADERS },
    );
  }
}
