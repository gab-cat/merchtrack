import React from 'react';
import { PaymentHistory } from '@/components/public/profile/payment-history';
import PageAnimation from '@/components/public/page-animation';

export const metadata = {
  title: 'Payment History | MerchTrack',
  description: 'View and manage your payment history',
};

export default function PaymentHistoryPage() {
  return (
    <PageAnimation className='max-w-full'>
      <PaymentHistory />
    </PageAnimation>
  );
}