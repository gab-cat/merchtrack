import React from 'react';
import PageAnimation from '@/components/public/page-animation';
import MyTickets from '@/components/public/profile/my-tickets';
import MyProfileSideBar from '@/components/public/profile/my-profile-sidebar';

export default function PaymentHistoryPage() {
  return (
    <PageAnimation className='min-h-[75vh] max-w-full'>
      <div className="container mx-auto my-4 px-4 sm:my-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          {/* Left Sidebar - Hidden on mobile, shown as tabs */}
          <div className="hidden w-full lg:block lg:w-1/4">
            <MyProfileSideBar />
          </div>
          {/* Main Content */}
          <div className="flex-1">
            <MyTickets />
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}