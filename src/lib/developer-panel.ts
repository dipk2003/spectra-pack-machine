import 'server-only';

import { getAdminDashboardData, type AdminDashboardData } from './admin-dashboard';
import { withTimeout } from './async-timeout';
import type { DeveloperAccessDecision } from './developer-access';
import { COMPANY_INFO } from './data';
import { getNextAuthSecret, getSiteOrigin } from './runtime-config';
import {
  getSupabaseAdmin,
  getSupabaseConnectionStatus,
  isSupabaseConfigured,
} from './supabase';

type AnalyticsEventRow = {
  event_name: string;
  path: string;
  source: string;
  metadata: unknown;
  created_at: string;
};

export type DeveloperAnalyticsSummary = {
  status: 'available' | 'missing' | 'unavailable' | 'error';
  notice: string | null;
  windowDays: number;
  totalEvents: number;
  eventsLast24Hours: number;
  sampledEvents: number;
  sampleLimited: boolean;
  totals: {
    pageViews: number;
    leadSubmissions: number;
    meetingBookings: number;
    whatsappClicks: number;
    phoneClicks: number;
    emailClicks: number;
    catalogDownloads: number;
    chatOpens: number;
    chatMessages: number;
    contactActions: number;
  };
  leadConversionRate: number;
  topPages: Array<{ label: string; count: number }>;
  topSources: Array<{ label: string; count: number }>;
  recentEvents: Array<{
    eventName: string;
    path: string;
    source: string;
    context: string;
    createdAt: string;
  }>;
};

export type DeveloperPanelData = {
  generatedAt: string;
  access: {
    mode: DeveloperAccessDecision['mode'];
    identitySource: DeveloperAccessDecision['identitySource'];
    explicitOwnerIdConfigured: boolean;
    fallbackWarning: string | null;
  };
  operations: Pick<
    AdminDashboardData,
    'stats' | 'recentLeads' | 'recentMeetings' | 'notices' | 'database'
  >;
  analytics: DeveloperAnalyticsSummary;
  config: Array<{
    key: string;
    label: string;
    healthy: boolean;
    detail: string;
  }>;
};

const WINDOW_DAYS = 30;
const ANALYTICS_SAMPLE_LIMIT = 1000;
const DEVELOPER_ANALYTICS_TIMEOUT_MS = 8_000;
const PLACEHOLDER_PATTERNS = ['YOUR_', 'change-this', 'ChangeThis', 'replace-with-your'];
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const GA_ID_PATTERN = /^G-[A-Z0-9]+$/i;
const GOOGLE_ADS_ID_PATTERN = /^AW-\d+$/i;

const hasConfiguredValue = (value: unknown) => {
  const text = String(value || '').trim();
  return Boolean(
    text && !PLACEHOLDER_PATTERNS.some((placeholder) => text.includes(placeholder)),
  );
};

const hasValidAnalyticsId = (value: unknown, pattern: RegExp) => {
  const text = String(value || '').trim();
  return hasConfiguredValue(text) && pattern.test(text);
};

const isMissingTableError = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false;
  const code = 'code' in error ? String(error.code || '') : '';
  const message = 'message' in error ? String(error.message || '') : '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('Could not find the table') ||
    message.includes('relation "analytics_events" does not exist')
  );
};

const emptyAnalytics = (
  status: DeveloperAnalyticsSummary['status'],
  notice: string,
): DeveloperAnalyticsSummary => ({
  status,
  notice,
  windowDays: WINDOW_DAYS,
  totalEvents: 0,
  eventsLast24Hours: 0,
  sampledEvents: 0,
  sampleLimited: false,
  totals: {
    pageViews: 0,
    leadSubmissions: 0,
    meetingBookings: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    emailClicks: 0,
    catalogDownloads: 0,
    chatOpens: 0,
    chatMessages: 0,
    contactActions: 0,
  },
  leadConversionRate: 0,
  topPages: [],
  topSources: [],
  recentEvents: [],
});

const countBy = (values: string[], fallback: string) => {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const label = value.trim() || fallback;
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 8);
};

const getMetadataContext = (metadata: unknown) => {
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    return '';
  }

  const safeMetadata = metadata as Record<string, unknown>;
  const contextKeys = [
    'product_slug',
    'category_slug',
    'lead_source',
    'link_type',
    'chat_intent',
  ];
  for (const key of contextKeys) {
    const value = safeMetadata[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().slice(0, 100);
    }
  }
  return '';
};

