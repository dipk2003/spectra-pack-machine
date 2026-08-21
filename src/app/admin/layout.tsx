import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { canShowDeveloperNavigation } from '@/lib/developer-access';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Secure Admin | Spectra Pack Machines',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-image-preview': 'none',
      'max-snippet': 0,
      'max-video-preview': 0,
    },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  noStore();

  const session = await getServerSession(authOptions);
  const canAccessDeveloper = canShowDeveloperNavigation(session);

  return (
    <AdminShell session={session} canAccessDeveloper={canAccessDeveloper}>
      {children}
    </AdminShell>
  );
}
