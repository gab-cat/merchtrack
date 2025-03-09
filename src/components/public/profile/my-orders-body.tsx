'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { OrderStatus, OrderPaymentStatus } from '@prisma/client';
import { FaBoxes, FaShoppingBag, FaCheckCircle, FaClock, FaTimesCircle, FaSearch } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import MyProfileSideBar from '@/components/public/profile/my-profile-sidebar';
import { useUserStore } from '@/stores/user.store';
import { useOrdersQuery } from '@/hooks/orders.hooks';
import { formatCurrency, formatDistanceToNow } from "@/utils/format";
import { PaymentDialog } from '@/components/public/profile/payment-dialog';
import { cn } from '@/lib/utils';
import { ExtendedOrder } from '@/types/orders';

// Helper data
const STATUS_TABS = [
  { id: 'all', label: 'All Orders', icon: <FaShoppingBag className="mr-2" /> },
  { id: 'pending', label: 'Pending', icon: <FaClock className="mr-2" />, status: OrderStatus.PENDING },
  { id: 'processing', label: 'Processing', icon: <FaBoxes className="mr-2" />, status: OrderStatus.PROCESSING },
  { id: 'ready', label: 'Ready', icon: <FaCheckCircle className="mr-2" />, status: OrderStatus.READY },
  { id: 'delivered', label: 'Delivered', icon: <FaCheckCircle className="mr-2" />, status: OrderStatus.DELIVERED },
  { id: 'cancelled', label: 'Cancelled', icon: <FaTimesCircle className="mr-2" />, status: OrderStatus.CANCELLED },
];

