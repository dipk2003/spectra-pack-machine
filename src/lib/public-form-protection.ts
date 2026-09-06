import type { NextRequest } from 'next/server';
import {
  SPAM_HONEYPOT_FIELD,
  SPAM_STARTED_AT_FIELD,
  SPAM_TURNSTILE_TOKEN_FIELD,
} from './spam-shield';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MIN_FORM_COMPLETION_MS = 1200;
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 12;

type TurnstileResponse = {
  success?: boolean;
};

export class SilentSpamBlockError extends Error {
  constructor() {
    super('Spam submission blocked silently.');
    this.name = 'SilentSpamBlockError';
  }
}

export class PublicFormProtectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublicFormProtectionError';
  }
}

/** Bound untrusted input before JSON parsing; never trust Content-Length alone. */
export async function readPublicFormInput(req: NextRequest): Promise<Record<string, unknown>> {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new PublicFormProtectionError('A JSON form submission is required.');
  }
  if (req.headers.get('sec-fetch-site') === 'cross-site') {
    throw new PublicFormProtectionError('Invalid form origin.');
  }
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) throw new PublicFormProtectionError('Invalid form origin.');
  const reader = req.body?.getReader();
  if (!reader) throw new PublicFormProtectionError('Invalid form submission.');
  let bytes = 0;
  let body = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 24000) {
        await reader.cancel();
        throw new PublicFormProtectionError('Form submission is too large.');
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
    const input: unknown = JSON.parse(body);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid object');
    return input as Record<string, unknown>;
  } catch (error) {
    if (error instanceof PublicFormProtectionError) throw error;
    throw new PublicFormProtectionError('Invalid form submission. Please reload and try again.');
  } finally {
    reader.releaseLock();
  }
}

const hasTurnstileConfig = () =>
  Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() &&
      process.env.TURNSTILE_SECRET_KEY?.trim(),
  );

const readClientIp = (req: NextRequest) =>
  req.headers.get('cf-connecting-ip') ||
  req.headers.get('x-real-ip') ||
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  '';

async function verifyTurnstile(req: NextRequest, token: string) {
  const formData = new URLSearchParams();
  formData.set('secret', process.env.TURNSTILE_SECRET_KEY || '');
  formData.set('response', token);

  const remoteIp = readClientIp(req);
  if (remoteIp) {
    formData.set('remoteip', remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new PublicFormProtectionError(
      'Verification service is unavailable. Please try again.',
    );
  }

  const payload = (await response.json().catch(() => null)) as TurnstileResponse | null;
  if (!payload?.success) {
    throw new PublicFormProtectionError(
      'Please complete the verification challenge and retry.',
    );
  }
}

export async function enforcePublicFormProtection(
  req: NextRequest,
  input: Record<string, unknown>,
) {
  const honeypot = String(input[SPAM_HONEYPOT_FIELD] || '').trim();
  if (honeypot) {
    throw new SilentSpamBlockError();
  }

  const startedAt = Number(input[SPAM_STARTED_AT_FIELD]);
  if (!Number.isFinite(startedAt)) {
    throw new PublicFormProtectionError('Invalid form submission. Please reload and try again.');
  }

  const ageMs = Date.now() - startedAt;
  if (ageMs < MIN_FORM_COMPLETION_MS) {
    throw new PublicFormProtectionError('Please wait a moment before submitting.');
  }

  if (ageMs > MAX_FORM_AGE_MS) {
    throw new PublicFormProtectionError(
      'This form session has expired. Please refresh the page and try again.',
    );
  }

  if (!hasTurnstileConfig()) {
    return;
  }

  const turnstileToken = String(input[SPAM_TURNSTILE_TOKEN_FIELD] || '').trim();
  if (!turnstileToken) {
    throw new PublicFormProtectionError(
      'Please complete the verification challenge before submitting.',
    );
  }

  await verifyTurnstile(req, turnstileToken);
}
