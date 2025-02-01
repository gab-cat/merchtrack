import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { FC } from 'react';
import { verifyPermission } from '@/utils/permissions';
import { getSessionData, getUserId } from '@/lib/auth';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';

export const metadata = {
  title: 'Create Product | Admin Dashboard',
  description: 'View and manage products'
};  

const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));
const NewProductContainer = dynamic(() => import('./(components)/new-product-container'));

const Page: FC = async () => {
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
        <PageTitle title='New Product' />
        <div className="space-y-4">
          <NewProductContainer />
        </div>
      </div>
    </PageAnimation>
  );
};

export default Page;