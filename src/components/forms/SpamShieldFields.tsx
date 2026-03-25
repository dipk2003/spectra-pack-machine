'use client';

import Script from 'next/script';
import { useEffect, useId, useRef, useState } from 'react';
import {
  SPAM_HONEYPOT_FIELD,
  SPAM_STARTED_AT_FIELD,
  SPAM_TURNSTILE_TOKEN_FIELD,
} from '@/lib/spam-shield';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      reset?: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

type SpamShieldFieldsProps = {
  honeypotValue: string;
  formStartedAt: string;
  turnstileToken: string;
  onHoneypotChange: (value: string) => void;
  onTurnstileTokenChange: (value: string) => void;
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

const visuallyHiddenStyle = {
  position: 'absolute',
  left: '-10000px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
} as const;

export default function SpamShieldFields({
  honeypotValue,
  formStartedAt,
  turnstileToken,
  onHoneypotChange,
  onTurnstileTokenChange,
}: SpamShieldFieldsProps) {
  const honeypotId = useId().replace(/:/g, '');
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileTokenChangeRef = useRef(onTurnstileTokenChange);
  const [turnstileReady, setTurnstileReady] = useState(false);

  useEffect(() => {
    turnstileTokenChangeRef.current = onTurnstileTokenChange;
  }, [onTurnstileTokenChange]);

  useEffect(() => {
    if (turnstileSiteKey && window.turnstile) {
      setTurnstileReady(true);
    }
  }, []);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileReady || !window.turnstile || !turnstileRef.current) {
      return;
    }

    if (!turnstileWidgetIdRef.current) {
      turnstileWidgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: (token) => {
          turnstileTokenChangeRef.current(token);
        },
        'expired-callback': () => {
          turnstileTokenChangeRef.current('');
        },
        'error-callback': () => {
          turnstileTokenChangeRef.current('');
        },
      });
    }

    return () => {
      if (turnstileWidgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileReady]);

  useEffect(() => {
    if (turnstileWidgetIdRef.current && window.turnstile?.reset) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }, [formStartedAt]);

  return (
    <>
      <div aria-hidden="true" style={visuallyHiddenStyle}>
        <label htmlFor={honeypotId}>Website</label>
        <input
          id={honeypotId}
          name={SPAM_HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={honeypotValue}
          onChange={(event) => onHoneypotChange(event.target.value)}
        />
      </div>
      <input type="hidden" name={SPAM_STARTED_AT_FIELD} value={formStartedAt} />
      <input type="hidden" name={SPAM_TURNSTILE_TOKEN_FIELD} value={turnstileToken} />
      {turnstileSiteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="lazyOnload"
            onReady={() => setTurnstileReady(true)}
          />
          <div ref={turnstileRef} />
        </>
      ) : null}
    </>
  );
}
