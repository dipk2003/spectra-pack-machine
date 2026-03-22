import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createMeeting, listMeetings } from '@/lib/cms';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const meeting = await createMeeting(body);

    return NextResponse.json({ success: true, id: meeting.id }, { status: 201 });
  } catch (error) {
    console.error('Meeting creation error:', error);
    if (
      error instanceof Error &&
      (error.message.includes('required') || error.message.includes('invalid'))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: SUPABASE_ADMIN_CONFIG_MESSAGE,
          code: 'SUPABASE_ADMIN_NOT_CONFIGURED',
        },
        { status: 503 },
      );
    }

    const meetings = await listMeetings();
    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Meeting fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}