function MyOrdersBody() {
  const { userId } = useUserStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: orders, isLoading, refetch } = useOrdersQuery({
    where: {
      customerId: userId!,
      isDeleted: false,
    },
    include: {
      orderItems: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    if (!orders?.data) return [];
    
    if (activeTab === 'all') return orders.data;
    
    const selectedTab = STATUS_TABS.find(tab => tab.id === activeTab);
    if (!selectedTab?.status) return orders.data;
    
    return orders.data.filter(order => order.status === selectedTab.status);
  }, [orders?.data, activeTab]);
  
  const handlePaymentModalOpen = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsPaymentModalOpen(true);
  };
  
  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    refetch();
    toast.success('Payment information submitted successfully! Your payment is being reviewed.');
  };
  
  const getPaymentStatusColor = (status: OrderPaymentStatus) => {
    switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DOWNPAYMENT': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'REFUNDED': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
    case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'READY': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDING':
    default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };
  
  const getProductImages = (order: ExtendedOrder) => {
    if (!order.orderItems.length) return ['/img/profile-placeholder-img.png'];
    
    return order.orderItems.slice(0, 1).map(item => {
      if (item.variant?.product?.imageUrl && item.variant.product.imageUrl.length > 0) {
        return item.variant.product.imageUrl[0];
      }
      return '/img/profile-placeholder-img.png';
    });
  };
  
  // Get counts for each tab
  const getTabCounts = () => {
    if (!orders?.data) return {
      all: 0,
      pending: 0,
      processing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0
    };
    
    const counts: Record<string, number> = {
      all: orders.data.length,
      pending: 0,
      processing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0
    };
    
    orders.data.forEach(order => {
      switch (order.status) {
      case 'PENDING': counts.pending++; break;
      case 'PROCESSING': counts.processing++; break;
      case 'READY': counts.ready++; break;
      case 'DELIVERED': counts.delivered++; break;
      case 'CANCELLED': counts.cancelled++; break;
      default: break;
      }
    });
    
    return counts;
  };
  
  const tabCounts = getTabCounts();

  return (
    <div className="container mx-auto my-4 px-4 pb-16 sm:my-8 sm:px-6 lg:pb-8 xl:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* The sidebar is now controlled by the MyProfileSideBar component */}
        {/* It will render properly for both desktop and mobile */}
        <MyProfileSideBar />
        
        {/* Main Content */}
        <div className="flex-1">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2">
              <CardTitle className="flex items-center text-xl font-bold text-gray-800 sm:text-2xl">
                <FaShoppingBag className="mr-3 text-primary" /> My Orders
              </CardTitle>
              <CardDescription>
                Track and manage all your purchases
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b px-2 sm:px-4">
                <ScrollArea className="pb-0.5">
                  <TabsList className="h-auto w-max min-w-full gap-1 bg-transparent py-0">
                    {STATUS_TABS.map(tab => (
                      <TabsTrigger 
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "relative data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                          "data-[state=active]:text-primary data-[state=active]:font-medium",
                          "my-1 flex items-center justify-center py-2"
                        )}
                      >
                        <div className="flex items-center">
                          {tab.icon}
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="sm:hidden">
                            {tab.id === 'all' ? 'All' : tab.label.split(' ')[0]}
                          </span>
                          {tabCounts[tab.id] > 0 && (
                            <span className={cn(
                              "ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs",
                              activeTab === tab.id && "bg-blue-100"
                            )}>
                              {tabCounts[tab.id]}
                            </span>
                          )}
                        </div>
                        {activeTab === tab.id && (
                          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"></span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              </div>
              
              {STATUS_TABS.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="p-1 pt-4">
                  <ScrollArea className="h-[calc(100vh-250px)] sm:h-[calc(100vh-220px)]">
                    {isLoading ? (
                      <div className="flex h-60 items-center justify-center">
                        <Spinner size="lg" className="text-primary" />
                        <span className="ml-2">Loading your orders...</span>
                      </div>
                    ) : !filteredOrders.length ? (
                      <div className="flex h-60 flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-6">
                          <FaSearch className="size-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No {tab.id !== 'all' ? tab.label : ''} orders found</h3>
                        <p className="mt-2 max-w-md px-4 text-sm text-gray-600">
                          {tab.id !== 'all' 
                            ? `You don't have any orders with ${tab.label.toLowerCase()} status.`
                            : "You haven't placed any orders yet. Explore our products and make your first order!"}
                        </p>
                        <Button className="mt-4 bg-primary hover:bg-primary/90">
                          <Link href="/shop">Browse Products</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 px-2 pb-4 sm:px-0">
                        {filteredOrders.map(order => (
                          <Card key={order.id} className="overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="border-b bg-gray-50 p-3 sm:p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 sm:text-base">Order #{order.id.substring(0, 8)}</span>
                                  <Badge variant="outline" className={cn("ml-0 sm:ml-2", getOrderStatusColor(order.status))}>
                                    {order.status}
                                  </Badge>
                                  <Badge variant="outline" className={cn("ml-0 sm:ml-1", getPaymentStatusColor(order.paymentStatus))}>
                                    {order.paymentStatus}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500 sm:text-sm">
                                  Placed {formatDistanceToNow(new Date(order.createdAt))} ago
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="size-16 overflow-hidden rounded-md border border-gray-200 sm:size-20">
                                    <Image
                                      src={getProductImages(order)[0]}
                                      alt="Order Item"
                                      width={80}
                                      height={80}
                                      className="size-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 sm:text-sm">
                                      {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                                    </span>
                                    <p className="text-base font-semibold text-orange-600 sm:text-lg">
                                      {formatCurrency(Number(order.totalAmount))}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mt-2 flex md:mt-0">
                                  <Button 
                                    onClick={() => {
                                      if (order.paymentStatus === 'PENDING' || order.paymentStatus === 'DOWNPAYMENT') {
                                        handlePaymentModalOpen(order.id);
                                      } else {
                                        window.location.href = `/track-order?id=${order.id}`;
                                      }
                                    }}
                                    variant={order.paymentStatus === 'PENDING' || order.paymentStatus === 'DOWNPAYMENT' ? 'default' : 'outline'}
                                    className={
                                      order.paymentStatus === 'PENDING' || order.paymentStatus === 'DOWNPAYMENT'
                                        ? "w-full bg-orange-500 text-white hover:bg-orange-600 md:w-auto"
                                        : "w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 md:w-auto"
                                    }
                                  >
                                    {order.paymentStatus === 'PENDING' || order.paymentStatus === 'DOWNPAYMENT'
                                      ? 'Complete Payment'
                                      : 'Track Order'
                                    }
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentDialog
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        orderId={selectedOrderId}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}

export default MyOrdersBody;
