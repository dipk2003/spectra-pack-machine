'use client';

import '@/lib/init-auth-env';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { COMPANY_INFO } from '@/lib/data';
import styles from './page.module.css';

const LOGIN_TIMEOUT_MS = 25_000;

class LoginTimeoutError extends Error {
  constructor() {
    super('Login request timed out.');
    this.name = 'LoginTimeoutError';
  }
}

const withLoginTimeout = <T,>(operation: Promise<T>) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(
      () => reject(new LoginTimeoutError()),
      LOGIN_TIMEOUT_MS,
    );

    operation.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });

const getLoginErrorMessage = (error?: string | null) => {
  if (error?.startsWith('AuthUnavailable:')) {
    return 'Login security service temporary busy hai. Please 30 seconds baad retry karein.';
  }

  if (error?.startsWith('RateLimited:')) {
    const retryAfterSeconds = Number.parseInt(error.split(':')[1] || '', 10);
    const waitMinutes = Number.isFinite(retryAfterSeconds)
      ? Math.max(1, Math.ceil(retryAfterSeconds / 60))
      : 1;

    return `Too many attempts. Please wait ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'} and try again.`;
  }

  if (error === 'CredentialsSignin') {
    return 'Email/password incorrect hai ya is account ko admin access nahi mila hai.';
  }

  return 'Sign in complete nahi ho paya. Please try again.';
};

export default function AdminLoginPage() {
  const { status } = useSession();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const submissionInFlight = useRef(false);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('reason');
    const rejectedSession = reason === 'revoked' || reason === 'invalid-role' || reason === 'auth-check-failed';
    if (reason === 'revoked') {
      setSessionNotice('This admin account is inactive or its access was removed. Sign in with an active account.');
    } else if (reason === 'invalid-role') {
      setSessionNotice('This account does not have access to the admin workspace.');
    } else if (reason === 'auth-check-failed') {
      setSessionNotice('We could not verify this admin session. Please sign in again.');
    }

    if (status === 'authenticated') {
      if (rejectedSession) {
        setValidatingSession(false);
        return;
      }
      setValidatingSession(true);
      window.location.assign('/admin');
      return;
    }

    setValidatingSession(false);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionInFlight.current) {
      return;
    }

    submissionInFlight.current = true;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await withLoginTimeout(
        signIn('credentials', {
          email: form.email.trim(),
          password: form.password,
          redirect: false,
          callbackUrl: `${window.location.origin}/admin`,
        }),
      );

      if (res?.ok && !res.error) {
        toast.success('Welcome back!');
        window.location.assign(res.url || '/admin');
      } else {
        const message = getLoginErrorMessage(res?.error);
        setErrorMessage(message);
        toast.error(message);
      }
    } catch (error) {
      const message =
        error instanceof LoginTimeoutError
          ? 'Server response mein delay hua. Please retry—button ab reset kar diya gaya hai.'
          : 'Login failed. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      submissionInFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logoImageWrap}>
            <Image
              src={COMPANY_INFO.displayLogoPath}
              alt={COMPANY_INFO.name}
              width={1632}
              height={607}
              className={styles.logoImage}
              priority
              sizes="160px"
            />
          </div>
          <h1>Admin Panel</h1>
          <p>Sign in with your configured admin email to manage your website</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required placeholder="Enter your admin email"
              autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.passwordField}>
              <input type={showPassword ? 'text' : 'password'} className="form-input" required placeholder="••••••••" autoComplete="current-password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {errorMessage ? (
            <p className={styles.loginError} role="alert" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}
          {sessionNotice && !errorMessage ? (
            <p className={styles.loginError} role="status" aria-live="polite">
              {sessionNotice}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || validatingSession}
            aria-busy={loading || validatingSession}
            style={{ width: '100%' }}
          >
            {loading || validatingSession ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
