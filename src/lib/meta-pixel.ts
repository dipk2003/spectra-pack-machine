// Direct Pixel is opt-in. When GTM owns Meta, leave the Pixel ID unset here.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';
type PixelQueue = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: PixelQueue;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: PixelQueue;
    _fbq?: PixelQueue;
    __spectraMetaInitialized?: boolean;
  }
}

export function updateMetaConsent(granted: boolean) {
  if (typeof window === 'undefined' || !/^\d{5,20}$/.test(PIXEL_ID)) return;
  window.fbq?.('consent', granted ? 'grant' : 'revoke');
}

export function initializeMetaPixel() {
  if (typeof window === 'undefined' || !/^\d{5,20}$/.test(PIXEL_ID)) return;
  if (window.__spectraMetaInitialized) return;
  if (!window.fbq) {
    const queue = function (...args: unknown[]) {
      if (queue.callMethod) queue.callMethod(...args);
      else queue.queue.push(args);
    } as PixelQueue;
    queue.queue = [];
    queue.push = queue;
    queue.loaded = true;
    queue.version = '2.0';
    window.fbq = queue;
    window._fbq = window._fbq || queue;
  }
  window.fbq('consent', 'grant');
  // Only explicit events; do not automatically scrape form fields or buttons.
  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('init', PIXEL_ID);
  window.__spectraMetaInitialized = true;
  if (!document.getElementById('spectra-meta-pixel')) {
    const script = document.createElement('script');
    script.id = 'spectra-meta-pixel';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
}

export function sendMetaEvent(event: string, recordId?: string) {
  if (!window.__spectraMetaInitialized) return;
  const standardEvent = event === 'page_view' ? 'PageView'
    : event === 'generate_lead' ? 'Lead'
    : event === 'meeting_booked' ? 'Schedule' : '';
  if (standardEvent) {
    window.fbq?.('trackSingle', PIXEL_ID, standardEvent, {},
      ...(recordId ? [{ eventID: `${event}:${recordId}` }] : []));
  } else if (['whatsapp_click', 'phone_click', 'email_click', 'catalog_download'].includes(event)) {
    // Contact intent is never reported as a completed lead.
    window.fbq?.('trackSingleCustom', PIXEL_ID, event);
  }
}
