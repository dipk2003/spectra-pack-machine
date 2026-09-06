import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createMeeting, listMeetings, normalizeMeetingInput } from '@/lib/cms';
import {
  buildMeetingLink,
  sendMeetingOwnerNotificationEmail,
  sendMeetingScheduledEmail,
} from '@/lib/notifications';
import {
  enforcePublicFormProtection,
  readPublicFormInput,
  PublicFormProtectionError,
  SilentSpamBlockError,
} from '@/lib/public-form-protection';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  isSupabaseConfigured,
  SUPABASE_ADMIN_CONFIG_MESSAGE,
} from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const rateLimit = await enforceMappedRateLimit(req);
  if (rateLimit.limitedResponse) {
    return rateLimit.limitedResponse;
  }

  try {
    const body = await readPublicFormInput(req);
    await enforcePublicFormProtection(req, body);
    const meetingInput = normalizeMeetingInput(body);
    const meetingLink = buildMeetingLink(meetingInput);
    const meeting = await createMeeting({ ...meetingInput, meetingLink });
    let emailSent = false;
    let ownerEmailSent = false;

    try {
      const result = await sendMeetingOwnerNotificationEmail({
        name: meeting.name,
        email: meeting.email,
        phone: meeting.phone,
        company: meeting.company,
        machineInterest: meeting.machineInterest,
        date: meeting.date,
        time: meeting.time,
        message: meeting.message,
        meetingLink: meeting.meetingLink,
      });
      ownerEmailSent = result.sent;
    } catch (emailError) {
      console.error('Meeting owner email failed:', emailError);
    }

    try {
      const result = await sendMeetingScheduledEmail({
        email: meeting.email,
        name: meeting.name,
        date: meeting.date,
        time: meeting.time,
        meetingLink: meeting.meetingLink,
      });
      emailSent = result.sent;
    } catch (emailError) {
      console.error('Meeting customer email failed:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        id: meeting.id,
        meetingLink: meeting.meetingLink,
        emailSent,
        ownerEmailSent,
      },
      { status: 201, headers: rateLimit.headers },
    );
  } catch (error) {
    if (error instanceof SilentSpamBlockError) {
      return NextResponse.json(
        { success: true, id: '', meetingLink: '', emailSent: false },
        { status: 201, headers: rateLimit.headers },
      );
    }
    if (error instanceof PublicFormProtectionError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimit.headers },
      );
    }
    console.error('Meeting creation error:', error);
    if (
      error instanceof Error &&
      (error.message.includes('required') || error.message.includes('invalid'))
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimit.headers },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimit.headers },
    );
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
