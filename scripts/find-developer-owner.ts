import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

loadEnvConfig(process.cwd());

const normalize = (value: unknown) =>
  String(value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  '';
const expectedName = normalize(process.env.DEVELOPER_ADMIN_NAME || 'dipanshu');

async function main() {
  if (!url || !serviceKey) {
    throw new Error('Supabase URL and service-role credentials are required.');
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, display_name, role, active')
    .eq('active', true);

  if (error) throw error;

  const namedMatches = (data || []).filter((row) => {
    const emailLocalPart = normalize(String(row.email || '').split('@')[0]);
    return normalize(row.display_name) === expectedName || emailLocalPart === expectedName;
  });
  const matches = namedMatches.filter((row) => normalize(row.role) === 'owner');

  if (matches.length === 1) {
    console.log(`DEVELOPER_OWNER_USER_ID=${matches[0].user_id}`);
    return;
  }

  const envAdminName = normalize(process.env.ADMIN_NAME);
  const envAdminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const envAdminPasswordConfigured = Boolean(process.env.ADMIN_PASSWORD);
  if (
    matches.length === 0 &&
    envAdminName === expectedName &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(envAdminEmail) &&
    envAdminPasswordConfigured
  ) {
    console.log(`DEVELOPER_OWNER_USER_ID=env-admin:${envAdminEmail}`);
    return;
  }

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one active owner matching "${expectedName}"; found ${matches.length} owner match(es) and ${namedMatches.length} active name match(es). Environment fallback checks: name=${envAdminName === expectedName ? 'ok' : 'mismatch'}, email=${envAdminEmail ? 'configured' : 'missing'}, password=${envAdminPasswordConfigured ? 'configured' : 'missing'}.`,
    );
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
