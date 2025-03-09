'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBoxes, 
  FaMoneyBillWave, 
  FaShippingFast, 
  FaCheckCircle, 
  FaSearch, 
  FaArrowLeft,
  FaReceipt
} from "react-icons/fa";
import { motion } from 'framer-motion';
import { OrderStatus, OrderPaymentStatus } from '@prisma/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOrderQuery } from '@/hooks/orders.hooks';
import { formatCurrency, formatDate } from "@/utils/format";
import { PaymentDialog } from '@/components/public/profile/payment-dialog';
import { cn } from '@/lib/utils';

// Animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } }
};

const scale = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
};

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: <FaReceipt className="size-5" /> },
  { key: 'PROCESSING', label: 'Processing', icon: <FaBoxes className="size-5" /> },
  { key: 'READY', label: 'Ready for Pickup', icon: <FaShippingFast className="size-5" /> },
  { key: 'DELIVERED', label: 'Completed', icon: <FaCheckCircle className="size-5" /> }
];

function TrackOrderBody() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('id');
  
  const [orderId, setOrderId] = useState(orderIdParam || '');
  const [searchedOrderId, setSearchedOrderId] = useState(orderIdParam || '');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { data: order, isLoading, refetch } = useOrderQuery(searchedOrderId);

  const handleSearch = () => {
    setSearchedOrderId(orderId);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    refetch();
    toast.success('Payment information submitted successfully! Your payment is being reviewed.');
  };

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!order) return -1;
    
    if (order.status === 'CANCELLED') return -2; // Special case for cancelled orders
    
    return STATUS_STEPS.findIndex(step => step.key === order.status);
  };
  
  // Get payment status badge color
  const getPaymentStatusColor = (status: OrderPaymentStatus) => {
    switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DOWNPAYMENT': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'REFUNDED': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get order status badge color
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

  const baseUrl = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000';
  const surveyLink = `${baseUrl}/survey?id=${order?.customerSatisfactionSurvey?.id}`;

  return (
    <div className="container mx-auto my-8 px-4">
      <motion.div 
        className="mx-auto max-w-4xl" 
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">Track Your Order</h1>
          <p className="max-w-2xl text-gray-600">
            Enter your order number to check the current status of your purchase and estimated delivery date.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter order number (e.g., ORD12345)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-10"
                />
                {orderId && (
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setOrderId('')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <Button 
                onClick={handleSearch}
                disabled={!orderId.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <FaSearch className="mr-2 size-4" /> Track Order
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <motion.div 
            className="flex h-80 items-center justify-center" 
            variants={scale}
          >
            <Spinner size="lg" className="text-primary" />
            <span className="ml-2">Loading order details...</span>
          </motion.div>
        ) : !order && searchedOrderId ? (
          <motion.div variants={scale}>
            <Alert variant="destructive" className="mb-8">
              <AlertTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Order Not Found
              </AlertTitle>
              <AlertDescription>
                We couldn&apos;t find an order with the ID &quot;{searchedOrderId}&quot;. Please check if you entered the correct order number.
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <Button variant="outline" onClick={() => setSearchedOrderId('')}>
                <FaArrowLeft className="mr-2 size-4" /> Try Another Order ID
              </Button>
            </div>
          </motion.div>
        ) : order ? (
          <motion.div variants={scale}>
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      Order #{order.id}
                      <Badge 
                        variant="outline" 
                        className={cn(getOrderStatusColor(order.status))}
                      >
                        {order.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Placed on {formatDate(new Date(order.createdAt))}
                    </CardDescription>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={cn("text-sm", getPaymentStatusColor(order.paymentStatus))}
                  >
                    Payment: {order.paymentStatus}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Status Tracker */}
                <div className="mb-8">
                  <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">Order Progress</h3>
                  
                  {order.status === 'CANCELLED' ? (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Order Cancelled
                      </AlertTitle>
                      <AlertDescription>
                        This order has been cancelled and will not be processed further.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="relative">
                      {/* Progress bar */}
                      <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200"></div>
                      
                      {/* Completed progress */}
                      <div 
                        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-green-500 transition-all duration-500"
                        style={{ 
                          width: `${Math.max(0, (getCurrentStepIndex() / (STATUS_STEPS.length - 1)) * 100)}%` 
                        }}
                      ></div>
                      
                      {/* Steps */}
                      <div className="relative flex justify-between">
                        {STATUS_STEPS.map((step, index) => {
                          const currentIndex = getCurrentStepIndex();
                          const isCompleted = index <= currentIndex;
                          const isCurrent = index === currentIndex;
                          
                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div 
                                className={cn(
                                  "relative z-10 flex size-12 items-center justify-center rounded-full transition-colors duration-300",
                                  isCompleted 
                                    ? "bg-green-500 text-white" 
                                    : "border-2 border-gray-200 bg-white text-gray-400"
                                )}
                              >
                                {step.icon}
                              </div>
                              <div 
                                className={cn(
                                  "mt-2 whitespace-nowrap text-sm",
                                  isCurrent && "font-medium text-green-600",
                                  isCompleted && !isCurrent && "font-medium",
                                  !isCompleted && "text-gray-500"
                                )}
                              >
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-2 font-medium">Order Details</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-gray-500">Items</p>
                      <p className="font-medium">{order.orderItems?.length || 0} item(s)</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-medium">{formatCurrency(Number(order.totalAmount))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estimated Delivery</p>
                      <p className="font-medium">
                        {order.estimatedDelivery 
                          ? formatDate(new Date(order.estimatedDelivery)) 
                          : 'To be determined'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {order.status === 'PENDING' && (
                  <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                    <h3 className="mb-1 flex items-center gap-1 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Awaiting Payment
                    </h3>
                    <p className="text-sm">
                      Your order is currently pending. It will be processed once payment is confirmed.
                    </p>
                  </div>
                )}

                {(order.status === 'READY') && (
                  <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
                    <h3 className="mb-1 flex items-center gap-1 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ready for Pickup
                    </h3>
                    <p className="text-sm">
                      Your order is ready! You can pick it up at the designated location during business hours.
                    </p>
                  </div>
                )}
                
                {order.status === 'DELIVERED' && (
                  <div className="rounded-lg bg-green-50 p-4 text-green-800">
                    <h3 className="mb-1 flex items-center gap-1 font-medium">
                      <FaCheckCircle className="size-4" />
                    Order Complete
                    </h3>
                    <p className="text-sm">
                    Your order has been delivered successfully. Thank you for shopping with us!
                    </p>
                  </div>
                )}
                {order.customerSatisfactionSurvey && (
                  <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                    <h3 className="mb-1 font-medium">Feedback Request</h3>
                    <p className="text-sm">
                      Your feedback is important to us! Please let us know how we did.
                    </p>
                    <Link href={surveyLink} className="text-blue-600 underline">
                      Complete Survey
                    </Link>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-4">
                <Button variant="outline">
                  <Link href="/my-orders" className="flex items-center gap-2">
                    <FaArrowLeft className="size-4" /> View All Orders
                  </Link>
                </Button>
                
                {(order.paymentStatus === 'PENDING' || order.paymentStatus === 'DOWNPAYMENT') && (
                  <Button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    <FaMoneyBillWave className="mr-2 size-4" /> Pay Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ) : null}
      </motion.div>
      
      {/* Payment Modal */}
      <PaymentDialog
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        orderId={order?.id ?? null}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}

export default TrackOrderBody;