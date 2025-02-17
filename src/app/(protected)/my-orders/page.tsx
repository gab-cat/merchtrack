import React from 'react';
import MyOrdersBody from '@/components/public/profile/my-orders-body';
import PageAnimation from '@/components/public/page-animation';

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-full'>
      <MyOrdersBody />
    </PageAnimation>
  );
};

export default Page;