'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { captureAttribution } from '@/lib/attribution';
import {
  initializeAnalytics,
  readAnalyticsConsent,
  setAnalyticsConsent,
  trackAnalyticsEvent,
  type AnalyticsConsentState,
} from '@/lib/analytics';
import styles from './AnalyticsProvider.module.css';

const classifyTrackedLink = (href: string) => {
  const normalized = href.trim().toLowerCase();

  if (/^(?:https?:\/\/)?(?:api\.)?whatsapp\.com\//.test(normalized) || normalized.includes('wa.me/')) {
    return { event: 'whatsapp_click' as const, linkType: 'whatsapp' };
  }
  if (normalized.startsWith('tel:')) {
    return { event: 'phone_click' as const, linkType: 'phone' };
  }
  if (normalized.startsWith('mailto:')) {
    return { event: 'email_click' as const, linkType: 'email' };
  }
  if (/catalog|\.pdf(?:$|[?#])/i.test(normalized)) {
    return { event: 'catalog_download' as const, linkType: 'catalog' };
  }

  return null;
};

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<AnalyticsConsentState>('unset');
  const lastPageView = useRef('');

  useEffect(() => {
    captureAttribution();
    initializeAnalytics();
    setConsent(readAnalyticsConsent());
  }, []);

  useEffect(() => {
    const path = pathname || '/';
    if (/^\/(admin|api)(\/|$)/.test(path)) return;
    captureAttribution();
    if (consent !== 'granted') return;
    if (lastPageView.current === path) return;
    lastPageView.current = path;
    trackAnalyticsEvent('page_view', {
      path,
      surface: 'navigation',
    });
  }, [consent, pathname]);

  useEffect(() => {
    const resetConsent = () => {
      setAnalyticsConsent('denied');
      try {
        window.localStorage.removeItem('spectra-analytics-consent-v1');
      } catch {
        // The banner can still reopen for this page when storage is unavailable.
      }
      lastPageView.current = '';
      setConsent('unset');
    };

    window.addEventListener('spectra:reset-analytics-consent', resetConsent);
    return () => window.removeEventListener('spectra:reset-analytics-consent', resetConsent);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const tracked = classifyTrackedLink(link.getAttribute('href') || '');
      if (!tracked) return;

      trackAnalyticsEvent(tracked.event, {
        surface: 'global-click',
        metadata: { link_type: tracked.linkType },
      });
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  const chooseConsent = (nextConsent: Exclude<AnalyticsConsentState, 'unset'>) => {
    setAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
  };

  if (consent !== 'unset') return null;

  return (
    <aside
      className={styles.banner}
      role="dialog"
      aria-live="polite"
      aria-label="Analytics consent"
    >
      <div className={styles.copy}>
        <strong>Privacy choices</strong>
        <p>
          We use site analytics and advertising measurement to understand enquiries and improve the website.
          Advertising and analytics storage stays off until you allow it.
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => chooseConsent('denied')}
        >
          Necessary only
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => chooseConsent('granted')}
        >
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
