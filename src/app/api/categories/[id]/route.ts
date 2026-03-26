import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';
import { cleanupUnusedManagedAssets } from '@/lib/storage-assets';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = await getCategoryById(params.id, { access: 'admin' });
    if (!category) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existing = await getCategoryById(params.id, { access: 'admin' });
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: rateLimit.headers },
      );
    }

    const body = await req.json();
    const category = await updateCategory(params.id, { ...existing, ...body });
    await cleanupUnusedManagedAssets([existing.image], [category.image]);
    return NextResponse.json(category, { headers: rateLimit.headers });
  } catch (error: unknown) {
    if (getErrorCode(error) === '23505') {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409, headers: rateLimit.headers },
      );
    }
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimit.headers },
      );
    }
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existing = await getCategoryById(params.id, { access: 'admin' });
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: rateLimit.headers },
      );
    }

    await deleteCategory(params.id);
    await cleanupUnusedManagedAssets([existing.image]);
    return NextResponse.json({ success: true }, { headers: rateLimit.headers });
  } catch (error: unknown) {
    if (getErrorCode(error) === '23503') {
      return NextResponse.json(
        { error: 'Category cannot be deleted while products are still assigned to it' },
        { status: 409, headers: rateLimit.headers },
      );
    }
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}
