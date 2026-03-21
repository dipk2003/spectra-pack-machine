import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createCategory, listCategories } from '@/lib/cms';
import { getErrorCode } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest(req);
    const categories = await listCategories({ publishedOnly: !isAdmin });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const category = await createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (getErrorCode(error) === '23505') {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
