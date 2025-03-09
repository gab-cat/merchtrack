import { Metadata } from 'next';
import { PaymentHistory } from '@/components/public/profile/payment-history';

export const metadata: Metadata = {
  title: 'Payment History | MerchTrack',
  description: 'View your payment transaction history',
};

export default function PaymentHistoryPage() {
  return <PaymentHistory />;
}