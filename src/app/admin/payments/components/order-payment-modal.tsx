import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $Enums } from "@prisma/client";
import { FaBox, FaMoneyBill } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { processPayment } from "@/actions/payments.actions";
import { useUserStore } from "@/stores/user.store";
import { ExtendedOrder, ExtendedOrderItem } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const paymentFormSchema = (maxAmount: number) => z.object({
  amount: z.number()
    .min(1, "Amount must be greater than 0")
    .max(maxAmount, `Amount cannot exceed ₱${maxAmount.toFixed(2)}`)
    .refine((val) => val > 0, {
      message: "Amount must be greater than 0",
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

export function OrderPaymentModal({ open, onOpenChange, order }: OrderPaymentModalProps) {
  const { userId } = useUserStore();
  const queryClient = useQueryClient();
  
  const remaining = Number(order?.totalAmount) - (order?.payments?.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema(remaining)),
    defaultValues: {
      amount: 0,
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
    mutationFn: async (data: PaymentFormValues) => {
      if (!userId || !order) throw new Error("Missing required data");
      
      const remaining = Number(order.totalAmount) - (order.payments?.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0);
      
      if (data.amount > remaining) {
        throw new Error(`Payment amount (₱${data.amount.toFixed(2)}) cannot exceed remaining balance (₱${remaining.toFixed(2)})`);
      }
      
      const result = await processPayment({
        userId,
        orderId: order.id,
        amount: data.amount,
        paymentMethod: data.paymentMethod as $Enums.PaymentMethod,
        paymentSite: data.paymentSite as $Enums.PaymentSite,
        paymentStatus: data.paymentStatus as $Enums.PaymentStatus,
        referenceNo: data.referenceNo,
        memo: data.memo,
        transactionId: data.transactionId,
        paymentProvider: data.paymentProvider,
        limitFields: []
      });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      toast.success("Payment processed successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process payment");
    }
  });

  if (!order) return null;

  // const remaining = Number(order.totalAmount) - (order.payments?.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-neutral-2">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-primary">
            <MdPayments className="mr-2"/>
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 pt-4 md:grid-cols-5">
          {/* Order Details */}
          <div className="space-y-6 md:col-span-2">
            <div>
              <h3 className="mb-2 font-semibold text-primary">Order Details</h3>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-xs font-medium">{order.id}</p>
                <Separator className="my-3" />
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                <Separator className="my-3" />
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">₱{Number(order.totalAmount).toFixed(2)}</p>
                <Separator className="my-3" />
                <p className="text-sm text-gray-500">Remaining Balance</p>
                <div className="mt-1 rounded-md bg-gray-50 p-2">
                  <p className="text-lg font-bold text-red-500">₱{remaining.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-primary">Order Items</h3>
              <div className="space-y-2">
                {order.orderItems?.map((item: ExtendedOrderItem) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100">
                      <FaBox className="size-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.variant.product.title}</p>
                      <Badge variant='outline'>{item.variant.variantName}</Badge>
                      <p className="text-sm text-gray-500">{item.quantity}x @ ₱{Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-3">
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
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value > remaining) {
                                  toast.warning(`Amount cannot exceed remaining balance (₱${remaining.toFixed(2)})`);
                                  return;
                                }
                                field.onChange(value);
                              }}
                              max={remaining}
                              className={cn(
                                "bg-white pr-24 appearance-none",
                                isFullPayment && "border-green-500 ring-green-500",
                                isDownpayment && "border-blue-500 ring-blue-500",
                              )}
                            />
                            {isFullPayment && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-green-600">
                                Full Payment
                              </span>
                            )}
                            {isDownpayment && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600">
                                Down Payment
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Maximum amount: ₱{remaining.toFixed(2)}
                          </p>
                          {value > 0 && (
                            <p className="text-xs text-gray-500">
                              Remaining after payment: ₱{(remaining - value).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    );
                  }}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Payment Method<span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values($Enums.PaymentMethod).map((method) => (
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
                        <FormLabel>
                          Payment Site<span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select payment site" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values($Enums.PaymentSite).map((site) => (
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
                      <FormLabel>
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
                          <Input placeholder="Enter payment provider" {...field} className="bg-white" />
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
                          placeholder="Add any notes about this payment"
                          className="resize-none bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending || remaining <= 0} className="bg-primary text-neutral-2 hover:bg-primary-600">
                    <FaMoneyBill className="mr-2 size-4" />
                    {isPending ? "Processing..." : "Process Payment"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}