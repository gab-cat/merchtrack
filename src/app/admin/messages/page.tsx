import React from 'react';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import PageTitle from '@/components/private/page-title';
import PageAnimation from '@/components/public/page-animation';
import MessagesContainer from '@/app/admin/messages/(components)/msg-container';
import { getSessionData, getUserId } from '@/lib/auth';
import { verifyPermission } from '@/utils/permissions';

export const metadata = {  
  title: 'Customer Messages | Admin Dashboard',  
  description: 'Manage and respond to customer messages'  
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
        <PageTitle title='Customer Messages' />
        <div className="space-y-4">
          <MessagesContainer />
        </div>
      </div>
    </PageAnimation>
  );
};

export default Page;