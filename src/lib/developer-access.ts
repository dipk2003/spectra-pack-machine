import 'server-only';

import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { getConfiguredEnvAdmin, isConfiguredEnvAdminId } from './admin-identity';
import { getAdminUserByUserId } from './admin-users';
import { assertSecureAuthConfig } from './runtime-config';

export type DeveloperAccessMode =
  | 'explicit-owner-id'
  | 'env-owner-name-fallback'
  | 'denied';

export type DeveloperAccessDecision = {
  allowed: boolean;
  mode: DeveloperAccessMode;
  identitySource: 'database' | 'environment' | null;
  explicitOwnerIdConfigured: boolean;
  fallbackWarning: string | null;
  reason:
    | 'allowed'
    | 'not-authenticated'
    | 'owner-role-required'
    | 'admin-access-revoked'
    | 'owner-id-mismatch'
    | 'fallback-not-eligible'
    | 'verification-failed';
};

const normalizeRole = (value: unknown) => String(value || '').trim().toLowerCase();

const normalizeDeveloperName = (value: unknown) =>
  String(value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const getDeveloperOwnerUserId = () =>
  String(process.env.DEVELOPER_OWNER_USER_ID || '').trim();

const getDeveloperAdminName = () =>
  normalizeDeveloperName(process.env.DEVELOPER_ADMIN_NAME || 'dipanshu');

const isEligibleEnvironmentNameFallback = (userId: string) => {
  const configuredEnvAdmin = getConfiguredEnvAdmin();
  if (
    !configuredEnvAdmin ||
    !isConfiguredEnvAdminId(userId) ||
    normalizeRole(configuredEnvAdmin.role) !== 'owner'
  ) {
    return false;
  }

  const expectedName = getDeveloperAdminName();
  const displayName = normalizeDeveloperName(configuredEnvAdmin.displayName);
  const emailLocalPart = normalizeDeveloperName(
    configuredEnvAdmin.email.split('@')[0] || '',
  );
  return Boolean(
    expectedName && (displayName === expectedName || emailLocalPart === expectedName),
  );
};

const denied = (
  reason: DeveloperAccessDecision['reason'],
  explicitOwnerIdConfigured: boolean,
): DeveloperAccessDecision => ({
  allowed: false,
  mode: 'denied',
  identitySource: null,
  explicitOwnerIdConfigured,
  fallbackWarning: null,
  reason,
});

/**
 * Computes navigation visibility without another database round trip. This does
 * not grant access: both the developer page and its API call getDeveloperAccess
 * again and verify the active database owner record before returning data.
 */
export function canShowDeveloperNavigation(session: Session | null) {
  const userId = String(session?.user?.id || '').trim();
  if (!userId || normalizeRole(session?.user?.role) !== 'owner') return false;

  const explicitOwnerId = getDeveloperOwnerUserId();
  if (explicitOwnerId) return userId === explicitOwnerId;

  return isEligibleEnvironmentNameFallback(userId);
}

/**
 * Developer access is deliberately narrower than ordinary admin access.
 *
 * Preferred mode: an active owner whose exact user id matches the server-only
 * DEVELOPER_OWNER_USER_ID value. If that value is absent, only the configured
 * environment owner can use the name fallback; database users never can.
 */
export async function getDeveloperAccess(
  prefetchedSession?: Session | null,
): Promise<DeveloperAccessDecision> {
  assertSecureAuthConfig();

  const explicitOwnerId = getDeveloperOwnerUserId();
  const explicitOwnerIdConfigured = Boolean(explicitOwnerId);
  const session =
    prefetchedSession === undefined
      ? await getServerSession(authOptions)
      : prefetchedSession;
  const userId = String(session?.user?.id || '').trim();

  if (!userId) {
    return denied('not-authenticated', explicitOwnerIdConfigured);
  }

  if (normalizeRole(session?.user?.role) !== 'owner') {
    return denied('owner-role-required', explicitOwnerIdConfigured);
  }

  try {
    const configuredEnvAdmin = getConfiguredEnvAdmin();
    const isEnvironmentOwner = Boolean(
      configuredEnvAdmin &&
        isConfiguredEnvAdminId(userId) &&
        normalizeRole(configuredEnvAdmin.role) === 'owner',
    );
    let identitySource: DeveloperAccessDecision['identitySource'] = null;

    if (isEnvironmentOwner) {
      identitySource = 'environment';
    } else {
      const adminUser = await getAdminUserByUserId(userId);
      if (!adminUser?.active) {
        return denied('admin-access-revoked', explicitOwnerIdConfigured);
      }
      if (normalizeRole(adminUser.role) !== 'owner') {
        return denied('owner-role-required', explicitOwnerIdConfigured);
      }
      identitySource = 'database';
    }

    if (explicitOwnerIdConfigured) {
      if (userId !== explicitOwnerId) {
        return denied('owner-id-mismatch', true);
      }

      return {
        allowed: true,
        mode: 'explicit-owner-id',
        identitySource,
        explicitOwnerIdConfigured: true,
        fallbackWarning: null,
        reason: 'allowed',
      };
    }

    if (!isEnvironmentOwner || !configuredEnvAdmin) {
      return denied('fallback-not-eligible', false);
    }

    if (!isEligibleEnvironmentNameFallback(userId)) {
      return denied('fallback-not-eligible', false);
    }

    return {
      allowed: true,
      mode: 'env-owner-name-fallback',
      identitySource: 'environment',
      explicitOwnerIdConfigured: false,
      fallbackWarning:
        'DEVELOPER_OWNER_USER_ID is not configured. Developer access is using the restricted environment-owner name fallback. Configure the exact owner user id to disable this fallback.',
      reason: 'allowed',
    };
  } catch (error) {
    console.error('Failed to verify developer access:', error);
    return denied('verification-failed', explicitOwnerIdConfigured);
  }
}
