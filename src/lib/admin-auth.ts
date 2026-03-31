import type { NextRequest } from 'next/server';
import { isConfiguredEnvAdminId } from './admin-identity';
import { getToken } from 'next-auth/jwt';
import { getAdminUserByUserId } from './admin-users';
import { assertSecureAuthConfig, getNextAuthSecret } from './runtime-config';

export async function isAdminRequest(req: NextRequest) {
  assertSecureAuthConfig();

  const token = await getToken({
    req,
    secret: getNextAuthSecret(),
  });

  if (!token?.id || typeof token.role !== 'string' || !token.role.trim()) {
    return false;
  }

  if (isConfiguredEnvAdminId(token.id)) {
    return true;
  }

  try {
    const adminUser = await getAdminUserByUserId(token.id);
    return Boolean(adminUser?.role);
  } catch (error) {
    console.error('Failed to validate admin session:', error);
    return false;
  }
}
