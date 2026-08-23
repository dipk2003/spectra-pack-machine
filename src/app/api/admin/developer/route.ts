import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { getDeveloperAccess } from '@/lib/developer-access';
import { getDeveloperPanelData } from '@/lib/developer-panel';
import { getDeveloperPinState, isDeveloperPinUnlocked } from '@/lib/developer-pin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  Vary: 'Cookie',
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const access = await getDeveloperAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Developer owner access required.' },
        { status: 403, headers: PRIVATE_HEADERS },
      );
    }

    const userId = String(session?.user?.id || '').trim();
    const pinState = await getDeveloperPinState();
    if (
      !userId ||
      !pinState.available ||
      !pinState.configured ||
      !(await isDeveloperPinUnlocked(userId, pinState))
    ) {
      return NextResponse.json(
        { error: 'Developer PIN unlock required.', code: 'DEVELOPER_PIN_REQUIRED' },
        { status: 423, headers: PRIVATE_HEADERS },
      );
    }

    const data = await getDeveloperPanelData(access);
    return NextResponse.json(data, { headers: PRIVATE_HEADERS });
  } catch (error) {
    console.error('Developer panel failed:', error);
    return NextResponse.json(
      { error: 'Developer diagnostics are temporarily unavailable.' },
      { status: 500, headers: PRIVATE_HEADERS },
    );
  }
}
