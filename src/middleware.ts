import { NextRequest, NextResponse } from 'next/server';
import { isConfiguredEnvAdminId } from '@/lib/admin-identity';
import { getToken } from 'next-auth/jwt';
import { getAdminUserByUserId } from '@/lib/admin-users';
import { assertSecureAuthConfig, getNextAuthSecret } from '@/lib/runtime-config';

const addPrivateAdminHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  return response;
};

const isAdminLoginPath = (pathname: string) =>
  pathname === '/admin/login' || pathname === '/admin/login/';

const continueAdminRequest = (requestHeaders: Headers) =>
  addPrivateAdminHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
  );

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);

  if (pathname.startsWith('/admin')) {
    requestHeaders.set('x-admin-route', '1');
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !isAdminLoginPath(pathname)) {
    assertSecureAuthConfig();

    const token = await getToken({ req, secret: getNextAuthSecret() });
    if (!token?.id || typeof token.role !== 'string' || !token.role.trim()) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', `${pathname}${req.nextUrl.search}`);
      return addPrivateAdminHeaders(NextResponse.redirect(loginUrl));
    }

    if (isConfiguredEnvAdminId(token.id)) {
      return continueAdminRequest(requestHeaders);
    }

    try {
      const adminUser = await getAdminUserByUserId(token.id);

      if (!adminUser?.role) {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('reason', 'revoked');
        return addPrivateAdminHeaders(NextResponse.redirect(loginUrl));
      }
    } catch (error) {
      console.error('Failed to validate admin access in middleware:', error);
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('reason', 'auth-check-failed');
      return addPrivateAdminHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return continueAdminRequest(requestHeaders);
}

export const config = {
  matcher: ['/admin/:path*'],
};
