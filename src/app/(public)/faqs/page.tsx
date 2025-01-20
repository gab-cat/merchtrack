'use client';

import FaqsBody from '@/components/public/faqs-body';
import { FAQS_CONTENT } from '@/constants';
import PageTitle from '@/components/public/page-title';
import PageAnimation from '@/components/public/page-animation';

const Page = () => {
  return (
    <PageAnimation className='max-w-4xl'>
      <PageTitle title={FAQS_CONTENT.title} description={FAQS_CONTENT.description} />
      <FaqsBody />
    </PageAnimation>
  );
};

export default Page;