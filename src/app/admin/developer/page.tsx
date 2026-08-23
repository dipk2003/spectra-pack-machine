import { unstable_noStore as noStore } from 'next/cache';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getDeveloperAccess } from '@/lib/developer-access';
import { getDeveloperPanelData } from '@/lib/developer-panel';
import { getDeveloperPinState, isDeveloperPinUnlocked } from '@/lib/developer-pin';
import DeveloperPanelClient from './DeveloperPanelClient';
import DeveloperPinGate from './DeveloperPinGate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DeveloperPage() {
  noStore();

  const session = await getServerSession(authOptions);
  const access = await getDeveloperAccess(session);
  if (!access.allowed) {
    notFound();
  }

  const userId = String(session?.user?.id || '').trim();
  const pinState = await getDeveloperPinState();
  if (!pinState.available) {
    return <DeveloperPinGate mode="unavailable" notice={pinState.notice} />;
  }
  if (!pinState.configured) {
    return <DeveloperPinGate mode="setup" notice={pinState.notice} />;
  }
  if (!userId || !(await isDeveloperPinUnlocked(userId, pinState))) {
    return <DeveloperPinGate mode="unlock" />;
  }

  const initialData = await getDeveloperPanelData(access);
  return <DeveloperPanelClient initialData={initialData} />;
}
