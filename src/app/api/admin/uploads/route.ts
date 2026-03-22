import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { storeUploadedImage } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const fileEntry = formData.get('file');
    const folderEntry = formData.get('folder');

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    const folder = typeof folderEntry === 'string' ? folderEntry : 'general';
    const url = await storeUploadedImage(fileEntry, folder);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Image upload failed. Please retry.',
      },
      { status: 500 },
    );
  }
}
