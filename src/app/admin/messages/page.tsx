import React from 'react';
import PageTitle from '@/components/private/page-title';
import PageAnimation from '@/components/public/page-animation';
import MessagesContainer from '@/app/admin/messages/(components)/msg-container';

const Page = () => {
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