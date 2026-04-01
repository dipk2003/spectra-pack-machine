import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { isConfiguredEnvAdminId } from './admin-identity';
import { getAdminUserByUserId } from './admin-users';
import { assertSecureAuthConfig } from './runtime-config';
import { authOptions } from './auth-options';

export async function isAdminRequest(req: NextRequest) {
  assertSecureAuthConfig();

  void req;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId || typeof role !== 'string' || !role.trim()) {
    return false;
  }

  if (isConfiguredEnvAdminId(userId)) {
    return true;
  }

  try {
    const adminUser = await getAdminUserByUserId(userId);
    return Boolean(adminUser?.role);
  } catch (error) {
    console.error('Failed to validate admin session:', error);
    return false;
  }
}
