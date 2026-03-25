import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

type AdminUserRow = {
  user_id: string;
  email: string;
  role: string;
  display_name: string | null;
  active: boolean | null;
};

export type AdminUserAccess = {
  userId: string;
  email: string;
  role: string;
  displayName: string;
  active: boolean;
};

const isMissingAdminUsersTableError = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code === 'PGRST205' || error.code === '42P01';
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message.includes('Could not find the table');
  }

  return false;
};

const mapAdminUserRow = (row: AdminUserRow): AdminUserAccess => ({
  userId: row.user_id,
  email: row.email,
  role: row.role,
  displayName: row.display_name || '',
  active: Boolean(row.active),
});

export async function getAdminUserByUserId(userId: string) {
  if (!isSupabaseConfigured() || !userId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, role, display_name, active')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    if (isMissingAdminUsersTableError(error)) {
      return null;
    }

    throw error;
  }

  return data ? mapAdminUserRow(data as AdminUserRow) : null;
}
