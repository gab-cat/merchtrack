import React from 'react';
import { Mail } from 'lucide-react';
import PageAnimation from '@/components/public/page-animation';
import { MyTickets } from '@/features/customer/my-tickets/components';
import { MyProfileSidebar } from '@/features/customer/my-account/components';
import { Card } from '@/components/ui/card';
import FAQBody from '@/components/public/faq-body';

export const metadata = {
  title: 'Support Tickets | MerchTrack',
  description: 'Manage and handle customer support tickets',
};

export default function PaymentHistoryPage() {
  return (
    <PageAnimation className='min-h-[75vh] max-w-full'>
      <div className="container mx-auto my-4 px-4 sm:my-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          {/* Left Sidebar - Hidden on mobile, shown as tabs */}
          <div className="hidden w-full lg:block lg:w-1/4">
            <MyProfileSidebar />
          </div>
          {/* Main Content */}
          <div className="flex-1">
            <Card className="mb-4 border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-primary">Customer Support Center</h2>
              </div>
              <p className="text-sm text-gray-700">
                      This is the main support page for handling all customer concerns regarding orders, payments, products, and general inquiries. 
                      All support tickets should be processed through this system for proper tracking and resolution.
              </p>
              <div className="mt-3 flex items-center text-sm text-gray-700">
                <Mail className="mr-2 size-4 text-blue-600" />
                <span>Email support is also available at: </span>
                <a href="mailto:support@merchtrack.tech" className="ml-1 font-medium text-blue-600 hover:underline">
                        support@merchtrack.tech
                </a>
              </div>
            </Card>
            <MyTickets />
            <div className="-mb-24 mt-8 flex items-center gap-3">
              <h2 className="text-center text-xl font-semibold text-primary">Frequently Asked Questions</h2>
            </div>
            <FAQBody displayTitle={false} />
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}