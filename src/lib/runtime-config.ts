const PLACEHOLDER_PATTERNS = ['YOUR_', 'change-this', 'ChangeThis', 'replace-with-your'];
const DEFAULT_SITE_ORIGIN = 'https://www.spectrapackmachines.com';

const hasPlaceholderValue = (value: string) =>
  !value || PLACEHOLDER_PATTERNS.some((pattern) => value.includes(pattern));

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const splitOriginCandidates = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeOrigin = (value: string) => {
  const trimmed = trimTrailingSlash(value.trim());
  if (!trimmed || hasPlaceholderValue(trimmed)) {
    return '';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+(?::\d+)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return '';
};

const normalizeOriginCandidates = (value: string) =>
  splitOriginCandidates(value)
    .map(normalizeOrigin)
    .filter(Boolean);

const selectOriginCandidate = (
  value: string,
  options?: { preferNonLocal?: boolean },
) => {
  const normalizedCandidates = normalizeOriginCandidates(value);
  if (!normalizedCandidates.length) {
    return '';
  }

  if (options?.preferNonLocal) {
    const nonLocalCandidate = normalizedCandidates.find((candidate) => !isLocalOrigin(candidate));
    if (nonLocalCandidate) {
      return nonLocalCandidate;
    }
  }

  return normalizedCandidates[0];
};

const getConfiguredSiteOrigin = () =>
  selectOriginCandidate(process.env.SITE_ORIGIN || process.env.APP_SITE_URL || '', {
    preferNonLocal: true,
  });

const getVercelOrigin = () =>
  selectOriginCandidate(
    process.env.VERCEL_BRANCH_URL ||
      process.env.VERCEL_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      '',
    { preferNonLocal: true },
  );

const isLocalOrigin = (value: string) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname);
  } catch {
    return true;
  }
};

type RuntimeRequestLike = {
  headers?: Headers;
  nextUrl?: {
    origin?: string;
  };
};

const getRequestOrigin = (req?: RuntimeRequestLike) => {
  const nextUrlOrigin = normalizeOrigin(req?.nextUrl?.origin || '');
  if (nextUrlOrigin) {
    return nextUrlOrigin;
  }

  const hostHeader =
    req?.headers?.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    req?.headers?.get('host')?.trim() ||
    '';

  if (!hostHeader) {
    return '';
  }

  const forwardedProto = req?.headers?.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol =
    forwardedProto ||
    (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(hostHeader) ? 'http' : 'https');

  return normalizeOrigin(`${protocol}://${hostHeader}`);
};

export function getNextAuthSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || '';
}

export function getNextAuthUrl() {
  const explicitAuthOrigin = selectOriginCandidate(
    process.env.AUTH_URL || process.env.NEXTAUTH_URL || '',
    {
      preferNonLocal:
        process.env.NODE_ENV === 'production' ||
        process.env.NEXT_PHASE === 'phase-production-build',
    },
  );
  const vercelOrigin = getVercelOrigin();
  const siteOrigin = getConfiguredSiteOrigin();

  if (explicitAuthOrigin && !isLocalOrigin(explicitAuthOrigin)) {
    return explicitAuthOrigin;
  }

  if (vercelOrigin && !isLocalOrigin(vercelOrigin)) {
    return vercelOrigin;
  }

  if (siteOrigin && !isLocalOrigin(siteOrigin)) {
    return siteOrigin;
  }

  return explicitAuthOrigin || vercelOrigin || siteOrigin;
}

export function sanitizeRuntimeEnvOrigins() {
  const preferNonLocal =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PHASE === 'phase-production-build';
  const sanitizedSiteOrigin = selectOriginCandidate(
    process.env.SITE_ORIGIN || process.env.APP_SITE_URL || '',
    { preferNonLocal: true },
  );
  const sanitizedAuthOrigin = selectOriginCandidate(
    process.env.AUTH_URL || process.env.NEXTAUTH_URL || '',
    { preferNonLocal },
  );
  const fallbackAuthOrigin =
    sanitizedAuthOrigin && (!preferNonLocal || !isLocalOrigin(sanitizedAuthOrigin))
      ? sanitizedAuthOrigin
      : sanitizedSiteOrigin || getVercelOrigin() || sanitizedAuthOrigin;

  if (sanitizedSiteOrigin) {
    process.env.SITE_ORIGIN = sanitizedSiteOrigin;
    if (!process.env.APP_SITE_URL || hasPlaceholderValue(process.env.APP_SITE_URL)) {
      process.env.APP_SITE_URL = sanitizedSiteOrigin;
    }
  }

  if (fallbackAuthOrigin) {
    process.env.NEXTAUTH_URL = fallbackAuthOrigin;
    process.env.AUTH_URL = fallbackAuthOrigin;
  }
}

export function hydrateAuthRuntimeEnv(req?: RuntimeRequestLike) {
  const requestOrigin = getRequestOrigin(req);
  const configuredAuthOrigin = normalizeOrigin(
    process.env.AUTH_URL || process.env.NEXTAUTH_URL || '',
  );
  const resolvedAuthUrl =
    requestOrigin &&
    (!configuredAuthOrigin ||
      hasPlaceholderValue(configuredAuthOrigin) ||
      isLocalOrigin(configuredAuthOrigin))
      ? requestOrigin
      : getNextAuthUrl();

  if (
    resolvedAuthUrl &&
    (!process.env.NEXTAUTH_URL ||
      hasPlaceholderValue(process.env.NEXTAUTH_URL) ||
      isLocalOrigin(process.env.NEXTAUTH_URL))
  ) {
    process.env.NEXTAUTH_URL = resolvedAuthUrl;
  }

  if (
    resolvedAuthUrl &&
    (!process.env.AUTH_URL ||
      hasPlaceholderValue(process.env.AUTH_URL) ||
      isLocalOrigin(process.env.AUTH_URL))
  ) {
    process.env.AUTH_URL = resolvedAuthUrl;
  }
}

export function getSiteOrigin() {
  const explicitOrigin = getConfiguredSiteOrigin();

  if (explicitOrigin && !hasPlaceholderValue(explicitOrigin)) {
    return explicitOrigin;
  }

  const nextAuthUrl = getNextAuthUrl();

  if (nextAuthUrl && !isLocalOrigin(nextAuthUrl) && !hasPlaceholderValue(nextAuthUrl)) {
    return nextAuthUrl;
  }

  const vercelOrigin = getVercelOrigin();
  if (vercelOrigin && !isLocalOrigin(vercelOrigin) && !hasPlaceholderValue(vercelOrigin)) {
    return vercelOrigin;
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
      'NEXTAUTH_SECRET or AUTH_SECRET must be set to a strong non-placeholder value in production.',
    );
  }

  const nextAuthUrl = getNextAuthUrl();
  if (!nextAuthUrl || isLocalOrigin(nextAuthUrl) || hasPlaceholderValue(nextAuthUrl)) {
    throw new Error(
      'Set NEXTAUTH_URL/AUTH_URL to the real public origin or provide SITE_ORIGIN/VERCEL_URL in production.',
    );
  }
}
