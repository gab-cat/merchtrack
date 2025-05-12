'use client';

import { CreditCard, Search, Receipt } from 'lucide-react';
import { PaymentStatus } from '@prisma/client';
import { useState } from 'react';
import { MyProfileSidebar } from '@/features/customer/my-account/components';
import { usePaymentsQuery } from '@/hooks/payments.hooks';
import { useUserStore } from '@/stores/user.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const getPaymentStatusStyle = (status: PaymentStatus) => {
  switch (status) {
  case 'VERIFIED': return 'bg-green-100 text-green-800';
  case 'PENDING': return 'bg-yellow-100 text-yellow-800';
  case 'DECLINED': return 'bg-red-100 text-red-800';
  case 'REFUNDED': return 'bg-orange-100 text-orange-800';
  default: return 'bg-gray-100 text-gray-800';
  }
};

export function PaymentHistory() {
  const { userId } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paymentsResponse, isLoading } = usePaymentsQuery({
    where: {
      userId: userId!,
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    },
    limitFields: ['order', 'user', 'processedById']
  });

  const payments = paymentsResponse?.data || [];
  const filteredPayments = payments.filter(payment => 
    payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto my-8 px-4">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="w-full lg:w-1/4">
          <MyProfileSidebar />
        </div>
        
        <div className="flex-1">
          <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <Receipt className="size-6 text-blue-600" />
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>View all your payment transactions</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search by order ID or reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Spinner className="mr-2" />
                  <span>Loading payment history...</span>
                </div>
              ) : !filteredPayments.length ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <CreditCard className="mb-4 size-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">No Payments Found</h3>
                  <p className="text-sm text-gray-600">
                    {searchTerm ? 'No payments match your search' : 'You haven\'t made any payments yet'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div 
                        key={payment.id}
                        className="bg-card hover:bg-accent/5 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex size-16 items-center justify-center rounded-lg bg-primary/5">
                            <CreditCard className="size-8 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{payment.orderId}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className={cn("font-medium", getPaymentStatusStyle(payment.paymentStatus))}>
                                {payment.paymentStatus}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </span>
                              <span className="font-medium text-orange-600">
                                {formatCurrency(Number(payment.amount))}
                              </span>
                            </div>
                            {payment.referenceNo && (
                              <p className="mt-1 text-sm text-gray-600">
                                Ref: {payment.referenceNo}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <Badge className="mb-1 capitalize">{payment.paymentMethod.toLowerCase()}</Badge>
                          {payment.memo && (
                            <p className="text-sm text-gray-600">{payment.memo}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}