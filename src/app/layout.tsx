import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { Manrope, Sora } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Toaster } from 'react-hot-toast';
import { COMPANY_INFO, SEO_CITY_MARKETS } from '@/lib/data';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';

const socialProfiles = Object.values(COMPANY_INFO.socialLinks);
const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-manrope' });
const sora = Sora({ subsets: ['latin'], display: 'swap', variable: '--font-sora' });
const configuredGtmId =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() ||
  process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim() ||
  '';
const configuredGoogleAnalyticsId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';
const configuredGoogleAdsId =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || '';
const hasGoogleTagManager = /^GTM-[A-Z0-9]+$/i.test(configuredGtmId);
const googleAnalyticsId =
  !hasGoogleTagManager &&
  /^G-[A-Z0-9]+$/i.test(configuredGoogleAnalyticsId)
    ? configuredGoogleAnalyticsId
    : '';
const googleAdsId =
  !hasGoogleTagManager && /^AW-\d+$/i.test(configuredGoogleAdsId)
    ? configuredGoogleAdsId
    : '';
const directGoogleTagId = googleAnalyticsId || googleAdsId;
const googleConsentBootstrap = `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
window.gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
window.gtag('set', 'ads_data_redaction', true);
window.gtag('set', 'url_passthrough', true);
window.__spectraAnalyticsInitialized = true;
`;
const googleAnalyticsConfiguration = googleAnalyticsId
  ? `window.gtag('config', ${JSON.stringify(googleAnalyticsId)}, {
  send_page_view: false,
  anonymize_ip: true
});
window.__spectraGoogleAnalyticsConfigured = true;`
  : '';
const googleAdsConfiguration = googleAdsId
  ? `window.gtag('config', ${JSON.stringify(googleAdsId)});
window.__spectraGoogleAdsConfigured = true;`
  : '';
const googleTagConfiguration = directGoogleTagId
  ? `
window.gtag('js', new Date());
${googleAnalyticsConfiguration}
${googleAdsConfiguration}
window.__spectraGoogleTagJsInitialized = true;
`
  : '';
