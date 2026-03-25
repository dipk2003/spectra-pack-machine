import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createLead, getCatalogPath, listLeads, normalizeLeadInput } from '@/lib/cms';
import { sendCatalogEmail, sendContactThankYouEmail } from '@/lib/notifications';
import {
  enforcePublicFormProtection,
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
    const body = await req.json();
    await enforcePublicFormProtection(req, body);
    const leadInput = normalizeLeadInput(body);
    const lead = await createLead(leadInput);
    let emailSent = false;
    const machineInterest =
      typeof body.machineInterest === 'string' ? body.machineInterest.trim() : '';

    try {
      if (leadInput.source === 'homepage-lead-magnet') {
        const catalogPath = await getCatalogPath();
        const result = await sendCatalogEmail({
          email: leadInput.email,
          name: leadInput.name,
          machineInterest,
          catalogPath,
        });
        emailSent = result.sent;
      } else if (leadInput.source === 'contact') {
        const result = await sendContactThankYouEmail({
          email: leadInput.email,
          name: leadInput.name,
        });
        emailSent = result.sent;
      }
    } catch (emailError) {
      console.error('Lead email failed:', emailError);
    }

    return NextResponse.json(
      { success: true, id: lead.id, emailSent },
      { status: 201, headers: rateLimit.headers },
    );
  } catch (error) {
    if (error instanceof SilentSpamBlockError) {
      return NextResponse.json(
        { success: true, id: '', emailSent: false },
        { status: 201, headers: rateLimit.headers },
      );
    }
    if (error instanceof PublicFormProtectionError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimit.headers },
      );
    }
    console.error('Lead creation error:', error);
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

    const leads = await listLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Lead fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
