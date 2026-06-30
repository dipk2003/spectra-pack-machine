import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule a Packaging Machine Consultation',
  description:
    'Schedule a call with Spectra Pack Machines to discuss machine selection, customization, pricing, installation, or a factory visit.',
  alternates: { canonical: '/schedule-meeting' },
  openGraph: {
    title: 'Schedule a Consultation | Spectra Pack Machines',
    description: 'Book a technical discussion about your packaging requirement with the Spectra Pack team.',
    url: '/schedule-meeting',
  },
};

export default function ScheduleMeetingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
