import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

type RateLimitPreset = {
  key: string;
  limit: number;
  windowMs: number;
  message: string;
};

type RateLimitPresetName = keyof typeof RATE_LIMIT_PRESETS;

type LocalRateLimitEntry = {
  count: number;
  resetAt: number;
};

type DistributedRateLimitRow = {
  allowed?: boolean;
  current_count?: number | string;
  remaining?: number | string;
  reset_at?: string;
};

type RateLimitHeaders = Record<string, string>;

type RateLimitResult = {
  limitedResponse: NextResponse | null;
  headers: RateLimitHeaders;
};

type RateLimitRouteRule = {
  methods: readonly string[];
  pathname: RegExp;
  presetName: RateLimitPresetName;
};

declare global {
  // eslint-disable-next-line no-var
  var __spectraLocalRateLimitStore: Map<string, LocalRateLimitEntry> | undefined;
  // eslint-disable-next-line no-var
  var __spectraRateLimitWarnings: Set<string> | undefined;
}

const localRateLimitStore =
  globalThis.__spectraLocalRateLimitStore ?? new Map<string, LocalRateLimitEntry>();
const warningStore = globalThis.__spectraRateLimitWarnings ?? new Set<string>();

if (!globalThis.__spectraLocalRateLimitStore) {
  globalThis.__spectraLocalRateLimitStore = localRateLimitStore;
}

if (!globalThis.__spectraRateLimitWarnings) {
  globalThis.__spectraRateLimitWarnings = warningStore;
}

const RATE_LIMIT_PRESETS: Record<string, RateLimitPreset> = {
  auth: {
    key: 'auth',
    limit: 8,
    windowMs: 15 * 60 * 1000,
    message: 'Too many login attempts. Please wait before trying again.',
  },
  chat: {
    key: 'chat',
    limit: 18,
    windowMs: 5 * 60 * 1000,
    message: 'Too many chat requests. Please wait a few minutes and retry.',
  },
  leads: {
    key: 'leads',
    limit: 5,
    windowMs: 10 * 60 * 1000,
    message: 'Too many enquiry submissions. Please wait before sending another message.',
  },
  meetings: {
    key: 'meetings',
    limit: 4,
    windowMs: 15 * 60 * 1000,
    message: 'Too many meeting requests. Please wait before booking again.',
  },
  adminWrites: {
    key: 'admin-writes',
    limit: 60,
    windowMs: 5 * 60 * 1000,
    message: 'Too many admin updates. Please wait a moment and retry.',
  },
  adminUploads: {
    key: 'admin-uploads',
    limit: 20,
    windowMs: 5 * 60 * 1000,
    message: 'Too many image uploads. Please wait a moment before trying again.',
  },
} as const;

const RATE_LIMIT_ROUTE_MAP: readonly RateLimitRouteRule[] = [
  {
    methods: ['POST'],
    pathname: /^\/api\/auth(?:\/.*)?$/i,
    presetName: 'auth',
  },
  {
    methods: ['POST'],
    pathname: /^\/api\/chat$/i,
    presetName: 'chat',
  },
  {
    methods: ['POST'],
    pathname: /^\/api\/leads$/i,
    presetName: 'leads',
  },
  {
    methods: ['POST'],
    pathname: /^\/api\/meetings$/i,
    presetName: 'meetings',
  },
  {
    methods: ['POST'],
    pathname: /^\/api\/admin\/uploads$/i,
    presetName: 'adminUploads',
  },
  {
    methods: ['POST'],
    pathname: /^\/api\/(?:products|categories|blogs|site-settings)$/i,
    presetName: 'adminWrites',
  },
  {
    methods: ['PUT', 'PATCH', 'DELETE'],
    pathname: /^\/api\/(?:products|categories|blogs|leads|meetings)\/[^/]+$/i,
    presetName: 'adminWrites',
  },
] as const;

const warnOnce = (key: string, message: string, error?: unknown) => {
  if (warningStore.has(key)) {
    return;
  }

  warningStore.add(key);
  console.warn(message, error);
};

const getClientIp = (req: NextRequest) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const connectingIp = req.headers.get('cf-connecting-ip');

  return (
    forwardedFor?.split(',')[0]?.trim() ||
    realIp?.trim() ||
    connectingIp?.trim() ||
    'unknown'
  );
};

const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
};

const buildClientKey = (req: NextRequest, preset: RateLimitPreset) =>
  createHash('sha256')
    .update(`${preset.key}:${getClientIp(req)}`)
    .digest('hex');

