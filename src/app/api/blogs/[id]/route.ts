import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { deleteBlog, getBlogById, updateBlog } from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blog = await getBlogById(params.id, { access: 'admin' });
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Failed to fetch blog:', error);
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

    const existing = await getBlogById(params.id, { access: 'admin' });
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: rateLimit.headers },
      );
    }

    const body = await req.json();
    const blog = await updateBlog(params.id, { ...existing, ...body });
    return NextResponse.json(blog, { headers: rateLimit.headers });
  } catch (error: unknown) {
    if (getErrorCode(error) === '23505') {
      return NextResponse.json(
        { error: 'Blog with this slug already exists' },
        { status: 409, headers: rateLimit.headers },
      );
    }
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimit.headers },
      );
    }
    console.error('Failed to update blog:', error);
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

    await deleteBlog(params.id);
    return NextResponse.json({ success: true }, { headers: rateLimit.headers });
  } catch (error) {
    console.error('Failed to delete blog:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}
