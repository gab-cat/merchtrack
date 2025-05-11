'use client';

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $Enums } from "@prisma/client";
import { MdPayments, MdOutlineMoneyOff, MdReceipt } from "react-icons/md";
import { FiChevronDown, FiChevronUp, FiPackage, FiDollarSign } from "react-icons/fi";
import { LuPhilippinePeso } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { processPayment } from "@/features/admin/payments/actions";
import { useUserStore } from "@/stores/user.store";
import { ExtendedOrder } from "@/types/orders";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useOrderQuery } from "@/hooks/orders.hooks";

const paymentFormSchema = (maxAmount: number, order: ExtendedOrder) => z.object({
  amount: z.number()
    .min(1, "Amount must be greater than 0")
    .max(maxAmount, `Amount cannot exceed ₱${maxAmount.toFixed(2)}`)
    .refine((val) => {
      if (order.paymentPreference === 'DOWNPAYMENT') {
        const minDownpayment = maxAmount * 0.5;
        return val >= minDownpayment;
      }
      return true;
    }, {
      message: "Downpayment must be at least 50% of the total amount",
    }),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS'] as const),
  paymentSite: z.enum(['ONSITE', 'OFFSITE'] as const),
  referenceNo: z.string().optional(),
  memo: z.string().optional(),
  transactionId: z.string().optional(),
  paymentProvider: z.string().optional(),
  paymentStatus: z.enum(['VERIFIED', 'PENDING', 'DECLINED', 'PROCESSING', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'CANCELLED'] as const)
});

type PaymentFormValues = z.infer<ReturnType<typeof paymentFormSchema>>;

interface OrderPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ExtendedOrder | null;
}

export function OrderPaymentModal({ open, onOpenChange, order }: Readonly<OrderPaymentModalProps>) {
  const { userId } = useUserStore();
  const queryClient = useQueryClient();
  const [isOrderItemsOpen, setIsOrderItemsOpen] = React.useState(false);
  
  const remaining = order ? Number(order.totalAmount) - (order.payments?.filter(payment => payment.paymentStatus === 'VERIFIED').reduce((acc, payment) => acc + Number(payment.amount), 0) ?? 0) : 0;
  const minPayment = order?.paymentPreference === 'DOWNPAYMENT' ? remaining * 0.5 : 0;
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema(remaining, order!)),
    mode: 'onBlur',
    defaultValues: {
      amount: minPayment,
      paymentMethod: 'CASH',
      paymentSite: 'ONSITE',
      paymentStatus: 'VERIFIED',
      referenceNo: '',
      transactionId: '',
      paymentProvider: '',
      memo: ''
    }
  });

  const { mutate: submitPayment, isPending } = useMutation({
    mutationKey: ['payment:process'],
    mutationFn: async (data: PaymentFormValues) => {
      if (!order?.id || !userId) return;
      return processPayment({
        orderId: order.id,
        userId,
        ...data,
      });
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error('Failed to process payment', {
          description: data?.message ?? 'An error occurred'
        });
        return;
      }

      toast.success('Payment processed successfully');
      
      // Fix invalidation by using correct query keys
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders:all'] });
      queryClient.invalidateQueries({ queryKey: ['payments:all'] });
      
      // Specifically invalidate the single order
      if (order?.id) {
        queryClient.invalidateQueries({ queryKey: ['orders', order.id] });
      }
      
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to process payment', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  });

  if (!order) return null;

  const totalItems = order.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto bg-neutral-1">
        <DialogHeader className="rounded-t-lg bg-primary p-4 text-white">
          <DialogTitle className="flex items-center gap-2">
            <MdPayments className="size-5" />
            Process Payment for Order #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6 px-1">
          <div className="rounded-lg border border-primary/20 bg-primary/5 shadow-sm">
            <div className="border-b border-primary/20 bg-primary/10 p-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-primary">
                <MdReceipt className="size-4" />
                Order Summary
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Customer: {order.customer?.firstName} {order.customer?.lastName}
              </p>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-sm">
                    <LuPhilippinePeso className="size-3.5" />Total Amount
                  </span>
                  <span className="font-medium">₱{Number(order.totalAmount).toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-sm">
                    <FiDollarSign className="size-3.5" />Amount Paid
                  </span>
                  <span className="font-medium text-green-600">
                    ₱{(Number(order.totalAmount) - remaining).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MdOutlineMoneyOff className="size-3.5" />Remaining
                  </span>
                  <span className="font-medium text-primary">₱{remaining.toFixed(2)}</span>
                </div>
                
                {order.paymentPreference === 'DOWNPAYMENT' && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1 text-sm">Minimum Payment Required</span>
                    <Badge className="bg-primary/80 hover:bg-primary">₱{minPayment.toFixed(2)}</Badge>
                  </div>
                )}
              </div>
              
              <Collapsible
                open={isOrderItemsOpen}
                onOpenChange={setIsOrderItemsOpen}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
                    <FiPackage className="size-4" />
                    Order Items ({totalItems} items)
                  </h4>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      {isOrderItemsOpen ? (
                        <FiChevronUp className="size-4" />
                      ) : (
                        <FiChevronDown className="size-4" />
                      )}
                      <span className="sr-only">Toggle items</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2">
                  <div className="border-border max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                    {order.orderItems?.map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="border-b pb-2 text-sm last:border-0 last:pb-0"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {item.variant?.product?.title || 'Unknown Product'}
                          </span>
                          <span>₱{Number(item.price).toFixed(2)}</span>
                        </div>
                        <div className="text-muted-foreground flex justify-between text-xs">
                          <span>{item.variant?.variantName || 'Unknown Variant'} × {item.quantity}</span>
                          <span>₱{(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => submitPayment(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => {
                  const value = parseFloat(field.value.toString()) || 0;
                  const isFullPayment = value === remaining;
                  const isDownpayment = value >= remaining * 0.5 && value < remaining;
                  
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <LuPhilippinePeso className="size-3.5" />
                        Payment Amount<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            min={minPayment}
                            max={remaining}
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) ?? '')}
                            className={cn(
                              "pr-16",
                              isFullPayment && "border-green-500 focus-visible:ring-green-500",
                              isDownpayment && "border-blue-500 focus-visible:ring-blue-500"
                            )}
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-sm text-gray-500">PHP</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <MdPayments className="size-3.5" />
                        Payment Method<span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS'].map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentSite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <FiPackage className="size-3.5" />
                        Payment Site<span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select payment site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['ONSITE', 'OFFSITE'].map((site) => (
                            <SelectItem key={site} value={site}>
                              {site}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MdReceipt className="size-3.5" />
                      Payment Status<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values($Enums.PaymentStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference number" {...field} className="bg-white" />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter transaction ID" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter provider name" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="memo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add payment notes..."
                        className="min-h-[80px] resize-none bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                  {isPending ? "Processing..." : "Process Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Component that handles the automatic opening of payment modal based on URL parameters
 */
export function OrderPaymentModalWithQueryParams() {
  const [isOpen, setIsOpen] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const { data: order, isLoading } = useOrderQuery(orderId || '');
  
  // Open modal automatically if orderId is present in URL
  React.useEffect(() => {
    if (orderId && order) {
      setIsOpen(true);
    }
  }, [orderId, order]);
  
  // Close modal and clean up URL parameters
  const handleCloseModal = () => {
    setIsOpen(false);
    const basePath = window.location.pathname;
    router.replace(basePath);
  };
  
  return (
    <>
      {!isLoading && orderId && (
        <OrderPaymentModal
          open={isOpen}
          onOpenChange={handleCloseModal}
          order={order!}
        />
      )}
    </>
  );
}