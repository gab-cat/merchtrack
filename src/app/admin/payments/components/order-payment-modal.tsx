import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $Enums } from "@prisma/client";
import { MdPayments } from "react-icons/md";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { processPayment } from "@/actions/payments.actions";
import { useUserStore } from "@/stores/user.store";
import { ExtendedOrder } from "@/types/orders";
import { cn } from "@/lib/utils";

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
  
  const remaining = order ? Number(order.totalAmount) - (order.payments?.filter(payment => payment.paymentStatus === 'VERIFIED').reduce((acc, payment) => acc + Number(payment.amount), 0) ?? 0) : 0;
  const minPayment = order?.paymentPreference === 'DOWNPAYMENT' ? remaining * 0.5 : 0;
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema(remaining, order!)),
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
    mutationKey: ['payments:all', 'orders:all'],
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
      queryClient.invalidateQueries({ queryKey: ['orders:all'] });
      queryClient.invalidateQueries({ queryKey: ['payments:all'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to process payment', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  });

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MdPayments className="size-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="text-sm font-medium">Order Details</h3>
              <p className="text-muted-foreground mt-1 text-sm">Order #{order.id}</p>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Total Amount</span>
                  <span className="font-medium">₱{Number(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Amount Paid</span>
                  <span className="font-medium">
                    ₱{(Number(order.totalAmount) - remaining).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Remaining</span>
                  <span className="font-medium">₱{remaining.toFixed(2)}</span>
                </div>
                {order.paymentPreference === 'DOWNPAYMENT' && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Minimum Payment Required</span>
                    <Badge>₱{minPayment.toFixed(2)}</Badge>
                  </div>
                )}
              </div>
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
                      <FormLabel>
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method<span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Payment Site<span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status<span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
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