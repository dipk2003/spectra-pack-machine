import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createBlog, listBlogs } from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest(req);
    const blogs = await listBlogs({
      publishedOnly: !isAdmin,
      access: isAdmin ? 'admin' : 'public',
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
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
    const blog = await createBlog(body);
    return NextResponse.json(blog, { status: 201, headers: rateLimit.headers });
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
    console.error('Failed to create blog:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}
