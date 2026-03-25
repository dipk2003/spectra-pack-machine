import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createProduct, listProducts } from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest(req);
    const products = await listProducts({
      publishedOnly: !isAdmin,
      access: isAdmin ? 'admin' : 'public',
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
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
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201, headers: rateLimit.headers });
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
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}
