import '@/lib/init-auth-env';
import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { enforceMappedRateLimit, type RateLimitResult } from '@/lib/rate-limit';
import {
  assertSecureAuthConfig,
  getSiteOrigin,
  hydrateAuthRuntimeEnv,
} from '@/lib/runtime-config';
import { authOptions } from '@/lib/auth-options';

const createAuthHandler = () => NextAuth(authOptions);

const buildNextAuthRateLimitResponse = (rateLimit: RateLimitResult) => {
  const retryAfter = Math.max(
    1,
    rateLimit.failure?.retryAfterSeconds ||
      Number.parseInt(rateLimit.headers['Retry-After'] || '60', 10) ||
      60,
  );
  const temporarilyUnavailable =
    rateLimit.failure?.code === 'RATE_LIMIT_UNAVAILABLE';
  const errorUrl = new URL('/admin/login', getSiteOrigin());
  errorUrl.searchParams.set(
    'error',
    `${temporarilyUnavailable ? 'AuthUnavailable' : 'RateLimited'}:${retryAfter}`,
  );
  errorUrl.searchParams.set('callbackUrl', '/admin');

  return NextResponse.json(
    { url: errorUrl.toString() },
    {
      status: rateLimit.failure?.status || 429,
      headers: {
        ...rateLimit.headers,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },
  );
};

export async function GET(
  req: NextRequest,
  context: { params: { nextauth: string[] } },
) {
  hydrateAuthRuntimeEnv(req);
  assertSecureAuthConfig();
  return createAuthHandler()(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: { nextauth: string[] } },
) {
  hydrateAuthRuntimeEnv(req);
  assertSecureAuthConfig();

  const rateLimit = await enforceMappedRateLimit(req);
  if (rateLimit.limitedResponse) {
    // next-auth/react expects a JSON `url` and parses its `error` query value.
    // Returning the generic API error object here makes signIn() throw instead.
    return buildNextAuthRateLimitResponse(rateLimit);
  }

  const response = await createAuthHandler()(req, context);
  Object.entries(rateLimit.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
