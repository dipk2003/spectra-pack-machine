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

const SECURE_SESSION_COOKIE_NAME = '__Secure-next-auth.session-token';
const SESSION_COOKIE_NAME = 'next-auth.session-token';

const hasSessionCookie = (req: NextRequest, baseName: string) =>
  req.cookies
    .getAll()
    .some(
      ({ name }) => name === baseName || name.startsWith(`${baseName}.`),
    );

const getSessionCookieConfig = (req: NextRequest) => {
  // Prefer the cookie NextAuth actually issued. The suffix check also supports
  // chunked cookies such as `__Secure-next-auth.session-token.0`.
  if (hasSessionCookie(req, SECURE_SESSION_COOKIE_NAME)) {
    return {
      secureCookie: true,
      cookieName: SECURE_SESSION_COOKIE_NAME,
    };
  }

  if (hasSessionCookie(req, SESSION_COOKIE_NAME)) {
    return {
      secureCookie: false,
      cookieName: SESSION_COOKIE_NAME,
    };
  }

  const forwardedProtocol = req.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase();
  const secureCookie =
    forwardedProtocol === 'https' || req.nextUrl.protocol.toLowerCase() === 'https:';

  return {
    secureCookie,
    cookieName: secureCookie
      ? SECURE_SESSION_COOKIE_NAME
      : SESSION_COOKIE_NAME,
  };
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);

  if (pathname.startsWith('/admin')) {
    requestHeaders.set('x-admin-route', '1');
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !isAdminLoginPath(pathname)) {
    assertSecureAuthConfig();

    // Decode the cookie NextAuth actually issued, then fall back to the request
    // protocol. Raw NEXTAUTH_URL may contain deployment/local fallback values
    // and previously made middleware select the wrong cookie name.
    const token = await getToken({
      req,
      secret: getNextAuthSecret(),
      ...getSessionCookieConfig(req),
    });
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