const countEvent = (eventCounts: Map<string, number>, ...names: string[]) =>
  names.reduce((total, name) => total + (eventCounts.get(name) || 0), 0);

async function getAnalyticsSummary(): Promise<DeveloperAnalyticsSummary> {
  if (!isSupabaseConfigured()) {
    return emptyAnalytics(
      'unavailable',
      'First-party analytics is unavailable until Supabase admin access is configured.',
    );
  }

  const supabase = getSupabaseAdmin();
  const now = Date.now();
  const windowStart = new Date(now - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const dayStart = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  try {
    const [eventsResult, dayCountResult] = await withTimeout(
      Promise.all([
        supabase
          .from('analytics_events')
          .select('event_name, path, source, metadata, created_at', { count: 'exact' })
          .gte('created_at', windowStart)
          .order('created_at', { ascending: false })
          .limit(ANALYTICS_SAMPLE_LIMIT),
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', dayStart),
      ]),
      DEVELOPER_ANALYTICS_TIMEOUT_MS,
      'Developer analytics summary',
    );

    const queryError = eventsResult.error || dayCountResult.error;
    if (queryError) {
      if (isMissingTableError(queryError)) {
        return emptyAnalytics(
          'missing',
          'First-party analytics setup is pending. Apply the analytics_events database migration to start collecting traffic and conversion events.',
        );
      }

      console.error('Developer analytics query failed:', queryError);
      return emptyAnalytics(
        'error',
        'First-party analytics is temporarily unavailable. Database configuration remains intact.',
      );
    }

    const rows = Array.isArray(eventsResult.data)
      ? (eventsResult.data as AnalyticsEventRow[])
      : [];
    const eventCounts = new Map<string, number>();
    rows.forEach((row) => {
      const eventName = String(row.event_name || '').trim().toLowerCase();
      if (eventName) eventCounts.set(eventName, (eventCounts.get(eventName) || 0) + 1);
    });

    const pageViews = countEvent(eventCounts, 'page_view');
    const leadSubmissions = countEvent(
      eventCounts,
      'generate_lead',
      'lead_submit',
      'lead_submitted',
    );
    const meetingBookings = countEvent(
      eventCounts,
      'meeting_booked',
      'meeting_submit',
      'meeting_submitted',
    );
    const whatsappClicks = countEvent(eventCounts, 'whatsapp_click');
    const phoneClicks = countEvent(eventCounts, 'phone_click');
    const emailClicks = countEvent(eventCounts, 'email_click');
    const catalogDownloads = countEvent(eventCounts, 'catalog_download');
    const chatOpens = countEvent(eventCounts, 'chat_open');
    const chatMessages = countEvent(eventCounts, 'chat_message');
    const contactActions =
      leadSubmissions +
      meetingBookings +
      whatsappClicks +
      phoneClicks +
      emailClicks;
    const totalEvents = eventsResult.count ?? rows.length;

    return {
      status: 'available',
      notice:
        totalEvents > rows.length
          ? `The overall event count covers the full ${WINDOW_DAYS}-day window. Funnel, page, and source breakdowns use the latest ${rows.length.toLocaleString()} events.`
          : null,
      windowDays: WINDOW_DAYS,
      totalEvents,
      eventsLast24Hours: dayCountResult.count ?? 0,
      sampledEvents: rows.length,
      sampleLimited: totalEvents > rows.length,
      totals: {
        pageViews,
        leadSubmissions,
        meetingBookings,
        whatsappClicks,
        phoneClicks,
        emailClicks,
        catalogDownloads,
        chatOpens,
        chatMessages,
        contactActions,
      },
      leadConversionRate:
        pageViews > 0 ? Number(((leadSubmissions / pageViews) * 100).toFixed(2)) : 0,
      topPages: countBy(
        rows.filter((row) => row.event_name === 'page_view').map((row) => row.path || ''),
        '(unknown page)',
      ),
      topSources: countBy(
        rows.map((row) => row.source || ''),
        'direct / unknown',
      ),
      recentEvents: rows.slice(0, 12).map((row) => ({
        eventName: String(row.event_name || 'unknown'),
        path: String(row.path || ''),
        source: String(row.source || 'direct / unknown'),
        context: getMetadataContext(row.metadata),
        createdAt: String(row.created_at || ''),
      })),
    };
  } catch (error) {
    console.error('Developer analytics request failed:', error);
    return emptyAnalytics(
      'error',
      'First-party analytics is temporarily unavailable. Please retry after checking the database connection.',
    );
  }
}

const getSafeSiteHost = () => {
  try {
    return new URL(getSiteOrigin()).host;
  } catch {
    return 'not configured';
  }
};

export async function getDeveloperPanelData(
  access: DeveloperAccessDecision,
): Promise<DeveloperPanelData> {
  const [dashboard, analytics] = await Promise.all([
    getAdminDashboardData(),
    getAnalyticsSummary(),
  ]);
  const supabase = getSupabaseConnectionStatus();
  const analyticsHealthy = analytics.status === 'available';
  const smtpConfigured = [
    process.env.SMTP_HOST,
    process.env.SMTP_USER,
    process.env.SMTP_PASS,
    process.env.SMTP_FROM_EMAIL,
  ].every(hasConfiguredValue);
  const googleAnalyticsConfigured =
    hasValidAnalyticsId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, GA_ID_PATTERN) ||
    [
      process.env.NEXT_PUBLIC_GTM_ID,
      process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
    ].some((value) => hasValidAnalyticsId(value, GTM_ID_PATTERN));
  const googleAdsConfigured = hasValidAnalyticsId(
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
    GOOGLE_ADS_ID_PATTERN,
  );

  return {
    generatedAt: new Date().toISOString(),
    access: {
      mode: access.mode,
      identitySource: access.identitySource,
      explicitOwnerIdConfigured: access.explicitOwnerIdConfigured,
      fallbackWarning: access.fallbackWarning,
    },
    operations: {
      stats: dashboard.stats,
      recentLeads: dashboard.recentLeads,
      recentMeetings: dashboard.recentMeetings,
      notices: dashboard.notices,
      database: dashboard.database,
    },
    analytics,
    config: [
      {
        key: 'database',
        label: 'Supabase admin connection',
        healthy: supabase.adminConfigured,
        detail: supabase.message,
      },
      {
        key: 'analytics',
        label: 'First-party analytics table',
        healthy: analyticsHealthy,
        detail: analyticsHealthy
          ? 'analytics_events is available and reporting.'
          : analytics.notice || 'Analytics status could not be determined.',
      },
      {
        key: 'developer-guard',
        label: 'Developer owner allowlist',
        healthy: access.mode === 'explicit-owner-id',
        detail:
          access.mode === 'explicit-owner-id'
            ? 'Exact server-side owner user id enforcement is active.'
            : access.fallbackWarning || 'Exact developer owner id is not configured.',
      },
      {
        key: 'auth-secret',
        label: 'Admin session secret',
        healthy: hasConfiguredValue(getNextAuthSecret()),
        detail: hasConfiguredValue(getNextAuthSecret())
          ? 'A non-placeholder authentication secret is configured.'
          : 'Configure a strong NEXTAUTH_SECRET or AUTH_SECRET.',
      },
      {
        key: 'smtp',
        label: 'Lead notification email',
        healthy: smtpConfigured,
        detail: smtpConfigured
          ? 'SMTP notification settings are present.'
          : 'One or more SMTP notification settings are missing.',
      },
      {
        key: 'owner-email',
        label: 'Owner notification recipient',
        healthy: hasConfiguredValue(process.env.OWNER_NOTIFICATION_EMAIL),
        detail: hasConfiguredValue(process.env.OWNER_NOTIFICATION_EMAIL)
          ? 'Owner notification routing is configured.'
          : 'OWNER_NOTIFICATION_EMAIL is not configured.',
      },
      {
        key: 'ga',
        label: 'Google Analytics / GTM tag',
        healthy: googleAnalyticsConfigured,
        detail: googleAnalyticsConfigured
          ? 'A client-loaded Google Analytics measurement id or GTM container is configured.'
          : 'Google Analytics measurement id or GTM container is not configured.',
      },
      {
        key: 'google-ads',
        label: 'Google Ads tag',
        healthy: googleAdsConfigured,
        detail: googleAdsConfigured
          ? 'A client-loaded Google Ads id is configured.'
          : 'Google Ads id is not configured.',
      },
      {
        key: 'whatsapp',
        label: 'WhatsApp destination',
        healthy: /^\d{10,15}$/.test(COMPANY_INFO.whatsapp),
        detail: /^\d{10,15}$/.test(COMPANY_INFO.whatsapp)
          ? 'Website WhatsApp destination is valid.'
          : 'Website WhatsApp destination needs attention.',
      },
      {
        key: 'origin',
        label: 'Production site origin',
        healthy: getSafeSiteHost() !== 'not configured',
        detail: getSafeSiteHost(),
      },
    ],
  };
}
