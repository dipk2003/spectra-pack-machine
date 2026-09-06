import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getConfiguredEnvAdmin, isConfiguredEnvAdminId } from './admin-identity';
import { getAdminUserByUserId } from './admin-users';
import { isCrmAccessRole, isCrmOwnerRole, type CrmViewer } from './crm-types';
import { assertSecureAuthConfig } from './runtime-config';
import { authOptions } from './auth-options';

export async function getAdminRequestContext(
  req?: NextRequest,
): Promise<CrmViewer | null> {
  assertSecureAuthConfig();

  void req;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId || typeof role !== 'string' || !role.trim()) {
    return null;
  }

  if (isConfiguredEnvAdminId(userId)) {
    const configuredAdmin = getConfiguredEnvAdmin();
    if (!configuredAdmin) return null;

    return {
      userId: configuredAdmin.id,
      email: configuredAdmin.email,
      displayName: configuredAdmin.displayName,
      role: configuredAdmin.role,
      canViewAllLeads: true,
      canManageTeam: true,
    };
  }

  try {
    const adminUser = await getAdminUserByUserId(userId);
    if (!adminUser?.role || !adminUser.active || !isCrmAccessRole(adminUser.role)) {
      return null;
    }

    const ownerAccess = isCrmOwnerRole(adminUser.role);
    return {
      userId: adminUser.userId,
      email: adminUser.email || session.user?.email || '',
      displayName:
        adminUser.displayName || session.user?.name || adminUser.email || 'Team member',
      role: adminUser.role,
      canViewAllLeads: ownerAccess,
      canManageTeam: ownerAccess,
    };
  } catch (error) {
    console.error('Failed to validate admin session:', error);
    return null;
  }
}

/**
 * Existing CMS/admin endpoints are owner-only. Sales staff use the scoped CRM
 * endpoints, which call getAdminRequestContext and enforce lead ownership.
 */
export async function isAdminRequest(req: NextRequest) {
  const context = await getAdminRequestContext(req);
  return Boolean(context?.canManageTeam);
}
