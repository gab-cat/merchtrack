import React from 'react';
import TransactionHistoryBody from '@/components/public/profile/transaction-history-body';
import PageAnimation from '@/components/public/page-animation';

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-full'>
      <TransactionHistoryBody />
    </PageAnimation>
  );
};

export default Page;