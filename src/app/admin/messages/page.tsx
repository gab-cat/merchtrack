import React from 'react';
import PageTitle from '@/components/private/page-title';
import PageAnimation from '@/components/public/page-animation';
import { MessageContainer } from '@/features/admin/messages/components';

export const metadata = {  
  title: 'Customer Messages | Admin Dashboard',  
  description: 'Manage and respond to customer messages'  
};  

const Page = () => {
  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title='Customer Messages' />
        <div className="space-y-4">
          <MessageContainer />
        </div>
      </div>
    </PageAnimation>
  );
};

export default Page;