'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { CreditCard, Clock, CheckCircle, XCircle, Info } from "lucide-react";
import { FaRegCreditCard,  } from "react-icons/fa";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MyProfileSideBar from '@/components/public/profile/my-profile-sidebar';
import SupportModal from '@/components/public/profile/support-modal';
import MyTickets from '@/components/public/profile/my-tickets';
import { useUserStore } from '@/stores/user.store';
import { usePaymentsQuery } from '@/hooks/payments.hooks';
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from '@/lib/utils';
import { useUserImageQuery } from '@/hooks/messages.hooks';

function MyAccountBody() {
  const { user } = useUserStore();
  const { data: userImage } = useUserImageQuery(user?.clerkId);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  // User info
  const userData = {
    firstName: user?.firstName ?? 'John',
    lastName: user?.lastName ?? 'Doe',
    email: user?.email ?? 'john.doe@example.com',
    phone: user?.phone ?? '09213653016',
    college: user?.college ?? 'COCS',
    role: user?.role ?? 'STUDENT',
  };

  // Query user payments
  const { data: payments, isLoading: paymentsLoading } = usePaymentsQuery({
    where: {
      isDeleted: false,
      userId: user?.id as string,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      order: true,
    },
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
    case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'REFUNDED': return 'bg-red-100 text-red-800 border-red-200';
    case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
    case 'VERIFIED': return <CheckCircle className="mr-1 size-3" />;
    case 'PENDING': return <Clock className="mr-1 size-3" />;
    case 'REFUNDED': return <XCircle className="mr-1 size-3" />;
    case 'REJECTED': return <XCircle className="mr-1 size-3" />;
    default: return null;
    }
  };

  return (
    <div className="container mx-auto my-4 px-4 pb-16 sm:my-8 sm:px-6 lg:pb-8 xl:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* The sidebar is now controlled by the MyProfileSideBar component */}
        {/* It will render properly for both desktop and mobile */}
        <MyProfileSideBar />
        
        {/* Main Content */}
        <div className="w-full flex-1">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Account</h1>
              {/* <TabsList className="w-full overflow-x-auto sm:w-auto">
                <TabsTrigger value="profile" className="flex items-center gap-1.5">
                  <FaUser className="size-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="payment-history" className="flex items-center gap-1.5">
                  <FaHistory className="size-4" />
                  <span>Payments</span>
                </TabsTrigger>
                <TabsTrigger value="tickets" className="flex items-center gap-1.5">
                  <FaTicketAlt className="size-4" />
                  <span>Tickets</span>
                </TabsTrigger>
              </TabsList> */}
            </div>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Image 
                        src={userImage ?? "/img/profile-placeholder-img.png"} 
                        alt="Profile Picture" 
                        width={120} 
                        height={120} 
                        className="rounded-full border-4 border-white shadow-sm"
                      />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      {userData.firstName} {userData.lastName}
                    </CardTitle>
                    <CardDescription>
                      {userData.email}
                    </CardDescription>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">{userData.role}</Badge>
                      <Badge className="bg-purple-100 text-purple-800">{userData.college}</Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6">
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <Info className="size-4 text-blue-600" />
                    <AlertDescription className="ml-2 text-sm text-blue-700">
                      To update your account information, please contact our support team at <span className="font-medium">support@merchtrack.tech</span>. We require verification for account changes.
                    </AlertDescription>
                  </Alert>
                  
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* First Name */}
                      <div>
                        <Label htmlFor="firstName" className="mb-1 block text-sm text-gray-600">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={userData.firstName}
                          readOnly
                          className="border-transparent bg-gray-50"
                        />
                      </div>
                      
                      {/* Last Name */}
                      <div>
                        <Label htmlFor="lastName" className="mb-1 block text-sm text-gray-600">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={userData.lastName}
                          readOnly
                          className="border-transparent bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="mb-1 block text-sm text-gray-600">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userData.email}
                        readOnly
                        className="border-transparent bg-gray-50"
                      />
                    </div>
                    
                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="mb-1 block text-sm text-gray-600">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={userData.phone}
                        readOnly
                        className="border-transparent bg-gray-50"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                        onClick={() => setIsSupportModalOpen(true)}
                      >
                        Request Account Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="payment-history">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                  <div className="flex items-center">
                    <FaRegCreditCard className="mr-2 size-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        Payment History
                      </CardTitle>
                      <CardDescription>
                        View all your payment transactions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)]">
                    {paymentsLoading ? (
                      <div className="flex h-60 items-center justify-center">
                        <Spinner size="lg" className="text-primary" />
                        <span className="ml-2">Loading payment history...</span>
                      </div>
                    ) : !payments?.data?.length ? (
                      <div className="flex h-60 flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-6">
                          <CreditCard className="size-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No payment records found</h3>
                        <p className="mt-2 max-w-md px-4 text-sm text-gray-600">
                          You haven&apos;t made any payments yet. Payments will appear here once processed.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {payments.data.map((payment) => (
                          <div key={payment.id} className="p-4 transition-colors hover:bg-gray-50">
                            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                              <div className="flex items-start sm:items-center">
                                <div className="mr-4 flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  <CreditCard className="size-4" />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">Order #{payment.orderId}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "flex items-center", 
                                        getPaymentStatusColor(payment.paymentStatus)
                                      )}
                                    >
                                      {getPaymentStatusIcon(payment.paymentStatus)}
                                      {payment.paymentStatus}
                                    </Badge>
                                  </div>
                                  <div className="mt-1 flex flex-wrap text-sm text-gray-600">
                                    <span>{formatDate(new Date(payment.createdAt))}</span>
                                    <span className="mx-2 hidden sm:inline">•</span>
                                    <span>{payment.paymentMethod}</span>
                                    {payment.referenceNo && (
                                      <>
                                        <span className="mx-2 hidden sm:inline">•</span>
                                        <span className="mt-1 block sm:mt-0 sm:inline">Ref: {payment.referenceNo}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 w-full text-left sm:mt-0 sm:text-right">
                                <div className="font-semibold text-orange-600">
                                  {formatCurrency(Number(payment.amount))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <MyTickets />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Support Modal */}
      <SupportModal 
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        predefinedSubject="Account Change Request"
        predefinedTemplate={`I would like to request the following changes to my account information:

Name: ${userData.firstName} ${userData.lastName}
Email: ${userData.email}
College: ${userData.college}
Role: ${userData.role}

Changes needed:
[Please describe what information you need to update]

Thank you for your assistance.`}
      />
    </div>
  );
}

export default MyAccountBody;