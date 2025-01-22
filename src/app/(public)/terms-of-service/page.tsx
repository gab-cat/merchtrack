import React from 'react';
import TermsOfServiceBody from '@/components/public/terms-of-service-body';
import { TERMS_OF_SERVICE_CONTENT } from '@/constants';
import PageTitle from '@/components/public/page-title';
import PageAnimation from '@/components/public/page-animation';

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-4xl'>
      <PageTitle title={TERMS_OF_SERVICE_CONTENT.title} description={TERMS_OF_SERVICE_CONTENT.description} />
      <TermsOfServiceBody />
    </PageAnimation>
  );
};

export default Page;