import { redirect } from 'next/navigation';
import { SettingsContainer } from '@/features/admin/announcements/components';
import { getSessionData, getUserId } from '@/lib/auth';
import PageTitle from '@/components/private/page-title';
import PageAnimation from '@/components/public/page-animation';


export const metadata = {
  title: 'Announcement Settings | Admin Dashboard',
  description: 'Manage and configure announcement settings'
};

export default async function SettingsPage() {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);
    
  if (!userId) {
    return redirect('/sign-in');
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