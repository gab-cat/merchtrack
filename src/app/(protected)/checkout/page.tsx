
import { CheckoutForm , OrderSummary } from '@/features/customer/checkout/components';

export const metadata = {
  title: 'Checkout | MerchTrack',
  description: 'Complete your order and checkout securely',
};

export default async function CheckoutPage() {

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-2">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}