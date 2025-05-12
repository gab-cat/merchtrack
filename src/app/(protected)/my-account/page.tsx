import React from 'react';
import { MyAccountBody } from '@/features/customer/my-account/components';
import PageAnimation from '@/components/public/page-animation';

export const metadata = {
  title: 'My Account | MerchTrack',
  description: 'Manage your account settings, orders, payments, and more',
};

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-full'>
      <MyAccountBody />
      
    </PageAnimation>
  );
};

export default Page;