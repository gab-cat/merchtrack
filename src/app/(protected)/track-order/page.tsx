import React from 'react';
import TrackOrderBody from '@/components/public/track-order-body';
import PageAnimation from '@/components/public/page-animation';

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-full'>
      <TrackOrderBody />
    </PageAnimation>
  );
};

export default Page;