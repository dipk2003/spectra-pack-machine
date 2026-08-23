import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { getDeveloperAccess } from '@/lib/developer-access';
import { getErrorCode } from '@/lib/errors';
import {
  configureDeveloperPin,
  createDeveloperUnlockToken,
  getDeveloperPinCookieName,
  getDeveloperPinCookieOptions,
  getDeveloperPinState,
  isValidDeveloperPin,
  verifyDeveloperPin,
} from '@/lib/developer-pin';
import { enforceMappedRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_BODY_BYTES = 2 * 1024;
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  Vary: 'Cookie',
};

const json = (
  payload: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {},
) => NextResponse.json(payload, { status, headers: { ...PRIVATE_HEADERS, ...headers } });

const hasSameOrigin = (req: NextRequest) => {
  if (req.headers.get('sec-fetch-site') === 'cross-site') return false;

  const origin = req.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).origin === req.nextUrl.origin;
  } catch {
    return false;
  }
};

const parseBody = async (req: NextRequest) => {
  if (!(req.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return null;
  }

  const contentLength = Number(req.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return null;

  const raw = await req.text();
  if (!raw || Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

const getOwnerContext = async () => {
  const session = await getServerSession(authOptions);
  const access = await getDeveloperAccess(session);
  return {
    access,
    userId: String(session?.user?.id || '').trim(),
  };
};

export async function POST(req: NextRequest) {
  const { access, userId } = await getOwnerContext();
  if (!access.allowed || !userId) {
    return json({ error: 'Developer owner access required.' }, 403);
  }

  if (!hasSameOrigin(req)) {
    return json({ error: 'Cross-site PIN requests are not accepted.' }, 403);
  }

  const rateLimit = await enforceMappedRateLimit(req, 'developerUnlock');
  if (rateLimit.limitedResponse) return rateLimit.limitedResponse;

  const body = await parseBody(req);
  const action = body?.action;
  const pin = body?.pin;
  if ((action !== 'setup' && action !== 'unlock') || !isValidDeveloperPin(pin)) {
    return json(
      { error: 'Enter a valid 6-digit PIN.' },
      400,
      rateLimit.headers,
    );
  }

  try {
    const state = await getDeveloperPinState();
    if (!state.available) {
      return json(
        { error: state.notice || 'Secure PIN storage is unavailable.' },
        503,
        rateLimit.headers,
      );
    }

    let pinHash = state.hash;
    if (action === 'setup') {
      if (state.configured) {
        return json(
          { error: 'Developer PIN is already configured. Unlock it instead.' },
          409,
          rateLimit.headers,
        );
      }
      pinHash = await configureDeveloperPin(pin);
    } else {
      if (!state.configured || !pinHash) {
        return json(
          { error: 'Create the Developer PIN before unlocking.' },
          409,
          rateLimit.headers,
        );
      }
      if (!(await verifyDeveloperPin(pin, pinHash))) {
        return json({ error: 'Incorrect PIN.' }, 401, rateLimit.headers);
      }
    }

    const response = json({ ok: true, unlocked: true }, 200, rateLimit.headers);
    response.cookies.set(
      getDeveloperPinCookieName(),
      createDeveloperUnlockToken(userId, pinHash),
      getDeveloperPinCookieOptions(),
    );
    return response;
  } catch (error) {
    if (getErrorCode(error) === '23505') {
      return json(
        { error: 'Developer PIN is already configured. Unlock it instead.' },
        409,
        rateLimit.headers,
      );
    }
    console.error('Developer PIN request failed:', error);
    return json(
      { error: 'Developer PIN could not be processed. Please retry.' },
      500,
      rateLimit.headers,
    );
  }
}

export async function DELETE() {
  const { access } = await getOwnerContext();
  if (!access.allowed) {
    return json({ error: 'Developer owner access required.' }, 403);
  }

  const response = json({ ok: true, unlocked: false });
  response.cookies.set(getDeveloperPinCookieName(), '', {
    ...getDeveloperPinCookieOptions(),
    maxAge: 0,
  });
  return response;
}
