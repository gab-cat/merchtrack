import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SettingsContainer } from './components/settings-container';
import { getSessionData, getUserId } from '@/lib/auth';
import { verifyPermission } from '@/utils/permissions';
import PageTitle from '@/components/private/page-title';
import PageAnimation from '@/components/public/page-animation';

const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));

export default async function SettingsPage() {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);
    
  if (!userId) {
    return redirect('/sign-in');
  }
  
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return <PermissionDenied />;
  }

  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title='Announcement Settings' />
        <SettingsContainer userId={userId} />
      </div>
    </PageAnimation>
  );
}