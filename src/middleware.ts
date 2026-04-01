import { NextRequest, NextResponse } from 'next/server';
import { isConfiguredEnvAdminId } from '@/lib/admin-identity';
import { getToken } from 'next-auth/jwt';
import { getAdminUserByUserId } from '@/lib/admin-users';
import { assertSecureAuthConfig, getNextAuthSecret } from '@/lib/runtime-config';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);

  if (pathname.startsWith('/admin')) {
    requestHeaders.set('x-admin-route', '1');
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    assertSecureAuthConfig();

    const token = await getToken({ req, secret: getNextAuthSecret() });
    if (!token?.id || typeof token.role !== 'string' || !token.role.trim()) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (isConfiguredEnvAdminId(token.id)) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    try {
      const adminUser = await getAdminUserByUserId(token.id);

      if (!adminUser?.role) {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('reason', 'revoked');
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Failed to validate admin access in middleware:', error);
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('reason', 'auth-check-failed');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
