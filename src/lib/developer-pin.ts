import 'server-only';

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getNextAuthSecret } from './runtime-config';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

export const DEVELOPER_PIN_SETTING_KEY = 'developer_panel_pin_hash';
export const DEVELOPER_PIN_LENGTH = 6;

const DEVELOPER_PIN_TOKEN_VERSION = 1;
const DEVELOPER_PIN_COOKIE_TTL_SECONDS = 30 * 60;
const BCRYPT_ROUNDS = 12;
const PIN_PATTERN = /^\d{6}$/;

type DeveloperPinTokenPayload = {
  v: number;
  sub: string;
  exp: number;
  nonce: string;
  verifier: string;
};

export type DeveloperPinState = {
  available: boolean;
  configured: boolean;
  notice: string | null;
  hash: string | null;
};

const getSigningSecret = () => {
  const secret = getNextAuthSecret();
  if (!secret) {
    throw new Error('The admin session secret is not configured.');
  }
  return secret;
};

const encodeBase64Url = (value: string | Buffer) =>
  Buffer.from(value).toString('base64url');

const decodeBase64Url = (value: string) =>
  Buffer.from(value, 'base64url').toString('utf8');

const getPinMaterial = (pin: string) =>
  createHmac('sha256', getSigningSecret())
    .update(`spectra-developer-pin:v1:${pin}`)
    .digest('hex');

const getVerifierFingerprint = (hash: string) =>
  createHash('sha256').update(hash).digest('base64url').slice(0, 32);

const signPayload = (encodedPayload: string) =>
  createHmac('sha256', getSigningSecret()).update(encodedPayload).digest('base64url');

const safeSignatureEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
};

export const isValidDeveloperPin = (value: unknown): value is string =>
  typeof value === 'string' && PIN_PATTERN.test(value);

export const getDeveloperPinCookieName = () =>
  process.env.NODE_ENV === 'production'
    ? '__Host-spectra-developer-pin'
    : 'spectra-developer-pin';

export const getDeveloperPinCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: DEVELOPER_PIN_COOKIE_TTL_SECONDS,
});

export async function getDeveloperPinState(): Promise<DeveloperPinState> {
  if (!isSupabaseConfigured()) {
    return {
      available: false,
      configured: false,
      notice: 'Secure PIN storage is unavailable until Supabase admin access is configured.',
      hash: null,
    };
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('site_settings')
      .select('value')
      .eq('key', DEVELOPER_PIN_SETTING_KEY)
      .maybeSingle();

    if (error) {
      console.error('Developer PIN state query failed:', error);
      return {
        available: false,
        configured: false,
        notice: 'Secure PIN storage is temporarily unavailable.',
        hash: null,
      };
    }

    const hash = typeof data?.value === 'string' ? data.value.trim() : '';
    const configured = /^\$2[aby]\$/.test(hash);
    return {
      available: true,
      configured,
      notice: configured ? null : 'Create a 6-digit PIN to protect Developer Operations.',
      hash: configured ? hash : null,
    };
  } catch (error) {
    console.error('Developer PIN state request failed:', error);
    return {
      available: false,
      configured: false,
      notice: 'Secure PIN storage is temporarily unavailable.',
      hash: null,
    };
  }
}

export async function configureDeveloperPin(pin: string) {
  if (!isValidDeveloperPin(pin)) {
    throw new Error('PIN must contain exactly 6 digits.');
  }

  const currentState = await getDeveloperPinState();
  if (!currentState.available) {
    throw new Error(currentState.notice || 'Secure PIN storage is unavailable.');
  }
  if (currentState.configured) {
    throw new Error('Developer PIN is already configured.');
  }

  const hash = await bcrypt.hash(getPinMaterial(pin), BCRYPT_ROUNDS);
  const { error } = await getSupabaseAdmin().from('site_settings').insert({
    key: DEVELOPER_PIN_SETTING_KEY,
    value: hash,
    json_value: null,
    label: 'Developer panel PIN verifier',
    description: 'Private server-side verifier. Never return this setting through admin APIs.',
  });

  if (error) {
    throw error;
  }

  return hash;
}

export async function verifyDeveloperPin(pin: string, hash: string) {
  if (!isValidDeveloperPin(pin) || !/^\$2[aby]\$/.test(hash)) return false;
  try {
    return await bcrypt.compare(getPinMaterial(pin), hash);
  } catch {
    return false;
  }
}

export function createDeveloperUnlockToken(userId: string, pinHash: string) {
  const payload: DeveloperPinTokenPayload = {
    v: DEVELOPER_PIN_TOKEN_VERSION,
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + DEVELOPER_PIN_COOKIE_TTL_SECONDS,
    nonce: randomBytes(16).toString('base64url'),
    verifier: getVerifierFingerprint(pinHash),
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyDeveloperUnlockToken(
  token: string,
  userId: string,
  pinHash: string,
) {
  try {
    const [encodedPayload, signature, extra] = token.split('.');
    if (!encodedPayload || !signature || extra) return false;
    if (!safeSignatureEqual(signature, signPayload(encodedPayload))) return false;

    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as DeveloperPinTokenPayload;
    return Boolean(
      payload &&
        payload.v === DEVELOPER_PIN_TOKEN_VERSION &&
        payload.sub === userId &&
        Number.isSafeInteger(payload.exp) &&
        payload.exp > Math.floor(Date.now() / 1000) &&
        typeof payload.nonce === 'string' &&
        payload.nonce.length >= 16 &&
        payload.verifier === getVerifierFingerprint(pinHash),
    );
  } catch {
    return false;
  }
}

export async function isDeveloperPinUnlocked(
  userId: string,
  state?: DeveloperPinState,
) {
  const currentState = state || (await getDeveloperPinState());
  if (!currentState.available || !currentState.configured || !currentState.hash) {
    return false;
  }

  const token = cookies().get(getDeveloperPinCookieName())?.value || '';
  return verifyDeveloperUnlockToken(token, userId, currentState.hash);
}
