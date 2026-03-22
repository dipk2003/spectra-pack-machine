import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getCatalogPath, listSiteSettings, upsertSiteSetting } from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest(req);
    const catalogPath = await getCatalogPath();

    if (!isAdmin) {
      return NextResponse.json({ catalogPath });
    }

    const settings = await listSiteSettings();
    return NextResponse.json({ catalogPath, settings });
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: SUPABASE_ADMIN_CONFIG_MESSAGE, code: 'SUPABASE_ADMIN_NOT_CONFIGURED' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const setting = await upsertSiteSetting(body);
    return NextResponse.json(setting);
  } catch (error: unknown) {
    if (getErrorCode(error) === '23505') {
      return NextResponse.json(
        { error: 'Setting with this key already exists' },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to update site setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
