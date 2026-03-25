const PLACEHOLDER_PATTERNS = ['YOUR_', 'change-this', 'ChangeThis', 'replace-with-your'];
const DEFAULT_SITE_ORIGIN = 'https://www.spectrapackmachines.com';

const hasPlaceholderValue = (value: string) =>
  !value || PLACEHOLDER_PATTERNS.some((pattern) => value.includes(pattern));

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isLocalOrigin = (value: string) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname);
  } catch {
    return true;
  }
};

export function getNextAuthSecret() {
  return process.env.NEXTAUTH_SECRET || '';
}

export function getNextAuthUrl() {
  return trimTrailingSlash(process.env.NEXTAUTH_URL || '');
}

export function getSiteOrigin() {
  const explicitOrigin = trimTrailingSlash(
    process.env.SITE_ORIGIN || process.env.APP_SITE_URL || '',
  );

  if (explicitOrigin && !hasPlaceholderValue(explicitOrigin)) {
    return explicitOrigin;
  }

  const nextAuthUrl = getNextAuthUrl();

  if (nextAuthUrl && !isLocalOrigin(nextAuthUrl) && !hasPlaceholderValue(nextAuthUrl)) {
    return nextAuthUrl;
  }

  return DEFAULT_SITE_ORIGIN;
}

export function assertSecureAuthConfig() {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    return;
  }

  const nextAuthSecret = getNextAuthSecret();
  if (hasPlaceholderValue(nextAuthSecret)) {
    throw new Error(
      'NEXTAUTH_SECRET must be set to a strong non-placeholder value in production.',
    );
  }

  const nextAuthUrl = getNextAuthUrl();
  if (!nextAuthUrl || isLocalOrigin(nextAuthUrl) || hasPlaceholderValue(nextAuthUrl)) {
    throw new Error(
      'NEXTAUTH_URL must be set to the real public site origin in production.',
    );
  }
}
