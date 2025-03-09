import React from 'react';
import { PaymentHistory } from '@/components/public/profile/payment-history';
import PageAnimation from '@/components/public/page-animation';

export default function PaymentHistoryPage() {
  return (
    <PageAnimation className='max-w-full'>
      <PaymentHistory />
    </PageAnimation>
  );
}