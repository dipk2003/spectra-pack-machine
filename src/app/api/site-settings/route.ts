import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getCatalogPath, getSiteSetting, listSiteSettings, upsertSiteSetting } from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';
import { parseHeroCarouselOverrideMap } from '@/lib/home-hero';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest(req);
    const access = isAdmin ? 'admin' : 'public';
    const catalogPath = await getCatalogPath({ access });
    const heroCarouselSetting = await getSiteSetting('hero_carousel_overrides', { access });
    const heroCarouselOverrides = parseHeroCarouselOverrideMap(
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
      return NextResponse.json({ catalogPath, heroCarouselOverrides });
    }

    const settings = await listSiteSettings({ access: 'admin' });
    return NextResponse.json({ catalogPath, heroCarouselOverrides, settings });
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
    const setting = await upsertSiteSetting(body);
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
