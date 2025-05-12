import React from 'react';
import TrackOrderBody from '@/features/customer/track-order/components/track-order-body';
import PageAnimation from '@/components/public/page-animation';

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-full'>
      <TrackOrderBody />
    </PageAnimation>
  );
};

export default Page;