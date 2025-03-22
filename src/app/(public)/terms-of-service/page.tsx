import React from 'react';
import TermsOfServiceBody from '@/components/public/terms-of-service-body';
import { TERMS_OF_SERVICE_CONTENT } from '@/constants';
import PageTitle from '@/components/public/page-title';
import PageAnimation from '@/components/public/page-animation';

export const revalidate = 86400;

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-6xl'>
      <PageTitle title={TERMS_OF_SERVICE_CONTENT.title} description={TERMS_OF_SERVICE_CONTENT.description} />
      <TermsOfServiceBody />
    </PageAnimation>
  );
};

export default Page;