const ChatWidget = dynamic(() => import('@/components/chatbot/ChatWidget'), {
  ssr: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY_INFO.website),
  applicationName: COMPANY_INFO.name,
  title: {
    default: `${COMPANY_INFO.name} | ${COMPANY_INFO.tagline}`,
    template: '%s | Spectra Pack Machines'
  },
  description: 'Spectra Pack Machines manufactures shrink wrapping machines, sealing machines, vacuum packaging machines, conveyor systems, and pallet stretch wrapping solutions in India.',
  keywords: ['packaging machine manufacturer in India', 'packing machine', 'Spectra Pack Machine', 'spectrapackmachine', 'shrink wrapping machine', 'sealing machine', 'band sealer machine', 'vacuum packaging machine', 'web sealer with shrink tunnel', 'conveyor systems', 'pallet stretch wrap machine'],
  authors: [{ name: 'Spectra Pack Machines' }],
  creator: COMPANY_INFO.name,
  publisher: COMPANY_INFO.name,
  category: 'Industrial packaging machinery',
  manifest: '/manifest.webmanifest',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '256x256' },
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/favicon.png', type: 'image/png', sizes: '512x512' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: COMPANY_INFO.website,
    siteName: COMPANY_INFO.name,
    title: `${COMPANY_INFO.name} | ${COMPANY_INFO.tagline}`,
    description: 'Shrink wrapping, sealing, vacuum packaging, conveyors, and end-of-line packaging solutions from Spectra Pack Machines.',
    images: [
      {
        url: COMPANY_INFO.logoPath,
        width: 1632,
        height: 607,
        alt: COMPANY_INFO.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: COMPANY_INFO.name,
    description: COMPANY_INFO.tagline,
    images: [COMPANY_INFO.logoPath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '432KpBNFuun1WeWgmjmdf2HTzKYEI_tGb2dQxv2hEuM',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdminRoute = headers().get('x-admin-route') === '1';

  return (
    <html lang="en-IN">
      <head>
        {!isAdminRoute && directGoogleTagId ? (
          <>
            <script
              id="spectra-google-consent-default"
              dangerouslySetInnerHTML={{ __html: googleConsentBootstrap }}
            />
            <script
              id="spectra-google-tag"
              defer
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(directGoogleTagId)}`}
            />
            <script
              id="spectra-google-tag-config"
              dangerouslySetInnerHTML={{ __html: googleTagConfiguration }}
            />
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${COMPANY_INFO.website}/#organization`,
                  name: COMPANY_INFO.name,
                  legalName: COMPANY_INFO.legalName,
                  url: COMPANY_INFO.website,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${COMPANY_INFO.website}${COMPANY_INFO.logoPath}`,
                    width: 1632,
                    height: 607,
                  },
                  image: `${COMPANY_INFO.website}${COMPANY_INFO.logoPath}`,
                  description: 'Manufacturer of shrink wrapping, sealing, vacuum packaging, conveyor, and end-of-line packaging machines in India.',
                  address: [
                    {
                      '@type': 'PostalAddress',
                      streetAddress: '505, Dattani Prism 1, Above Janseva Hospital, Behind Dattani Mall',
                      addressLocality: 'Vasai West',
                      addressRegion: 'Maharashtra',
                      postalCode: '401207',
                      addressCountry: 'IN',
                    },
                    {
                      '@type': 'PostalAddress',
                      streetAddress: 'Ground Floor, Gala No-11, Royal I.T. Industrial Estate, Saaghpada, Chinchoti, Kaman',
                      addressLocality: 'Vasai East',
                      addressRegion: 'Maharashtra',
                      postalCode: '401208',
                      addressCountry: 'IN',
                    },
                  ],
                  location: [
                    {
                      '@type': 'LocalBusiness',
                      '@id': `${COMPANY_INFO.website}/#head-office`,
                      name: `${COMPANY_INFO.name} – Head Office`,
                      url: `${COMPANY_INFO.website}/contact`,
                      telephone: COMPANY_INFO.phone[0],
                      address: {
                        '@type': 'PostalAddress',
                        streetAddress: '505, Dattani Prism 1, Above Janseva Hospital, Behind Dattani Mall',
                        addressLocality: 'Vasai West',
                        addressRegion: 'Maharashtra',
                        postalCode: '401207',
                        addressCountry: 'IN',
                      },
                      parentOrganization: { '@id': `${COMPANY_INFO.website}/#organization` },
                    },
                    {
                      '@type': 'LocalBusiness',
                      '@id': `${COMPANY_INFO.website}/#factory`,
                      name: COMPANY_INFO.name,
                      url: `${COMPANY_INFO.website}/contact`,
                      telephone: COMPANY_INFO.phone[0],
                      address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Ground Floor, Gala No-11, Royal I.T. Industrial Estate, Saaghpada, Chinchoti, Kaman',
                        addressLocality: 'Vasai East',
                        addressRegion: 'Maharashtra',
                        postalCode: '401208',
                        addressCountry: 'IN',
                      },
                      parentOrganization: { '@id': `${COMPANY_INFO.website}/#organization` },
                    },
                  ],
                  telephone: COMPANY_INFO.phone[0],
                  email: COMPANY_INFO.email[0],
                  foundingDate: String(COMPANY_INFO.foundedYear),
                  areaServed: SEO_CITY_MARKETS.map((city) => ({
                    '@type': 'City',
                    name: city.name,
                    containedInPlace: city.region,
                  })),
                  knowsAbout: ['Packaging machines', 'Shrink wrapping machines', 'Sealing machines', 'Vacuum packaging machines', 'Conveyor systems', 'Pallet stretch wrapping machines'],
                  sameAs: socialProfiles,
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: COMPANY_INFO.phone[0],
                    contactType: 'sales',
                    areaServed: 'IN',
                    availableLanguage: ['English', 'Hindi'],
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${COMPANY_INFO.website}/#website`,
                  url: COMPANY_INFO.website,
                  name: COMPANY_INFO.name,
                  alternateName: 'Spectra Pack',
                  inLanguage: 'en-IN',
                  publisher: { '@id': `${COMPANY_INFO.website}/#organization` },
                },
              ],
            })
          }}
        />
      </head>
      <body className={`${manrope.variable} ${sora.variable}`}>
        {!isAdminRoute ? <AnalyticsProvider /> : null}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#fff',
              fontFamily: 'var(--font-body)',
            },
          }}
        />
        {!isAdminRoute ? (
          <div id="site-navbar">
            <Navbar />
          </div>
        ) : null}
        <main>{children}</main>
        {!isAdminRoute ? (
          <>
            <div id="site-footer">
              <Footer />
            </div>
            <div id="site-whatsapp">
              <WhatsAppButton />
            </div>
            <div id="site-chat-widget">
              <ChatWidget />
            </div>
          </>
        ) : null}
      </body>
    </html>
  );
}
