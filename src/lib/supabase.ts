import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase admin env is missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
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
