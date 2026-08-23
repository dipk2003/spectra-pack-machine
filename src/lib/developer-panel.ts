import 'server-only';

import { getAdminDashboardData, type AdminDashboardData } from './admin-dashboard';
import { withTimeout } from './async-timeout';
import type { DeveloperAccessDecision } from './developer-access';
import { COMPANY_INFO } from './data';
import { LEAD_STATUSES, isLeadStatus, type LeadStatus } from './lead-status';
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
  medium: string | null;
  campaign: string | null;
  session_id: string | null;
  metadata: unknown;
  created_at: string;
};

type LeadPipelineRow = {
  id: string;
  status: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  created_at: string;
};

export type DeveloperLeadPipelineSummary = {
  status: 'available' | 'unavailable' | 'error';
  notice: string | null;
  total: number;
  sampled: number;
  paidAttributed: number;
  paidAttributedWindow: number;
  stages: Record<LeadStatus, number>;
  progressed: number;
  openOpportunities: number;
  won: number;
  lost: number;
  topPaidCampaigns: Array<{ label: string; count: number }>;
};

export type DeveloperAdvertisingSummary = {
  tagConfigured: boolean;
  leadConversionConfigured: boolean;
  reportingApiConnected: boolean;
  notice: string;
  websiteAttributed: {
    visitors: number;
    pageViews: number;
    contactActions: number;
    leads: number;
    conversionRate: number | null;
  };
  authoritative: {
    impressions: number | null;
    clicks: number | null;
    spend: number | null;
    conversions: number | null;
    costPerLead: number | null;
  };
};

