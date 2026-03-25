import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import { storeUploadedImage } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = await enforceMappedRateLimit(req);
  if (rateLimit.limitedResponse) {
    return rateLimit.limitedResponse;
  }

  try {
    const formData = await req.formData();
    const fileEntry = formData.get('file');
    const folderEntry = formData.get('folder');

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: 'Image file is required.' },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const folder = typeof folderEntry === 'string' ? folderEntry : 'general';
    const url = await storeUploadedImage(fileEntry, folder);

    return NextResponse.json({ url }, { headers: rateLimit.headers });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Image upload failed. Please retry.',
      },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
