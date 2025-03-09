'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentMethod, PaymentSite } from '@prisma/client';
import { toast } from 'sonner';
import { useOrderQuery } from '@/hooks/orders.hooks';
import { useUserStore } from '@/stores/user.store';
import { processPayment } from '@/actions/payments.actions';
import { formatCurrency } from '@/utils/format';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  onPaymentComplete: () => void;
}

const paymentFormSchema = z.object({
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS'] as const, {
    required_error: 'Please select a payment method',
  }),
  paymentSite: z.enum(['ONSITE', 'OFFSITE'] as const, {
    required_error: 'Please select a payment site',
  }),
  paymentType: z.enum(['FULL', 'DOWNPAYMENT'] as const, {
    required_error: 'Please select a payment type',
  }),
  customAmount: z.number().optional(),
  referenceNo: z.string().optional(),
  transactionId: z.string().optional(),
  paymentProvider: z.string().optional(),
  memo: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function PaymentDialog({ open, onOpenChange, orderId, onPaymentComplete }: Readonly<PaymentDialogProps>) {
  const { userId } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<PaymentSite>('ONSITE');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
  const { data: orderData, isLoading } = useOrderQuery(orderId ?? '');
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: 'CASH',
      paymentSite: 'ONSITE',
      paymentType: 'FULL',
      customAmount: undefined,
      referenceNo: '',
      transactionId: '',
      paymentProvider: '',
      memo: '',
    },
  });

  const paymentType = form.watch('paymentType');
  
  const order = orderData;
  const remainingAmount = order ? 
    Number(order.totalAmount) - 
    (order.payments
      ?.filter(payment => payment.paymentStatus === 'VERIFIED')
      ?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0)
    : 0;

  // Update payment amount whenever the payment type changes
  useEffect(() => {
    if (paymentType === 'FULL') {
      setPaymentAmount(remainingAmount);
    } else {
      // For downpayment, use the custom amount or default to 0
      const customAmount = form.getValues('customAmount');
      setPaymentAmount(customAmount || 0);
    }
  }, [paymentType, remainingAmount, form]);

  // When custom amount changes, update payment amount
  const handleCustomAmountChange = (value: number) => {
    form.setValue('customAmount', value);
    setPaymentAmount(value);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as PaymentSite);
    form.setValue('paymentSite', value as PaymentSite);
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (!userId || !orderId || !order) {
      toast.error('Unable to process payment. Please try again.');
      return;
    }

    // Validate payment amount
    if (data.paymentType === 'DOWNPAYMENT' && (!data.customAmount || data.customAmount <= 0)) {
      toast.error('Please enter a valid payment amount.');
      return;
    }

    if (data.paymentType === 'DOWNPAYMENT' && data.customAmount && data.customAmount > remainingAmount) {
      toast.error(`Payment amount cannot exceed ${formatCurrency(remainingAmount)}.`);
      return;
    }

    // Determine final payment amount
    const finalAmount = data.paymentType === 'FULL' ? remainingAmount : (data.customAmount ?? 0);
    
    if (finalAmount <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await processPayment({
        userId: userId,
        orderId: orderId,
        amount: finalAmount,
        paymentMethod: data.paymentMethod,
        paymentSite: data.paymentSite,
        paymentStatus: 'PENDING',
        referenceNo: data.referenceNo ?? '',
        transactionId: data.transactionId,
        paymentProvider: data.paymentProvider,
        memo: data.memo,
      });
      
      if (result.success) {
        onPaymentComplete();
      } else {
        toast.error(result.message ?? 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred while processing your payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOnsiteInstructions = () => (
    <Card className="mb-4 p-4">
      <h3 className="mb-2 font-medium">On-site Payment Instructions</h3>
      <p className="text-sm text-gray-700">
        Please visit our store at the following location to complete your payment:
      </p>
      <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm">
        <p className="font-medium">MerchTrack Payment Center</p>
        <p>SSC-A, 3rd Floor, Room 301</p>
        <p>Building, University Campus</p>
        <p>Operating Hours: Mon-Fri, 9am-4pm</p>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        <span className="font-medium">Note:</span> Please bring your order ID when making an on-site payment.
      </p>
    </Card>
  );

  const renderBankDetails = () => (
    <Card className="mb-4 p-4">
      <h3 className="mb-2 font-medium">Bank Transfer Details</h3>
      <div className="rounded-md bg-gray-50 p-3 text-sm">
        <p><span className="font-medium">Bank:</span> ABC Bank</p>
        <p><span className="font-medium">Account Name:</span> MerchTrack Merchandise</p>
        <p><span className="font-medium">Account Number:</span> 1234-5678-9012-3456</p>
        <p><span className="font-medium">Reference Format:</span> [Your Order ID]</p>
      </div>
      <div className="mt-3 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
        <p className="font-medium">Important:</p>
        <p>Please include your Order ID in the payment reference to help us identify your payment.</p>
      </div>
    </Card>
  );

  const renderGCashDetails = () => (
    <Card className="mb-4 p-4">
      <h3 className="mb-2 font-medium">GCash Details</h3>
      <div className="rounded-md bg-gray-50 p-3 text-sm">
        <p><span className="font-medium">GCash Number:</span> 0917-123-4567</p>
        <p><span className="font-medium">Account Name:</span> MerchTrack</p>
        <p><span className="font-medium">Reference Format:</span> [Your Order ID]</p>
      </div>
    </Card>
  );

  const renderMayaDetails = () => (
    <Card className="mb-4 bg-neutral-2 p-4">
      <h3 className="mb-2 font-medium">Maya Details</h3>
      <div className="rounded-md bg-gray-50 p-3 text-sm">
        <p><span className="font-medium">Maya Number:</span> 0918-765-4321</p>
        <p><span className="font-medium">Account Name:</span> MerchTrack</p>
        <p><span className="font-medium">Reference Format:</span> [Your Order ID]</p>
      </div>
    </Card>
  );

  const getPaymentMethodDetails = (method: PaymentMethod) => {
    switch (method) {
    case 'BANK_TRANSFER':
      return renderBankDetails();
    case 'GCASH':
      return renderGCashDetails();
    case 'MAYA':
      return renderMayaDetails();
    default:
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-neutral-2 sm:max-w-[600px]">
        <DialogHeader className='bg-neutral-2'>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Provide payment details for your order. After submission, our team will verify your payment.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
            <span className="ml-2">Loading order details...</span>
          </div>
        ) : !order ? (
          <div className="py-4 text-center text-red-600">
            Order not found or unable to load order details
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span>{orderId}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="font-medium">Amount Due:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ONSITE">On-site Payment</TabsTrigger>
                    <TabsTrigger value="OFFSITE">Off-site Payment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ONSITE" className="py-2">
                    {renderOnsiteInstructions()}
                  </TabsContent>
                  
                  <TabsContent value="OFFSITE" className="space-y-4 py-2">
                    {/* Payment Type Selection */}
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Payment Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="FULL" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Full Payment ({formatCurrency(remainingAmount)})
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="DOWNPAYMENT" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Downpayment (Enter amount)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Custom Amount Input (only shown for downpayment) */}
                    {paymentType === 'DOWNPAYMENT' && (
                      <FormField
                        control={form.control}
                        name="customAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={field.value?.toString() ?? ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    handleCustomAmountChange(value);
                                  } else {
                                    handleCustomAmountChange(0);
                                  }
                                }}
                                min={1}
                                max={remainingAmount}
                                step={0.01}
                                required
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum downpayment amount: {formatCurrency(remainingAmount * 0.1)}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                      <p className="font-medium">Payment Amount: {formatCurrency(paymentAmount)}</p>
                      <p>This amount will be processed upon verification.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('paymentMethod', value as PaymentMethod);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                              <SelectItem value="GCASH">GCash</SelectItem>
                              <SelectItem value="MAYA">Maya</SelectItem>
                              <SelectItem value="OTHERS">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {getPaymentMethodDetails(form.watch('paymentMethod'))}
                    
                    <FormField
                      control={form.control}
                      name="referenceNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter reference number" {...field} required />
                          </FormControl>
                          <FormDescription>
                            The transaction reference number from your payment receipt
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction ID (if available)" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="Enter payment provider (e.g., bank name)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                {activeTab === "OFFSITE" && (<FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information about your payment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />)}

                <DialogFooter>
                  {activeTab == "OFFSITE" && (<Button 
                    type="submit" 
                    disabled={isSubmitting || (paymentType === 'DOWNPAYMENT' && (!form.getValues('customAmount') || (form.getValues('customAmount')! <= 0)))}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" /> Processing...
                      </>
                    ) : (
                      'Submit Payment'
                    )}
                  </Button>)}
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}