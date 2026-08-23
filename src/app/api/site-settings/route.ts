import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getCatalogPath, getSiteSetting, listSiteSettings, upsertSiteSetting } from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';
import { parseHeroCarouselSettings } from '@/lib/home-hero';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';
import { cleanupUnusedManagedAssets } from '@/lib/storage-assets';

const PRIVATE_SETTING_KEYS = new Set(['developer_panel_pin_hash']);
const normalizeSettingKey = (value: unknown) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest(req);
    const access = isAdmin ? 'admin' : 'public';
    const catalogPath = await getCatalogPath({ access });
    const heroCarouselSetting = await getSiteSetting('hero_carousel_overrides', { access });
    const heroCarouselSettings = parseHeroCarouselSettings(
      (() => {
        if (heroCarouselSetting?.jsonValue) {
          return heroCarouselSetting.jsonValue;
        }

        try {
          return heroCarouselSetting?.value ? JSON.parse(heroCarouselSetting.value) : {};
        } catch {
          return {};
        }
      })(),
    );

    if (!isAdmin) {
      return NextResponse.json({
        catalogPath,
        heroCarouselOverrides: heroCarouselSettings.overrides,
        heroCarouselSettings,
      });
    }

    const settings = (await listSiteSettings({ access: 'admin' })).filter(
      (setting) => !PRIVATE_SETTING_KEYS.has(setting.key),
    );
    return NextResponse.json({
      catalogPath,
      heroCarouselOverrides: heroCarouselSettings.overrides,
      heroCarouselSettings,
      settings,
    });
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = await enforceMappedRateLimit(req);
  if (rateLimit.limitedResponse) {
    return rateLimit.limitedResponse;
  }

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: SUPABASE_ADMIN_CONFIG_MESSAGE, code: 'SUPABASE_ADMIN_NOT_CONFIGURED' },
        { status: 503, headers: rateLimit.headers },
      );
    }

    const body = await req.json();
    if (PRIVATE_SETTING_KEYS.has(normalizeSettingKey(body?.key))) {
      return NextResponse.json(
        { error: 'This private setting can only be managed by its secure endpoint.' },
        { status: 403, headers: rateLimit.headers },
      );
    }
    const existing = await getSiteSetting(String(body?.key || ''), { access: 'admin' });
    const setting = await upsertSiteSetting(body);
    await cleanupUnusedManagedAssets(
      [existing?.jsonValue, existing?.value],
      [body?.jsonValue, body?.value, setting.jsonValue, setting.value],
    );
    return NextResponse.json(setting, { headers: rateLimit.headers });
  } catch (error: unknown) {
    if (getErrorCode(error) === '23505') {
      return NextResponse.json(
        { error: 'Setting with this key already exists' },
        { status: 409, headers: rateLimit.headers },
      );
    }
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimit.headers },
      );
    }
    console.error('Failed to update site setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}
