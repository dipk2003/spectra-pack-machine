import 'server-only';

import {
  getSupabaseAdmin,
  getSupabaseConnectionStatus,
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from './supabase';

export type AdminDashboardStats = {
  leads: number;
  unreadLeads: number;
  meetings: number;
  pendingMeetings: number;
  products: number;
  blogs: number;
};

export type RecentLeadSummary = {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
};

export type RecentMeetingSummary = {
  id: string;
  name: string;
  date: string;
  time: string;
  meetingLink: string;
  status: string;
  createdAt: string;
};

export type AdminDashboardData = {
  generatedAt: string;
  stats: AdminDashboardStats;
  recentLeads: RecentLeadSummary[];
  recentMeetings: RecentMeetingSummary[];
  notices: string[];
  database: ReturnType<typeof getSupabaseConnectionStatus>;
};

type LeadSummaryRow = {
  id: string;
  name: string;
  email: string;
  source: string | null;
  created_at: string;
};

type MeetingSummaryRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  meeting_link: string | null;
  status: string | null;
  created_at: string;
};

type QueryResult<T> = {
  data: T | null;
  count: number | null;
  error: unknown;
};

const EMPTY_STATS: AdminDashboardStats = {
  leads: 0,
  unreadLeads: 0,
  meetings: 0,
  pendingMeetings: 0,
  products: 0,
  blogs: 0,
};

const isMissingTableError = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false;

  const code = 'code' in error ? String(error.code || '') : '';
  const message = 'message' in error ? String(error.message || '') : '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('Could not find the table') ||
    message.includes('does not exist')
  );
};

const asQueryResult = <T>(value: unknown): QueryResult<T> => {
  if (typeof value !== 'object' || value === null) {
    return { data: null, count: null, error: new Error('Invalid database response') };
  }

  const result = value as { data?: T | null; count?: number | null; error?: unknown };
  return {
    data: result.data ?? null,
    count: typeof result.count === 'number' ? result.count : null,
    error: result.error ?? null,
  };
};

const runQuery = async <T>(
  label: string,
  operation: () => PromiseLike<unknown>,
): Promise<QueryResult<T>> => {
  try {
    return asQueryResult<T>(await operation());
  } catch (error) {
    console.error(`Admin dashboard ${label} query failed:`, error);
    return { data: null, count: null, error };
  }
};

const toText = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const mapRecentLead = (row: LeadSummaryRow): RecentLeadSummary => ({
  id: toText(row.id),
  name: toText(row.name, 'Unknown'),
  email: toText(row.email),
  source: toText(row.source, 'contact'),
  createdAt: toText(row.created_at),
});

const mapRecentMeeting = (row: MeetingSummaryRow): RecentMeetingSummary => ({
  id: toText(row.id),
  name: toText(row.name, 'Unknown'),
  date: toText(row.date),
  time: toText(row.time),
  meetingLink: toText(row.meeting_link),
  status: toText(row.status, 'pending'),
  createdAt: toText(row.created_at),
});

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const database = getSupabaseConnectionStatus();

  if (!isSupabaseConfigured()) {
    return {
      generatedAt: new Date().toISOString(),
      stats: { ...EMPTY_STATS },
      recentLeads: [],
      recentMeetings: [],
      notices: [SUPABASE_ADMIN_CONFIG_MESSAGE],
      database,
    };
  }

  const supabase = getSupabaseAdmin();
  const [
    leadsCount,
    unreadLeadsCount,
    meetingsCount,
    pendingMeetingsCount,
    productsCount,
    blogsCount,
    recentLeadsResult,
    recentMeetingsResult,
  ] = await Promise.all([
    runQuery<never[]>('lead count', () =>
      supabase.from('leads').select('id', { count: 'exact', head: true }),
    ),
    runQuery<never[]>('unread lead count', () =>
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('read', false),
    ),
    runQuery<never[]>('meeting count', () =>
      supabase.from('meetings').select('id', { count: 'exact', head: true }),
    ),
    runQuery<never[]>('pending meeting count', () =>
      supabase
        .from('meetings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ),
    runQuery<never[]>('product count', () =>
      supabase.from('products').select('id', { count: 'exact', head: true }),
    ),
    runQuery<never[]>('blog count', () =>
      supabase.from('blogs').select('id', { count: 'exact', head: true }),
    ),
    runQuery<LeadSummaryRow[]>('recent leads', () =>
      supabase
        .from('leads')
        .select('id, name, email, source, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ),
    runQuery<MeetingSummaryRow[]>('recent meetings', () =>
      supabase
        .from('meetings')
        .select('id, name, date, time, meeting_link, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ),
  ]);

  const queryGroups = [
    { label: 'leads', results: [leadsCount, unreadLeadsCount, recentLeadsResult] },
    {
      label: 'meetings',
      results: [meetingsCount, pendingMeetingsCount, recentMeetingsResult],
    },
    { label: 'products', results: [productsCount] },
    { label: 'blogs', results: [blogsCount] },
  ];
  const notices = queryGroups.flatMap(({ label, results }) => {
    const firstError = results.find((result) => Boolean(result.error))?.error;
    if (!firstError) return [];

    console.error(`Admin dashboard could not load ${label}:`, firstError);
    return [
      isMissingTableError(firstError)
        ? `The ${label} table is not available yet. Run the database setup migration.`
        : `The ${label} summary is temporarily unavailable.`,
    ];
  });

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      leads: leadsCount.count ?? 0,
      unreadLeads: unreadLeadsCount.count ?? 0,
      meetings: meetingsCount.count ?? 0,
      pendingMeetings: pendingMeetingsCount.count ?? 0,
      products: productsCount.count ?? 0,
      blogs: blogsCount.count ?? 0,
    },
    recentLeads: Array.isArray(recentLeadsResult.data)
      ? recentLeadsResult.data.map(mapRecentLead)
      : [],
    recentMeetings: Array.isArray(recentMeetingsResult.data)
      ? recentMeetingsResult.data.map(mapRecentMeeting)
      : [],
    notices,
    database,
  };
}
