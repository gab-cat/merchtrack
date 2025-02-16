import React from 'react';
import { Metadata } from "next";
import { FaShieldAlt } from "react-icons/fa";
import { FaBagShopping, FaCreditCard  } from "react-icons/fa6";
import { RiFilePaper2Line } from "react-icons/ri";
import { UserProfileDetails } from "../components/user-profile-details";
import { UserActions } from "../components/user-actions";
import { UserPermissions } from "../components/user-permissions";
import { UserActivityLogs } from "../components/user-activity-logs";
import { UserOrderHistory } from "../components/user-order-history";
import { UserPaymentHistory } from "../components/user-payment-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';
import { Card } from '@/components/ui/card';

type Params = {
  params: Promise<{
    email: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Manage User - MerchTrack',
  description: 'View and manage user details, permissions, activity logs, orders, and payments.',
};

export default async function UserManagePage({ params }: Params) {
  const email = decodeURIComponent((await params).email);

  return (
    <PageAnimation>
      <div className="container space-y-6 p-6">
        <PageTitle title="Manage User" />
        
        {/* User Profile and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UserProfileDetails email={email} />
          </div>
          <div>
            <UserActions email={email} />
          </div>
        </div>

        {/* Tabs for Different Sections */}
        <Card>
          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="w-full justify-start border-b bg-gray-50/50 px-6">
              <TabsTrigger value="permissions" className="flex items-center gap-2 px-4 py-3">
                <FaShieldAlt className="size-4" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2 px-4 py-3">
                <RiFilePaper2Line className="size-4" />
                Activity Logs
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 px-4 py-3">
                <FaBagShopping className="size-4" />
                Order History
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2 px-4 py-3">
                <FaCreditCard  className="size-4" />
                Payment History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="p-6">
              <UserPermissions email={email} />
            </TabsContent>

            <TabsContent value="activity" className="p-6">
              <UserActivityLogs email={email} />
            </TabsContent>

            <TabsContent value="orders" className="p-6">
              <UserOrderHistory email={email} />
            </TabsContent>

            <TabsContent value="payments" className="p-6">
              <UserPaymentHistory email={email} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageAnimation>
  );
}