export type DeveloperAnalyticsSummary = {
  status: 'available' | 'missing' | 'unavailable' | 'error';
  notice: string | null;
  windowDays: number;
  totalEvents: number;
  eventsLast24Hours: number;
  uniqueVisitors: number;
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
  paid: {
    visitors: number;
    pageViews: number;
    contactActions: number;
  };
  dailyActivity: Array<{
    date: string;
    events: number;
    pageViews: number;
    contactActions: number;
  }>;
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
  pipeline: DeveloperLeadPipelineSummary;
  advertising: DeveloperAdvertisingSummary;
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
  uniqueVisitors: 0,
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
  paid: {
    visitors: 0,
    pageViews: 0,
    contactActions: 0,
  },
  dailyActivity: [],
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

const CONTACT_EVENT_NAMES = new Set([
  'generate_lead',
  'lead_submit',
  'lead_submitted',
  'meeting_booked',
  'meeting_submit',
  'meeting_submitted',
  'whatsapp_click',
  'phone_click',
  'email_click',
]);

const metadataFlag = (metadata: unknown, key: string) =>
  Boolean(
    metadata &&
      typeof metadata === 'object' &&
      !Array.isArray(metadata) &&
      (metadata as Record<string, unknown>)[key],
  );

const isPaidAnalyticsEvent = (row: AnalyticsEventRow) => {
  const source = String(row.source || '').trim().toLowerCase();
  const medium = String(row.medium || '').trim().toLowerCase();
  return Boolean(
    metadataFlag(row.metadata, 'paid_click') ||
      source.includes('google-ads') ||
      source.includes('googleads') ||
      source.includes('microsoft-ads') ||
      ['cpc', 'ppc', 'paid', 'paid-search', 'paid_search', 'display'].includes(medium),
  );
};

const getDailyActivity = (rows: AnalyticsEventRow[], now: number) => {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now - (13 - index) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return { date, events: 0, pageViews: 0, contactActions: 0 };
  });
  const byDate = new Map(days.map((day) => [day.date, day]));

  rows.forEach((row) => {
    const day = byDate.get(String(row.created_at || '').slice(0, 10));
    if (!day) return;
    const eventName = String(row.event_name || '').trim().toLowerCase();
    day.events += 1;
    if (eventName === 'page_view') day.pageViews += 1;
    if (CONTACT_EVENT_NAMES.has(eventName)) day.contactActions += 1;
  });

  return days;
};

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
          .select(
            'event_name, path, source, medium, campaign, session_id, metadata, created_at',
            { count: 'exact' },
          )
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
    const uniqueVisitors = new Set(
      rows.map((row) => String(row.session_id || '').trim()).filter(Boolean),
    ).size;
    const paidRows = rows.filter(isPaidAnalyticsEvent);
    const paidPageViews = paidRows.filter(
      (row) => String(row.event_name || '').trim().toLowerCase() === 'page_view',
    ).length;
    const paidContactActions = paidRows.filter((row) =>
      CONTACT_EVENT_NAMES.has(String(row.event_name || '').trim().toLowerCase()),
    ).length;
    const paidVisitors = new Set(
      paidRows.map((row) => String(row.session_id || '').trim()).filter(Boolean),
    ).size;

    return {
      status: 'available',
      notice:
        totalEvents > rows.length
          ? `The overall event count covers the full ${WINDOW_DAYS}-day window. Funnel, page, and source breakdowns use the latest ${rows.length.toLocaleString()} events.`
          : null,
      windowDays: WINDOW_DAYS,
      totalEvents,
      eventsLast24Hours: dayCountResult.count ?? 0,
      uniqueVisitors,
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
      paid: {
        visitors: paidVisitors,
        pageViews: paidPageViews,
        contactActions: paidContactActions,
      },
      dailyActivity: getDailyActivity(rows, now),
      topPages: countBy(
        rows.filter((row) => row.event_name === 'page_view').map((row) => row.path || ''),
        '(unknown page)',
      ),
      topSources: countBy(
        rows.map((row) => {
          const source = String(row.source || '').trim();
          const medium = String(row.medium || '').trim();
          return medium && medium !== 'none' ? `${source || 'direct'} / ${medium}` : source;
        }),
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

const emptyLeadStages = (): Record<LeadStatus, number> =>
  Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<
    LeadStatus,
    number
  >;

const emptyPipeline = (
  status: DeveloperLeadPipelineSummary['status'],
  notice: string,
): DeveloperLeadPipelineSummary => ({
  status,
  notice,
  total: 0,
  sampled: 0,
  paidAttributed: 0,
  paidAttributedWindow: 0,
  stages: emptyLeadStages(),
  progressed: 0,
  openOpportunities: 0,
  won: 0,
  lost: 0,
  topPaidCampaigns: [],
});

const isPaidLead = (row: LeadPipelineRow) => {
  const source = String(row.utm_source || '').trim().toLowerCase();
  const medium = String(row.utm_medium || '').trim().toLowerCase();
  return Boolean(
    row.gclid ||
      row.gbraid ||
      row.wbraid ||
      source.includes('google-ads') ||
      source.includes('googleads') ||
      ['cpc', 'ppc', 'paid', 'paid-search', 'paid_search', 'display'].includes(medium),
  );
};

async function getLeadPipelineSummary(): Promise<DeveloperLeadPipelineSummary> {
  if (!isSupabaseConfigured()) {
    return emptyPipeline(
      'unavailable',
      'Lead progress is unavailable until Supabase admin access is configured.',
    );
  }

  try {
    const result = await withTimeout(
      getSupabaseAdmin()
        .from('leads')
        .select(
          'id, status, utm_source, utm_medium, utm_campaign, gclid, gbraid, wbraid, created_at',
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .limit(5000),
      DEVELOPER_ANALYTICS_TIMEOUT_MS,
      'Developer lead pipeline summary',
    );

    if (result.error) {
      console.error('Developer lead pipeline query failed:', result.error);
      return emptyPipeline(
        'error',
        'Lead progress is temporarily unavailable. Check the lead attribution migration.',
      );
    }

    const rows = Array.isArray(result.data)
      ? (result.data as LeadPipelineRow[])
      : [];
    const stages = emptyLeadStages();
    rows.forEach((row) => {
      const status = isLeadStatus(row.status) ? row.status : 'new';
      stages[status] += 1;
    });
    const paidRows = rows.filter(isPaidLead);
    const windowStart = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const paidAttributedWindow = paidRows.filter(
      (row) => Date.parse(String(row.created_at || '')) >= windowStart,
    ).length;
    const total = result.count ?? rows.length;

    return {
      status: 'available',
      notice:
        total > rows.length
          ? `Stage totals use the latest ${rows.length.toLocaleString()} of ${total.toLocaleString()} leads.`
          : null,
      total,
      sampled: rows.length,
      paidAttributed: paidRows.length,
      paidAttributedWindow,
      stages,
      progressed:
        stages.contacted + stages.qualified + stages.quoted + stages.won + stages.lost,
      openOpportunities: stages.contacted + stages.qualified + stages.quoted,
      won: stages.won,
      lost: stages.lost,
      topPaidCampaigns: countBy(
        paidRows.map((row) =>
          String(
            row.utm_campaign ||
              row.utm_source ||
              (row.gclid || row.gbraid || row.wbraid ? 'Google Ads (unlabelled)' : ''),
          ),
        ),
        'Paid campaign (unlabelled)',
      ),
    };
  } catch (error) {
    console.error('Developer lead pipeline request failed:', error);
    return emptyPipeline(
      'error',
      'Lead progress is temporarily unavailable. Please retry.',
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
  const [dashboard, analytics, pipeline] = await Promise.all([
    getAdminDashboardData(),
    getAnalyticsSummary(),
    getLeadPipelineSummary(),
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
  const googleAdsLeadConversionConfigured = hasConfiguredValue(
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_CONVERSION_LABEL ||
      process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL,
  );
  const websiteAttributedLeads = pipeline.paidAttributedWindow;
  const websiteAttributedConversionRate =
    analytics.paid.visitors > 0
      ? Number(((websiteAttributedLeads / analytics.paid.visitors) * 100).toFixed(2))
      : null;

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
    pipeline,
    advertising: {
      tagConfigured: googleAdsConfigured,
      leadConversionConfigured: googleAdsLeadConversionConfigured,
      reportingApiConnected: false,
      notice:
        googleAdsConfigured && googleAdsLeadConversionConfigured
          ? 'Google Ads tag and lead conversion action are active. Website-attributed visits and leads are shown below. Authoritative impressions, ad clicks, spend, and cost per lead require a separate Google Ads reporting API connection.'
          : googleAdsConfigured
            ? 'Google Ads destination tag is active, so paid-click attribution works. The Google Ads lead conversion label is not configured yet, so form leads may not appear as conversions inside Google Ads.'
            : 'Google Ads tag is not configured. Paid-click attribution and Ads conversion measurement need attention.',
      websiteAttributed: {
        visitors: analytics.paid.visitors,
        pageViews: analytics.paid.pageViews,
        contactActions: analytics.paid.contactActions,
        leads: websiteAttributedLeads,
        conversionRate: websiteAttributedConversionRate,
      },
      authoritative: {
        impressions: null,
        clicks: null,
        spend: null,
        conversions: null,
        costPerLead: null,
      },
    },
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
        key: 'developer-pin',
        label: 'Developer PIN lock',
        healthy: true,
        detail: 'Owner-bound, rate-limited PIN verification and a short-lived HttpOnly unlock session are active.',
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
        label: 'Google Ads measurement tag',
        healthy: googleAdsConfigured,
        detail: googleAdsConfigured
          ? 'The Google Ads destination is configured for conversion measurement.'
          : 'Google Ads id is not configured.',
      },
      {
        key: 'google-ads-reporting',
        label: 'Google Ads reporting API',
        healthy: false,
        detail:
          'Not connected. Impressions, spend, ad-platform clicks and CPL remain unavailable until OAuth reporting credentials are added.',
      },
      {
        key: 'google-ads-lead-conversion',
        label: 'Google Ads lead conversion action',
        healthy: googleAdsLeadConversionConfigured,
        detail: googleAdsLeadConversionConfigured
          ? 'The form-lead conversion label is configured.'
          : 'Add the real lead conversion label from Google Ads; it cannot be guessed from the AW account ID.',
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
