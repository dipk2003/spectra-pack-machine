import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { getDeveloperAccess } from '@/lib/developer-access';
import { getDeveloperPanelData } from '@/lib/developer-panel';
import DeveloperPanelClient from './DeveloperPanelClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DeveloperPage() {
  noStore();

  const access = await getDeveloperAccess();
  if (!access.allowed) {
    notFound();
  }

  const initialData = await getDeveloperPanelData(access);
  return <DeveloperPanelClient initialData={initialData} />;
}
