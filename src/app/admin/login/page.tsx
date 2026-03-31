'use client';

import '@/lib/init-auth-env';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { COMPANY_INFO } from '@/lib/data';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      setValidatingSession(false);
      return;
    }

    let cancelled = false;

    const verifyAndRedirect = async () => {
      setValidatingSession(true);
      const hasAdminAccess = await hasActiveAdminSession();

      if (cancelled) {
        return;
      }

      if (hasAdminAccess) {
        router.replace('/admin');
        return;
      }

      await signOut({ redirect: false });

      if (!cancelled) {
        setValidatingSession(false);
      }
    };

    void verifyAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  const hasActiveAdminSession = async () => {
    try {
      const response = await fetch('/api/admin/status', { cache: 'no-store' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const waitForActiveAdminSession = async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (await hasActiveAdminSession()) {
        return true;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: `${window.location.origin}/admin`,
      });

      if (await waitForActiveAdminSession()) {
        toast.success('Welcome back!');
        router.replace('/admin');
      } else if (res?.error) {
        toast.error('Admin email allowlisted nahi hai ya password incorrect hai.');
      } else {
        await signOut({ redirect: false });
        toast.error('Login hua, lekin admin access verify nahi hui.');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logoImageWrap}>
            <Image
              src={COMPANY_INFO.displayLogoPath}
              alt={COMPANY_INFO.name}
              width={181}
              height={60}
              className={styles.logoImage}
              priority
              sizes="181px"
            />
          </div>
          <h1>Admin Panel</h1>
          <p>Sign in with your configured admin email to manage your website</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required placeholder="Enter your admin email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.passwordField}>
              <input type={showPassword ? 'text' : 'password'} className="form-input" required placeholder="••••••••"
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
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || validatingSession}
            style={{ width: '100%' }}
          >
            {loading || validatingSession ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
