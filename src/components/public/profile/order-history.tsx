'use client';

import { Package, ClipboardList, Search } from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import MyProfileSideBar from './my-profile-sidebar';
import { OrderDetailsDialog } from './order-details-dialog';
import { PaymentDialog } from './payment-dialog';

import { useOrdersQuery } from '@/hooks/orders.hooks';
import { useUserStore } from '@/stores/user.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getOrderStatusStyle = (status: OrderStatus) => {
  switch (status) {
  case 'PENDING': return 'bg-yellow-100 text-yellow-800';
  case 'PROCESSING': return 'bg-blue-100 text-blue-800';
  case 'READY': return 'bg-purple-100 text-purple-800';
  case 'DELIVERED': return 'bg-green-100 text-green-800';
  default: return 'bg-gray-100 text-gray-800';
  }
};

const ORDER_STATUS_TABS = [
  { value: 'ALL', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY', label: 'Ready' },
  { value: 'DELIVERED', label: 'Delivered' },
] as const;

export function OrderHistory() {
  const { userId } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | OrderStatus>('ALL');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: ordersResponse, isLoading, refetch } = useOrdersQuery({
    where: {
      customerId: userId,
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const orders = ordersResponse?.data || [];
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePaymentModalOpen = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    setSelectedOrderId(null);
    refetch();
  };

  return (
    <div className="container mx-auto my-8 px-4">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="w-full lg:w-1/4">
          <MyProfileSideBar />
        </div>
        
        <div className="flex-1">
          <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <ClipboardList className="size-6 text-blue-600" />
                <div>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track all your orders</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="mb-6">
                <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as typeof selectedStatus)}>
                  <TabsList className="mb-4 w-full">
                    {ORDER_STATUS_TABS.map((tab) => (
                      <TabsTrigger 
                        key={tab.value} 
                        value={tab.value}
                        className="flex-1"
                      >
                        {tab.label}
                        <span className="ml-2 text-xs">
                          ({orders.filter(order => tab.value === 'ALL' ? true : order.status === tab.value).length})
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search orders by ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Spinner className="mr-2" />
                  <span>Loading orders...</span>
                </div>
              ) : !filteredOrders.length ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <Package className="mb-4 size-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">No Orders Found</h3>
                  <p className="text-sm text-gray-600">
                    {searchTerm ? 'No orders match your search' : 'You haven\'t placed any orders yet'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-card hover:bg-accent/5 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <button type='button' className="flex size-16 cursor-pointer items-center justify-center rounded-lg bg-primary/5"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIsDetailsModalOpen(true);
                            }}>
                            <Package className="size-8 text-primary" />
                          </button>
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className={cn("font-medium", getOrderStatusStyle(order.status))}>
                                {order.status}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              <span className="font-medium text-primary">
                                {formatCurrency(Number(order.totalAmount))}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          {(order.paymentStatus === 'PENDING' || order.paymentStatus === 'DOWNPAYMENT') ? (
                            <Button 
                              variant="secondary"
                              className="bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                              onClick={() => handlePaymentModalOpen(order.id)}
                            >
                              Complete Payment
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                            >
                              <Link href={`/track-order?id=${order.id}`}>
                                Track Order
                              </Link>
                            </Button>
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

      <PaymentDialog
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        orderId={selectedOrderId}
        onPaymentComplete={handlePaymentComplete}
      />

      <OrderDetailsDialog
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        orderId={selectedOrderId}
      />
    </div>
  );
}