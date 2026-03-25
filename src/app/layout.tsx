import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Manrope, Sora } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Toaster } from 'react-hot-toast';
import { COMPANY_INFO } from '@/lib/data';

const socialProfiles = Object.values(COMPANY_INFO.socialLinks);
const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-manrope' });
const sora = Sora({ subsets: ['latin'], display: 'swap', variable: '--font-sora' });
const ChatWidget = dynamic(() => import('@/components/chatbot/ChatWidget'), {
  ssr: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY_INFO.website),
  title: {
    default: `${COMPANY_INFO.name} | ${COMPANY_INFO.tagline}`,
    template: '%s | Spectra Pack Machines'
  },
  description: 'Spectra Pack Machines manufactures shrink wrapping machines, sealing machines, vacuum packaging machines, conveyor systems, and pallet stretch wrapping solutions in India.',
  keywords: ['packaging machines', 'shrink wrapping machine', 'sealing machine', 'band sealer machine', 'vacuum packaging machine', 'web sealer with shrink tunnel', 'conveyor systems', 'pallet stretch wrap machine'],
  authors: [{ name: 'Spectra Pack Machines' }],
  icons: {
    icon: COMPANY_INFO.logoPath,
    apple: COMPANY_INFO.logoPath,
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
        width: 1000,
        height: 250,
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={COMPANY_INFO.logoPath} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: COMPANY_INFO.name,
              url: COMPANY_INFO.website,
              logo: `${COMPANY_INFO.website}${COMPANY_INFO.logoPath}`,
              description:
                'Manufacturer of shrink wrapping, sealing, vacuum packaging, conveyor, and end-of-line packaging machines in India.',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '505, Dattani Prism 1, Above Janseva Hospital, Behind Dattani Mall',
                addressLocality: 'Vasai West',
                addressRegion: 'Maharashtra',
                postalCode: '401207',
                addressCountry: 'IN'
              },
              telephone: COMPANY_INFO.phone[1],
              email: COMPANY_INFO.email[0],
              sameAs: socialProfiles,
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: COMPANY_INFO.phone[1],
                contactType: 'sales',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi']
              }
            })
          }}
        />
      </head>
      <body className={`${manrope.variable} ${sora.variable}`}>
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
        <div id="site-navbar">
          <Navbar />
        </div>
        <main>{children}</main>
        <div id="site-footer">
          <Footer />
        </div>
        <div id="site-whatsapp">
          <WhatsAppButton />
        </div>
        <div id="site-chat-widget">
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}
