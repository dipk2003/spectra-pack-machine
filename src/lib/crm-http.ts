import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { CrmAccessError, CrmSchemaError, CrmValidationError } from './crm';
import { isTrustedCrmRequest } from './crm-policy';

export const CRM_PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  Vary: 'Cookie',
};

export const crmHeaders = (extra?: HeadersInit) => {
  const headers = new Headers(CRM_PRIVATE_HEADERS);
  if (extra) new Headers(extra).forEach((value, key) => headers.set(key, value));
  return headers;
};

export const isTrustedCrmMutation = (req: NextRequest) =>
  isTrustedCrmRequest(req.headers, req.nextUrl.origin);

export const readCrmInput = async (req: NextRequest, maxBytes = 24_000): Promise<Record<string, unknown>> => {
  const declaredLength = Number(req.headers.get('content-length') || '0');
  if (declaredLength > maxBytes) throw new CrmValidationError('Request is too large.');
  const reader = req.body?.getReader();
  if (!reader) throw new CrmValidationError('A JSON object is required.');
  const decoder = new TextDecoder();
  let body = '';
  let bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new CrmValidationError('Request is too large.');
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
    const input: unknown = JSON.parse(body);
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new CrmValidationError('A JSON object is required.');
    }
    return input as Record<string, unknown>;
  } catch (error) {
    if (error instanceof CrmValidationError) throw error;
    throw new CrmValidationError('Provide a valid JSON object.');
  } finally {
    reader.releaseLock();
  }
};

export const crmErrorResponse = (error: unknown, extraHeaders?: HeadersInit) => {
  if (error instanceof CrmValidationError) {
    return NextResponse.json(
      { error: error.message, code: 'CRM_VALIDATION_ERROR' },
      { status: error.message === 'Lead not found.' ? 404 : 400, headers: crmHeaders(extraHeaders) },
    );
  }

  if (error instanceof CrmAccessError) {
    return NextResponse.json(
      { error: error.message, code: 'CRM_ACCESS_DENIED' },
      { status: 403, headers: crmHeaders(extraHeaders) },
    );
  }

  if (error instanceof CrmSchemaError) {
    return NextResponse.json(
      { error: error.message, code: 'CRM_MIGRATION_REQUIRED' },
      { status: 503, headers: crmHeaders(extraHeaders) },
    );
  }

  console.error('CRM request failed:', error instanceof Error ? error.name : 'DatabaseError');
  return NextResponse.json(
    { error: 'CRM is temporarily unavailable.', code: 'CRM_UNAVAILABLE' },
    { status: 500, headers: crmHeaders(extraHeaders) },
  );
};

export const crmUnauthorizedResponse = () =>
  NextResponse.json(
    { error: 'Please sign in to the CRM.', code: 'CRM_UNAUTHORIZED' },
    { status: 401, headers: crmHeaders() },
  );

export const crmOriginResponse = () =>
  NextResponse.json(
    { error: 'Request origin was rejected.', code: 'CRM_ORIGIN_REJECTED' },
    { status: 403, headers: crmHeaders() },
  );
