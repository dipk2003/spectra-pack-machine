import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Packaging Machine Quote',
  description:
    'Contact Spectra Pack Machines for machine recommendations, quotations, factory discussions, installation guidance, and pan-India packaging equipment support.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Spectra Pack Machines',
    description: 'Share your product, output, and delivery location for a practical packaging machine recommendation.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
