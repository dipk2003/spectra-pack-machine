import '@/lib/init-auth-env';
import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  assertSecureAuthConfig,
  hydrateAuthRuntimeEnv,
} from '@/lib/runtime-config';
import { authOptions } from '@/lib/auth-options';

const createAuthHandler = () => NextAuth(authOptions);

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
    return rateLimit.limitedResponse;
  }

  const response = await createAuthHandler()(req, context);
  Object.entries(rateLimit.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
