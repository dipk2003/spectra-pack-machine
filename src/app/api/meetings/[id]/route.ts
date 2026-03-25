import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getMeetingById, updateMeeting } from '@/lib/cms';
import { sendMeetingUpdateEmail } from '@/lib/notifications';
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

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: SUPABASE_ADMIN_CONFIG_MESSAGE,
          code: 'SUPABASE_ADMIN_NOT_CONFIGURED',
        },
        { status: 503 },
      );
    }

    const meeting = await getMeetingById(params.id);
    if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Failed to fetch meeting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
        {
          error: SUPABASE_ADMIN_CONFIG_MESSAGE,
          code: 'SUPABASE_ADMIN_NOT_CONFIGURED',
        },
        { status: 503, headers: rateLimit.headers },
      );
    }

    const body = await req.json();
    const meeting = await updateMeeting(params.id, body);

    if (body.sendEmailNotification) {
      try {
        await sendMeetingUpdateEmail({
          email: meeting.email,
          name: meeting.name,
          date: meeting.date,
          time: meeting.time,
          meetingLink: meeting.meetingLink,
          status: meeting.status,
          adminNotes: meeting.adminNotes,
        });
      } catch (emailError) {
        console.error('Meeting update email failed:', emailError);
      }
    }

    return NextResponse.json(meeting, { headers: rateLimit.headers });
  } catch (error) {
    console.error('Failed to update meeting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: rateLimit.headers });
  }
}
