import { redirect } from 'next/navigation';
import { getAdminRequestContext } from '@/lib/admin-auth';
import IntegrationPanel from './IntegrationPanel';

export const dynamic = 'force-dynamic';
export default async function IntegrationsPage() {
  const viewer = await getAdminRequestContext();
  if (!viewer) redirect('/admin/login?callbackUrl=/admin/integrations');
  if (!viewer.canManageTeam) redirect('/admin/leads');
  return <IntegrationPanel />;
}
