'use client';

import { FC } from "react";
import { BiUser } from "react-icons/bi";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaBoxes } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import Link from "next/link";
import { OrderStatusCard } from "./order-status-card";
import { OrderActionButtons } from "./order-action-buttons";
import { OrderItemsTable } from "./order-items-table";
import { PaymentsTable } from "./payments-table";
import { updateOrderStatus } from "./_actions";
import { OrderStatus, OrderPaymentStatus } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, prettyFormatDate } from "@/utils/format";
import { useOrderQuery } from "@/hooks/orders.hooks";
import useToast from "@/hooks/use-toast";
import { fadeInUp } from "@/constants/animations";

interface OrderDetailsProps {
  orderId: string;
  userId: string;
}

export const OrderDetails: FC<OrderDetailsProps> = ({ orderId, userId }) => {
  const { data: order, isLoading, refetch } = useOrderQuery(orderId);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      if (!order) {
        throw new Error("Order not found");
      }
      
      if (newStatus === OrderStatus.DELIVERED) {
        // check if the order payment status is paid before marking as delivered
        if (order?.paymentStatus !== OrderPaymentStatus.PAID) {
          throw new Error("Order payment status must be 'PAID' before marking as delivered");
        }
      }
      const result = await updateOrderStatus(orderId, newStatus, userId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Order status updated successfully");
      refetch();
    },
    onError: (error) => {
      useToast({
        type: "error",
        message: error.message || "Failed to update order status",
        title: "Unable to update order status"
      });
    }
  });


  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-[200px]" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground text-lg">Order not found</p>
      </div>
    );
  }

  return (
    <motion.div {...fadeInUp} className="min-h-screen space-y-6 p-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">#{order.id}</h1>
            <p className="text-muted-foreground">Created on {prettyFormatDate(order.createdAt)}</p>
          </div>
          <OrderActionButtons 
            status={order.status as OrderStatus}
            paymentStatus={order.paymentStatus as OrderPaymentStatus}
            isUpdatingStatus={isUpdatingStatus}
            onUpdateStatus={updateStatus}
            orderId={orderId}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BiUser className="size-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-neutral-7">Customer Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-semibold text-neutral-7">Name:</span>
                  <span>{order.customer.firstName} {order.customer.lastName}</span>
                  <span className="font-semibold text-neutral-7">Email:</span>
                  <span className="break-all text-primary underline">
                    <Link href={`/admin/users/${order.customer.email}`} passHref>
                      {order.customer.email}
                    </Link>
                  </span>
                  <span className="font-semibold text-neutral-7">Phone:</span>
                  <span>{order.customer.phone || '—'}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-semibold text-neutral-7">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-semibold text-neutral-7">Subtotal:</span>
                  <span>{formatCurrency(Number(order.totalAmount + order.discountAmount))}</span>
                  <span className="font-semibold text-neutral-7">Discount:</span>
                  <span>- {formatCurrency(Number(order.discountAmount))}</span>
                  <span className="font-semibold text-accent-destructive">Total:</span>
                  <span className="font-semibold text-accent-destructive">{formatCurrency(Number(order.totalAmount))}</span>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-neutral-7">Customer Note</h3>
                <p>{order.customerNotes ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <OrderStatusCard 
          status={order.status as OrderStatus}
          paymentStatus={order.paymentStatus as OrderPaymentStatus}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <FaBoxes />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderItemsTable items={order.orderItems} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MdPayments />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable 
            payments={order.payments} 
            orderId={orderId}
            userId={userId}
            onRefund={refetch}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};