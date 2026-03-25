export const SPAM_HONEYPOT_FIELD = 'website';
export const SPAM_STARTED_AT_FIELD = 'formStartedAt';
export const SPAM_TURNSTILE_TOKEN_FIELD = 'turnstileToken';

export type SpamShieldPayload = {
  website: string;
  formStartedAt: string;
  turnstileToken: string;
};

export function createSpamShieldPayload(): SpamShieldPayload {
  return {
    website: '',
    formStartedAt: String(Date.now()),
    turnstileToken: '',
  };
}
