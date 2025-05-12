'use client';

import { FC, useState, useEffect } from "react";
import { BiUser, BiEdit } from "react-icons/bi";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaBoxes } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderStatusCard , OrderActionButtons , OrderItemsTable , PaymentsTable } from "@/features/admin/orders/components";
import { updateOrderStatus, updateOrderNotes } from "@/features/admin/orders/actions";
import { OrderStatus, OrderPaymentStatus } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, prettyFormatDate } from "@/utils/format";
import { useOrderQuery } from "@/hooks/orders.hooks";
import useToast from "@/hooks/use-toast";
import { fadeInUp } from "@/constants/animations";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle , DialogFooter } from "@/components/ui/dialog";


interface OrderDetailsProps {
  orderId: string;
  userId: string;
}

// Define the form schema outside the component
const orderNotesSchema = z.object({
  note: z.string().optional()
});

type OrderNotesFormValues = z.infer<typeof orderNotesSchema>;

export const OrderDetails: FC<OrderDetailsProps> = ({ orderId, userId }) => {
  const { data: order, isLoading, refetch } = useOrderQuery(orderId);
  const toast = useToast;
  const [isEditingNote, setIsEditingNote] = useState(false);
  
  const orderNotesForm = useForm<OrderNotesFormValues>({
    resolver: zodResolver(orderNotesSchema),
    defaultValues: {
      note: order?.customerNotes ?? ''
    }
  });
  
  useEffect(() => {
    if (order) {
      orderNotesForm.reset({ note: order.customerNotes ?? '' });
    }
  }, [order, orderNotesForm]);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ newStatus, reason }: { newStatus: OrderStatus; reason?: string }) => {
      if (!order) {
        throw new Error("Order not found");
      }
      
      if (newStatus === OrderStatus.DELIVERED) {
        // check if the order payment status is paid before marking as delivered
        if (order?.paymentStatus !== OrderPaymentStatus.PAID) {
          throw new Error("Order payment status must be 'PAID' before marking as delivered");
        }
      }
      
      // If cancelling an order without a reason, require one
      if (newStatus === OrderStatus.CANCELLED && !reason) {
        throw new Error("A reason is required when cancelling an order");
      }
      
      const result = await updateOrderStatus(orderId, newStatus, userId, reason);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast({
        type: "success",
        message: "Order status updated successfully",
        title: "Order status updated"
      });
      refetch();
    },
    onError: (error) => {
      toast({
        type: "error",
        message: error.message || "Failed to update order status",
        title: "Unable to update order status"
      });
    }
  });
  
  const { mutate: updateNotes, isPending: isUpdatingNotes } = useMutation({
    mutationFn: async (data: OrderNotesFormValues) => {
      const result = await updateOrderNotes(orderId, data.note ?? '', userId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast({
        type: "success",
        message: "Order notes updated successfully",
        title: "Notes updated"
      });
      setIsEditingNote(false);
      refetch();
    },
    onError: (error) => {
      toast({
        type: "error",
        message: error.message || "Failed to update order notes",
        title: "Unable to update notes"
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
            onUpdateStatus={(status, reason) => updateStatus({ newStatus: status, reason })}
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

              <Separator />

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <BiEdit className="size-5" />
            Customer Notes
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      orderNotesForm.reset({ note: order.customerNotes ?? '' });
                      setIsEditingNote(true);
                    }}
                  >
                    <BiEdit className="size-4" />
            Edit Notes
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border p-4">
                    {order.customerNotes ? (
                      <p className="whitespace-pre-wrap">{order.customerNotes}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No customer notes</p>
                    )}
                  </div>
                </CardContent>
              </Card>
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
          <OrderItemsTable 
            items={order.orderItems} 
            orderId={orderId} 
            userId={userId}
            onRemoveItem={refetch}
            orderStatus={order.status}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
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

      

      <Dialog open={isEditingNote} onOpenChange={setIsEditingNote}>
        <DialogContent className="bg-neutral-2">
          <DialogHeader>
            <DialogTitle>Edit Customer Notes</DialogTitle>
          </DialogHeader>
          <Form {...orderNotesForm}>
            <form onSubmit={orderNotesForm.handleSubmit((data) => updateNotes(data))}>
              <FormField
                control={orderNotesForm.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Add notes about this order..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditingNote(false)}
                  disabled={isUpdatingNotes}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdatingNotes}
                >
                  {isUpdatingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};