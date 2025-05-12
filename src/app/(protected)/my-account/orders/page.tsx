import React from 'react';
import PageAnimation from '@/components/public/page-animation';
import { OrderHistory } from '@/features/customer/my-orders/components';

export const metadata = {
  title: 'Order History | MerchTrack',
  description: 'View and manage your order history',
};

export default function OrderHistoryPage() {
  return (
    <PageAnimation className='max-w-full'>
      <OrderHistory />
    </PageAnimation>
  );
}