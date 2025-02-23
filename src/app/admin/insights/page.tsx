import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import PageTitle from '@/components/private/page-title';
import PageAnimation from '@/components/public/page-animation';
import { getSessionData, getUserId } from '@/lib/auth';
import { verifyPermission } from '@/utils/permissions';
import InsightsTabs from '@/app/admin/insights/components/insights-tabs';

export const metadata = {  
  title: 'Business Insights | Admin Dashboard',  
  description: 'View business metrics and analytics'  
};  

const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));

const Page = async () => {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);
    
  if (!userId) {
    return redirect('/sign-in');
  }
  
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return <PermissionDenied />;
  }

  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title='Business Insights' />
        <div className="space-y-4">
          <InsightsTabs />
        </div>
      </div>
    </PageAnimation>
  );
};

export default Page;