const cleanupExpiredLocalEntries = (now: number) => {
  for (const [key, entry] of Array.from(localRateLimitStore.entries())) {
    if (entry.resetAt <= now) {
      localRateLimitStore.delete(key);
    }
  }
};

const buildHeaders = (
  preset: RateLimitPreset,
  remaining: number,
  resetAt: number,
) => ({
    'X-RateLimit-Limit': String(preset.limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.max(0, Math.ceil(resetAt / 1000))),
  });

const buildRateLimitResponse = (
  preset: RateLimitPreset,
  currentCount: number,
  resetAt: number,
): RateLimitResult => {
  const remaining = Math.max(0, preset.limit - currentCount);
  const limited = currentCount > preset.limit;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  const headers = limited
    ? {
        ...buildHeaders(preset, remaining, resetAt),
        'Retry-After': String(retryAfterSeconds),
      }
    : buildHeaders(preset, remaining, resetAt);

  if (limited) {
    return {
      limitedResponse: NextResponse.json(
        {
          error: preset.message,
          code: 'RATE_LIMITED',
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers,
        },
      ),
      headers,
    };
  }

  return {
    limitedResponse: null,
    headers,
  };
};

const enforceLocalRateLimit = (
  clientKey: string,
  preset: RateLimitPreset,
): RateLimitResult => {
  const now = Date.now();
  cleanupExpiredLocalEntries(now);

  const entry = localRateLimitStore.get(clientKey);

  if (!entry || entry.resetAt <= now) {
    const nextEntry = {
      count: 1,
      resetAt: now + preset.windowMs,
    };
    localRateLimitStore.set(clientKey, nextEntry);
    return buildRateLimitResponse(preset, nextEntry.count, nextEntry.resetAt);
  }

  entry.count = Math.min(entry.count + 1, preset.limit + 1);
  localRateLimitStore.set(clientKey, entry);
  return buildRateLimitResponse(preset, entry.count, entry.resetAt);
};

const parseDistributedRateLimitRow = (value: unknown) => {
  const row = (Array.isArray(value) ? value[0] : value) as
    | DistributedRateLimitRow
    | null
    | undefined;

  if (!row || typeof row !== 'object') {
    return null;
  }

  const currentCount = Number(row.current_count);
  const resetAt = row.reset_at ? new Date(String(row.reset_at)).getTime() : NaN;

  if (!Number.isFinite(currentCount) || !Number.isFinite(resetAt)) {
    return null;
  }

  return {
    currentCount,
    resetAt,
  };
};

const enforceDistributedRateLimit = async (
  clientKey: string,
  preset: RateLimitPreset,
): Promise<RateLimitResult> => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc('enforce_rate_limit', {
    identifier: clientKey,
    max_requests: preset.limit,
    window_seconds: Math.max(1, Math.ceil(preset.windowMs / 1000)),
  });

  if (error) {
    throw error;
  }

  const parsed = parseDistributedRateLimitRow(data);

  if (!parsed) {
    throw new Error('Rate limit RPC returned an unexpected payload.');
  }

  return buildRateLimitResponse(preset, parsed.currentCount, parsed.resetAt);
};

export async function enforceRateLimit(
  req: NextRequest,
  presetName: RateLimitPresetName,
): Promise<RateLimitResult> {
  const preset = RATE_LIMIT_PRESETS[presetName];
  const clientKey = buildClientKey(req, preset);

  if (isSupabaseConfigured()) {
    try {
      return await enforceDistributedRateLimit(clientKey, preset);
    } catch (error) {
      warnOnce(
        'distributed-rate-limit-fallback',
        'Distributed rate limiting is unavailable. Falling back to local in-memory limits.',
        error,
      );
    }
  }

  return enforceLocalRateLimit(clientKey, preset);
}

export function resolveRateLimitPresetName(
  req: Pick<NextRequest, 'method' | 'nextUrl'>,
): RateLimitPresetName | null {
  const method = req.method.toUpperCase();
  const pathname = normalizePathname(req.nextUrl.pathname);

  const matchingRule = RATE_LIMIT_ROUTE_MAP.find(
    (rule) => rule.methods.includes(method) && rule.pathname.test(pathname),
  );

  return matchingRule?.presetName || null;
}

export async function enforceMappedRateLimit(
  req: NextRequest,
  fallbackPresetName?: RateLimitPresetName,
): Promise<RateLimitResult> {
  const presetName = fallbackPresetName || resolveRateLimitPresetName(req);

  if (!presetName) {
    return {
      limitedResponse: null,
      headers: {},
    };
  }

  return enforceRateLimit(req, presetName);
}
