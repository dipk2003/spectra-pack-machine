import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import {
  deleteProduct,
  getProductById,
  updateProduct,
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

    const product = await getProductById(params.id, { access: 'admin' });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
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

    const existing = await getProductById(params.id, { access: 'admin' });
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: rateLimit.headers },
      );
    }

    const body = await req.json();
    const product = await updateProduct(params.id, { ...existing, ...body });
    await cleanupUnusedManagedAssets(
      [existing.image, existing.gallery],
      [product.image, product.gallery],
    );
    return NextResponse.json(product, { headers: rateLimit.headers });
  } catch (error: unknown) {
    if (getErrorCode(error) === '23505') {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 409, headers: rateLimit.headers },
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes('required') || error.message.includes('valid category'))
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimit.headers },
      );
    }
    console.error('Failed to update product:', error);
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

    const existing = await getProductById(params.id, { access: 'admin' });
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: rateLimit.headers },
      );
    }

    await deleteProduct(params.id);
    await cleanupUnusedManagedAssets([existing.image, existing.gallery]);
    return NextResponse.json({ success: true }, { headers: rateLimit.headers });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}
