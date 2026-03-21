import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createBlog, listBlogs } from '@/lib/cms';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest(req);
    const blogs = await listBlogs({ publishedOnly: !isAdmin });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const blog = await createBlog(body);
    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Blog with this slug already exists' }, { status: 409 });
    }
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to create blog:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
