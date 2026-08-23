'use client';

import { FormEvent, useState } from 'react';
import { KeyRound, Loader2, LockKeyhole, ShieldAlert } from 'lucide-react';
import styles from './page.module.css';

type DeveloperPinGateProps = {
  mode: 'setup' | 'unlock' | 'unavailable';
  notice?: string | null;
};

export default function DeveloperPinGate({ mode, notice }: DeveloperPinGateProps) {
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isSetup = mode === 'setup';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(pin)) {
      setError('PIN exactly 6 digits ka hona chahiye.');
      return;
    }
    if (isSetup && pin !== confirmation) {
      setError('Dono PIN match nahi kar rahe.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/developer/pin', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isSetup ? 'setup' : 'unlock', pin }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          typeof result?.error === 'string'
            ? result.error
            : 'Developer panel unlock nahi ho paya.',
        );
      }

      setPin('');
      setConfirmation('');
      window.location.reload();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Developer panel unlock nahi ho paya.',
      );
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pinGate}>
      <section className={styles.pinCard} aria-labelledby="developer-pin-heading">
        <span className={styles.pinIcon} aria-hidden="true">
          {mode === 'unavailable' ? <ShieldAlert size={30} /> : <LockKeyhole size={30} />}
        </span>
        <h1 id="developer-pin-heading">
          {mode === 'setup'
            ? 'Create Developer PIN'
            : mode === 'unlock'
              ? 'Unlock Developer Operations'
              : 'Developer Security Unavailable'}
        </h1>
        <p>
          {mode === 'setup'
            ? 'Dipanshu owner account ke liye apna private 6-digit PIN set karein. PIN server par protected form mein store hoga.'
            : mode === 'unlock'
              ? 'Ads leads, website reach aur lead progress dekhne ke liye 6-digit PIN enter karein.'
              : notice || 'Secure PIN storage is temporarily unavailable.'}
        </p>

        {mode !== 'unavailable' && (
          <form className={styles.pinForm} onSubmit={(event) => void submit(event)}>
            <label htmlFor="developer-pin">{isSetup ? 'New 6-digit PIN' : 'Developer PIN'}</label>
            <div className={styles.pinInputWrap}>
              <KeyRound size={18} aria-hidden="true" />
              <input
                id="developer-pin"
                name="developer-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                autoComplete={isSetup ? 'new-password' : 'current-password'}
                value={pin}
                disabled={submitting}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
              />
            </div>

            {isSetup && (
              <>
                <label htmlFor="developer-pin-confirmation">Confirm PIN</label>
                <div className={styles.pinInputWrap}>
                  <KeyRound size={18} aria-hidden="true" />
                  <input
                    id="developer-pin-confirmation"
                    name="developer-pin-confirmation"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    autoComplete="new-password"
                    value={confirmation}
                    disabled={submitting}
                    onChange={(event) =>
                      setConfirmation(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    required
                  />
                </div>
              </>
            )}

            {error && <div className={styles.pinError} role="alert">{error}</div>}
            <button type="submit" className={styles.pinSubmit} disabled={submitting}>
              {submitting ? <Loader2 className={styles.spinning} size={18} /> : <LockKeyhole size={18} />}
              {submitting ? 'Checking…' : isSetup ? 'Set PIN & Open' : 'Unlock Dashboard'}
            </button>
          </form>
        )}

        {mode !== 'unavailable' && (
          <small>5 wrong attempts ke baad 15 minutes ka security lock lagega.</small>
        )}
      </section>
    </div>
  );
}
