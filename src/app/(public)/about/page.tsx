import React from 'react';
import AboutUsBody from '@/components/public/about-us-body';
import { ABOUT_US_CONTENT } from '@/constants';
import PageTitle from '@/components/public/page-title';
import PageAnimation from '@/components/public/page-animation';

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-4xl'>
      <PageTitle title={ABOUT_US_CONTENT.title} description={ABOUT_US_CONTENT.description} />
      <AboutUsBody />
    </PageAnimation>
  );
};

export default Page;