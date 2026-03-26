import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnv = {
  supabaseUrl: string;
  supabasePublicKey: string;
  supabaseServiceRoleKey: string;
};

export const SUPABASE_ADMIN_CONFIG_MESSAGE =
  'Supabase admin access is not configured. Add a real SUPABASE_SERVICE_ROLE_KEY so admin can load leads, meetings, and manage database content.';
export const SUPABASE_AUTH_CONFIG_MESSAGE =
  'Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, and SUPABASE_SERVICE_ROLE_KEY so admin login can use Supabase Auth.';

const hasPlaceholderValue = (value: string) =>
  !value ||
  value.includes('YOUR_') ||
  value.includes('change-this') ||
  value.includes('ChangeThis');

let supabaseAdminClient: SupabaseClient | null = null;
let supabasePublicClient: SupabaseClient | null = null;
let supabaseAdminClientConfig = '';
let supabasePublicClientConfig = '';

const getSupabaseEnv = (): SupabaseEnv => ({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabasePublicKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '',
  supabaseServiceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    '',
});

const createSupabaseRuntimeClient = (url: string, key: string) =>
  createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

export function hasSupabasePublicConfig() {
  const { supabaseUrl, supabasePublicKey } = getSupabaseEnv();
  return (
    supabaseUrl.startsWith('http') &&
    !hasPlaceholderValue(supabaseUrl) &&
    !hasPlaceholderValue(supabasePublicKey)
  );
}

export function isSupabaseConfigured() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseEnv();
  return (
    supabaseUrl.startsWith('http') &&
    !hasPlaceholderValue(supabaseUrl) &&
    !hasPlaceholderValue(supabaseServiceRoleKey)
  );
}

export function getSupabaseConnectionStatus() {
  const publicConfigured = hasSupabasePublicConfig();
  const adminConfigured = isSupabaseConfigured();

  return {
    publicConfigured,
    adminConfigured,
    mode: adminConfigured
      ? 'service-role'
      : publicConfigured
        ? 'public-readonly'
        : 'disconnected',
    message: adminConfigured
      ? 'Supabase public and admin access are configured.'
      : publicConfigured
        ? SUPABASE_ADMIN_CONFIG_MESSAGE
        : 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY first.',
  } as const;
}

export function getSupabasePublic() {
  const { supabaseUrl, supabasePublicKey } = getSupabaseEnv();

  if (!hasSupabasePublicConfig()) {
    throw new Error(
      'Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
    );
  }

  const cacheKey = `${supabaseUrl}::${supabasePublicKey}`;
  if (!supabasePublicClient || supabasePublicClientConfig !== cacheKey) {
    supabasePublicClient = createSupabaseRuntimeClient(supabaseUrl, supabasePublicKey);
    supabasePublicClientConfig = cacheKey;
  }

  return supabasePublicClient;
}

export function createSupabasePublicClient() {
  const { supabaseUrl, supabasePublicKey } = getSupabaseEnv();

  if (!hasSupabasePublicConfig()) {
    throw new Error(SUPABASE_AUTH_CONFIG_MESSAGE);
  }

  return createSupabaseRuntimeClient(supabaseUrl, supabasePublicKey);
}

export function getSupabaseAdmin() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseEnv();

  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_ADMIN_CONFIG_MESSAGE);
  }

  const cacheKey = `${supabaseUrl}::${supabaseServiceRoleKey}`;
  if (!supabaseAdminClient || supabaseAdminClientConfig !== cacheKey) {
    supabaseAdminClient = createSupabaseRuntimeClient(supabaseUrl, supabaseServiceRoleKey);
    supabaseAdminClientConfig = cacheKey;
  }

  return supabaseAdminClient;
}
