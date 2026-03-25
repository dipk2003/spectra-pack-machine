import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  '';

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

export function hasSupabasePublicConfig() {
  return (
    supabaseUrl.startsWith('http') &&
    !hasPlaceholderValue(supabaseUrl) &&
    !hasPlaceholderValue(supabasePublicKey)
  );
}

export function isSupabaseConfigured() {
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
  if (!hasSupabasePublicConfig()) {
    throw new Error(
      'Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
    );
  }

  if (!supabasePublicClient) {
    supabasePublicClient = createClient(supabaseUrl, supabasePublicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabasePublicClient;
}

export function createSupabasePublicClient() {
  if (!hasSupabasePublicConfig()) {
    throw new Error(SUPABASE_AUTH_CONFIG_MESSAGE);
  }

  return createClient(supabaseUrl, supabasePublicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_ADMIN_CONFIG_MESSAGE);
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdminClient;
}
